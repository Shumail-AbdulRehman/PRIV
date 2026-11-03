const story=await(await fetch('story.json')).json();
let captions=[];
try{captions=await(await fetch('captions.json')).json();}catch{/* Voice generation may still be running during design preview. */}
const canvas=document.getElementById('film'),c=canvas.getContext('2d');
const W=1920,H=1080;
const P={blue:'#4264D9',ink:'#15233C',muted:'#687791',ice:'#F1F5FC',white:'#FFFFFF',line:'#DDE5F2',mint:'#DDF0E8',green:'#27745F',amber:'#996119',paleAmber:'#FFF0D8',red:'#AD4545',paleRed:'#FBE7E5',sky:'#E4EBFF',navy:'#101F3A'};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>1-Math.pow(1-clamp(n),3);
const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
const mix=(a,b,n)=>a+(b-a)*clamp(n);
const arrive=(t,start=0,duration=.65)=>ease((t-start)/duration);
function rr(x,y,w,h,r=16,fill=P.white,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function text(value,x,y,size=26,color=P.ink,weight=500,align='left',family='Manrope'){
  c.fillStyle=color;c.font=`${weight} ${size}px ${family}`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(String(value),x,y);
}
function lines(values,x,y,size=66,color=P.ink,weight=700,gap=1.17){values.forEach((v,i)=>text(v,x,y+i*size*gap,size,color,weight));}
function rule(x1,y1,x2,y2,color=P.line,width=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function circle(x,y,r,fill,stroke){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function layer(alpha,fn,dx=0,dy=0,scale=1){if(alpha<=0)return;c.save();c.globalAlpha*=clamp(alpha);c.translate(dx,dy);c.scale(scale,scale);fn();c.restore();}
function card(x,y,w,h,fn,fill=P.white){c.save();c.shadowColor='#15233C0C';c.shadowBlur=28;c.shadowOffsetY=12;rr(x,y,w,h,18,fill,P.line);c.restore();if(fn)fn();}
function pill(label,x,y,fill=P.sky,color=P.blue,size=18){c.font=`650 ${size}px Manrope`;const w=c.measureText(label).width+28;rr(x,y-26,w,38,19,fill);text(label,x+14,y,size,color,650);return w;}
function mark(x,y,size=52,fill=P.blue){rr(x,y,size,size,size*.27,fill);c.save();c.translate(x,y);c.scale(size/48,size/48);c.fillStyle=P.white;c.fill(new Path2D('M12 12h8v11l8-5V12h8v24h-8V25l-8 5v6h-8V12Z'));c.restore();}
function check(x,y,s=20,color=P.green){c.save();c.strokeStyle=color;c.lineWidth=s*.13;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x-s*.37,y);c.lineTo(x-s*.09,y+s*.28);c.lineTo(x+s*.42,y-s*.32);c.stroke();c.restore();}
function icon(name,x,y,size=28,color=P.blue){
  c.save();c.translate(x,y);c.scale(size/24,size/24);c.strokeStyle=color;c.lineWidth=1.65;c.lineCap='round';c.lineJoin='round';
  const path=d=>c.stroke(new Path2D(d));
  const shapes={building:'M4 21V4h12v17M8 8h1m3 0h1M8 12h1m3 0h1M8 16h1m3 0h1M16 10h4v11M2 21h20',calendar:'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 4h2',users:'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-2a7 7 0 0 1 14 0v2m1-16a4 4 0 0 1 0 7m2 3a5 5 0 0 1 3 5',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v6l4 2',camera:'M3 7h5l2-3h4l2 3h5v14H3ZM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',pin:'M12 22s8-8 8-13A8 8 0 0 0 4 9c0 5 8 13 8 13ZM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',repeat:'M4 8h15l-4-4m4 4-4 4M20 16H5l4 4m-4-4 4-4',arrow:'M3 12h18m-6-6 6 6-6 6',bell:'M5 16h14l-2-3V9a5 5 0 0 0-10 0v4ZM10 20h4',task:'M8 4H4v18h16V4h-4M8 2h8v5H8ZM8 12h8m-8 5h5',grid:'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',scan:'M3 8V3h5m8 0h5v5m0 8v5h-5M8 21H3v-5M7 12h10',spark:'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',alert:'M12 3 2 21h20ZM12 9v5m0 3v1',phone:'M6 2h12v20H6ZM10 18h4'};
  path(shapes[name]||shapes.task);c.restore();
}
function path(points,color=P.line,width=3,progress=1,dashed=false){
  c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';if(dashed)c.setLineDash([9,12]);
  c.beginPath();c.moveTo(points[0],points[1]);c.bezierCurveTo(...points.slice(2));c.stroke();c.restore();
  if(progress>0&&progress<1){const p=bezier(points,progress);circle(p.x,p.y,7,P.blue);circle(p.x,p.y,14,'#4264D91A');}
}
function bezier(p,t){const u=1-t;return{x:u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6],y:u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]};}
function avatar(x,y,initials,fill=P.sky,size=42){circle(x,y,size/2,fill);text(initials,x,y+size*.15,size*.34,P.blue,700,'center');}
function building(x,y,w=210,h=260,color=P.blue){
  rr(x,y,w,h,12,P.white,P.line);rr(x+14,y+14,w-28,40,6,P.sky);icon('building',x+26,y+23,24,color);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)rr(x+25+col*(w-50)/3,y+80+row*48,(w-70)/3,28,5,'#EAF0FB');
  rr(x+w/2-18,y+h-51,36,51,4,color);rule(x-12,y+h,x+w+12,y+h,P.line,3);
}
function person(x,y,s=1){
  c.save();c.translate(x,y);c.scale(s,s);rr(-65,28,130,140,40,'#8FA9E6');circle(0,-15,39,'#C89A7B');c.fillStyle='#303444';c.beginPath();c.arc(0,-27,39,Math.PI,2*Math.PI);c.fill();rr(-43,-26,15,31,8,'#303444');rr(30,-26,13,31,7,'#303444');circle(-12,-13,2.8,P.ink);circle(13,-13,2.8,P.ink);c.strokeStyle='#865C49';c.lineWidth=3;c.beginPath();c.arc(0,-5,12,.2,Math.PI-.2);c.stroke();c.restore();
}
function photo(x,y,w,h,r=16,kind='cleaning'){c.save();c.beginPath();c.roundRect(x,y,w,h,r);c.clip();const image=images[kind];const ratio=Math.max(w/image.width,h/image.height);c.drawImage(image,x+(w-image.width*ratio)/2,y+(h-image.height*ratio)/2,image.width*ratio,image.height*ratio);c.restore();}
const TASKS=[
  {time:'8:00 AM',title:'Floor cleaning',site:'Building A',staff:'Ali',initials:'AL'},
  {time:'10:00 AM',title:'Washroom cleaning',site:'Building A',staff:'Sara',initials:'SA'},
  {time:'2:00 PM',title:'Lobby inspection',site:'Building A',staff:'Omar',initials:'OM'},
  {time:'9:00 AM',title:'Corridor cleaning',site:'Building B',staff:'Hina',initials:'HI'},
  {time:'11:00 AM',title:'Washroom cleaning',site:'Building B',staff:'Yusuf',initials:'YU'},
  {time:'5:00 PM',title:'Evening cleaning',site:'Building B',staff:'Sana',initials:'SN'}
];
function heading(kicker,title,sub){text(kicker.toUpperCase(),90,167,18,P.blue,750);text(title,88,244,62,P.ink,750);if(sub)text(sub,91,289,24,P.muted,450);}
function background(dark=false){c.fillStyle=dark?P.navy:P.ice;c.fillRect(0,0,W,H);if(!dark){c.fillStyle='#E9EFFA';c.beginPath();c.ellipse(1780,80,460,300,-.4,0,Math.PI*2);c.fill();}}
function header(scene,dark=false){mark(82,55,48);text('Hygene Ops',145,90,31,dark?P.white:P.ink,750);text(scene==='closing'?'CLEANING OPERATIONS PLATFORM':'INVESTOR EXPLAINER',1838,84,15,dark?'#A5B9DF':P.muted,650,'right');}
function footer(time,dark=false){
  const label=story.scenes.find(s=>time>=s.start&&time<s.end)?.label||story.scenes.at(-1).label;
  rule(84,1014,1836,1014,dark?'#334562':P.line,3);rule(84,1014,mix(84,1836,time/90),1014,dark?'#9DB6FF':P.blue,3);
  text('Illustrative product demo · Sample data',84,1050,15,dark?'#9DB0D0':P.muted,500);
  text(label,1836,1050,15,dark?'#9DB0D0':P.muted,500,'right');
  if(showCaptions){const cap=captions.find(s=>time>=s.start&&time<s.end);if(cap){c.font='550 24px Manrope';const width=c.measureText(cap.text).width+50;rr((W-width)/2,947,width,51,10,'#101F3AEF');text(cap.text,W/2,982,24,P.white,550,'center');}}
}
function opening(s){
  background(true);
  layer(arrive(s,.15),()=>{text('BUILT FOR CLEANING OPERATIONS',90,233,18,'#ADC2F1',650);lines(['Every building.','Every team.','One operation.'],84,365,94,P.white,750,1.18);text('Bring the daily details together.',91,797,29,'#B4C4E0',450);},0,(1-arrive(s,.15))*28);
  const nodes=[{x:1070,y:298,label:'LOCATIONS',name:'building'},{x:1500,y:300,label:'PEOPLE',name:'users'},{x:1060,y:682,label:'SCHEDULES',name:'calendar'},{x:1500,y:680,label:'PROOF',name:'camera'}];
  nodes.forEach((n,i)=>{const a=arrive(s,.7+i*.22);layer(a,()=>{const center={x:1370,y:540};const p=[n.x+100,n.y+70,n.x+100,540,center.x,540,center.x,center.y];path(p,'#3D557E',2,clamp((s-2-i*.4)/1.2));rr(n.x,n.y,198,132,16,'#1B3153','#3A5072');icon(n.name,n.x+26,n.y+24,34,'#AAC3FF');text(n.label,n.x+26,n.y+102,17,'#D2DDF3',600);},0,(1-a)*20);});
  layer(arrive(s,2.5),()=>{circle(1370,540,84,'#3459CF');circle(1370,540,103,null,'#7795EA');mark(1328,498,84);text('Hygene Ops',1370,682,28,P.white,750,'center');});
  layer(arrive(s,5.5),()=>pill('One connected operation',1157,864,'#263F68','#D7E3FF',22));
}
function metric(label,value,x,y,w=224,color=P.ink){rr(x,y,w,104,12,'#F5F7FC');text(label,x+18,y+31,17,P.muted,550);text(value,x+18,y+80,37,color,750);}
function dashboard(x,y,w,h,s=8,exceptions=false){
  c.save();c.translate(x,y);c.scale(w/1260,h/610);
  card(0,0,1260,610);
  rr(0,0,178,610,[18,0,0,18],'#F8FAFD');mark(20,20,33);text('Hygene Ops',63,43,16,P.ink,750);
  ['Overview','Locations','Team','Schedules','Task activity'].forEach((label,i)=>{if(i===0)rr(12,87+i*53,154,42,8,P.sky);icon(['grid','building','users','calendar','task'][i],24,98+i*53,19,i===0?P.blue:P.muted);text(label,55,113+i*53,15,i===0?P.blue:P.muted,i===0?750:550);});
  avatar(38,562,'FM',P.sky,30);text('Manager',61,568,14,P.ink,650);
  text(exceptions?'Today’s work, in focus':'Your operation, at a glance',210,48,29,P.ink,750);pill('All locations',1040,44,P.ice,P.muted,15);
  metric('Locations','2',210,76);metric('Assigned team','6',455,76);metric('Scheduled tasks','6',700,76);metric(exceptions?'Needs attention':'Daily recurrence',exceptions?'2':'On',945,76,278,exceptions?P.amber:P.green);
  text(exceptions?'Task activity':'Today’s cleaning schedule',212,222,21,P.ink,750);text('LOCATION',224,265,12,P.muted,750);text('TASK',400,265,12,P.muted,750);text('ASSIGNED TO',710,265,12,P.muted,750);text('STATUS',975,265,12,P.muted,750);
  const ordinary=['Completed','In progress','Scheduled','Completed','Pending','Scheduled'];
  const alerted=['Completed','Missed','In progress','Completed','Overdue','Scheduled'];
  TASKS.forEach((task,i)=>{const yy=293+i*48,vis=arrive(s,.15+i*.1);layer(vis,()=>{rule(211,yy+31,1221,yy+31,P.line,1);text(task.site,224,yy+12,16,P.muted,550);text(task.title,400,yy+12,17,P.ink,650);avatar(726,yy+5,task.initials,P.sky,26);text(task.staff,750,yy+12,16,P.ink,550);
    let label=(exceptions?alerted:ordinary)[i];if(s<4&&i<4)label='Pending';const good=label==='Completed',bad=['Missed','Overdue'].includes(label);pill(label,975,yy+12,good?P.mint:bad?P.paleAmber:P.sky,good?P.green:bad?P.amber:P.blue,14);
  },0,(1-vis)*12);});
  c.restore();
}
function phone(x,y,w=310,h=590,fn){
  c.save();c.translate(x,y);c.scale(w/310,h/590);c.save();c.shadowColor='#16295526';c.shadowBlur=35;c.shadowOffsetY=18;rr(0,0,310,590,43,P.navy);c.restore();rr(8,8,294,574,36,P.white);rr(108,15,94,23,13,P.navy);text('9:41',28,40,12,P.ink,750);rule(258,31,274,31,P.ink,6);c.save();c.beginPath();c.roundRect(14,53,282,509,24);c.clip();if(fn)fn();c.restore();rr(107,571,96,4,3,P.ink);c.restore();
}
function overview(s){
  background();heading('Centralized operations','Every location. One clear view.','Workforce, attendance, and daily cleaning activity in one workspace.');
  layer(arrive(s),()=>dashboard(90,343,1225,563,s),0,(1-arrive(s))*40);
  layer(arrive(s,1.5),()=>{phone(1420,310,324,616,()=>{rr(14,53,282,509,0,'#F8FAFE');text('Check in',34,96,25,P.ink,750);text('Building A',34,124,15,P.muted,550);
    rr(30,148,250,198,16,'#E8EFF7');for(let i=0;i<4;i++){rule(32,176+i*44,278,153+i*44,'#FFFFFF',15);rule(60+i*67,151,28+i*67,340,'#FFFFFF',11);}circle(158,244,69,'#4264D91B');circle(158,244,48,null,'#91A9E9');icon('pin',140,214,36,P.blue);circle(174,265,8,P.blue,P.white);
    pill('Within assigned location',33,376,P.mint,P.green,14);
    rr(31,408,248,105,12,P.sky);person(75,450,.34);icon('camera',113,428,23,P.blue);text('Selfie captured',112,481,17,P.ink,650);if(s>6)check(259,459,20,P.green);
    rr(31,529,248,42,10,s>8?P.green:P.blue);text(s>8?'Checked in':'Confirm check-in',155,557,15,P.white,700,'center');
  });},0,(1-arrive(s,1.5))*50);
  layer(arrive(s,4),()=>{pill('Location-based attendance',1383,280,P.white,P.blue,19);});
}
function pivot(s){
  background();const a=arrive(s,.05);layer(a,()=>{text('LESS REPETITION. MORE CONTROL.',960,302,19,P.blue,750,'center');text('Set it once.',960,450,112,P.ink,750,'center');text('Let the schedule work.',960,582,91,P.blue,750,'center');},0,(1-a)*30);
  const cards=[-1,0,1];cards.forEach((n,i)=>layer(arrive(s,.55+i*.2),()=>{const x=684+n*340;rr(x,716,314,95,15,P.white,P.line);icon('repeat',x+24,742,30,P.blue);text(['Daily tasks','Recurring schedules','Assigned teams'][i],x+72,773,21,P.ink,650);}));
}
const STEPS=['Configure','Schedule','Generate','Deliver','Complete','Monitor'];
function stepStrip(current){
  STEPS.forEach((label,i)=>{const x=98+i*286;if(i<5)rule(x+177,288,x+252,288,i<current?'#8EA5EB':P.line,2);circle(x+15,288,15,i<=current?P.blue:P.white,i<=current?undefined:P.line);if(i<current)check(x+15,288,15,P.white);else text(i+1,x+15,294,14,i===current?P.white:P.muted,750,'center');text(label,x+43,295,19,i<=current?P.blue:P.muted,i===current?750:550);});
}
function field(label,value,x,y,w=507,active=false){text(label,x,y,17,P.muted,600);rr(x,y+14,w,55,9,P.white,active?P.blue:P.line);text(value,x+17,y+50,21,P.ink,600);}
function configure(s){
  layer(arrive(s),()=>{lines(['One recurring task.','Ready for every day.'],97,487,55,P.ink,750,1.24);text('Choose the location, time, and staff.',100,662,24,P.muted,450);pill('No daily recreation',99,736,P.mint,P.green,22);});
  const a=arrive(s,.15);layer(a,()=>{card(1000,346,710,531);text('New cleaning schedule',1035,398,28,P.ink,750);pill('Manager setup',1485,394,P.ice,P.muted,16);
    field('Location',s>.3?'Building A':'Choose location',1036,444,638,s<.8);
    field('Configured area / cleaning task',s>.65?'Ground floor · Floor cleaning':'Choose area and task',1036,545,638,s>=.8&&s<1.4);
    field('Repeat',s>1.1?'Every day':'Choose frequency',1036,646,194,s>=1.4&&s<1.9);
    field('Time',s>1.5?'8:00 AM':'Start time',1250,646,194);
    field('Assigned staff',s>1.9?'Ali':'Select staff',1464,646,210);
    rr(1036,765,638,66,12,s>3?P.green:P.blue);text(s>3?'Recurring schedule saved':'Save recurring schedule',1355,807,23,P.white,750,'center');if(s>3)check(1094,798,25,P.white);
  },0,(1-a)*25);
}
function calendar(s){
  card(90,340,1740,545);text('Daily cleaning calendar',125,392,29,P.ink,750);pill('Repeats every day',1510,390,P.mint,P.green,18);
  const cols=[{x:115,label:'MONDAY',date:'Today',today:true},{x:690,label:'TUESDAY',date:'Planned',today:false},{x:1265,label:'WEDNESDAY',date:'Planned',today:false}];
  cols.forEach((day,j)=>{rr(day.x,420,550,432,12,day.today?'#EDF2FF':'#F7F9FC');text(day.label,day.x+20,452,16,day.today?P.blue:P.muted,750);pill(s>2.5&&day.today?'Tasks generated':day.date,day.x+348,450,day.today?P.white:'#EDF1F6',day.today?P.blue:P.muted,14);
    TASKS.forEach((task,i)=>{const a=arrive(s,j*.2+i*.11);layer(a,()=>{const yy=473+i*59;rr(day.x+13,yy,524,50,8,P.white);rr(day.x+13,yy,4,50,2,i<3?P.blue:'#70A693');text(task.time,day.x+26,yy+31,16,P.muted,600);text(task.title,day.x+132,yy+31,17,P.ink,650);text(task.site.replace('Building ','Bldg '),day.x+509,yy+31,14,P.muted,500,'right');if(s>2.5&&day.today)check(day.x+332,yy+25,14,P.green);},(1-a)*25,0);});
  });
  text(s>2.5?'Today’s tasks are created automatically. Future days stay on the recurring plan.':'Two buildings. Six recurring tasks. One configured daily plan.',960,927,23,s>2.5?P.green:P.muted,600,'center');
}
function taskPhone(x,y,task,s,complete=false,w=280,h=540){
  phone(x,y,w,h,()=>{rr(14,53,282,509,0,'#F7F9FD');text(`Hi, ${task.staff}`,32,96,24,P.ink,750);text('Your assigned work',32,126,15,P.muted,550);pill(task.site,32,173,P.sky,P.blue,15);
    const a=arrive(s,.3);layer(a,()=>{rr(30,215,250,235,14,P.white,P.line);icon('task',48,235,27);text(task.time,48,297,16,P.muted,600);const title=task.title.split(' ');lines(title,48,331,23,P.ink,750,1.23);text(complete?'Cleaning + photo submitted':'Daily recurring task',48,406,13,P.muted,550);pill(complete?'Completed':'Pending',48,435,complete?P.mint:P.sky,complete?P.green:P.blue,15);},0,(1-a)*45);
    if(s<3){layer(arrive(s,.2)*(1-arrive(s,2.4,.5)),()=>{rr(22,70,267,90,14,'#E5ECFE',P.line);icon('bell',36,88,22,P.blue);text('New task assigned',68,104,16,P.ink,750);text(task.title,68,132,14,P.muted,550);});}
    if(complete){circle(155,509,24,P.mint);check(155,509,24,P.green);}else{rr(30,488,250,45,10,P.blue);text('View assignment',155,517,16,P.white,750,'center');}
  });
}
function deliver(s){
  const flow1=[595,586,760,586,740,525,880,525],flow2=[984,525,1110,525,1100,560,1230,560],flow3=[984,525,1200,525,1320,560,1544,560];
  path(flow1,'#B4C5EF',3,(s*.43)%1);path(flow2,'#B4C5EF',3,(s*.45)%1);path(flow3,'#B4C5EF',3,(s*.36+.4)%1);
  card(92,388,506,370);icon('calendar',120,420,32);text('Today’s schedule',169,449,27,P.ink,750);TASKS.filter((_,i)=>i===0||i===3).forEach((task,i)=>{rr(118,483+i*109,451,88,10,P.ice);text(task.time,136,514+i*109,16,P.muted,600);text(task.title,136,548+i*109,22,P.ink,750);text(task.site,544,514+i*109,15,P.muted,550,'right');});
  circle(933,525,64,P.sky);mark(897,489,72);text('Hygene Ops',933,633,23,P.ink,750,'center');text('Scheduled tasks',933,669,19,P.muted,550,'center');
  layer(arrive(s,.5),()=>taskPhone(1190,349,TASKS[0],s,s>5.8));layer(arrive(s,.8),()=>taskPhone(1511,349,TASKS[3],s-.3,s>6.6));
  if(s<3.2){[flow2,flow3].forEach((p,i)=>{const a=clamp((s-.9-i*.45)/1.6);if(a>0&&a<1){const q=bezier(p,ease(a));rr(q.x-75,q.y-24,150,49,10,P.blue);text('Assigned',q.x,q.y+7,19,P.white,700,'center');}});}
  pill(s>5.8?'After cleaning, photo submission, and review':'Tasks appear in the assigned employees’ apps',538,922,s>5.8?P.mint:P.white,s>5.8?P.green:P.blue,23);
}
function automation(s){
  background();const current=s<4?0:s<7?1:s<9?2:s<14?3:s<17?4:5;heading('Automatic task scheduling','Configure once. Keep the work moving.');stepStrip(current);
  const final=()=>{dashboard(207,345,1505,554,12);pill('Recurring plan → Assigned work → Visible progress',607,929,P.mint,P.green,23);};
  const phase=s<4?0:s<9?1:s<17?2:3;
  const starts=[0,4,9,17],renderers=[()=>configure(s),()=>calendar(s-4),()=>deliver(s-9),final];
  const prior=[null,()=>configure(3.99),()=>calendar(4.99),()=>deliver(7.99)];
  const a=arrive(s,starts[phase],.48);
  if(phase&&a<1)layer(1-a,prior[phase],-100*a,0);
  layer(a,renderers[phase],(1-a)*100,0);
}
function qr(x,y,size){
  rr(x,y,size,size,7,P.white);const unit=size/21;
  for(let i=0;i<21;i++)for(let j=0;j<21;j++){const inCorner=(i<7&&j<7)||(i>13&&j<7)||(i<7&&j>13);if(!inCorner&&((i*11+j*7+i*j)%9<4))rr(x+i*unit,y+j*unit,unit-.3,unit-.3,0,P.ink);}
  [[0,0],[14,0],[0,14]].forEach(([xx,yy])=>{rr(x+xx*unit,y+yy*unit,7*unit,7*unit,0,P.ink);rr(x+(xx+1)*unit,y+(yy+1)*unit,5*unit,5*unit,0,P.white);rr(x+(xx+2)*unit,y+(yy+2)*unit,3*unit,3*unit,0,P.ink);});
}
function mobile(s){
  background();heading('Mobile task management','From assigned work to photographic proof.');
  const stages=['View assignment','Scan task QR','Complete cleaning','Submit photos'];
  stages.forEach((label,i)=>{const x=110+i*444,a=arrive(s,i*.35);layer(a,()=>{circle(x+34,355,22,i<=Math.floor(s/2.8)?P.blue:P.white,i<=Math.floor(s/2.8)?undefined:P.line);text(i+1,x+34,363,18,i<=Math.floor(s/2.8)?P.white:P.muted,750,'center');text(label,x+71,363,22,P.ink,700);if(i<3)icon('arrow',x+380,338,30,'#ACBDE6');},0,(1-a)*20);});
  layer(arrive(s,.2),()=>taskPhone(139,409,TASKS[0],10,false,273,518));
  layer(arrive(s,1),()=>{phone(578,409,273,518,()=>{text('Scan task QR',155,101,23,P.ink,750,'center');text('Confirm the task location',155,134,14,P.muted,550,'center');rr(38,181,234,244,16,P.ice);qr(75,223,160);const yy=218+(Math.sin(s*1.7)*.5+.5)*164;rule(63,yy,247,yy,'#4264D9AA',3);if(s>4){pill('Task confirmed',77,469,P.mint,P.green,15);check(155,527,32,P.green);}else text('Align the code in the frame',155,474,14,P.muted,550,'center');});});
  layer(arrive(s,2),()=>{phone(1017,409,273,518,()=>{text('Floor cleaning',32,103,24,P.ink,750);pill('In progress',32,152,P.sky,P.blue,15);photo(31,203,248,224,14,'reception');text('Building A · Ground floor',32,471,16,P.muted,550);rr(31,505,248,48,10,P.blue);text('Finish cleaning',155,536,16,P.white,750,'center');});});
  layer(arrive(s,3),()=>{phone(1456,409,273,518,()=>{text('Photographic proof',32,101,22,P.ink,750);text('Required cleaning evidence',32,132,14,P.muted,550);photo(31,174,248,191,14,'reception');icon('camera',33,395,23,P.blue);text('Photo attached',67,415,17,P.ink,650);if(s>7){circle(155,468,28,P.mint);check(155,468,26,P.green);text('Submitted',155,527,22,P.green,750,'center');text('Awaiting verification',155,553,14,P.muted,550,'center');}else{rr(31,483,248,49,10,P.blue);text('Submit proof',155,515,16,P.white,750,'center');}});});
}
function monitor(s){
  background();heading('Management visibility','See progress. Spot exceptions.','Scheduled, pending, in progress, completed, missed, and overdue work.');
  layer(arrive(s),()=>dashboard(90,342,1310,575,s+8,true),0,(1-arrive(s))*25);
  const alerts=[{name:'Washroom cleaning',site:'Building A · Missed',color:P.red,bg:P.paleRed,icon:'alert'},
    {name:'Washroom cleaning',site:'Building B · Not completed in time',color:P.amber,bg:P.paleAmber,icon:'clock'},
    {name:'Photographic proof',site:'Submission stays separate from verification',color:P.blue,bg:P.sky,icon:'camera'}];
  alerts.forEach((item,i)=>{const a=arrive(s,.8+i*.85);layer(a,()=>{card(1438,352+i*185,393,163);rr(1460,373+i*185,43,43,11,item.bg);icon(item.icon,1470,382+i*185,23,item.color);text(item.name,1460,450+i*185,23,P.ink,750);text(item.site,1460,482+i*185,i===2?13:15,P.muted,550);},(1-a)*50,0);});
}
function planned(s){
  background();heading('The next layer of accountability','Planned AI cleaning verification.','A roadmap concept for reducing repetitive manual review.');pill('PLANNED FEATURE',1565,170,P.paleAmber,P.amber,18);
  card(93,373,530,449);photo(111,391,494,294,12);icon('camera',119,721,31);text('Photographic proof',166,747,27,P.ink,750);text('Submitted by the employee',120,789,20,P.muted,500);
  path([624,587,740,587,756,587,855,587],'#A6B8E5',3,(s*.25)%1,true);
  layer(arrive(s,.7),()=>{circle(951,587,95,P.sky);circle(951,587,115,null,'#CBD7F1');icon('spark',918,554,66,P.blue);text('Planned AI review',951,769,26,P.ink,750,'center');pill('Concept preview',868,819,P.white,P.blue,17);});
  path([1070,587,1185,587,1196,587,1280,587],'#A6B8E5',3,(s*.25+.5)%1,true);
  layer(arrive(s,1.5),()=>{card(1284,391,545,392);text('Manager oversight',1322,446,30,P.ink,750);rule(1321,476,1791,476,P.line,1);icon('camera',1320,512,26);text('Assess submitted evidence',1365,535,23,P.ink,600);icon('alert',1320,579,26);text('Surface exceptions for review',1365,602,23,P.ink,600);icon('users',1320,646,26);text('Keep people in control',1365,669,23,P.ink,600);pill('Potential: less manual checking',1322,742,P.mint,P.green,19);});
  text('A roadmap for helping managers focus their attention on exceptions.',960,913,21,P.muted,550,'center');
}
function closing(s){
  background(true);layer(arrive(s,.15),()=>{mark(909,180,102);text('Hygene Ops',960,360,56,P.white,750,'center');text('Cleaning operations,',960,488,91,P.white,750,'center');text('connected.',960,601,111,'#A9C0FF',750,'center');});
  const cols=[{icon:'users',a:'Workforce',b:'management'},{icon:'repeat',a:'Task',b:'automation'},{icon:'grid',a:'Operational',b:'visibility'},{icon:'spark',a:'AI verification',b:'Planned'}];
  cols.forEach((item,i)=>{const x=252+i*415,a=arrive(s,1+i*.3);layer(a,()=>{if(i>0)rule(x-47,736,x-47,876,'#3D5070',1);icon(item.icon,x,743,36,'#A9C0FF');text(item.a,x,822,26,P.white,650);text(item.b,x,861,24,i===3?'#A9C0FF':'#B2C3DF',500);},0,(1-a)*18);});
}
const scenes={opening,overview,pivot,automation,mobile,monitor,planned,closing};
let showCaptions=true,images={};
await Promise.all([document.fonts.load('750 90px Manrope'),document.fonts.load('500 20px GeistMono'),...['cleaning','reception'].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[name]=img;resolve();};img.onerror=reject;img.src=`assets/${name}.webp`;}))]);
await document.fonts.ready;
let currentTime=0;
function draw(time){
  currentTime=clamp(time,0,89.9999);c.clearRect(0,0,W,H);
  const index=story.scenes.findIndex(scene=>currentTime>=scene.start&&currentTime<scene.end),scene=story.scenes[index];
  const local=currentTime-scene.start;
  if(index>0&&local<.52){const prior=story.scenes[index-1];scenes[prior.id](prior.end-prior.start-.01);const amount=ease(local/.52);c.save();c.beginPath();c.rect(W*(1-amount),0,W*amount,H);c.clip();scenes[scene.id](local);c.restore();}else scenes[scene.id](local);
  const dark=scene.id==='opening'||scene.id==='closing';header(scene.id,dark);footer(currentTime,dark);
}
window.renderFrame=time=>{draw(time);return true;};
window.filmReady=true;window.filmStory=story;
window.setCaptions=value=>{showCaptions=value;draw(currentTime);};
const play=document.getElementById('play'),seek=document.getElementById('seek'),sound=document.getElementById('sound'),timer=document.getElementById('time');
let playing=false,started=0,offset=0;
const format=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
function ui(t){seek.value=t;timer.textContent=`${format(t)} / 1:30`;}
function pause(){playing=false;offset=currentTime;sound.pause();play.textContent='Play film';}
function tick(now){if(!playing)return;const t=offset+(now-started)/1000;if(t>=90){draw(89.999);ui(90);pause();offset=0;return;}draw(t);ui(t);requestAnimationFrame(tick);}
async function toggle(){if(playing){pause();return;}playing=true;started=performance.now();sound.currentTime=offset;try{await sound.play();}catch{}play.textContent='Pause';requestAnimationFrame(tick);}
play.addEventListener('click',toggle);
function seekTo(t){offset=clamp(t,0,89.99);started=performance.now();draw(offset);ui(offset);sound.currentTime=offset;}
seek.addEventListener('input',()=>seekTo(Number(seek.value)));
document.getElementById('captions').addEventListener('click',event=>{showCaptions=!showCaptions;event.target.textContent=`Captions ${showCaptions?'on':'off'}`;event.target.setAttribute('aria-pressed',String(showCaptions));draw(currentTime);});
document.getElementById('mute').addEventListener('click',event=>{sound.muted=!sound.muted;event.target.textContent=sound.muted?'Unmute':'Mute';event.target.setAttribute('aria-pressed',String(sound.muted));});
document.addEventListener('keydown',event=>{if(event.target.tagName==='INPUT'||event.target.tagName==='BUTTON')return;if(event.code==='Space'){event.preventDefault();toggle();}if(event.key==='ArrowRight')seekTo(currentTime+5);if(event.key==='ArrowLeft')seekTo(currentTime-5);});
if(new URLSearchParams(location.search).has('render'))document.documentElement.classList.add('render');
draw(0);
