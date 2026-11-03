import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.wav':'audio/wav','.mp4':'video/mp4','.png':'image/png','.srt':'text/plain'};
export function serve(port=5198){
  const server=http.createServer(async(req,res)=>{
    try{
      const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if(path!==root.slice(0,-1)&&!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end();return;}
      const name=(await stat(path)).isDirectory()?resolve(path,'index.html'):path;
      const data=await readFile(name),range=req.headers.range;
      const type=mime[extname(name)]||'application/octet-stream';
      if(range){const [,a,b]=/bytes=(\d+)-(\d*)/.exec(range)||[];const start=Number(a),end=b?Number(b):data.length-1;
        if(!Number.isFinite(start)||start>=data.length||end<start){res.writeHead(416).end();return;}
        res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));
      }else{res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':'no-cache'});res.end(data);}
    }catch{res.writeHead(404).end('Not found');}
  });
  return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){await serve(Number(process.env.PORT||5198));console.log('Hygene Ops film: http://127.0.0.1:'+(process.env.PORT||5198));}
