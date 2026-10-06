export function verificationTaskLabel(task:{status:string;verificationState?:string;completionOutcome?:string|null},action=false):string {
 if(task.completionOutcome==='VERIFIED_COMPLETE')return 'Verified complete';
 if(task.completionOutcome==='COMPLETED_WITH_EXCEPTIONS')return 'Completed with exceptions';
 const labels:Record<string,string>={CAPTURING:'Continue photos',PROCESSING:'Waiting for checks',REWORK_REQUIRED:'Fixing items',NEEDS_REVIEW:'Manager review'};
 return labels[task.verificationState??'']??(task.status==='PENDING'?'Start cleaning':action?'Finish task':'Cleaning');
}
