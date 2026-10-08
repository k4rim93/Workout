const screen=document.getElementById('screen'),days=window.KIKZ_DAYS,cardio=window.KIKZ_CARDIO,stateKey='kikz-training-v2';
let state=JSON.parse(localStorage.getItem(stateKey)||'{"day":1,"done":{},"mode":"no-padel"}');
function save(){localStorage.setItem(stateKey,JSON.stringify(state))}
function dayById(id){return days.find(d=>d.id===Number(id))}
function color(d){return d.color}
function isDone(key){return!!state.done[key]}
function toggle(key){state.done[key]=!state.done[key];save();renderDay(state.day)}
function sectionTitle(n,label,d){return `<div class="section-title"><i style="background:${color(d)}">${n}</i>${label}</div>`}
function home(view='workout'){
  if(view==='cardio'){renderCardio();return;}
  screen.innerHTML=`<section>
    <div class="kicker">YOUR TRAINING PLAN</div>
    <h1 class="home-title">KIKZ TRAINING</h1>
    <div class="main-tabs">
      <button class="main-tab active" id="workoutTab">WORKOUT</button>
      <button class="main-tab" id="cardioTab">CARDIO</button>
    </div>
    <p class="home-sub">4 strength & athletic days. Choose cardio separately based on Padel and fatigue.</p>
    <div class="day-grid">
      ${days.map(d=>`<button class="day-card" data-open="${d.id}">
        <div class="day-dot" style="background:${color(d)}">DAY ${d.id}</div>
        <div><div class="day-name">${d.name}</div><div class="day-focus">${d.focus}</div></div>
        <div class="chev">›</div>
      </button>`).join('')}
    </div>
    <button class="reset-link" id="resetHome">Reset progress</button>
    <div class="rule-card"><strong>Training rule:</strong> Padel counts as conditioning. If you played hard, skip Intervals. On busy days, do the Strength workout only.</div>
  </section>`;
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{state.day=Number(b.dataset.open);save();renderDay(state.day)});
  document.getElementById('cardioTab').onclick=()=>renderCardio();
  document.getElementById('workoutTab').onclick=()=>home('workout');
}

