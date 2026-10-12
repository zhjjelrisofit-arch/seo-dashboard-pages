// Phase 3: brand + category metrics now read from real data.
//   Brand: GSC Branded Excel-derived JSON (Phase 2)
//   Category: GSC API query + 755-word V1 keyword library matched JSON (Phase 3)
const BRAND_DATA={jf:null,vj:null};
const CATEGORY_DATA={jf:null,vj:null};
let META={asOf:'2026-10-06',oldest:'2024-10-01',queryFrom:'2025-10-09',queryThrough:'2026-10-06'};
const SITES={
 jf:{name:'JelriSoFit',short:'JF',color:'#2a66d8',description:'医疗制服 · Medical Workwear',groups:[['JF-01','通用医疗制服'],['JF-02','职业与专业人群'],['JF-03','款式与产品属性'],['JF-04','选购与比较']],shares:[.39,.29,.20,.12]},
 vj:{name:'VyblooJug',short:'VJ',color:'#0e9488',description:'保温饮水容器 · Insulated Drinkware',groups:[['VJ-01','通用保温饮水容器'],['VJ-02','材质与功能规格'],['VJ-03','人群场景与外观'],['VJ-04','选购与比较']],shares:[.37,.30,.22,.11]}
};
const LABEL={clicks:'点击量',impressions:'曝光量',ctr:'平均点击率',position:'平均排名'};
const COLORS={clicks:'#4184f4',impressions:'#633db5',ctr:'#139f93',position:'#d28b34'};
const KEYS=['clicks','impressions','ctr','position'];
const BASE={jf:[['uniformes medicos','uniforme medico','uniformes hospitalarios','ropa medica','scrubs medicos','pijama quirurgica','uniforme quirurgico','uniforme sanitario','ropa de enfermeria','uniformes para clinica','conjunto medico','uniformes sanitarios','pijamas medicas','ropa de hospital','uniforme para consultorio'],['uniforme de enfermera','scrubs enfermeria','uniforme de doctor','uniforme para dentista','uniforme odontologico','ropa para veterinario','uniforme de nutricionista','uniforme para fisioterapeuta','uniformes de laboratorio','ropa de medico','uniforme para estudiantes medicina','scrubs para enfermeros','uniforme de pediatra','uniforme clinico para mujer','ropa para profesionales de salud'],['scrubs elastico','uniforme medico comodo','uniforme medico antifluidos','scrubs con bolsillos','pijama quirurgica moderna','uniforme medico ligero','scrubs de colores','uniforme medico blanco','uniformes medicos modernos','scrubs de manga larga','uniforme hospitalario transpirable','scrubs tela stretch','uniformes medicos azul marino','pijama quirurgica corte recto','scrubs ajuste comodo'],['mejores uniformes medicos','scrubs vs pijama quirurgica','donde comprar scrubs','precio de uniformes medicos','uniformes medicos baratos','mejores marcas de scrubs','como elegir scrubs','comparativa uniformes medicos','scrubs en oferta','tienda uniformes medicos','diferencia scrubs y uniforme','comprar uniformes clinicos','recomendaciones pijama quirurgica','uniformes medicos mayoreo','que uniforme medico comprar']],vj:[['termo de acero inoxidable','termos para agua','botella termica','botellas de agua','vaso termico','termos grandes','botella para agua fria','termo para bebidas','botella termica grande','vaso de agua termico','termo para llevar','termos reutilizables','botella aislante','vaso para agua con tapa','termo de viaje'],['termo 40 oz','botella acero inoxidable','termo antigoteo','botella doble pared','termo conserva frio','botella con popote','termo con asa','botella de 1 litro','vaso aislante de acero','termo 24 horas frio','botella termica 1200 ml','botella a prueba de fugas','termo doble boquilla','botella termica con pajilla','termo tapa hermetica'],['botella para gimnasio','termo para deporte','termo para oficina','botella para escuela','termo para senderismo','botella para viajar','termo para mujer','botella para auto','termo rosa grande','botella de agua para correr','vaso termico con estilo','termo para universitarios','botella para entrenamiento','termo para trabajo','botella termica elegante'],['mejores termos para agua','mejor botella termica','comparativa termos','termo vs botella termica','precio termo de acero','donde comprar termos','que termo conserva mas frio','termos en oferta','comprar botella termica','mejores marcas termos','termo de acero o plastico','botella reutilizable recomendada','que termo elegir','termos baratos','termo 40 oz precio']]};
const BRAND_Q={jf:['jelrisofit','jelrisofit scrubs','jelrisofit uniformes medicos','jelrisofit mexico','jelrisofit reviews','jelrisofit uniformes','jelrisofit pijama quirurgica','jelrisofit tallas','jelrisofit tienda','jelrisofit ropa medica','jelri so fit','jelrisofit opiniones'],vj:['vybloojug','vybloo jug','vybloojug termo','vybloojug botella','vybloojug 40 oz','vybloojug mexico','vybloojug reseñas','vybloojug vaso termico','vybloojug tienda','vybloojug opiniones','vybloojug precio','vybloojug termos']};





'use strict';
// V0.3 仅用于交互验收。所有数值、Query及同步状态为本地生成的演示样例。

