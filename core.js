export const uid=()=>globalThis.crypto.randomUUID();
const clone=x=>structuredClone(x);
export function initialProject(){
 const bg={id:uid(),type:'color',name:'Fondo de apertura',color:'#15192c'};
 const title={id:uid(),type:'text',name:'Título',text:'Tu próxima historia',color:'#f5f2ff',fontSize:72};
 const sub={id:uid(),type:'text',name:'Subtítulo',text:'Creada con SD Studio',color:'#a4a9c4',fontSize:30};
 const scene={id:uid(),name:'Apertura',items:[item(bg.id),{...item(title.id),x:100,y:270,w:1080,h:110},{...item(sub.id),x:104,y:385,w:1080,h:60}]};
 return {version:1,name:'Mi estudio',sources:[bg,title,sub],scenes:[scene],preview:scene.id,program:scene.id,studio:true,transition:'cut'};
}
export const item=sourceId=>({id:uid(),sourceId,x:0,y:0,w:1280,h:720,visible:true,locked:false});
export function addScene(p,name){const s={id:uid(),name:name.trim()||'Nueva escena',items:[]};p.scenes.push(s);p.preview=s.id;if(!p.studio)p.program=s.id;return s;}
export function duplicateScene(p,id){const s=clone(p.scenes.find(x=>x.id===id));if(!s)throw Error('Escena inexistente');s.id=uid();s.name+=' · copia';s.items.forEach(i=>i.id=uid());p.scenes.push(s);p.preview=s.id;if(!p.studio)p.program=s.id;return s;}
export function removeScene(p,id){if(p.scenes.length===1)throw Error('Conservá al menos una escena.');if(!p.scenes.some(s=>s.id===id))throw Error('Escena inexistente');p.scenes=p.scenes.filter(s=>s.id!==id);if(p.preview===id)p.preview=p.scenes[0].id;if(p.program===id)p.program=p.scenes[0].id;}
export function selectScene(p,id){if(!p.scenes.some(s=>s.id===id))throw Error('Escena inexistente');p.preview=id;if(!p.studio)p.program=id;}
export function take(p){const old=p.program;p.program=p.preview;if(p.studio)p.preview=old;}
export function validateProject(raw){
 const fail=()=>{throw Error('Proyecto inválido o incompatible. No se modificó tu estudio.');};
 if(!raw||raw.version!==1||typeof raw.name!=='string'||raw.name.length>150||!Array.isArray(raw.sources)||!Array.isArray(raw.scenes)||raw.sources.length>100||raw.scenes.length<1||raw.scenes.length>100)fail();
 const ids=new Set();const unique=id=>{if(typeof id!=='string'||!id||id.length>100||ids.has(id))fail();ids.add(id);};
 const str=(v,max)=>{if(typeof v!=='string'||v.length>max)fail();return v;};
 const color=v=>{if(!/^#[0-9a-fA-F]{6}$/.test(v))fail();return v;};
 const num=(v,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail();return v;};
 const bool=v=>{if(typeof v!=='boolean')fail();return v;};
 const sources=raw.sources.map(s=>{if(!s||!['color','text','image','screen','camera','mic'].includes(s.type))fail();unique(s.id);const o={id:s.id,type:s.type,name:str(s.name,150)};
 if(s.type==='text'){o.text=str(s.text,2000);o.fontSize=num(s.fontSize,8,240);o.color=color(s.color);}
 if(s.type==='color')o.color=color(s.color);
 if(s.type==='image'){o.data=str(s.data,4000000);if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(o.data))fail();}
 if(['screen','camera','mic'].includes(s.type)){o.volume=num(s.volume??1,0,2);o.muted=bool(s.muted??false);}
 return o;});
 const sourceIds=new Set(sources.map(s=>s.id));
 const scenes=raw.scenes.map(s=>{if(!s||!Array.isArray(s.items)||s.items.length>100)fail();unique(s.id);return{id:s.id,name:str(s.name,150),items:s.items.map(i=>{if(!i)fail();unique(i.id);if(!sourceIds.has(i.sourceId))fail();return{id:i.id,sourceId:i.sourceId,x:num(i.x,-2560,2560),y:num(i.y,-1440,1440),w:num(i.w,1,5120),h:num(i.h,1,2880),visible:bool(i.visible),locked:bool(i.locked)};})};});
 if(!scenes.some(s=>s.id===raw.preview)||!scenes.some(s=>s.id===raw.program)||!['cut','fade'].includes(raw.transition))fail();
 return {version:1,name:raw.name,sources,scenes,preview:raw.preview,program:raw.program,studio:bool(raw.studio),transition:raw.transition};
}
