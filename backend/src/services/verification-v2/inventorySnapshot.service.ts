import {visibleRubricV1,viewSurfaces} from './rubrics.js';
import type {Prisma} from '@prisma/client';
import {prisma} from '../../prisma/prisma.js';
import {ApiError} from '../../utils/ApiError.js';
import {resolvePolicy,taskDeadlines} from './verificationPolicy.service.js';
import {requiredViewsSchema} from './contracts.js';
import {resolveTaskInstanceWindow} from '../../cron/taskInstanceWindow.js';
import type {VerificationTransaction} from './jobQueue.service.js';
import {writeAuditLog} from '../auditLog.service.js';
export type InventorySelectionInput={areaId:number;inventorySelection:'ALL'|'SUBSET';selectedItems:{areaItemId:number;mandatory:boolean}[];expectedInventoryVersion:number};
export async function validateInventorySelection(tx:VerificationTransaction,locationId:number,input:InventorySelectionInput) {
 await tx.$queryRaw`SELECT id FROM "Area" WHERE id=${input.areaId} FOR UPDATE`;
 const area=await tx.area.findFirst({where:{id:input.areaId,locationId,status:'ACTIVE'},include:{items:{orderBy:[{sequence:'asc'},{id:'asc'}]}}});
 if(!area)throw new ApiError(422,'Choose an active area in this location');
 if(area.inventoryVersion!==input.expectedInventoryVersion)throw new ApiError(409,'Inventory changed. Refresh your selection.');
 const ids=input.selectedItems.map(i=>i.areaItemId);
 if(new Set(ids).size!==ids.length)throw new ApiError(422,'Fixture selection must be unique');
 if(ids.some(id=>!area.items.some(i=>i.id===id&&i.status==='ACTIVE')))throw new ApiError(422,'Every selected fixture must be active and belong to this area');
 const selected=input.inventorySelection==='ALL'?area.items.filter(i=>i.status==='ACTIVE'):area.items.filter(i=>ids.includes(i.id));
 const overrides=new Map(input.selectedItems.map(i=>[i.areaItemId,i.mandatory]));
 if(!selected.length||!selected.some(i=>overrides.get(i.id)!==false))throw new ApiError(422,'Select at least one mandatory fixture');
 for(const item of selected){const views=requiredViewsSchema.parse(item.requiredViews);if(overrides.get(item.id)!==false&&!views.some(v=>v.mandatory))throw new ApiError(422,'A mandatory fixture requires a mandatory view');}
 return {area,selected,overrides};
}
export async function configureTemplateInventory(tx:VerificationTransaction,templateId:number,locationId:number,input:InventorySelectionInput) {
 // Every inventory writer uses area -> template order to avoid scheduling/edit deadlocks.
 const {area}=await validateInventorySelection(tx,locationId,input);
 await tx.$queryRaw`SELECT id FROM "TaskTemplate" WHERE id=${templateId} FOR UPDATE`;
 await tx.taskTemplateItem.deleteMany({where:{templateId}});
 await tx.taskTemplate.update({where:{id:templateId},data:{areaId:area.id,verificationVersion:2,inventorySelection:input.inventorySelection,inventoryConfigVersion:area.inventoryVersion,setupStatus:'READY'}});
 if(input.selectedItems.length)await tx.taskTemplateItem.createMany({data:input.selectedItems.map(i=>({templateId,areaId:area.id,...i}))});
}
function snapshotItems(selection:Awaited<ReturnType<typeof validateInventorySelection>>) {
 const {selected,overrides}=selection;
 return selected.map(item=>{
   const mandatory=overrides.get(item.id)??true;const views=requiredViewsSchema.parse(item.requiredViews);
   return {sourceAreaItemId:item.id,itemCodeSnapshot:item.stableCode,nameSnapshot:item.displayName,typeSnapshot:item.fixtureType,orderSnapshot:item.sequence,identificationSnapshot:{mode:item.identificationMode,existingNumber:item.existingNumber,positionHint:item.positionHint},rubricSnapshot:{key:item.rubricKey,version:item.rubricVersion,views,criteria:visibleRubricV1.criteria,outcomes:visibleRubricV1.outcomes,surfacesByView:Object.fromEntries(views.map(v=>[v.key,viewSurfaces[v.key]??[]]))},mandatory,requirements:{create:views.map(v=>({viewKey:v.key,instructionsSnapshot:v.instructions,mandatory:mandatory&&v.mandatory}))}};
  });
}
export type InstanceGenerationInput=Prisma.TaskInstanceUncheckedCreateInput&{baseDate?:Date};
export async function createTaskInstanceWithSnapshot(data:InstanceGenerationInput) {
 if(!data.templateId)throw new ApiError(422,'Scheduled task requires a template');
 return prisma.$transaction(async tx=>{
  const initial=await tx.taskTemplate.findUniqueOrThrow({where:{id:data.templateId!},select:{areaId:true}});
  if(initial.areaId)await tx.$queryRaw`SELECT id FROM "Area" WHERE id=${initial.areaId} FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM "TaskTemplate" WHERE id=${data.templateId} FOR UPDATE`;
  const template=await tx.taskTemplate.findUniqueOrThrow({where:{id:data.templateId!},include:{inventoryItems:true,location:{include:{company:true}}}});
  if(initial.areaId!==template.areaId)throw new ApiError(409,'Template area changed during generation; retry');
  const staff=template.staffId?await tx.staff.findUnique({where:{id:template.staffId},select:{shiftStart:true,shiftEnd:true}}):null;
  const window=data.baseDate?resolveTaskInstanceWindow({baseDate:data.baseDate,taskShiftStart:template.shiftStart,taskShiftEnd:template.shiftEnd,staffShiftStart:staff?.shiftStart,staffShiftEnd:staff?.shiftEnd,timeZone:template.location.timezone}):{date:new Date(data.date),shiftStart:new Date(data.shiftStart),shiftEnd:new Date(data.shiftEnd)};
  const existing=await tx.taskInstance.findUnique({where:{templateId_date:{templateId:template.id,date:window.date}}});
  if(existing)return {...existing,created:false};
  if(!template.isActive||!template.location.isActive||!template.location.company.isActive)return null;
  const common={templateId:template.id,title:template.title,locationId:template.locationId,staffId:template.staffId,...window};
  async function blockGeneration(reason:string) {
   await tx.taskTemplate.update({where:{id:template.id},data:{setupStatus:'NEEDS_REVIEW'}});
   const key=`setup:template:${template.id}`;
   const issueKey=`${key}:${reason}`;
   await tx.verificationException.upsert({where:{dedupeKey:key},create:{companyId:template.location.companyId,locationId:template.locationId,areaId:template.areaId,kind:'SETUP',dedupeKey:key,state:'MANAGER_REVIEW',priority:2,events:{create:{type:'SETUP_REQUIRED',dedupeKey:issueKey,payload:{templateId:template.id,reason}}}},update:{state:'MANAGER_REVIEW',resolvedAt:null}});
   console.warn(JSON.stringify({code:'INVENTORY_GENERATION_BLOCKED',templateId:template.id,companyId:template.location.companyId,reason,date:window.date.toISOString()}));
   return null;
  }
  // Existing historical instances remain readable; every newly generated task
  // requires a configured inventory schedule and a complete v2 snapshot.
  if(template.verificationVersion!==2)return blockGeneration('INVENTORY_MAPPING_REQUIRED');
  if(template.setupStatus!=='READY'||!template.areaId)return blockGeneration('SETUP_REQUIRED');
  let selection:Awaited<ReturnType<typeof validateInventorySelection>>;
  try {selection=await validateInventorySelection(tx,template.locationId,{areaId:template.areaId,inventorySelection:template.inventorySelection,expectedInventoryVersion:(await tx.area.findUniqueOrThrow({where:{id:template.areaId}})).inventoryVersion,selectedItems:template.inventoryItems.map(i=>({areaItemId:i.areaItemId,mandatory:i.mandatory}))});}
  catch(error){if(error instanceof ApiError||error instanceof Error&&error.name==='ZodError')return blockGeneration('INVENTORY_REVIEW_REQUIRED');throw error;}
  const {area,selected,overrides}=selection;
  const policy=resolvePolicy(template.location.company.verificationPolicy);
  if(selected.length>policy.maxItems)return blockGeneration('CAPACITY_LIMIT');
  const instance=await tx.taskInstance.create({data:{...common,verificationVersion:2,areaId:area.id,areaNameSnapshot:area.name,inventoryVersion:area.inventoryVersion,policySnapshot:policy,...taskDeadlines(window.shiftEnd,policy),verificationItems:{create:snapshotItems(selection)}}});
  if(instance.staffId)await tx.taskAssignment.create({data:{taskInstanceId:instance.id,staffId:instance.staffId}});
  return {...instance,created:true};
 },{maxWait:10000,timeout:30000});
}
export async function generateTaskInstances(data:InstanceGenerationInput[]) {
 let count=0;for(const row of data){const instance=await createTaskInstanceWithSnapshot(row);if(instance?.created)count++;}return {count};
}

