import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client';
import { invalidateWorkspace } from '@/lib/invalidateWorkspace';
import { useLanguage } from '@/i18n/context';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/DataTable';
import { Input } from '@/components/ui/input';

type Row = { row:number; name:string; email:string; phone:string; start:string; end:string; errors:string[] };
type Preview = { total:number; valid:number; rows:Row[]; token:string; location:{name:string;timezone:string} };
export default function StaffImportDialog({location}:{location:{id:number;name:string}}) {
  const {language}=useLanguage(), ur=language==='ur';
  const say=(en:string,urdu:string)=>ur?urdu:en;
  const [open,setOpen]=useState(false), [file,setFile]=useState<File|null>(null), [preview,setPreview]=useState<Preview|null>(null), [count,setCount]=useState<number|null>(null);
  const cache=useQueryClient(), busy=useRef(false);
  const base=`/location/${location.id}/staff-import`;
  const previewMutation=useMutation({mutationFn:async(next:File)=>{
    const body=new FormData();body.append('file',next);
    return (await client.post<{data:Preview}>(`${base}/preview`,body)).data.data;
  },onSuccess:setPreview});
  const confirm=useMutation({mutationFn:async()=>{
    if(!file||!preview||busy.current) return;
    busy.current=true;
    try {
      const body=new FormData();body.append('file',file);body.append('token',preview.token);
      const result=await client.post<{data:{count:number}}>(`${base}/confirm`,body);
      setCount(result.data.data.count);setPreview(null);setFile(null);
      void invalidateWorkspace(cache);
    } finally {busy.current=false;}
  }});
  const template=useMutation({mutationFn:async()=>{
    const response=await client.get(`${base}/template`,{responseType:'blob'});
    const url=URL.createObjectURL(response.data), link=document.createElement('a');
    link.href=url;link.download='staff-template.xlsx';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }});
  const rowError=(message:string)=>ur?({'Unsupported formula, link or cell content.':'فارمولا، لنک یا مواد قابل قبول نہیں۔','Enter a name between 2 and 150 characters.':'نام ۲ سے ۱۵۰ حروف میں درج کریں۔','Enter a valid email.':'درست ای میل درج کریں۔','Enter a valid phone as text, including any leading zero.':'ابتدائی صفر سمیت درست فون متن میں درج کریں۔','Enter different shift times in HH:mm format.':'شفٹ کے مختلف اوقات HH:mm میں درج کریں۔','Duplicate email in this spreadsheet.':'شیٹ میں ای میل دوبارہ درج ہے۔','Email is already in use.':'ای میل پہلے سے استعمال میں ہے۔','Enter a password with at least 6 characters and at most 72 UTF-8 bytes.':'پاس ورڈ کم از کم ۶ حروف اور زیادہ سے زیادہ ۷۲ UTF-8 بائٹس کا درج کریں۔'} as Record<string,string>)[message]??'یہ قطار درست کریں۔':message;
  const pending=previewMutation.isPending||confirm.isPending;
  const error=previewMutation.error||confirm.error||template.error;
  return <Dialog open={open} onOpenChange={next=>{if(!pending)setOpen(next);}}>
    <DialogTrigger asChild><Button variant="outline">{say('Import Staff','عملہ درآمد کریں')}</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" dir={ur?'rtl':'ltr'}>
        <DialogHeader><DialogTitle>{say('Import Staff','عملہ درآمد کریں')}</DialogTitle>
          <DialogDescription>{location.name} · {say('All employees will be assigned to this location. Use local shift times. Maximum 500 rows, subject to your plan capacity.','تمام ملازمین اسی مقام پر مقرر ہوں گے۔ مقامی شفٹ اوقات درج کریں۔ زیادہ سے زیادہ ۵۰۰ قطاریں، منصوبے کی گنجائش کے مطابق۔')}</DialogDescription></DialogHeader>
        {count!==null?<div role="status" className="space-y-3"><p>{count} {say('employees imported into','ملازمین درآمد ہوئے:')} {location.name}.</p><p>{say('Staff can now sign in using their email and the password you entered in the spreadsheet. Share each password privately with its employee.','عملہ اب اپنی ای میل اور شیٹ میں درج پاس ورڈ سے داخل ہو سکتا ہے۔ ہر ملازم کو اس کا پاس ورڈ نجی طور پر دیں۔')}</p><Button onClick={()=>{setCount(null);setOpen(false);}}>{say('Done','مکمل')}</Button></div>:<>
          <Button variant="outline" disabled={template.isPending||pending} onClick={()=>template.mutate()}>{say('Download Excel Template','ایکسل سانچہ ڈاؤن لوڈ کریں')}</Button>
          <p className="text-sm text-muted-foreground">{say('Name, email, phone, shift start, shift end and password are required. Enter a password of at least 6 characters for each employee. Staff use it to sign in after import. Passwords stay hidden in the preview. Format phones as Text and use HH:mm shift times, such as 22:00–06:00.','نام، ای میل، فون، شفٹ کا آغاز، اختتام اور پاس ورڈ ضروری ہیں۔ ہر ملازم کے لیے کم از کم ۶ حروف کا پاس ورڈ درج کریں جس سے وہ درآمد کے بعد داخل ہو سکے گا۔ پیش نظارے میں پاس ورڈ پوشیدہ رہیں گے۔ فون متن میں اور اوقات 22:00–06:00 کی طرح لکھیں۔')}</p>
          <label htmlFor={`staff-file-${location.id}`}>{say('Completed spreadsheet (.xlsx or .csv, up to 1 MB)','مکمل شیٹ (.xlsx یا .csv، زیادہ سے زیادہ ۱ ایم بی)')}</label>
          <Input id={`staff-file-${location.id}`} type="file" accept=".xlsx,.csv" disabled={pending} onChange={event=>{
            const next=event.target.files?.[0]??null;setFile(next);setPreview(null);previewMutation.reset();confirm.reset();template.reset();
            if(next)previewMutation.mutate(next);
          }}/>
          {pending?<p role="status">{confirm.isPending?say('Importing employees…','ملازمین درآمد ہو رہے ہیں…'):say('Checking spreadsheet…','شیٹ کی جانچ جاری ہے…')}</p>:null}
          {error?<p role="alert">{say('Could not complete this step. Check the file, assigned location and plan capacity. Preview again if it expired. If confirmation was interrupted, retry the same file to check its saved result.','یہ مرحلہ مکمل نہیں ہوا۔ فائل، مقرر مقام اور منصوبے کی گنجائش دیکھیں۔ میعاد ختم ہونے پر دوبارہ جانچیں۔ تصدیق میں خلل آنے پر محفوظ نتیجہ جانچنے کے لیے وہی فائل دوبارہ آزمائیں۔')}</p>:null}
          {preview?<>
            <p role="status">{preview.total} {say('Employees Found','ملازمین ملے')} · {preview.valid} {say('Valid','درست')} · {preview.total-preview.valid} {say('Errors','غلطیاں')}</p>
            <div className="max-h-72 overflow-auto">
              <DataTable data={preview.rows} rowKey={row=>row.row} pageSize={20}
                columns={[
                  {key:'row',header:say('Row','قطار'),render:row=>row.row},
                  {key:'name',header:say('Name','نام'),render:row=>row.name},
                  {key:'email',header:say('Email','ای میل'),render:row=><bdi>{row.email}</bdi>},
                  {key:'phone',header:say('Phone','فون'),render:row=><bdi>{row.phone}</bdi>},
                  {key:'shift',header:say('Shift','شفٹ'),render:row=><bdi>{row.start}–{row.end}</bdi>},
                  {key:'errors',header:say('Errors','غلطیاں'),render:row=>row.errors.map(message=><p key={message}>{rowError(message)}</p>)},
                ]}
                mobileRender={row=><div className="space-y-2 break-words">
                  <strong>{row.row} · {row.name}</strong><p><bdi>{row.email}</bdi></p>
                  <p><bdi>{row.phone}</bdi> · <bdi>{row.start}–{row.end}</bdi></p>
                  {row.errors.map(message=><p key={message}>{rowError(message)}</p>)}
                </div>}/>
            </div>
            {preview.valid===preview.total?<p>{say('You are about to import','آپ درآمد کرنے والے ہیں:')} {preview.total} {say('employees into','ملازمین، مقام:')} {preview.location.name}.</p>:<p>{say('Correct the errors and upload the spreadsheet again.','غلطیاں درست کرکے شیٹ دوبارہ اپ لوڈ کریں۔')}</p>}
            <Button disabled={pending||preview.valid!==preview.total} onClick={()=>confirm.mutate()}>{say('Confirm Import','درآمد کی تصدیق')}</Button>
          </>:null}
          <Button variant="outline" disabled={pending} onClick={()=>setOpen(false)}>{say('Cancel','منسوخ')}</Button>
        </>}
      </DialogContent>
    </Dialog>;
}