const state={page:'overview',period:'28',start:'2026-09-09',end:'2026-10-06',compare:true,groups:{jf:'all',vj:'all'},trendType:{jf:'brand',vj:'brand'},detailType:{jf:'brand',vj:'brand'},metrics:{},grain:{},dimension:{},query:{},dayPage:{}};
for(const key of ['jf12','vj12','jfb','jfc','vjb','vjc'])state.metrics[key]=['clicks','impressions'];
const chartStore={};
const $=(selector)=>document.querySelector(selector);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toUTC=s=>new Date(s+'T00:00:00Z');
const fromUTC=d=>`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
function addDays(s,n){let d=toUTC(s);d.setUTCDate(d.getUTCDate()+n);return fromUTC(d)}
function minusMonths(s,n){let d=toUTC(s),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-n);let last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return fromUTC(d)}
const daysBetween=(a,b)=>Math.round((toUTC(b)-toUTC(a))/86400000);
const fdate=d=>(d||'—').replaceAll('-','/');
const fnum=v=>v===null||v===undefined?'—':Math.round(v).toLocaleString('zh-CN');
const fpct=v=>v===null||v===undefined?'—':(v*100).toFixed(1)+'%';
const fpos=v=>v===null||v===undefined?'—':Number(v).toFixed(1);
const format=(value,k)=>k==='ctr'?fpct(value):k==='position'?fpos(value):fnum(value);
function short(v,k){if(k==='ctr')return (v*100).toFixed(v<.02?1:0)+'%';if(k==='position')return v.toFixed(1);if(Math.abs(v)>=10000)return (v/10000).toFixed(1)+'万';if(Math.abs(v)>=1000)return (v/1000).toFixed(1)+'千';return Math.round(v).toLocaleString('zh-CN')}
const rnd=(a,b)=>{let x=Math.sin(a*93.67+b*17.31)*54321.123;return x-Math.floor(x)};
function sum(rows){if(!rows.length||rows.some(v=>!v))return null;let impressions=0,clicks=0,weighted=0;for(const row of rows){impressions+=row.impressions;clicks+=row.clicks;weighted+=(row.position||0)*row.impressions}return {clicks,impressions,ctr:impressions?clicks/impressions:0,position:impressions?weighted/impressions:0}}
// --- Brand real data maps (Phase 2: GSC Branded Excel JSON) ---
const brandDayMap={jf:new Map(),vj:new Map()};
const brandMeta={jf:{asOf:'—',oldest:'—'},vj:{asOf:'—',oldest:'—'}};
// --- Category real data maps (Phase 3: GSC API + 755-word match JSON) ---
const categoryDayMap={jf:new Map(),vj:new Map()};
const categoryMeta={jf:{asOf:'—',oldest:'—'},vj:{asOf:'—',oldest:'—'}};

function loadBrandData(site,payload){
 BRAND_DATA[site]=payload;
 const m=new Map();
 for(const d of payload.days){
  m.set(d.date,{clicks:d.clicks,impressions:d.impressions,ctr:d.ctr||0,position:d.position});
 }
 brandDayMap[site]=m;
 brandMeta[site]={asOf:payload.asOf,oldest:payload.oldest};
}

function loadCategoryData(site,payload){
 CATEGORY_DATA[site]=payload;
 const m=new Map();
 for(const d of payload.days){
  m.set(d.date,{clicks:d.clicks,impressions:d.impressions,position:d.position,groups:d.groups||[]});
 }
 categoryDayMap[site]=m;
 categoryMeta[site]={asOf:payload.asOf,oldest:payload.oldest};
}

function brandRowsForRange(start,end,site){
 const map=brandDayMap[site];if(!map.size)return null;
 const rows=[];
 const dates=[...map.keys()].sort();
 for(const date of dates){if(date>=start&&date<=end)rows.push(map.get(date))}
 return rows.length?rows:null;
}

function categoryRowsForRange(start,end,site){
 // 只返回真实存在于 categoryDayMap 中的日期，缺失日期不补 0
 const map=categoryDayMap[site];if(!map.size)return null;
 const rows=[];
 const dates=[...map.keys()].sort();
 for(const date of dates){if(date>=start&&date<=end)rows.push({date,...map.get(date)})}
 return rows.length?rows:null;
}

function fromDays(start,end){return categoryDays(start,end)}

function categoryDays(start,end){
 if(start>end)return null;
 const map=categoryDayMap[state.site||'jf']; // fallback; 实际调用通过 sourceRows
 return null; // 不再使用此函数做实际查询，保留空函数避免其他位置调用报错
}

function sourceRows(start,end,site,type,group='all'){
 if(type==='brand')return brandRowsForRange(start,end,site);
 // 品类词：返回真实匹配后的每日聚合 row
 const rows=categoryRowsForRange(start,end,site);if(!rows)return null;
 return rows.map(r=>{
  if(group==='all')return {clicks:r.clicks,impressions:r.impressions,position:r.position};
  const g=r.groups&&r.groups[Number(group)];
  return g?{clicks:g.clicks,impressions:g.impressions,position:g.position}:null;
 });
}
function stats(start,end,site,type,group='all'){const rows=sourceRows(start,end,site,type,group);return rows?sum(rows):null}

function brandDayList(site,start,end){
 const map=brandDayMap[site];if(!map.size)return[];
 const dates=[...map.keys()].sort();
 return dates.filter(d=>d>=start&&d<=end).map(d=>({date:d,...map.get(d)}));
}
function range(){return {start:state.start,end:state.end}}
function prevRange(){const r=range(),length=daysBetween(r.start,r.end)+1;return {start:addDays(r.start,-length),end:addDays(r.start,-1)}}
function deltaHtml(site,type,k,group='all'){
 if(!state.compare)return '';
 const r=range(),p=prevRange(),current=stats(r.start,r.end,site,type,group),previous=stats(p.start,p.end,site,type,group);
 if(!current||!previous)return '<span class="delta neutral">—</span>';
 let change=k==='position'?current[k]-previous[k]:k==='ctr'?(current[k]-previous[k])*100:previous[k]?100*(current[k]-previous[k])/previous[k]:null;
 if(change===null)return '<span class="delta neutral">—</span>';
 let better=k==='position'?change<0:change>0;
 return `<span class="delta ${Math.abs(change)<.01?'neutral':better?'good':'bad'}">${change>0?'▲':change<0?'▼':'•'} ${Math.abs(change).toFixed(1)}${k==='position'?'':k==='ctr'?' 个百分点':'%'} 较上期</span>`;
}
function applyPeriod(p){if(p==='custom'){openModal('dateModal');$('#startDate').value=state.start;$('#endDate').value=state.end;$('#dateError').textContent='';return;}
 state.period=p;state.end=META.asOf;state.start=p==='7'?addDays(META.asOf,-6):p==='28'?addDays(META.asOf,-27):p==='90'?addDays(META.asOf,-89):addDays(minusMonths(META.asOf,12),1);
 render(true);
}
function setPage(p){if(!['overview','jf','vj'].includes(p))return;state.page=p;render(true)}
function updateShell(){const app=$('#app'),gate=$('#gate');app.style.display='block';gate.style.display='none';render(true)}
function emailOkay(v){v=v.trim();const m=v.match(/^([^\s@]+)@([^\s@]+)$/);return !!m&&m[2].toLowerCase()==='zhihuijiax.com'}
function rememberAllowed(){try{localStorage.setItem('jf_vj_seo_entered_v03','yes')}catch(e){}}
function allowed(){try{return localStorage.getItem('jf_vj_seo_entered_v03')==='yes'||localStorage.getItem('jf_vj_seo_entered_v02')==='yes'}catch(e){return false}}
function notify(msg){const t=$('#toast');t.textContent=msg;t.style.display='block';clearTimeout(window._toastTimeout);window._toastTimeout=setTimeout(()=>t.style.display='none',3200)}
function openModal(id){document.getElementById(id).classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function navigate(p){setPage(p);try{if(location.protocol!=='about:'&&location.hash!=='#'+p)history.replaceState(null,'','#'+p)}catch(e){}}
function shell(){const r=range(),page=state.page,heading=page==='overview'?'SEO 搜索表现总览':SITES[page].name+' · SEO 分析',good=['jf','vj'].flatMap(site=>['brand','category'].map(type=>stats(r.start,r.end,site,type))).filter(Boolean).length;return `
 <header class="page-top"><div><h1>${heading}</h1></div><div class="page-meta"><span class="tag" title="品牌词来自GSC Branded Excel，品类词来自GSC API + 755词V1匹配">LIVE</span><button type="button" class="tag status-meta ${good<4?'warn':''}" data-action="status" title="查看数据来源状态">数据截至 ${fdate(META.asOf)}${good<4?` · ${good}/4 数据源`:''}</button></div></header>
 <div class="toolbar"><div class="t-left"><div class="date-group" role="group" aria-label="日期范围">${[['7','近7天'],['28','近28天'],['90','近90天'],['365','近12个月'],['custom','自定义日期']].map(([id,label])=>`<button type="button" class="date-btn ${state.period===id?'active':''}" data-period="${id}" aria-pressed="${state.period===id}">${state.period===id?'✓ ':''}${label}</button>`).join('')}</div><span class="date-summary">${fdate(r.start)} — ${fdate(r.end)}</span></div><div class="t-right"><label class="compare"><input type="checkbox" id="compare" ${state.compare?'checked':''}/> 对比上期</label></div></div>`;}
function summaryTile(site,type){const r=range(),S=SITES[site],v=stats(r.start,r.end,site,type);return `<article class="card summary-tile"><div class="tile-header"><span class="tile-brand"><b class="square ${site}">${S.short}</b>${S.name}</span><span class="tile-type">${type==='brand'?'官方品牌词':'品类词（GSC + 755词库）'}</span></div><div class="tile-label">搜索点击量</div><div class="tile-number">${v?fnum(v.clicks):'—'}</div>${deltaHtml(site,type,'clicks')}<div class="tile-other"><span>搜索曝光量</span><strong>${v?fnum(v.impressions):'—'}</strong></div><div class="tile-foot"><span>${type==='brand'?'GSC Branded · Excel':'GSC API · 755词库匹配'}</span><button type="button" data-nav="${site}">查看明细 ↗</button></div></article>`;}
function typePanel(site,type){const r=range(),v=stats(r.start,r.end,site,type);const m=k=>`<div class="gm gm-${k}"><div class="gm-label">${LABEL[k]}</div><div class="gm-num">${v?fnum(v[k]):'—'}</div>${deltaHtml(site,type,k)}</div>`;return `<button type="button" class="tp ${type}" data-open-detail="${site}|${type}" aria-label="查看${SITES[site].name}${type==='brand'?'品牌词':'品类词'}明细"><span class="tp-head"><span class="tp-tag">${type==='brand'?'品牌词':'品类词'}</span></span><span class="gm-row">${m('clicks')}${m('impressions')}</span><span class="tp-meta">平均点击率 ${v?fpct(v.ctr):'—'}　·　平均排名 ${v?fpos(v.position):'—'}</span></button>`}
function siteCard(site){const S=SITES[site];return `<article class="card site-card ${site}"><div class="sc-head"><span class="sc-brand"><b class="square ${site}">${S.short}</b>${S.name}</span><button type="button" class="btn-primary" data-nav="${site}">查看明细 →</button></div><div class="tp-grid">${typePanel(site,'brand')}${typePanel(site,'category')}</div></article>`}
function overviewTrendCard(site){const S=SITES[site],type=state.trendType[site],id=site+'12';return `<section class="card trend-card"><header class="trend-card-head"><span class="sc-brand"><b class="square ${site}">${S.short}</b>${S.name}</span><div class="segment-control" role="group" aria-label="${S.name}趋势类型">${[['brand','品牌词'],['category','品类词']].map(([v,t])=>`<button type="button" data-trend-type="${site}|${v}" class="${type===v?'on':''}" aria-pressed="${type===v}">${t}</button>`).join('')}</div></header>${chartCard(id,type,site,'all',true)}</section>`}
function overview(){const r=range();return `<div class="section-heading"><h2>搜索表现概览</h2><span class="rightnote" title="品牌词与品类词口径不同，不能相加">随日期筛选</span></div><div class="site-grid">${['jf','vj'].map(siteCard).join('')}</div>
 <div class="section-heading"><h2>搜索趋势</h2><span class="rightnote">${fdate(r.start)} — ${fdate(r.end)}</span></div>
 <div class="trend-grid">${['jf','vj'].map(overviewTrendCard).join('')}</div>
 <div class="foot-note">品牌词与品类词口径不同，不能相加。</div>`;}
function metricRibbon(site,type,group='all'){
 const r=range(),key=site+(type==='brand'?'b':'c'),v=stats(r.start,r.end,site,type,group),sel=state.metrics[key]||[];
 return `<div class="metric-ribbon" role="group" aria-label="选择显示的搜索指标">${KEYS.map(k=>{const checked=sel.includes(k);return `<button type="button" class="metric-btn ${checked?'checked':''}" style="--sel:${COLORS[k]}" data-metric="${key}|${k}" aria-pressed="${checked}" title="${checked?'取消':'添加'}${LABEL[k]}趋势曲线"><span class="metric-top">${LABEL[k]}<span class="metric-check">${checked?'✓':''}</span></span><span class="metric-number">${v?format(v[k],k):'—'}</span><span class="metric-sub">${state.compare&&v?deltaHtml(site,type,k,group):v?'':'尚未覆盖日期'}</span></button>`;}).join('')}</div>`;
}
function detail(site){const S=SITES[site],type=state.detailType[site],g=state.groups[site],groups=[['all','全部品类'],...S.groups.map((v,i)=>[String(i),v[1]])];
 // 品类词历史完整性提示
 const catMeta=categoryMeta[site];
 const catRangeWarn=(type==='category'&&catMeta&&catMeta.oldest!=='—'&&state.start<catMeta.oldest)?`<div class="explain" style="color:#b17625;margin:.4em 0">品类词历史范围不完整：当前数据覆盖 ${fdate(catMeta.oldest)} 至 ${fdate(catMeta.asOf)}，所选区间内 ${fdate(state.start)} 至 ${fdate(addDays(catMeta.oldest,-1))} 无品类词数据（不会以 0 充数）。</div>`:'';
const panel=type==='brand'?`<section class="card analysis-block" id="brand-panel"><div class="block-head"><div><h2><span class="type-tag brand">品牌词</span>搜索表现</h2></div><span class="source-pill" title="官方 Branded 分类汇总 · Excel">Excel</span></div>${metricRibbon(site,'brand')}${chartCard(site+'b','brand',site,'all',false)}${dimensionPanel(site,'brand')}</section>`:`<section class="card analysis-block" id="category-panel"><div class="block-head"><div><h2><span class="type-tag category">品类词</span>搜索表现</h2></div><span class="source-pill category" title="GSC可见查询 · 每条Query只归属一个搜索需求组">GSC API</span></div>${catRangeWarn}<div class="group-bar">${groups.map(([v,t])=>`<button type="button" class="group-chip ${g===v?'selected':''}" data-group="${site}|${v}" aria-pressed="${g===v}">${esc(t)}</button>`).join('')}</div>${metricRibbon(site,'category',g)}${chartCard(site+'c','category',site,g,false)}${dimensionPanel(site,'category')}</section>`;return `<div class="detail-intro"><div class="square ${site}">${S.short}</div><div><div class="brand-name">${S.name}</div><div class="brand-note">${S.description}</div></div></div><div class="detail-switch segment-control" role="group" aria-label="分析类型">${[['brand','品牌词'],['category','品类词']].map(([v,t])=>`<button type="button" data-detail-type="${site}|${v}" class="${type===v?'on':''}" aria-pressed="${type===v}">${t}</button>`).join('')}</div>${panel}<div class="foot-note">品牌词与品类词口径不同，不能相加。</div>`;}
function monthStart(s){return s.slice(0,7)+'-01'}
function monthEnd(s){const d=toUTC(monthStart(s));return fromUTC(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)))}
function makeBuckets(start,end,grain){if(start>end)return[];const all=[];for(let d=start;d<=end;){let until=d;if(grain==='week'){
  const w=toUTC(d).getUTCDay(),plus=(7-w)%7;until=addDays(d,plus);
 }else if(grain==='month')until=monthEnd(d);if(until>end)until=end;
 let label=grain==='day'?d.slice(5).replace('-','/'):grain==='week'?d.slice(5).replace('-','/')+'—'+until.slice(5).replace('-','/'):d.slice(0,7).replace('-','/');
 const partial=grain==='month'&&(d!==monthStart(d)||until!==monthEnd(d));all.push({start:d,end:until,label,partial,days:daysBetween(d,until)+1});d=addDays(until,1);}return all}
function allowedGrains(){const days=daysBetween(state.start,state.end)+1;return days<=14?['day']:days<=60?['day','week']:['day','week','month']}
function usedGrain(key){const allowed=allowedGrains(),saved=state.grain[key];if(saved&&allowed.includes(saved))return saved;return daysBetween(state.start,state.end)+1>90?'week':'day'}
function clampDomain(metric,vals){const a=vals.filter(v=>Number.isFinite(v));if(!a.length)return {min:0,max:1};let low=Math.min(...a),high=Math.max(...a);
 if(metric==='position')return{min:Math.max(0,low-1),max:Math.max(low+1,high+1),reverse:true};
 const max=metric==='ctr'?Math.max(.04,high*1.25):Math.max(1,high*1.18);return{min:0,max,reverse:false};}
function makePlot(id,type,site,group){
 const selected=state.metrics[id]||[],months=makeBuckets(state.start,state.end,usedGrain(id)),sites=[site];
 if(!selected.length)return {body:'<div class="graph-empty">请勾选上方指标卡，选择要显示的趋势曲线</div>',legend:'<span>当前未选择指标</span>',note:'',hasData:false};
 const bucketData=months.map(b=>({bucket:b,values:Object.fromEntries(sites.map(s=>[s,stats(b.start,b.end,s,type,group)]))}));
 const traces=[];for(const k of KEYS.filter(k=>selected.includes(k)))for(const s of sites){traces.push({metric:k,site:s,color:COLORS[k],values:bucketData.map(d=>d.values[s]?.[k]??null)});}
 const scales={};for(const metric of selected){scales[metric]=clampDomain(metric,traces.filter(t=>t.metric===metric).flatMap(t=>t.values));}
 const axisKeys=[...KEYS.filter(k=>selected.includes(k))];const left=axisKeys[0]??null,right=axisKeys[1]??null;
 // With Clicks and Impressions checked (default), the axes are always Clicks left and Impressions right.
 const W=1120,H=304,L=75,R=80,T=32,B=48,PW=W-L-R,PH=H-T-B;
 const X=i=>L+(months.length===1?PW/2:PW*i/(months.length-1));
 const Y=(v,metric)=>{const d=scales[metric],frac=(v-d.min)/((d.max-d.min)||1);return T+(d.reverse?frac:1-frac)*PH};
 const colorName=k=>COLORS[k];
 const grid=Array.from({length:5},(_,i)=>{const frac=i/4,y=T+PH*frac;return `<line class="chart-grid" x1="${L}" y1="${y}" x2="${W-R}" y2="${y}"/><text class="chart-axis" x="${L-13}" y="${y+4}" text-anchor="end">${left?esc(short(scales[left].min+(scales[left].max-scales[left].min)*(scales[left].reverse?frac:1-frac),left)):''}</text>${right?`<text class="chart-axis" x="${W-R+13}" y="${y+4}">${esc(short(scales[right].min+(scales[right].max-scales[right].min)*(scales[right].reverse?frac:1-frac),right))}</text>`:''}`}).join('');
 const unitLabels=`<text x="${L-1}" y="17" class="chart-axis-name">${left?esc(LABEL[left]):''}</text>${right?`<text x="${W-R+12}" y="17" class="chart-axis-name">${esc(LABEL[right])}</text>`:''}`;
 const labels=months.map((b,i)=>{const step=Math.max(1,Math.ceil(months.length/9));if(i!==0&&i!==months.length-1&&i%step!==0)return'';return `<text x="${X(i)}" y="${H-16}" text-anchor="middle" class="chart-axis">${esc(b.label)}</text>`}).join('');
 const lineParts=traces.map(t=>{
  const runs=[];let current=[];for(let i=0;i<t.values.length;i++){
   const v=t.values[i];if(v===null){if(current.length)runs.push(current);current=[]}else current.push({i,x:X(i),y:Y(v,t.metric)});
  }if(current.length)runs.push(current);
  let html='';
  for(const run of runs){if(run.length===1)html+=`<circle cx="${run[0].x}" cy="${run[0].y}" r="3.5" fill="${months[run[0].i].partial?'white':t.color}" stroke="${t.color}" stroke-width="2"/>`;
   for(let j=1;j<run.length;j++){const a=run[j-1],b=run[j],partial=months[a.i].partial||months[b.i].partial;html+=`<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}" fill="none" stroke="${t.color}" stroke-width="2.9" stroke-linecap="round" ${partial?'stroke-dasharray="4 6"':''}/>`;}
   if(months.length<38)html+=run.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${months[p.i].partial?4.7:2.7}" fill="${months[p.i].partial?'white':t.color}" stroke="${months[p.i].partial?t.color:'white'}" stroke-width="${months[p.i].partial?2.2:1.2}"/>`).join('');
  }return html;
 }).join('');
 const span=PW/Math.max(1,months.length-1),hits=months.map((b,i)=>`<rect data-hit="${id}|${i}" x="${i===0?L-span/3:X(i)-span/2}" y="${T}" width="${months.length===1?PW:span}" height="${PH}" fill="transparent" style="cursor:crosshair"/>`).join('');
 chartStore[id]={traces,months,sites,selected,type,site,group,X};
 const legend=traces.map(t=>`<span><i class="legend-line" style="background:${t.color}"></i>${LABEL[t.metric]}</span>`).join('');
 const note=axisKeys.length>2?'另选的CTR和排名采用独立刻度；悬停可查看实际数值。':'点击量使用左轴，曝光量使用右轴。';
 return {body:`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${site?SITES[site].name:'JF和VJ'}${type==='brand'?'品牌':'品类'}搜索${selected.map(k=>LABEL[k]).join('和')}趋势">${unitLabels}${grid}${labels}${lineParts}${hits}<line data-hover-line="${id}" class="chart-hover-line" y1="${T}" y2="${T+PH}" x1="0" x2="0" style="display:none;pointer-events:none"/></svg><div class="chart-tips" data-tip="${id}"></div>`,legend,note,hasData:true};
}
function chartCard(id,type,site,group='all',showChips=false){const title=(type==='brand'?'品牌词':'品类词')+'趋势',dateText=`${fdate(state.start)}—${fdate(state.end)}`,selected=state.metrics[id];
 const chips=showChips?`<div class="metric-chips">${KEYS.map(k=>`<button type="button" class="metric-chip ${selected.includes(k)?'on':''}" style="--metric:${COLORS[k]}" data-metric="${id}|${k}" aria-pressed="${selected.includes(k)}"><i></i>${LABEL[k]}</button>`).join('')}</div>`:'';
 const grain=usedGrain(id),allowed=allowedGrains();const chooser=`<select class="mode-select" data-grain="${id}" aria-label="趋势时间粒度">${[['day','每日'],['week','每周'],['month','每月']].map(([v,t])=>`<option value="${v}" ${grain===v?'selected':''} ${allowed.includes(v)?'':'disabled'}>${t}</option>`).join('')}</select>`;
 const plot=makePlot(id,type,site,group);
 return `<div class="graph-wrap"><div class="graph-head"><div><h3>${title}</h3><p>${dateText}</p></div><div class="graph-actions">${chips}${chooser}</div></div><div class="graph-legend"><div class="legend-left">${plot.legend}</div><span class="graph-note">${plot.note}</span></div><div class="graph" data-graph="${id}">${plot.body}</div></div>`;
}
function showChartTip(hit,event){const [id,ix]=hit.getAttribute('data-hit').split('|'),data=chartStore[id];if(!data)return;const index=Number(ix),graph=hit.closest('.graph'),tip=graph?.querySelector(`[data-tip="${id}"]`),guide=graph?.querySelector(`[data-hover-line="${id}"]`);if(!tip||!guide)return;
 const period=data.months[index];tip.innerHTML=`<strong>${esc(period.label)}${period.partial?` · 仅含 ${period.days} 天，不完整`:''}</strong>${data.traces.map(t=>`<div class="trow"><span><i style="background:${t.color}"></i>${LABEL[t.metric]}</span><span>${format(t.values[index],t.metric)}</span></div>`).join('')}`;
 tip.style.display='block';const rect=graph.getBoundingClientRect();let x=(event.clientX||rect.left)-rect.left+15;tip.style.left=Math.min(x,rect.width-210)+'px';tip.style.top='24px';guide.style.display='block';guide.setAttribute('x1',data.X(index));guide.setAttribute('x2',data.X(index));}
