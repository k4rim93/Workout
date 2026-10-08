const screen=document.getElementById('screen'),programs=window.KIKZ_PROGRAMS,cardioPrograms=window.KIKZ_CARDIO_PROGRAMS,stateKey='kikz-training-v2';
let state=JSON.parse(localStorage.getItem(stateKey)||'{"day":1,"done":{},"mode":"no-padel"}');
let currentView='home';
state.activeWorkoutProgram=state.activeWorkoutProgram||'program-01';
state.activeCardioProgram=state.activeCardioProgram||'cardio-01';
state.done=state.done||{}; state.completedDays=state.completedDays||{};
function save(){localStorage.setItem(stateKey,JSON.stringify(state))}
function activeProgram(){return programs.find(p=>p.id===state.activeWorkoutProgram)||programs[0]}
function activeCardioProgram(){return cardioPrograms.find(p=>p.id===state.activeCardioProgram)||cardioPrograms[0]}
function programDays(){return activeProgram().days}
function cardio(){return activeCardioProgram().cardio}
function scopedKey(scope,key){return scope+'::'+key}
function migrateProgramState(){if(state.programStateVersion===2)return;Object.keys(state.done).forEach(k=>{if(/^\\d+-[wxm]-\\d+$/.test(k))state.done[scopedKey('program-01',k)]=state.done[k];if(/^c-[A-Z]$/.test(k))state.done[scopedKey('cardio-01',k)]=state.done[k]});Object.keys(state.completedDays).forEach(k=>{if(/^\\d+$/.test(k))state.completedDays[scopedKey('program-01',k)]=state.completedDays[k]});state.programStateVersion=2;save()}
migrateProgramState()
function haptic(pattern=8){try{if(navigator.vibrate)navigator.vibrate(pattern)}catch(e){}}
function pressFeedback(el){if(!el)return;el.classList.remove('tap-pop');void el.offsetWidth;el.classList.add('tap-pop');setTimeout(()=>el.classList.remove('tap-pop'),180)}
function bindInteractionFeedback(){screen.querySelectorAll('button,a').forEach(el=>el.addEventListener('pointerdown',()=>{pressFeedback(el);haptic(8)},{passive:true}))}
function dayById(id){return programDays().find(d=>d.id===Number(id))}
function dayKeys(d){return [...d.warmup.map((_,i)=>scopedKey(activeProgram().id,`${d.id}-w-${i}`)),...d.workout.map((_,i)=>scopedKey(activeProgram().id,`${d.id}-x-${i}`)),...d.mobility.map((_,i)=>scopedKey(activeProgram().id,`${d.id}-m-${i}`))]}
function dayProgress(d){const keys=dayKeys(d),done=keys.filter(k=>isDone(k)).length;return {done,total:keys.length,complete:done===keys.length}}
function dayCompleted(d){return!!state.completedDays[scopedKey(activeProgram().id,d.id)]}
function color(d){return d.color}
function isDone(key){return!!state.done[key]}
function toggle(key){state.done[key]=!state.done[key];const d=dayById(state.day);if(d&&dayProgress(d).complete){state.completedDays[scopedKey(activeProgram().id,d.id)]=true;haptic([10,35,10])}else haptic(8);save();renderDay(state.day)}
function sectionTitle(n,label,d,id){return `<div class="section-title" id="${id||''}"><i style="background:${color(d)}">${n}</i>${label}</div>`}
function home(view='workout'){
  currentView='home';
  document.body.classList.add('home-mode');
  screen.innerHTML=`<section class="home-screen home-full">
    <div class="home-hero home-full-hero">
      <img src="./kikz-home-clean.jpg" alt="KIKZ training" class="home-hero-img">
      <div class="home-overlay"></div>
      <div class="home-actions home-full-actions">
        <button class="home-choice workout-choice" id="homeWorkout" aria-label="Open Workout">
          <span class="choice-copy"><strong>WORKOUT</strong></span>
          <span class="choice-arrow">›</span>
        </button>
        <button class="home-choice cardio-choice" id="homeCardio" aria-label="Open Cardio">
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
  currentView='workout'; document.body.classList.remove('home-mode');
  const current=activeProgram();
  screen.innerHTML=`<section>
    <div class="kicker">WORKOUT SYSTEM</div><h1 class="home-title">WORKOUT</h1>
    <div class="program-current-card" style="--program-accent:${current.days[0]?.color||'#111'}">
      <div class="program-card-kicker">CURRENT PROGRAM</div>
      <div class="program-card-title">${current.label} — ${current.name}</div>
      <div class="program-card-desc">${current.description}</div>
      <div class="program-card-meta"><span>${current.days.length} DAYS / WEEK</span><span>ACTIVE</span></div>
      <button class="program-open" id="openCurrentProgram">OPEN PROGRAM →</button>
    </div>
    <div class="library-heading">YOUR PROGRAMS</div>
    <div class="program-list">${programs.map(p=>`
      <button class="program-list-card ${p.id===state.activeWorkoutProgram?'active':''}" data-program="${p.id}">
        <div class="program-list-accent" style="background:${p.days[0]?.color||'#111'}"></div>
        <div class="program-list-copy"><div class="program-list-label">${p.label}</div><strong>${p.name}</strong><small>${p.days.length} TRAINING DAYS • ${p.status.toUpperCase()}</small></div>
        <span class="program-list-arrow">›</span>
      </button>`).join('')}</div>
    <div class="library-note">New programs can be added here later without changing this layout.</div>
  </section>`;
  document.getElementById('openCurrentProgram').onclick=()=>renderProgram(current.id);
  document.querySelectorAll('[data-program]').forEach(b=>b.onclick=()=>renderProgram(b.dataset.program));
  bindInteractionFeedback();
}
function renderProgram(programId){
  const p=programs.find(x=>x.id===programId)||activeProgram(); state.activeWorkoutProgram=p.id; state.day=1; save(); currentView='program';
  document.body.classList.remove('home-mode'); const days=p.days;
  screen.innerHTML=`<button class="back" id="backPrograms">‹ All programs</button><section>
    <div class="kicker">${p.label}</div><h1 class="home-title">${p.name}</h1><p class="home-sub">${p.description}</p>
    <div class="day-grid">${days.map(d=>{const prog=dayProgress(d),done=dayCompleted(d);return `<button class="day-card ${done?'day-completed':''}" data-open="${d.id}"><div class="day-dot" style="background:${color(d)}">DAY ${d.id}</div><div class="day-card-copy"><div class="day-name">${d.name}</div><div class="day-focus">${d.focus}</div><div class="day-progress-row"><span>${done?'✓ DAY COMPLETE':`${prog.done}/${prog.total} complete`}</span><span>${Math.round((prog.done/prog.total)*100)}%</span></div><div class="day-progress"><span style="width:${(prog.done/prog.total)*100}%;background:${color(d)}"></span></div></div><div class="chev">›</div></button>`}).join('')}</div>
    <div id="nextUpMount"></div><div class="program-history-note">Progress is saved separately for each program.</div>
  </section>`;
  document.getElementById('backPrograms').onclick=renderWorkoutHome;
  document.querySelectorAll('[data-open]').forEach(x=>x.onclick=()=>{state.day=Number(x.dataset.open);save();renderDay(state.day)});
  const mount=document.getElementById('nextUpMount'),next=days.find(d=>!dayCompleted(d));
  mount.innerHTML=next?'<div class="next-up-card"><div><span>NEXT UP</span><strong>DAY '+next.id+' — '+next.name+'</strong><small>'+next.focus+'</small></div><button data-open="'+next.id+'">START →</button></div>':'<div class="all-days-complete">✓ ALL '+days.length+' DAYS COMPLETE</div>';
  mount.querySelector('[data-open]')?.addEventListener('click',()=>{state.day=Number(mount.querySelector('[data-open]').dataset.open);save();haptic(12);renderDay(state.day)});
  bindInteractionFeedback();
}function warmupItem(item,d,i){const[name,meta]=item,key=`${d.id}-w-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta"><span>${meta}</span></div></div></div>`}
function workoutItem(item,d,i){const[name,sets,rir,rest,url]=item,key=`${d.id}-x-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta">${sets?`<span>${sets}</span>`:''}${rir?`<span>${rir}</span>`:''}${rest?`<span>Rest ${rest}</span>`:''}</div></div><a class="play" style="background:${color(d)}" href="${url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>`}
function mobilityItem(item,d,i){const[name,meta,url]=item,key=`${d.id}-m-${i}`;return`<div class="item ${isDone(key)?'done':''}" data-toggle="${key}"><button class="check" aria-label="Mark complete" style="${isDone(key)?`background:${color(d)}`:''}">${isDone(key)?'✓':''}</button><div class="item-main"><div class="item-name">${name}</div><div class="item-meta"><span>${meta}</span></div></div><a class="play" style="background:${color(d)}" href="${url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div>`}
function bindToggles(){document.querySelectorAll('[data-toggle]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('a')||e.target.closest('button')){if(e.target.closest('button')){toggle(el.dataset.toggle)}return}toggle(el.dataset.toggle)}))}
function posterLinks(dayId){
  const raw={"1":[["https://www.youtube.com/watch?v=8iPEnn-ltC8",441,642,43,29],["https://www.youtube.com/watch?v=bsx8PIGIuaI",930,642,42,30],["https://www.youtube.com/watch?v=_RlRDWO2jfg",441,877,43,29],["https://www.youtube.com/watch?v=aoHXhJ2x2BQ",930,877,42,29],["https://www.youtube.com/watch?v=SgyUoY0IZ7A&t=477s",441,1095,43,29],["https://www.youtube.com/watch?v=qfc70k40318",930,1095,42,29],["https://www.youtube.com/results?search_query=zone+2+cycling+beginner+technique",933,1198,42,29]],"2":[["https://www.youtube.com/watch?v=4cxt_Tldugw",42,484,29,28],["https://www.youtube.com/watch?v=SE-2Y-3a1pY",375,484,30,28],["https://www.youtube.com/watch?v=bwhl_9jN_3o",690,484,31,28],["https://www.youtube.com/watch?v=ELOCsoDSmrg&t=1s",43,703,32,29],["https://www.youtube.com/watch?v=YyvSfVjQeL0",375,703,31,26],["https://www.youtube.com/watch?v=-qsRtp_PbVM",690,703,31,26],["https://www.youtube.com/results?search_query=lateral+shuffle+change+of+direction+technique",43,983,32,29],["https://www.youtube.com/results?search_query=lateral+bound+stick+landing+technique",375,983,30,29],["https://www.youtube.com/results?search_query=crossover+step+agility+technique",690,983,31,29],["https://www.youtube.com/watch?v=vIDzsqJiAIo",46,1153,31,26],["https://www.youtube.com/results?search_query=adductor+stretch+technique",377,1153,31,26],["https://www.youtube.com/watch?v=yZCfQ6YbAvA",690,1153,31,26]],"3":[["https://www.youtube.com/watch?v=fGm-ef-4PVk&t=215s",37,696,39,28],["https://www.youtube.com/watch?v=oSEYo6f3eWU",372,696,39,28],["https://www.youtube.com/watch?v=Hdc7Mw6BIEE",692,696,41,28],["https://www.youtube.com/watch?v=KJwiu8ttuZ0",37,945,40,28],["https://www.youtube.com/watch?v=SL-2xNfEBog",372,945,39,28],["https://www.youtube.com/watch?v=3FAvFJ0Vtag",692,945,41,29],["https://www.youtube.com/watch?v=OpRMRhr0Ycc&t=193s",37,1179,43,28],["https://www.youtube.com/results?search_query=bike+intervals+20+seconds+hard+70+seconds+easy",527,1177,43,30],["https://www.youtube.com/results?search_query=shoulder+stretch+technique",37,1466,43,32],["https://www.youtube.com/results?search_query=open+book+thoracic+rotation+mobility",386,1466,43,32],["https://www.youtube.com/results?search_query=kneeling+lat+stretch+technique",700,1466,42,30]],"4":[["https://www.youtube.com/results?search_query=box+jump+technique",457,619,40,39],["https://www.youtube.com/results?search_query=lateral+bound+stick+landing+technique",938,619,40,39],["https://www.youtube.com/watch?v=v-mQm_droHg",236,912,37,36],["https://www.youtube.com/watch?v=xDmFkJxPzeM",469,912,36,36],["https://www.youtube.com/watch?v=9RNKFnd8Hbk",699,912,36,36],["https://www.youtube.com/watch?v=UFI-CG4NMU8",943,912,36,36],["https://www.youtube.com/watch?v=1Tq3QdYUuHs&t=2s",950,1164,36,37],["https://www.youtube.com/watch?v=FEewFamWj4E",257,1168,36,37],["https://www.youtube.com/watch?v=PK3Xz3VemYw",526,1169,37,36],["https://www.youtube.com/watch?v=vIDzsqJiAIo",306,1441,37,37],["https://www.youtube.com/results?search_query=adductor+stretch+technique",625,1441,37,37],["https://www.youtube.com/watch?v=yZCfQ6YbAvA",951,1441,38,37]]};
  return (raw[String(dayId)]||[]).map(([url,x,y,w,h])=>`<a class="poster-link" href="${url}" target="_blank" rel="noopener" aria-label="Open exercise video" style="left:${x/10.24}%;top:${y/15.36}%;width:${w/10.24}%;height:${h/15.36}%;"></a>`).join('');
}
function renderDay(id){
  currentView='day';
  document.body.classList.remove('home-mode');
  const d=dayById(id);state.day=d.id;save();
  const p=dayProgress(d),completed=dayCompleted(d),pct=Math.round((p.done/p.total)*100);
  screen.innerHTML=`<button class="back" id="back">‹ All days</button>
  <section class="hero">
    <div class="hero-media poster-wrap"><img src="${d.image}" alt="Day ${d.id} ${d.name}">${posterLinks(d.id)}</div>
    <div class="hero-body">
      <div class="kicker">DAY ${d.id}</div><h1>${d.name}</h1><p class="focus">${d.focus}</p>
      <div class="day-detail-progress"><div class="day-progress-row"><span>${completed?'✓ DAY COMPLETE':`${p.done}/${p.total} complete`}</span><span>${pct}%</span></div><div class="day-progress"><span style="width:${pct}%;background:${color(d)}"></span></div></div>
      <button class="primary" id="start" style="background:${color(d)}">${completed?'VIEW WORKOUT':'START / CONTINUE'}</button>
    </div>
  </section>
  <nav class="section-nav" aria-label="Jump to section">
    <button data-jump="warmup">WARM-UP</button><button data-jump="workout">WORKOUT</button><button data-jump="mobility">MOBILITY</button>
  </nav>
  ${sectionTitle(1,'WARM-UP',d,'warmup')}<div class="list">${d.warmup.map((x,i)=>warmupItem(x,d,i)).join('')}</div>
  ${sectionTitle(2,'WORKOUT',d,'workout')}<div class="list">${d.workout.map((x,i)=>workoutItem(x,d,i)).join('')}</div>
  <div class="progression"><strong>Progression:</strong> Hit the top of the rep range on all sets with good form → increase load next session.</div>
  ${sectionTitle(3,'MOBILITY',d,'mobility')}<div class="list">${d.mobility.map((x,i)=>mobilityItem(x,d,i)).join('')}
  <div class="day-complete-wrap"><button class="day-complete ${completed?'completed':''}" id="completeDay">${completed?'✓ DAY COMPLETE': 'MARK DAY COMPLETE'}</button>${d.id<programDays().length?'<button class="next-day" id="nextDay">NEXT DAY →</button>':''}</div>
  </div>`;
  document.getElementById('back').onclick=renderWorkoutHome;
  document.getElementById('start').onclick=()=>document.getElementById('workout')?.scrollIntoView({behavior:'smooth',block:'start'});
  document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'start'}));
  document.getElementById('completeDay').onclick=()=>{
    state.completedDays=state.completedDays||{};state.completedDays[d.id]=true;save();haptic([10,35,10]);renderDay(d.id);
  };
  document.getElementById('nextDay')?.addEventListener('click',()=>{state.day=Math.min(programDays().length,d.id+1);save();haptic(12);renderDay(state.day)});
  bindToggles();
  bindInteractionFeedback();
}
function renderCardio(){
  currentView='cardio'; document.body.classList.remove('home-mode'); const current=activeCardioProgram();
  screen.innerHTML=`<section><div class="kicker">CONDITIONING SYSTEM</div><h1 class="home-title cardio-title">CARDIO</h1>
    <div class="program-current-card cardio-program-card" style="--program-accent:${current.cardio[0]?.color||'#111'}">
      <div class="program-card-kicker">CURRENT PROGRAM</div><div class="program-card-title">${current.label} — ${current.name}</div><div class="program-card-desc">${current.description}</div>
      <div class="program-card-meta"><span>${current.cardio.length} OPTIONS</span><span>ACTIVE</span></div><button class="program-open" id="openCurrentCardio">OPEN PROGRAM →</button>
    </div><div class="library-heading">YOUR PROGRAMS</div><div class="program-list">${cardioPrograms.map(p=>`
      <button class="program-list-card ${p.id===state.activeCardioProgram?'active':''}" data-cardio-program="${p.id}"><div class="program-list-accent" style="background:${p.cardio[0]?.color||'#111'}"></div>
      <div class="program-list-copy"><div class="program-list-label">${p.label}</div><strong>${p.name}</strong><small>${p.cardio.length} OPTIONS • ${p.status.toUpperCase()}</small></div><span class="program-list-arrow">›</span></button>`).join('')}</div>
    <div class="library-note">New cardio programs can be added here later without changing this layout.</div></section>`;
  document.getElementById('openCurrentCardio').onclick=()=>renderCardioProgram(current.id);
  document.querySelectorAll('[data-cardio-program]').forEach(x=>x.onclick=()=>renderCardioProgram(x.dataset.cardioProgram)); bindInteractionFeedback();
}
function renderCardioProgram(programId){
  const p=cardioPrograms.find(x=>x.id===programId)||activeCardioProgram(); state.activeCardioProgram=p.id; save(); currentView='cardio-program'; document.body.classList.remove('home-mode');
  screen.innerHTML=`<button class="back" id="backCardioPrograms">‹ All programs</button><section><div class="kicker">${p.label}</div><h1 class="home-title cardio-title">${p.name}</h1><p class="home-sub">${p.description}</p>
    <div class="padel-switch"><div><strong>PADEL / HARD SESSION TODAY?</strong><div class="small-muted">If yes, skip Intervals and use Recovery or nothing.</div></div><div class="switch-row"><button class="mode-btn ${state.mode==='padel'?'active':''}" data-mode="padel">YES</button><button class="mode-btn ${state.mode==='no-padel'?'active':''}" data-mode="no-padel">NO</button></div></div>
    <div class="cardio-list">${p.cardio.map(c=>`<article class="cardio-card ${state.mode==='padel'&&c.id==='C'?'dimmed':''}"><div class="cardio-head"><div class="cardio-dot" style="background:${c.color}">${c.id}</div><div><div class="day-name">${c.name}</div><div class="cardio-duration">${c.duration}</div></div></div><div class="cardio-intensity">${c.intensity}</div><div class="cardio-details">${c.details.map(x=>`<div>• ${x}</div>`).join('')}</div><div class="cardio-when"><strong>WHEN:</strong> ${c.when}</div><div class="cardio-actions"><button class="cardio-done ${isDone(scopedKey(p.id,'c-'+c.id))?'done-btn':''}" data-cardio="${c.id}">${isDone(scopedKey(p.id,'c-'+c.id))?'✓ DONE':'MARK DONE'}</button><a class="play" style="background:${c.color}" href="${c.url}" target="_blank" rel="noopener" aria-label="Open video">▶</a></div></article>`).join('')}</div></section>`;
  document.getElementById('backCardioPrograms').onclick=renderCardio;
  document.querySelectorAll('[data-mode]').forEach(x=>x.onclick=()=>{state.mode=x.dataset.mode;save();renderCardioProgram(p.id)});
  document.querySelectorAll('[data-cardio]').forEach(x=>x.onclick=()=>{const k=scopedKey(p.id,'c-'+x.dataset.cardio);state.done[k]=!state.done[k];save();haptic(12);renderCardioProgram(p.id)}); bindInteractionFeedback();
}function setupEdgeSwipe(){
  let startX=0,startY=0,tracking=false;
  const resetSwipe=()=>{screen.style.transition='transform 180ms ease';screen.style.transform='translateX(0)';setTimeout(()=>{screen.style.transition='';},190)};
  screen.addEventListener('touchstart',e=>{
    if(!e.touches.length)return;
    const t=e.touches[0];
    tracking=t.clientX<=36;
    if(tracking){startX=t.clientX;startY=t.clientY;screen.style.transition='';}
  },{passive:true});
  screen.addEventListener('touchmove',e=>{
    if(!tracking||!e.touches.length)return;
    const t=e.touches[0],dx=t.clientX-startX,dy=Math.abs(t.clientY-startY);
    if(dx>0&&dy<Math.max(45,dx*.7))screen.style.transform=`translateX(${Math.min(dx*.18,14)}px)`;
  },{passive:true});
  screen.addEventListener('touchend',e=>{
    if(!tracking||!e.changedTouches.length)return;
    const t=e.changedTouches[0],dx=t.clientX-startX,dy=Math.abs(t.clientY-startY);
    tracking=false;
    if(dx>70&&dy<70){
      screen.style.transition='transform 180ms ease';screen.style.transform='translateX(28px)';
      setTimeout(()=>{
        screen.style.transition='';screen.style.transform='translateX(0)';
        haptic(10); if(currentView==='day'||currentView==='program') renderWorkoutHome();
        else if(currentView==='cardio-program') renderCardio();
        else if(currentView==='workout'||currentView==='cardio') home();
      },140);
    }else resetSwipe();
  },{passive:true});
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
    state={day:1,done:{},mode:state.mode,completedDays:{},activeWorkoutProgram:'program-01',activeCardioProgram:'cardio-01',programStateVersion:2};save();renderWorkoutHome();
  }
}
setupEdgeSwipe();
home();
if('serviceWorker'in navigator){
  navigator.serviceWorker.register('sw.js').then(reg=>reg.update()).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{window.location.reload();},{once:true});
}
