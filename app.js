const screen=document.getElementById('screen'),days=window.KIKZ_DAYS,cardio=window.KIKZ_CARDIO,stateKey='kikz-training-v2';
let state=JSON.parse(localStorage.getItem(stateKey)||'{"day":1,"done":{},"mode":"no-padel"}');
function save(){localStorage.setItem(stateKey,JSON.stringify(state))}
function dayById(id){return days.find(d=>d.id===Number(id))}
function color(d){return d.color}
function isDone(key){return!!state.done[key]}
function toggle(key){state.done[key]=!state.done[key];save();renderDay(state.day)}
function sectionTitle(n,label,d){return `<div class="section-title"><i style="background:${color(d)}">${n}</i>${label}</div>`}
function home(view='workout'){
  document.body.classList.add('home-mode');
  screen.innerHTML=`<section class="home-screen home-full">
    <div class="home-hero home-full-hero">
      <img src="./kikz-home-clean.jpg" alt="KIKZ training" class="home-hero-img">
      <div class="home-overlay"></div>
      <div class="home-actions home-full-actions">
        <button class="home-choice workout-choice" id="homeWorkout" aria-label="Open Workout">
          <span class="choice-icon ph-fill ph-barbell" aria-hidden="true"></span>
          <span class="choice-copy"><strong>WORKOUT</strong></span>
          <span class="choice-arrow">›</span>
        </button>
        <button class="home-choice cardio-choice" id="homeCardio" aria-label="Open Cardio">
          <span class="choice-icon ph-fill ph-person-simple-run" aria-hidden="true"></span>
          <span class="choice-copy"><strong>CARDIO</strong></span>
          <span class="choice-arrow">›</span>
        </button>
      </div>
    </div>
  </section>`;
  document.getElementById('homeWorkout').onclick=()=>renderWorkoutHome();
  document.getElementById('homeCardio').onclick=()=>renderCardio();
}
function renderWorkoutHome(){
  document.body.classList.remove('home-mode');
  screen.innerHTML=`<section>
    <div class="kicker">YOUR TRAINING PLAN</div>
    <h1 class="home-title">KIKZ</h1>
    <p class="home-sub">4 strength & athletic days.</p>
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
  document.getElementById('resetHome').onclick=resetProgress;
}
function warmupItem(item,d,i){const[name,meta]=item,key=`${d.id}-w-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta"><span>${meta}</span></div></div></div>`}
function workoutItem(item,d,i){const[name,sets,rir,rest,url]=item,key=`${d.id}-x-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta">${sets?`<span>${sets}</span>`:''}${rir?`<span>${rir}</span>`:''}${rest?`<span>Rest ${rest}</span>`:''}</div></div><a class="play" style="background:${color(d)}" href="${url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>`}
function mobilityItem(item,d,i){const[name,meta,url]=item,key=`${d.id}-m-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta"><span>${meta}</span></div></div><a class="play" style="background:${color(d)}" href="${url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>`}
function bindToggles(){document.querySelectorAll('[data-toggle]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('a')||e.target.closest('button')){if(e.target.closest('button')){toggle(el.dataset.toggle)}return}toggle(el.dataset.toggle)}))}
function posterLinks(dayId){
  const raw={"1":[["https://www.youtube.com/watch?v=8iPEnn-ltC8",441,642,43,29],["https://www.youtube.com/watch?v=bsx8PIGIuaI",930,642,42,30],["https://www.youtube.com/watch?v=_RlRDWO2jfg",441,877,43,29],["https://www.youtube.com/watch?v=aoHXhJ2x2BQ",930,877,42,29],["https://www.youtube.com/watch?v=SgyUoY0IZ7A&t=477s",441,1095,43,29],["https://www.youtube.com/watch?v=qfc70k40318",930,1095,42,29],["https://www.youtube.com/results?search_query=zone+2+cycling+beginner+technique",933,1198,42,29]],"2":[["https://www.youtube.com/watch?v=4cxt_Tldugw",42,484,29,28],["https://www.youtube.com/watch?v=SE-2Y-3a1pY",375,484,30,28],["https://www.youtube.com/watch?v=bwhl_9jN_3o",690,484,31,28],["https://www.youtube.com/watch?v=ELOCsoDSmrg&t=1s",43,703,32,29],["https://www.youtube.com/watch?v=YyvSfVjQeL0",375,703,31,26],["https://www.youtube.com/watch?v=-qsRtp_PbVM",690,703,31,26],["https://www.youtube.com/results?search_query=lateral+shuffle+change+of+direction+technique",43,983,32,29],["https://www.youtube.com/results?search_query=lateral+bound+stick+landing+technique",375,983,30,29],["https://www.youtube.com/results?search_query=crossover+step+agility+technique",690,983,31,29],["https://www.youtube.com/watch?v=vIDzsqJiAIo",46,1153,31,26],["https://www.youtube.com/results?search_query=adductor+stretch+technique",377,1153,31,26],["https://www.youtube.com/watch?v=yZCfQ6YbAvA",690,1153,31,26]],"3":[["https://www.youtube.com/watch?v=fGm-ef-4PVk&t=215s",37,696,39,28],["https://www.youtube.com/watch?v=oSEYo6f3eWU",372,696,39,28],["https://www.youtube.com/watch?v=Hdc7Mw6BIEE",692,696,41,28],["https://www.youtube.com/watch?v=KJwiu8ttuZ0",37,945,40,28],["https://www.youtube.com/watch?v=SL-2xNfEBog",372,945,39,28],["https://www.youtube.com/watch?v=3FAvFJ0Vtag",692,945,41,29],["https://www.youtube.com/watch?v=OpRMRhr0Ycc&t=193s",37,1179,43,28],["https://www.youtube.com/results?search_query=bike+intervals+20+seconds+hard+70+seconds+easy",527,1177,43,30],["https://www.youtube.com/results?search_query=shoulder+stretch+technique",37,1466,43,32],["https://www.youtube.com/results?search_query=open+book+thoracic+rotation+mobility",386,1466,43,32],["https://www.youtube.com/results?search_query=kneeling+lat+stretch+technique",700,1466,42,30]],"4":[["https://www.youtube.com/results?search_query=box+jump+technique",457,619,40,39],["https://www.youtube.com/results?search_query=lateral+bound+stick+landing+technique",938,619,40,39],["https://www.youtube.com/watch?v=v-mQm_droHg",236,912,37,36],["https://www.youtube.com/watch?v=xDmFkJxPzeM",469,912,36,36],["https://www.youtube.com/watch?v=9RNKFnd8Hbk",699,912,36,36],["https://www.youtube.com/watch?v=UFI-CG4NMU8",943,912,36,36],["https://www.youtube.com/watch?v=1Tq3QdYUuHs&t=2s",950,1164,36,37],["https://www.youtube.com/watch?v=FEewFamWj4E",257,1168,36,37],["https://www.youtube.com/watch?v=PK3Xz3VemYw",526,1169,37,36],["https://www.youtube.com/watch?v=vIDzsqJiAIo",306,1441,37,37],["https://www.youtube.com/results?search_query=adductor+stretch+technique",625,1441,37,37],["https://www.youtube.com/watch?v=yZCfQ6YbAvA",951,1441,38,37]]};
  return (raw[String(dayId)]||[]).map(([url,x,y,w,h])=>`<a class="poster-link" href="${url}" target="_blank" rel="noopener" aria-label="Open exercise video" style="left:${x/10.24}%;top:${y/15.36}%;width:${w/10.24}%;height:${h/15.36}%;"></a>`).join('');
}
function renderDay(id){
  document.body.classList.remove('home-mode');
  const d=dayById(id);state.day=d.id;save();
  screen.innerHTML=`<button class="back" id="back">‹ All days</button><section class="hero"><div class="hero-media poster-wrap"><img src="${d.image}" alt="Day ${d.id} ${d.name}">${posterLinks(d.id)}</div><div class="hero-body"><div class="kicker">DAY ${d.id}</div><h1>${d.name}</h1><p class="focus">${d.focus}</p><button class="primary" id="start" style="background:${color(d)}">START / CONTINUE</button></div></section>
  ${sectionTitle(1,'WARM-UP',d)}<div class="list">${d.warmup.map((x,i)=>warmupItem(x,d,i)).join('')}</div>
  ${sectionTitle(2,'WORKOUT',d)}<div class="list">${d.workout.map((x,i)=>workoutItem(x,d,i)).join('')}</div>
  <div class="progression"><strong>Progression:</strong> Hit the top of the rep range on all sets with good form → increase load next session.</div>
  ${sectionTitle(3,'MOBILITY',d)}<div class="list">${d.mobility.map((x,i)=>mobilityItem(x,d,i)).join('')}</div>`;
  document.getElementById('back').onclick=home;
  document.getElementById('start').onclick=()=>document.querySelector('.section-title')?.scrollIntoView({behavior:'smooth'});
  bindToggles();
}
function renderCardio(){
  document.body.classList.remove('home-mode');
  screen.innerHTML=`<section>
    <div class="kicker">CONDITIONING SYSTEM</div><h1 class="home-title cardio-title">CARDIO</h1>
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
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();renderCardio()});
  document.querySelectorAll('[data-cardio]').forEach(b=>b.onclick=()=>{const k='c-'+b.dataset.cardio;state.done[k]=!state.done[k];save();renderCardio()});
}
function setNav(active){
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',
    (active==='cardio'&&b.id==='cardioNav') || (active!=='cardio'&&b.id==='workoutNav')
  ));
}
const homeButton=document.getElementById('homeBtn');
homeButton.type='button';
homeButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();home();});

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
home();
if('serviceWorker'in navigator){
  navigator.serviceWorker.register('sw.js').then(reg=>reg.update()).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{window.location.reload();},{once:true});
}
