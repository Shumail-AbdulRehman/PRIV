import assert from 'node:assert/strict';
import test from 'node:test';
import {registerHooks} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {create,act} from 'react-test-renderer';
globalThis.React=React;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const now=Date.now();
const shift={id:456,date:new Date(now).toISOString(),status:'CHECKED_IN',expectedStart:new Date(now-3*3600000).toISOString(),expectedEnd:new Date(now-60000).toISOString(),checkInTime:new Date(now-2*3600000).toISOString(),checkOutTime:null,location:{id:7,name:'Assigned site'}};
let records=[shift],uploads=[],failRead=false,permissions=0;
const cache={invalidateQueries:async()=>{},setQueryData(){}};
globalThis.attendanceRecovery={
 records:()=>records,
 read:async()=>{if(failRead)throw new Error('offline');return records;},
 permission:async()=>{permissions++;return{granted:true};},
 upload:async(path,form)=>{uploads.push({path,id:form.get('attendanceId')});records=[{...shift,checkOutTime:new Date(now).toISOString(),status:'CHECKED_OUT'}];throw new Error('response lost');},
 cache,
};
const mocks={
 'react-native':'{Alert:{alert(){}},Linking:{openSettings:async()=>{}},RefreshControl:"RefreshControl",ScrollView:"ScrollView",View:"View"}',
 'expo-camera':'{useCameraPermissions:()=>[null,globalThis.attendanceRecovery.permission]}',
 'expo-location':'{requestForegroundPermissionsAsync:globalThis.attendanceRecovery.permission,Accuracy:{Highest:1}}','expo-haptics':'{}',
 '@react-native-community/netinfo':'{addEventListener:()=>()=>{}}',
 '@react-navigation/native':'{useNavigation:()=>({navigate(){}}),useIsFocused:()=>true}',
 'react-native-safe-area-context':'{useSafeAreaInsets:()=>({top:0,bottom:0})}',
 '@tanstack/react-query':'{useQueryClient:()=>globalThis.attendanceRecovery.cache}',
 '/launch/launchApi':'{readAttendance:globalThis.attendanceRecovery.read}',
 '/auth/AuthContext':'{useAuth:()=>({user:{id:2,companyId:3,locationId:7}})}',
 '/api/client':'{uploadFormData:globalThis.attendanceRecovery.upload}',
 '/queries/staff':'{staffQueryKeys:{attendance:id=>[id,"attendance"],tasksToday:id=>[id,"tasks"]},useMyAttendanceQuery:()=>({data:globalThis.attendanceRecovery.records(),refetch:async()=>({}),isPending:false,isRefetching:false}),useTodaysTasksQuery:()=>({data:[],counts:{total:0,submitted:0},refetch:async()=>({}),isPending:false,isRefetching:false})}',
 '/verification/location':'{currentLocation:async()=>({coords:{latitude:24,longitude:67,accuracy:10}})}',
 '/utils/upload':'{createImagePart:()=>"synthetic-image"}',
 '/components/AttendanceCamera':'{AttendanceCamera:"AttendanceCamera"}',
 '/components/ui/button':'{Button:"Button"}','/components/ui/text':'{Text:"Text"}','/components/ui/icon':'{Icon:"Icon"}',
 '/components/ui/card':'{Card:"Card",CardContent:"CardContent"}',
 '/components/ScreenHeader':'{ScreenHeader:()=>null}','/components/StaffBrand':'{StaffBrand:()=>null}','/components/TaskCard':'{TaskCard:()=>null}','/components/LoadingState':'{LoadingState:()=>null}',
 '/i18n/LanguageProvider':'{useLanguage:()=>({t:text=>text,isRTL:false,language:"en"})}',
};
const directory=mkdtempSync(join(tmpdir(),'attendance-recovery-ui-'));
const urls=Object.fromEntries(Object.entries(mocks).map(([name,value],index)=>{const path=join(directory,index+'.cjs');writeFileSync(path,`module.exports=${value}`);return[name,pathToFileURL(path).href];}));
const hook=registerHooks({resolve(specifier,context,next){const name=Object.keys(urls).find(name=>specifier===name||name.startsWith('/')&&specifier.endsWith(name));return name?{url:urls[name],shortCircuit:true}:next(specifier,context);}});
const {HomeScreen}=await import('../src/screens/HomeScreen.tsx');
async function mount(){let renderer;await act(async()=>{renderer=create(React.createElement(HomeScreen));});return renderer;}
function checkout(renderer){return renderer.root.findAllByType('Button').find(button=>button.props.children==='Check Out');}
test('actual home screen sends exact selected checkout ID and reconciles a lost write response',async()=>{
 records=[shift];uploads=[];permissions=0;failRead=false;const renderer=await mount();
 try{assert.ok(checkout(renderer));await act(async()=>checkout(renderer).props.onPress());const camera=renderer.root.findByType('AttendanceCamera');await act(async()=>camera.props.onCapture('synthetic-selfie.jpg'));assert.deepEqual(uploads,[{path:'/attendance/check-out',id:'456'}]);assert.equal(renderer.root.findAllByType('AttendanceCamera').length,0);assert.ok(renderer.root.findAllByType('Text').some(node=>node.props.children==='Check-out recorded.'));}
 finally{await act(async()=>renderer.unmount());}
});
test('home screen reconciles before camera permission and never opens camera when disconnected',async()=>{
 records=[shift];uploads=[];permissions=0;failRead=true;const renderer=await mount();
 try{await act(async()=>checkout(renderer).props.onPress());assert.equal(renderer.root.findAllByType('AttendanceCamera').length,0);assert.equal(permissions,0);assert.equal(uploads.length,0);}
 finally{failRead=false;await act(async()=>renderer.unmount());}
});
test.after(()=>{hook.deregister();rmSync(directory,{recursive:true,force:true});});