function hideChartTip(hit){const id=hit?.getAttribute('data-hit')?.split('|')[0];if(!id)return;const g=hit.closest('.graph');if(g){const t=g.querySelector(`[data-tip="${id}"]`),ln=g.querySelector(`[data-hover-line="${id}"]`);if(t)t.style.display='none';if(ln)ln.style.display='none';}}

function defaultQ(){return{search:'',filterOpen:false,minClicks:'',maxClicks:'',minImpressions:'',maxImpressions:'',minPosition:'',maxPosition:'',sort:'clicks',desc:true,page:1}}
function qstate(site,type){const k=site+type;return state.query[k]||(state.query[k]=defaultQ())}
function demoQueries(site,type){
 // Phase 3: 品类词使用真实匹配的 Query；品牌词暂保留 Mock 关键词列表（前端的品牌 Query 明细未做后端匹配）
 if(type==='category'){
  const data=CATEGORY_DATA[site];
  if(!data||!data.queries||!data.queries.length)return[];
  // 按日期范围过滤：聚合 query 的 firstDate/lastDate 用于窗口判断，
  // 但更准确的是按区间重新读每日数据。这里采用预聚合（全期），按区间过滤 firstDate<=end && lastDate>=start
  // 并按 state.groups[site] 过滤组
  const r=range(),g=state.groups[site];
  return data.queries
    .filter(q=>q.firstDate<=r.end&&q.lastDate>=r.start)
    .filter(q=>g==='all'||q.groupCode===SITES[site].groups[Number(g)][0])
    .map(q=>({query:q.query,group:q.groupName,clicks:q.clicks,impressions:q.impressions,ctr:q.ctr,position:q.position}));
 }
 // 品牌词（仍是演示）
 const r=range(),from=r.start<META.queryFrom?META.queryFrom:r.start,through=r.end>META.queryThrough?META.queryThrough:r.end,days=from<=through?daysBetween(from,through)+1:0;
 if(!days)return[];const terms=BRAND_Q[site].map((q,i)=>({q,group:'—',groupId:-1,index:i}));
 return terms.map(t=>{
  const seed=rnd(t.index+7,t.groupId+12+ (site==='jf'?0:27)),influence=(1.2+.8*seed)/(1+t.index*.11);
  const impressions=Math.round(days*(18+seed*27)*influence*(site==='vj'?1.25:1));
  const clicks=Math.round(impressions*.10*(1+.55*rnd(t.index,27)));
  const position=4.5+t.index*.35+rnd(t.index,8)*.6;
  return{query:t.q,group:t.group,clicks,impressions,ctr:impressions?clicks/impressions:0,position};
 });
}
function filteredQueries(site,type){const q=qstate(site,type);return demoQueries(site,type).filter(v=>{
 if(q.search&&!v.query.toLowerCase().includes(q.search.toLowerCase().trim()))return false;
 for(const [name,min,max] of [['clicks','minClicks','maxClicks'],['impressions','minImpressions','maxImpressions'],['position','minPosition','maxPosition']]){
  if(q[min]!==''&&v[name]<Number(q[min]))return false;if(q[max]!==''&&v[name]>Number(q[max]))return false;
 }return true;
 }).sort((a,b)=>{let c=q.sort==='query'?a.query.localeCompare(b.query):a[q.sort]-b[q.sort];return q.desc?-c:c});}
