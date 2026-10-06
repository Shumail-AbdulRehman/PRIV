import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getEvidenceBlob } from './api';
export default function ProtectedEvidence({assetId,privacyState,alt='Verification evidence'}:{assetId:string;privacyState?:string;alt?:string}) {
  const [image,setImage]=useState<{assetId:string;url:string}|null>(null);const [failedAsset,setFailedAsset]=useState<string|null>(null);const [retry,setRetry]=useState(0);
  useEffect(()=>{if(privacyState==='PRIVACY_HOLD'||privacyState==='HELD')return;const abort=new AbortController();let objectUrl:string|undefined;getEvidenceBlob(assetId,abort.signal).then(blob=>{if(abort.signal.aborted)return;objectUrl=URL.createObjectURL(blob);setImage({assetId,url:objectUrl});setFailedAsset(null);}).catch(()=>{if(!abort.signal.aborted)setFailedAsset(assetId);});return()=>{abort.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};},[assetId,privacyState,retry]);
  if(privacyState==='PRIVACY_HOLD'||privacyState==='HELD')return <p className="rounded-lg bg-muted p-3 text-sm">Sensitive image restricted. Request a safe recapture.</p>;
  const url=image?.assetId===assetId?image.url:null;
  if(failedAsset===assetId)return <div role="alert" className="text-sm">Evidence unavailable. <Button size="sm" variant="outline" onClick={()=>setRetry(retry+1)}>Retry</Button></div>;
  return url?<a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={alt} className="max-h-64 max-w-full rounded-lg border border-border object-contain"/></a>:<p role="status" className="text-xs text-muted-foreground">Loading protected photo…</p>;
}
