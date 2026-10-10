import {View,StyleSheet,ActivityIndicator} from 'react-native';
import {Text} from '../../components/ui/text';
import {photoStatuses} from '../../verification/presentation';
import {checkedPhotoState} from '../../verification/policy';
import type {LocalSession,Manifest,QueueRow} from '../../verification/types';
export function VerificationProgress({manifest,local,rows,online,lastUpdated}:{manifest:Manifest;local:LocalSession|null;rows:QueueRow[];online:boolean;lastUpdated:number|null}){
 const photos=photoStatuses(manifest,local,rows);
 const finished=manifest.task.status==='COMPLETED'||!!manifest.staffSubmittedAt||!!manifest.task.completionOutcome;
 const checked=photos.filter(photo=>checkedPhotoState(photo.state)).length;
 const attention=photos.some(photo=>['RECAPTURE_REQUIRED','CLEANING_REQUIRED'].includes(photo.state));
 return <View style={styles.root}>
  <View style={styles.summary}>
   <Text style={styles.title} accessibilityLiveRegion="polite">{finished?'Task completed':attention?'Photo needs attention':!online?'Photo saved safely':'Checking photo…'}</Text>
   <Text style={styles.body}>{finished?'Your task has been submitted.':attention?'Follow the instruction for the current item before continuing.':!online?'Reconnect to send your saved photo.':'Keep the app open. The next item opens after this photo is checked.'}</Text>
   {!finished?<Text style={styles.metric}>{checked} of {photos.length} photos checked</Text>:null}
  </View>
  {!finished?<View style={styles.list}>{photos.map((photo,index)=>{
   const done=checkedPhotoState(photo.state);
   const action=['RECAPTURE_REQUIRED','CLEANING_REQUIRED'].includes(photo.state);
   const processing=['UPLOADING','PROCESSING','SERVER_ACCEPTED'].includes(photo.state);
   return <View key={photo.key} style={[styles.row,index>0&&styles.separator]}>
    {processing?<ActivityIndicator size="small" color="#087F73"/>:<Text style={styles.marker}>{done?'✓':action?'!':index+1}</Text>}
    <View style={{flex:1,gap:4}}><Text style={styles.rowTitle}>{photo.title}</Text><Text style={styles.body}>{done?'Photo checked':action?'Take another photo':processing?'Sending and checking…':['MISSING','AVAILABLE'].includes(photo.state)?'Not taken yet':'Saved on this phone'}</Text>{action&&photo.detail?<Text style={styles.body}>{photo.detail}</Text>:null}</View>
   </View>;
  })}</View>:null}
  {!finished&&lastUpdated?<Text style={styles.updated}>Last updated {new Date(lastUpdated).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text>:null}
 </View>;
}
const styles=StyleSheet.create({root:{gap:16},summary:{backgroundColor:'#E8F5F1',borderRadius:20,padding:20,gap:10},title:{fontSize:24,lineHeight:30,fontWeight:'700',color:'#172A2A'},body:{fontSize:14,lineHeight:21,color:'#586B6B'},metric:{fontSize:14,fontWeight:'600',color:'#172A2A'},list:{borderWidth:1,borderColor:'#DDE6E3',borderRadius:16,paddingHorizontal:16},row:{flexDirection:'row',gap:12,paddingVertical:16,alignItems:'flex-start'},separator:{borderTopWidth:1,borderTopColor:'#DDE6E3'},marker:{fontSize:18,color:'#087F73',fontWeight:'700',width:24},rowTitle:{fontSize:15,fontWeight:'600',color:'#172A2A'},updated:{fontSize:14,color:'#586B6B',textAlign:'center'}});