function tablePart(site,type){const q=qstate(site,type),data=filteredQueries(site,type),pages=Math.max(1,Math.ceil(data.length/10));q.page=Math.max(1,Math.min(q.page,pages));if(!data.length)return `<div class="empty">没有符合筛选条件的搜索查询。<br/>可尝试清除搜索词或减少数值限制。</div>`;
 const cols=[['query','搜索查询'],...(type==='category'?[['group','搜索需求组']]:[]),['clicks','点击量'],['impressions','曝光量'],['ctr','CTR'],['position','平均排名']];
 const head=cols.map(([id,label])=>`<th ${id==='group'?'':'class="sortable" data-sort="'+site+'|'+type+'|'+id+'"'} ${id==='query'?'style="min-width:230px"':''}>${label}${q.sort===id?(q.desc?' ↓':' ↑'):''}</th>`).join('');
 const body=data.slice((q.page-1)*10,q.page*10).map(v=>`<tr><td class="query-cell">${esc(v.query)}</td>${type==='category'?`<td><span class="group-badge">${esc(v.group)}</span></td>`:''}<td>${fnum(v.clicks)}</td><td>${fnum(v.impressions)}</td><td>${fpct(v.ctr)}</td><td>${fpos(v.position)}</td></tr>`).join('');
 return `<div class="table-scroll"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div><div class="table-footer"><span>共 ${data.length} 条</span><span class="page-actions"><button class="small-btn" data-qpage="${site}|${type}|-1" ${q.page===1?'disabled':''}>上一页</button>${q.page} / ${pages}<button class="small-btn" data-qpage="${site}|${type}|1" ${q.page>=pages?'disabled':''}>下一页</button></span></div>`;
}
function queryTab(site,type){const q=qstate(site,type),r=range();
 if(type==='brand'){
  const partial=r.start<META.queryFrom||r.end>META.queryThrough,hasWindow=r.end>=META.queryFrom&&r.start<=META.queryThrough;
  if(!hasWindow)return `<div class="empty">该日期范围超出公开Query明细窗口。<br/>当前演示Query窗口：${fdate(META.queryFrom)}—${fdate(META.queryThrough)}。</div>`;
  const f=[['minClicks','点击量下限'],['maxClicks','点击量上限'],['minImpressions','曝光量下限'],['maxImpressions','曝光量上限'],['minPosition','平均排名下限'],['maxPosition','平均排名上限']];
  return `${partial?'<div class="explain" style="color:#b17625">当前日期部分超出最近12个月Query发布窗口，明细只覆盖窗口内日期，不能与完整区间KPI直接相加。</div>':''}<div class="query-toolbar"><div class="ql"><input class="query-search" data-qsearch="${site}|${type}" aria-label="搜索查询词" placeholder="搜索查询词…" value="${esc(q.search)}"/><button type="button" class="small-btn" data-qfilter="${site}|${type}">☷ 指标筛选</button><button type="button" class="small-btn" data-qreset="${site}|${type}">重置</button></div><button type="button" class="small-btn" data-export="${site}|${type}">↓ 导出CSV</button></div><div class="filter-grid ${q.filterOpen?'show':''}" id="filters-${site}-${type}">${f.map(([id,label])=>`<div><label>${label}</label><input type="number" step="${id.toLowerCase().includes('position')?'.1':'1'}" min="0" data-qfield="${site}|${type}|${id}" value="${esc(q[id])}" placeholder="不限"/></div>`).join('')}</div><div id="qtable-${site}-${type}">${tablePart(site,type)}</div>`;
 }
 // 品类词真实 Query：无演示窗口限制
 const data=CATEGORY_DATA[site];
 if(!data)return '<div class="empty">品类词数据未加载。</div>';
 const f=[['minClicks','点击量下限'],['maxClicks','点击量上限'],['minImpressions','曝光量下限'],['maxImpressions','曝光量上限'],['minPosition','平均排名下限'],['maxPosition','平均排名上限']];
 return `<div class="query-toolbar"><div class="ql"><input class="query-search" data-qsearch="${site}|${type}" aria-label="搜索查询词" placeholder="搜索查询词…" value="${esc(q.search)}"/><button type="button" class="small-btn" data-qfilter="${site}|${type}">☷ 指标筛选</button><button type="button" class="small-btn" data-qreset="${site}|${type}">重置</button></div><button type="button" class="small-btn" data-export="${site}|${type}">↓ 导出CSV</button></div><div class="filter-grid ${q.filterOpen?'show':''}" id="filters-${site}-${type}">${f.map(([id,label])=>`<div><label>${label}</label><input type="number" step="${id.toLowerCase().includes('position')?'.1':'1'}" min="0" data-qfield="${site}|${type}|${id}" value="${esc(q[id])}" placeholder="不限"/></div>`).join('')}</div><div id="qtable-${site}-${type}">${tablePart(site,type)}</div>`;
}
function groupTab(site){const r=range(),groupRows=SITES[site].groups.map(([id,label],j)=>{
 const v=stats(r.start,r.end,site,'category',String(j));return `<tr><td><button type="button" class="small-btn" style="border:none;background:transparent;text-align:left;color:#376abe" data-group="${site}|${j}">${id} · ${esc(label)} ↗</button></td><td>${fnum(v?.clicks)}</td><td>${fnum(v?.impressions)}</td><td>${fpct(v?.ctr)}</td><td>${fpos(v?.position)}</td></tr>`;
 }).join('');return `<div class="table-scroll"><table class="data-table"><thead><tr><th>搜索需求组</th><th>点击量</th><th>曝光量</th><th>CTR</th><th>平均排名</th></tr></thead><tbody>${groupRows}</tbody></table></div><div class="table-footer"><span>点击组名筛选品类词</span></div>`;}
