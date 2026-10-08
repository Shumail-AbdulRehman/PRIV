import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../../components/ui/text';
import { photoStatuses, statusLabel } from '../../verification/presentation';
import type { LocalSession, Manifest, QueueRow } from '../../verification/types';

const colors = { ink: '#172A2A', muted: '#586B6B', teal: '#087F73', mint: '#E8F5F1', border: '#DDE6E3', amber: '#925713', paleAmber: '#FFF4DF',dirty:'#A43131',paleDirty:'#FBEAE7' };
export function VerificationProgress({ manifest, local, rows, online, lastUpdated }: {
  manifest: Manifest; local: LocalSession | null; rows: QueueRow[]; online: boolean; lastUpdated: number | null;
}) {
  const photos = photoStatuses(manifest, local, rows);
  const passed = photos.filter(photo => ['PASSED','MANAGER_ACCEPTED','WAIVED'].includes(photo.state)).length;
  const cleanCount=photos.filter(photo=>photo.cleanlinessOutcome==='CLEAN').length;
  const dirtyCount=photos.filter(photo=>photo.cleanlinessOutcome==='DIRTY').length;
  const reviewCount=photos.filter(photo=>photo.cleanlinessOutcome==='NEEDS_REVIEW').length;
  const retakes = photos.filter(photo => ['RECAPTURE_REQUIRED','CLEANING_REQUIRED'].includes(photo.state)).length;
  const waiting = rows.filter(row => ['SAVED','RETRY_WAIT','AUTH_REQUIRED','BLOCKED'].includes(row.state)).length;
  const uploading = rows.filter(row => row.state === 'UPLOADING').length;
  const finished = ['VERIFIED_COMPLETE','COMPLETED_WITH_EXCEPTIONS'].includes(manifest.task.completionOutcome ?? '');
  const review = manifest.task.verificationState === 'NEEDS_REVIEW';
  const missing = photos.some(photo => ['MISSING','AVAILABLE'].includes(photo.state));
  const pending=rows.filter(row=>['UPLOADING','SERVER_ACCEPTED','PROCESSING'].includes(row.state));
  const delayed=pending.some(row=>Date.now()-(row.metadata.timings?.uploadStartedAt??row.metadata.timings?.capturedAt??local?.savedAt??Date.now())>30_000)||!!local&&Date.now()-local.savedAt>30_000&&(manifest.pendingJobs??0)>0;
  const serviceFailure=photos.some(photo=>photo.state==='SERVICE_FAILURE');
  const title = finished ? (manifest.task.completionOutcome==='COMPLETED_WITH_EXCEPTIONS'?'Completed with exceptions':'Verified complete') : dirtyCount ? `${dirtyCount} ${dirtyCount===1?'view needs':'views need'} cleaning` : retakes ? `${retakes} ${retakes === 1 ? 'photo needs' : 'photos need'} attention` :
    review||serviceFailure||reviewCount ? 'Needs review' : !online ? 'Photos saved safely' : waiting || uploading ? 'Sending your photos' : missing ? 'More photos needed' : delayed ? 'Checks are taking longer' : 'Checking your work';
  const detail = finished ? (manifest.task.completionOutcome==='COMPLETED_WITH_EXCEPTIONS'?'Your manager resolved the exceptions. Accepted and waived views are shown separately from Clean.':'All required checks passed. Your task result has been recorded.') : dirtyCount ? 'Clean only the views marked Dirty, then scan the area QR again. Clean and accepted views are kept.' : retakes ? 'Only retake the views with a retake instruction. Clean and accepted views are kept.' :
    review||serviceFailure||reviewCount ? 'Your photos are kept. Follow the instructions below; unresolved checks may need your manager.' : !online ? 'Connect to the network to continue uploading.' :
    delayed ? 'This is taking longer than usual. You can continue with the next item or return to your tasks. Your saved photos are kept.' : waiting || uploading ? 'Keep the app open while photos upload. You can continue taking the remaining photos.' :
    missing ? 'Continue the photo guide to capture the remaining views.' : delayed ? 'Your photos reached the server. Checks are still pending; you can return to your tasks and check again later.' :
    'Results refresh automatically. A saved or uploaded photo is still waiting for verification.';
  return <View style={styles.root}>
    <View style={[styles.summary, (retakes > 0||reviewCount>0) && styles.attention]}>
      <Text style={styles.eyebrow}>PHOTO VERIFICATION</Text>
      <Text style={styles.title} accessibilityLiveRegion="polite">{title}</Text>
      <Text style={styles.body}>{detail}</Text>
      {(cleanCount+dirtyCount+reviewCount)>0?<Text style={styles.metric} accessibilityLiveRegion="polite">{cleanCount} Clean · {dirtyCount} Dirty · {reviewCount} Needs review</Text>:null}
      <View style={styles.track}><View style={[styles.fill,{width:`${photos.length ? passed/photos.length*100 : 0}%`}]} /></View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>{passed} of {photos.length} views resolved</Text>
        {uploading > 0 ? <Text style={styles.metric}>{uploading} uploading</Text> : waiting > 0 ? <Text style={styles.metric}>{waiting} on phone</Text> : null}
      </View>
    </View>
    <View style={styles.list}>
      {photos.map((photo,index) => {
        const passed = ['PASSED','MANAGER_ACCEPTED','WAIVED'].includes(photo.state);
        const attention = ['RECAPTURE_REQUIRED','CLEANING_REQUIRED','BLOCKED','AUTH_REQUIRED','REVIEW_REQUIRED','PRIVACY_HOLD','SERVICE_FAILURE'].includes(photo.state);
        const dirty=photo.cleanlinessOutcome==='DIRTY';
        const reviewed=photo.cleanlinessOutcome==='NEEDS_REVIEW';
        const tone=dirty?colors.dirty:attention?colors.amber:colors.muted;
        const checking = ['UPLOADING','PROCESSING','SERVER_ACCEPTED'].includes(photo.state);
        const slow=delayed&&checking;
        return <View key={photo.key} style={[styles.row,index > 0 && styles.separator]}>
          <View style={[styles.marker, passed ? {backgroundColor:colors.mint} : dirty?{backgroundColor:colors.paleDirty}:attention ? {backgroundColor:colors.paleAmber} : {}]}>
            {checking&&!slow ? <ActivityIndicator size="small" color={colors.teal}/> : <Text style={{color:dirty?colors.dirty:attention?colors.amber:colors.teal,fontWeight:'700'}}>{passed ? '✓' : reviewed&&!dirty ? '?' : attention ? '!' : slow ? '…' : String(index+1)}</Text>}
          </View>
          <View style={{flex:1,gap:4}}>
            <Text style={styles.rowTitle}>{photo.title}</Text>
            <Text style={[styles.label,{color:tone}]}>{statusLabel(photo.state,photo.cleanlinessOutcome)}{slow?' · Taking longer than usual':''}</Text>
            {photo.actionLabel?<Text style={[styles.label,{color:tone}]}>{photo.actionLabel}</Text>:null}
            {photo.detail && (attention || ['REVIEW_REQUIRED','PRIVACY_HOLD'].includes(photo.state)) ? <Text style={styles.body}>{photo.detail}</Text> : null}
          </View>
        </View>;
      })}
    </View>
    <Text style={styles.updated}>{lastUpdated ? `Last checked at ${new Date(lastUpdated).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : 'Connecting for the latest results…'}</Text>
  </View>;
}
const styles=StyleSheet.create({
  root:{gap:16},summary:{backgroundColor:colors.mint,borderRadius:20,padding:20,gap:10},attention:{backgroundColor:colors.paleAmber},
  eyebrow:{fontSize:11,fontWeight:'700',letterSpacing:1.3,color:colors.muted},title:{fontSize:24,lineHeight:30,fontWeight:'700',color:colors.ink},
  body:{fontSize:14,lineHeight:21,color:colors.muted},track:{height:6,borderRadius:3,backgroundColor:'#D4E4DF',overflow:'hidden',marginTop:6},fill:{height:6,backgroundColor:colors.teal},
  metrics:{flexDirection:'row',justifyContent:'space-between',gap:8,flexWrap:'wrap'},metric:{fontSize:12,fontWeight:'600',color:colors.ink},
  list:{borderWidth:1,borderColor:colors.border,borderRadius:16,paddingHorizontal:16},row:{flexDirection:'row',gap:12,paddingVertical:16,alignItems:'flex-start'},separator:{borderTopWidth:1,borderTopColor:colors.border},
  marker:{width:30,height:30,borderRadius:15,backgroundColor:'#F2F5F4',alignItems:'center',justifyContent:'center'},rowTitle:{fontSize:15,fontWeight:'600',color:colors.ink},label:{fontSize:12,fontWeight:'600'},updated:{fontSize:12,color:colors.muted,textAlign:'center'},
});