/** Explicit, single-task repair only. Schedule edits and cron never invoke this. */
export async function repairUnstartedInventoryTask(input:{taskId:number;templateId:number;locationId:number;expectedInventoryVersion:number}) {
 return prisma.$transaction(async tx=>{
  const initial=await tx.taskTemplate.findUniqueOrThrow({where:{id:input.templateId},select:{areaId:true}});
  if(!initial.areaId)throw new ApiError(409,'Schedule has no area inventory');
  await tx.$queryRaw`SELECT id FROM "Area" WHERE id=${initial.areaId} FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM "TaskTemplate" WHERE id=${input.templateId} FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM "TaskInstance" WHERE id=${input.taskId} FOR UPDATE`;
  const template=await tx.taskTemplate.findUniqueOrThrow({where:{id:input.templateId},include:{inventoryItems:true,location:{include:{company:true}}}});
  const task=await tx.taskInstance.findUniqueOrThrow({where:{id:input.taskId},include:{assignments:true,_count:{select:{areaSubmissions:true,completionAttempts:true,captureSessions:true,evidenceAssets:true,verificationItems:true}},verificationException:true}});
  if(template.areaId!==initial.areaId||template.locationId!==input.locationId||task.locationId!==input.locationId||task.templateId!==template.id)throw new ApiError(409,'Task or schedule mapping changed');
  if(!template.isActive||!template.location.isActive||!template.location.company.isActive||template.verificationVersion!==2||template.setupStatus!=='READY')throw new ApiError(409,'An active configured inventory schedule is required');
  if(task.verificationVersion!==1||!task.isActive||task.status!=='PENDING'||task.startedAt||task.completedAt||task.completionOutcome||task.hasManualOverride||task.verificationState!=='NOT_STARTED'||task.shiftEnd<=new Date()||task.proofImageUrls.length||task.verificationException||Object.values(task._count).some(Boolean)||task.assignments.some(a=>a.status!=='ASSIGNED'||a.startedAt||a.completedAt||a.failedAt))throw new ApiError(409,'Only an unstarted, unexpired legacy task without evidence can be repaired');
  const selection=await validateInventorySelection(tx,input.locationId,{areaId:template.areaId!,inventorySelection:template.inventorySelection,expectedInventoryVersion:input.expectedInventoryVersion,selectedItems:template.inventoryItems.map(i=>({areaItemId:i.areaItemId,mandatory:i.mandatory}))});
  const policy=resolvePolicy(template.location.company.verificationPolicy);
  if(selection.selected.length>policy.maxItems)throw new ApiError(409,'Inventory exceeds task capacity');
  const updated=await tx.taskInstance.update({where:{id:task.id},data:{verificationVersion:2,areaId:selection.area.id,areaNameSnapshot:selection.area.name,inventoryVersion:selection.area.inventoryVersion,policySnapshot:policy,...taskDeadlines(task.shiftEnd,policy),rowVersion:{increment:1},verificationItems:{create:snapshotItems(selection)}}});
  await writeAuditLog({companyId:template.location.companyId,actorType:'SYSTEM',entityType:'TASK_INSTANCE',entityId:task.id,action:'REPAIR_UNSTARTED_INVENTORY_TASK',reason:'Explicit operator repair of pending legacy task after schedule inventory setup',oldValue:{verificationVersion:1,areaId:task.areaId},newValue:{verificationVersion:2,areaId:selection.area.id,inventoryVersion:selection.area.inventoryVersion}},tx);
  return updated;
 },{timeout:30000});
}