function dayTab(site,type){const key=site+type,r=range();
 if(type==='brand'){
  const raw=brandDayList(site,r.start,r.end);if(!raw.length)return '<div class="empty">该日期范围尚无品牌词每日数据。</div>';
  const list=raw.map(d=>({date:d.date,clicks:d.clicks,impressions:d.impressions,ctr:d.impressions?d.clicks/d.impressions:0,position:d.position})).reverse();
  const pages=Math.ceil(list.length/20);const cur=state.dayPage[key]=Math.min(Math.max(1,state.dayPage[key]||1),pages);
  return `<div class="table-scroll"><table class="data-table"><thead><tr><th>日期（PT）</th><th>点击量</th><th>曝光量</th><th>CTR</th><th>平均排名</th></tr></thead><tbody>${list.slice((cur-1)*20,cur*20).map(v=>`<tr><td class="query-cell">${fdate(v.date)}</td><td>${fnum(v.clicks)}</td><td>${fnum(v.impressions)}</td><td>${fpct(v.ctr)}</td><td>${fpos(v.position)}</td></tr>`).join('')}</tbody></table></div><div class="table-footer"><span>共 ${list.length} 天</span><span class="page-actions"><button type="button" class="small-btn" data-dpage="${key}|-1" ${cur===1?'disabled':''}>上一页</button>${cur} / ${pages}<button type="button" class="small-btn" data-dpage="${key}|1" ${cur>=pages?'disabled':''}>下一页</button></span></div>`;
 }
 const catRows=categoryRowsForRange(r.start,r.end,site);if(!catRows)return '<div class="empty">该日期范围尚无品类词每日数据。</div>';
 const list=catRows.map(day=>{const g=state.groups[site];const v=g==='all'?{clicks:day.clicks,impressions:day.impressions,position:day.position}:(day.groups&&day.groups[Number(g)]);return{date:day.date,...v,ctr:v&&v.impressions?v.clicks/v.impressions:0}}).reverse();const pages=Math.ceil(list.length/20);const cur=state.dayPage[key]=Math.min(Math.max(1,state.dayPage[key]||1),pages);return `<div class="table-scroll"><table class="data-table"><thead><tr><th>日期（PT）</th><th>点击量</th><th>曝光量</th><th>CTR</th><th>平均排名</th></tr></thead><tbody>${list.slice((cur-1)*20,cur*20).map(v=>`<tr><td class="query-cell">${fdate(v.date)}</td><td>${fnum(v.clicks)}</td><td>${fnum(v.impressions)}</td><td>${fpct(v.ctr)}</td><td>${fpos(v.position)}</td></tr>`).join('')}</tbody></table></div><div class="table-footer"><span>共 ${list.length} 天</span><span class="page-actions"><button type="button" class="small-btn" data-dpage="${key}|-1" ${cur===1?'disabled':''}>上一页</button>${cur} / ${pages}<button type="button" class="small-btn" data-dpage="${key}|1" ${cur>=pages?'disabled':''}>下一页</button></span></div>`;}