function warmupItem(item,d,i){const[name,meta]=item,key=`${d.id}-w-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta"><span>${meta}</span></div></div></div>`}
function workoutItem(item,d,i){const[name,sets,rir,rest,url]=item,key=`${d.id}-x-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta">${sets?`<span>${sets}</span>`:''}${rir?`<span>${rir}</span>`:''}${rest?`<span>Rest ${rest}</span>`:''}</div></div><a class="play" style="background:${color(d)}" href="${url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>`}
function mobilityItem(item,d,i){const[name,meta,url]=item,key=`${d.id}-m-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta"><span>${meta}</span></div></div><a class="play" style="background:${color(d)}" href="${url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>`}
function bindToggles(){document.querySelectorAll('[data-toggle]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('a')||e.target.closest('button')){if(e.target.closest('button')){toggle(el.dataset.toggle)}return}toggle(el.dataset.toggle)}))}
function renderDay(id){
  const d=dayById(id);state.day=d.id;save();
  screen.innerHTML=`<button class="back" id="back">‹ All days</button><section class="hero"><div class="hero-media"><img src="${d.image}" alt="Day ${d.id} ${d.name}"></div><div class="hero-body"><div class="kicker">DAY ${d.id}</div><h1>${d.name}</h1><p class="focus">${d.focus}</p><button class="primary" id="start" style="background:${color(d)}">START / CONTINUE</button></div></section>
  ${sectionTitle(1,'WARM-UP',d)}<div class="list">${d.warmup.map((x,i)=>warmupItem(x,d,i)).join('')}</div>
  ${sectionTitle(2,'WORKOUT',d)}<div class="list">${d.workout.map((x,i)=>workoutItem(x,d,i)).join('')}</div>
  <div class="progression"><strong>Progression:</strong> Hit the top of the rep range on all sets with good form → increase load next session.</div>
  ${sectionTitle(3,'MOBILITY',d)}<div class="list">${d.mobility.map((x,i)=>mobilityItem(x,d,i)).join('')}</div>`;
  document.getElementById('back').onclick=home;
  document.getElementById('start').onclick=()=>document.querySelector('.section-title')?.scrollIntoView({behavior:'smooth'});
  bindToggles();setNav(d.id);
}
function renderCardio(){
  screen.innerHTML=`<section>
    <div class="kicker">TRAINING SYSTEM</div>
    <h1 class="home-title">KIKZ TRAINING</h1>
    <div class="main-tabs">
      <button class="main-tab" id="workoutTab">WORKOUT</button>
      <button class="main-tab active" id="cardioTab">CARDIO</button>
    </div>
    <div class="kicker cardio-kicker">CONDITIONING SYSTEM</div><h1 class="home-title cardio-title">CARDIO</h1>
    <p class="home-sub">4 options — pick the one that matches your Padel load and fatigue.</p>
    <div class="padel-switch">
      <div><strong>PADEL / HARD SESSION TODAY?</strong><div class="small-muted">If yes, skip Intervals and use Recovery or nothing.</div></div>
      <div class="switch-row"><button class="mode-btn ${state.mode==='padel'?'active':''}" data-mode="padel">YES</button><button class="mode-btn ${state.mode==='no-padel'?'active':''}" data-mode="no-padel">NO</button></div>
    </div>
    <div class="cardio-list">${cardio.map(c=>`<article class="cardio-card ${state.mode==='padel'&&c.id==='C'?'dimmed':''}">
      <div class="cardio-head"><div class="cardio-dot" style="background:${c.color}">${c.id}</div><div><div class="day-name">${c.name}</div><div class="cardio-duration">${c.duration}</div></div></div>
      <div class="cardio-intensity">${c.intensity}</div>
      <div class="cardio-details">${c.details.map(x=>`<div>• ${x}</div>`).join('')}</div>
      <div class="cardio-when"><strong>WHEN:</strong> ${c.when}</div>
      <div class="cardio-actions"><button class="cardio-done ${isDone('c-'+c.id)?'done-btn':''}" data-cardio="${c.id}">${isDone('c-'+c.id)?'✓ DONE':'MARK DONE'}</button><a class="play" style="background:${c.color}" href="${c.url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>
    </article>`).join('')}</div>`;
  document.getElementById('workoutTab').onclick=()=>home('workout');
  document.getElementById('cardioTab').onclick=()=>renderCardio();
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();renderCardio()});
  document.querySelectorAll('[data-cardio]').forEach(b=>b.onclick=()=>{const k='c-'+b.dataset.cardio;state.done[k]=!state.done[k];save();renderCardio()});
  setNav('cardio');
}
function setNav(active){
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',
    (active==='cardio'&&b.id==='cardioNav') || (active!=='cardio'&&b.id==='workoutNav')
  ));
}
document.getElementById('homeBtn').onclick=home;
document.addEventListener('click',e=>{if(e.target.id==='resetHome')resetProgress();});
async function updateAndReload(){
  try{
    if('serviceWorker' in navigator){
      const reg=await navigator.serviceWorker.getRegistration();
      if(reg){
        try{await reg.update();}catch(e){}
        if(reg.waiting){
          reg.waiting.postMessage({type:'SKIP_WAITING'});
          await new Promise(r=>setTimeout(r,250));
        }
      }
      if(window.caches){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
      }
    }
  }catch(e){}
  window.location.reload();
}
document.getElementById('reloadBtn').onclick=updateAndReload;
function resetProgress(){
  if(confirm('Reset all workout and cardio checkmarks?')){
    state={day:state.day,done:{},mode:state.mode};save();renderDay(state.day);
  }
}
document.querySelectorAll('.bottom-nav button[data-day]').forEach(b=>b.onclick=()=>{state.day=Number(b.dataset.day);save();renderDay(state.day)});
home();
if('serviceWorker'in navigator){
  navigator.serviceWorker.register('sw.js').then(reg=>reg.update()).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{window.location.reload();},{once:true});
}