function dimensionPanel(site,type){const key=site+type,tabs=type==='brand'?[['query','搜索查询'],['day','日期']]:[['query','搜索查询'],['group','搜索需求组'],['day','日期']],tab=state.dimension[key]||'query';let content=tab==='query'?queryTab(site,type):tab==='group'?groupTab(site):dayTab(site,type);
 const note=type==='brand'?'辅助品牌Query采用自定义匹配，与官方Branded KPI不要求加总一致。':'品类Query来自GSC API可见查询，按已确认的4个搜索需求组归类。';return `<div class="dimensions"><div class="dimension-tabs" role="tablist" aria-label="明细维度">${tabs.map(([id,label])=>`<button type="button" class="dim-tab ${tab===id?'on':''}" role="tab" aria-selected="${tab===id}" data-dimension="${key}|${id}">${label}</button>`).join('')}</div><div class="dim-body">${content}</div></div>`;}
function exportCSV(site,type){const data=filteredQueries(site,type);if(!data.length){notify('当前没有可导出的Query');return}
 const rows=[['Query','Group','Clicks','Impressions','CTR','Average Position'],...data.map(v=>[v.query,v.group,v.clicks,v.impressions,v.ctr.toFixed(5),v.position.toFixed(2)])];const safe=v=>{let s=String(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 const csv='\ufeff'+rows.map(row=>row.map(safe).join(',')).join('\r\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`${site}_${type}_${state.start}_${state.end}.csv`;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),500);notify(`已导出 ${type==='brand'?'品牌词':'品类词'} Query CSV`);}
function redrawTable(site,type){const node=document.getElementById(`qtable-${site}-${type}`);if(node)node.innerHTML=tablePart(site,type)}
function render(resetScroll=false){const y=window.scrollY;Object.keys(chartStore).forEach(k=>delete chartStore[k]);$('#view').innerHTML=shell()+(state.page==='overview'?overview():detail(state.page));document.querySelectorAll('.nav-btn[data-nav]').forEach(el=>el.classList.toggle('on',el.dataset.nav===state.page));if(resetScroll)window.scrollTo(0,0);else window.scrollTo(0,y)}
function applyDates(){const start=$('#startDate').value,end=$('#endDate').value,err=$('#dateError');if(!start||!end){err.textContent='请选择开始和结束日期';return;}if(start>end){err.textContent='开始日期不能晚于结束日期';return;}if(start<META.oldest||end>META.asOf){err.textContent=`数据覆盖范围：${fdate(META.oldest)} 至 ${fdate(META.asOf)}`;return;}state.period='custom';state.start=start;state.end=end;closeModal('dateModal');render(true)}
async function loadBrandJSON(){
 const sites=['jf','vj'];
 for(const site of sites){
  try{
   const res=await fetch(`./data/brand-${site}.json`,{cache:'no-store'});
   if(!res.ok){console.error(`brand-${site}.json HTTP ${res.status}`);continue}
   const payload=await res.json();
   loadBrandData(site,payload);
  }catch(err){console.error(`Failed to load brand-${site}.json`,err)}
 }
 // 同步加载品类词真实数据
 for(const site of sites){
  try{
   const res=await fetch(`./data/category-${site}.json`,{cache:'no-store'});
   if(!res.ok){console.error(`category-${site}.json HTTP ${res.status}`);continue}
   const payload=await res.json();
   loadCategoryData(site,payload);
  }catch(err){console.error(`Failed to load category-${site}.json`,err)}
 }
 // META.asOf：品牌词与品类词各自有 asOf，前端统一显示用「品牌词 asOf」（品类词同范围一致）
 const asOfDates=Object.values(brandMeta).map(m=>m.asOf).filter(v=>v&&v!=='—').sort();
 const oldestDates=Object.values(brandMeta).map(m=>m.oldest).filter(v=>v&&v!=='—').sort();
 if(asOfDates.length){META.asOf=asOfDates[asOfDates.length-1]}
 // META.oldest：取品牌词和品类词中更早的日期作为整个看板的最旧日期
 const brandOldests=Object.values(brandMeta).map(m=>m.oldest).filter(v=>v&&v!=='—').sort();
 const catOldestsDates=Object.values(categoryMeta).map(m=>m.oldest).filter(v=>v&&v!=='—').sort();
 if(brandOldests.length||catOldestsDates.length){
  const all=[...brandOldests,...catOldestsDates].sort();
  META.oldest=all[0];
 }
 // 品类词的 META 窗口（用于品牌词 Query 明细）
 const catOldests=catOldestsDates;
 META.queryThrough=META.asOf;
 META.queryFrom=catOldests[0]||minusMonths(META.asOf,12);
 // 更新数据来源状态弹窗的真实日期。
 const fmt=d=>d?d.replaceAll('-','/'):'—';
 const sjf=$('#statusJf'),svj=$('#statusVj');
 if(sjf)sjf.textContent=brandMeta.jf.asOf!=='—'?`品牌词至 ${fmt(brandMeta.jf.asOf)} · 品类词至 ${fmt(categoryMeta.jf.asOf)}`:'未加载';
 if(svj)svj.textContent=brandMeta.vj.asOf!=='—'?`品牌词至 ${fmt(brandMeta.vj.asOf)} · 品类词至 ${fmt(categoryMeta.vj.asOf)}`:'未加载';
 const scjf=$('#statusCatJf'),scvj=$('#statusCatVj');
 if(scjf)scjf.textContent=categoryMeta.jf.asOf!=='—'?`${fmt(categoryMeta.jf.oldest)} ~ ${fmt(categoryMeta.jf.asOf)}`:'未加载';
 if(scvj)scvj.textContent=categoryMeta.vj.asOf!=='—'?`${fmt(categoryMeta.vj.oldest)} ~ ${fmt(categoryMeta.vj.asOf)}`:'未加载';
}

function applyDefaultRange(){applyPeriod('28')}

function init(){const form=$('#gateForm'),submitButton=form.querySelector('[type="submit"]');form.addEventListener('submit',e=>{e.preventDefault();const v=$('#gateEmail').value;if(!emailOkay(v)){$('#gateError').textContent='邮箱格式或企业邮箱后缀不符合要求，请检查后重试';return}rememberAllowed();enterApp()});submitButton.disabled=false;
 const initialHash=location.hash.slice(1);if(['overview','jf','vj'].includes(initialHash))state.page=initialHash;
 window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(['overview','jf','vj'].includes(p))setPage(p)});
 document.addEventListener('click',e=>{
  let node=e.target.closest('[data-open-detail]');if(node){const [site,type]=node.dataset.openDetail.split('|');state.detailType[site]=type;navigate(site);return;}
  node=e.target.closest('[data-trend-type]');if(node){const [site,type]=node.dataset.trendType.split('|');state.trendType[site]=type;render();return;}
  node=e.target.closest('[data-detail-type]');if(node){const [site,type]=node.dataset.detailType.split('|');state.detailType[site]=type;render(true);return;}
  node=e.target.closest('[data-nav]');if(node){e.preventDefault();navigate(node.dataset.nav);return;}
  node=e.target.closest('[data-period]');if(node){applyPeriod(node.dataset.period);return;}
  node=e.target.closest('[data-metric]');if(node){const [key,metric]=node.dataset.metric.split('|'),sel=state.metrics[key];if(sel.includes(metric))state.metrics[key]=sel.filter(k=>k!==metric);else state.metrics[key]=KEYS.filter(k=>k===metric||sel.includes(k));render();return;}
  node=e.target.closest('[data-group]');if(node){const [site,group]=node.dataset.group.split('|');state.groups[site]=group;render();return;}
  node=e.target.closest('[data-dimension]');if(node){const [key,view]=node.dataset.dimension.split('|');state.dimension[key]=view;render();return;}
  node=e.target.closest('[data-sort]');if(node){const [site,type,field]=node.dataset.sort.split('|'),q=qstate(site,type);if(q.sort===field)q.desc=!q.desc;else {q.sort=field;q.desc=field!=='query'}q.page=1;redrawTable(site,type);return;}
  node=e.target.closest('[data-qpage]');if(node){const [site,type,dir]=node.dataset.qpage.split('|');qstate(site,type).page+=Number(dir);redrawTable(site,type);return;}
  node=e.target.closest('[data-dpage]');if(node){const [key,dir]=node.dataset.dpage.split('|');state.dayPage[key]=(state.dayPage[key]||1)+Number(dir);render();return;}
  node=e.target.closest('[data-qfilter]');if(node){const [site,type]=node.dataset.qfilter.split('|'),q=qstate(site,type);q.filterOpen=!q.filterOpen;$('#filters-'+site+'-'+type)?.classList.toggle('show',q.filterOpen);return;}
  node=e.target.closest('[data-qreset]');if(node){const [site,type]=node.dataset.qreset.split('|');state.query[site+type]=defaultQ();render();return;}
  node=e.target.closest('[data-export]');if(node){const [site,type]=node.dataset.export.split('|');exportCSV(site,type);return;}
  node=e.target.closest('[data-action]');if(node){const action=node.dataset.action;
   if(action==='manage')notify('演示版未配置GitHub私人仓库链接；正式部署后由此跳转GitHub管理数据。');
   if(action==='status')openModal('statusModal');if(action==='close-status')closeModal('statusModal');
   if(action==='close-date')closeModal('dateModal');if(action==='apply-date')applyDates();
   return;}
 });
 document.addEventListener('input',e=>{const el=e.target;if(el.matches('[data-qsearch]')){const [site,type]=el.dataset.qsearch.split('|'),q=qstate(site,type);q.search=el.value;q.page=1;redrawTable(site,type)}});
 document.addEventListener('change',e=>{const el=e.target;if(el.id==='compare'){state.compare=el.checked;render();return;}if(el.matches('[data-grain]')){state.grain[el.dataset.grain]=el.value;render();return;}if(el.matches('[data-qfield]')){const [site,type,id]=el.dataset.qfield.split('|');qstate(site,type)[id]=el.value;qstate(site,type).page=1;redrawTable(site,type)}});
 document.addEventListener('mousemove',e=>{const hit=e.target.closest('[data-hit]');if(hit)showChartTip(hit,e)});
 document.addEventListener('mouseout',e=>{const hit=e.target.closest('[data-hit]');if(hit)hideChartTip(hit)});
 for(const name of ['dateModal','statusModal'])document.getElementById(name).addEventListener('click',e=>{if(e.target.id===name)closeModal(name)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('dateModal');closeModal('statusModal')}});
 // 异步加载真实品牌词数据后再首次渲染。
 if(allowed())enterApp();
}

async function bootstrapApp(){
 // 加载真实品牌词和品类词 JSON，全部就绪后再渲染。
 try{await loadBrandJSON()}catch(e){console.error('loadBrandJSON failed',e)}
 applyDefaultRange();
}

async function enterApp(){
 await bootstrapApp();
 updateShell();
}
window.addEventListener('DOMContentLoaded',init);

