/* =============== Images (photo de base + variantes "ouvertes") =============== */
const KITCHEN_SRC = "images/kitchen.jpg";
const OPEN_SRC = {
  glass_cab: "images/glass_cab.jpg",
  left_cab:  "images/left_cab.jpg",
  drawers:   "images/drawers.jpg",
  yellow_cab:"images/yellow_cab.jpg",
  sink_cab:  "images/sink_cab.jpg",
  oven:      "images/oven.jpg",
};
document.getElementById('kitchenPhoto').src = KITCHEN_SRC;

const stage = document.getElementById('stage');
const photoFrame = document.getElementById('photoFrame');
function el(tag, cls, parent){ const e=document.createElement('div'); if(cls) e.className=cls; (parent||photoFrame).appendChild(e); return e; }
function pct(v){ return v+'%'; }
function box(node,l,t,w,h){ node.style.left=pct(l); node.style.top=pct(t); node.style.width=pct(w); node.style.height=pct(h); }

/* =============== Son (Web Audio, aucun fichier) =============== */
let actx, muted=false;
function ac(){ actx = actx || new (window.AudioContext||window.webkitAudioContext)(); return actx; }
function tone(freq,dur,type,vol,delay){
  if(muted) return;
  setTimeout(()=>{
    try{
      const a=ac(); const o=a.createOscillator(); const g=a.createGain();
      o.type=type||'sine'; o.frequency.value=freq;
      g.gain.setValueAtTime(0.0001,a.currentTime);
      g.gain.exponentialRampToValueAtTime(vol||.2,a.currentTime+.02);
      g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+dur);
      o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+dur+.02);
    }catch(e){}
  }, delay||0);
}
function noiseBurst(dur,vol){
  if(muted) return;
  try{
    const a=ac(); const bufferSize=a.sampleRate*dur;
    const buf=a.createBuffer(1,bufferSize,a.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i]=(Math.random()*2-1)*(1-i/bufferSize);
    const src=a.createBufferSource(); src.buffer=buf;
    const g=a.createGain(); g.gain.value=vol||.25;
    src.connect(g); g.connect(a.destination); src.start();
  }catch(e){}
}
function toggleMute(){ muted=!muted; document.getElementById('soundToggle').textContent = muted?'🔇':'🔊'; }
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),1400);
}

/* =============== Placards, tiroir et four (vraies images alignées) =============== */
const OVERLAYS = [
 {key:'glass_cab',  l:47, t:31, w:33, h:15, dx:-0.08, dy:0.56},
 {key:'left_cab',   l:4,  t:68, w:20, h:20, dx:0.08,  dy:0.74},
 {key:'drawers',    l:25, t:62, w:13, h:26, dx:0.08,  dy:0},
 {key:'yellow_cab', l:52, t:66, w:9,  h:21, dx:0.39,  dy:0.65},
 {key:'sink_cab',   l:78, t:66, w:21, h:21, dx:0.39,  dy:0.65},
 {key:'oven',       l:36, t:55, w:17, h:16, dx:0.39,  dy:0.56},
];
OVERLAYS.forEach((o, ovIdx)=>{
  const img = document.createElement('img');
  img.className = 'overlay-photo';
  img.id = 'ov_'+o.key;
  img.src = OPEN_SRC[o.key];
  img.style.transform = `translate(${o.dx}%, ${o.dy}%)`;
  photoFrame.appendChild(img);

  const hotspot = el('div','hotspot');
  box(hotspot, o.l, o.t, o.w, o.h);
  const spark = el('div','sparkle',hotspot); spark.textContent='✨';
  const revealBowl = el('div','reveal-bowl',hotspot);
  hotspot.dataset.ovIdx = ovIdx;
  hotspot.addEventListener('click', ()=>{
    const opening = !img.classList.contains('shown');
    img.classList.toggle('shown');
    hotspot.classList.toggle('shown');
    tone(opening ? (o.key==='oven'?300:520) : (o.key==='oven'?250:400), o.key==='oven'?.18:.12, o.key==='oven'?'sawtooth':'triangle', .17);
    if(o.key==='oven' && opening) tone(660,.25,'triangle',.15,650);
    if(opening) revealGamelle(ovIdx, hotspot, revealBowl);
  });
});

/* =============== Evier (eau) =============== */
(function(){
  const scene = el('div','hotspot sink-scene'); box(scene, 76,50,20,10);
  const stream = el('div','water-stream', scene);
  for(let i=0;i<5;i++){ const b=el('div','bubble',scene); b.style.left=(40+Math.random()*20)+'%'; b.style.animationDelay=(Math.random()*1)+'s'; }
  scene.addEventListener('click', ()=>{
    scene.classList.toggle('on');
    tone(scene.classList.contains('on')?880:520, .1, 'sine', .1);
  });
})();

/* =============== Tapis (petit effet sans triche visuelle) =============== */
(function(){
  const rug = el('div','hotspot'); box(rug,12,86,67,14);
  rug.addEventListener('click', ()=>{
    tone(160,.15,'square',.12);
    for(let i=0;i<5;i++){
      const d = el('div','dust'); d.textContent='💨';
      const rect = rug.getBoundingClientRect(); const sRect = photoFrame.getBoundingClientRect();
      d.style.left = (rect.left-sRect.left + Math.random()*rect.width)+'px';
      d.style.top = (rect.top-sRect.top + rect.height*0.3)+'px';
      d.style.transition = 'transform .7s ease-out, opacity .7s';
      photoFrame.appendChild(d);
      requestAnimationFrame(()=>{ d.style.transform = `translateY(-30px) scale(1.3)`; d.style.opacity='0'; });
      setTimeout(()=>d.remove(), 720);
    }
    toast('Tapis tout propre ! 🟩');
  });
})();

/* =============== Suspensions (4 lampes) =============== */
[[33,22],[52,26],[64,29],[76,26]].forEach(([lx,ly])=>{
  const lamp = el('div','hotspot lamp'); box(lamp, lx-4, ly-3, 8, 8);
  const glow = el('div','lamp-glow', lamp);
  lamp.addEventListener('click', ()=>{
    lamp.classList.toggle('lit');
    lamp.classList.remove('swing'); void lamp.offsetWidth; lamp.classList.add('swing');
    tone(lamp.classList.contains('lit')?740:420, .12, 'triangle', .16);
  });
});

/* =============== Hotte =============== */
(function(){
  const scene = el('div','hotspot hood-scene'); box(scene, 30,24,18,19);
  const fan = el('div','fan-icon', scene); fan.textContent='✳️';
  let loopId=null;
  scene.addEventListener('click', ()=>{
    const on = scene.classList.toggle('on');
    tone(on?300:220,.15,'sawtooth',.1);
    if(on){ loopId = setInterval(()=>tone(180+Math.random()*30,.08,'sawtooth',.04),180); }
    else if(loopId){ clearInterval(loopId); loopId=null; }
  });
})();

/* =============== Ustensiles suspendus =============== */
(function(){
  const rail = el('div','hotspot'); box(rail, 4,46,27,7);
  rail.addEventListener('click', ()=>{
    rail.classList.remove('swing'); void rail.offsetWidth; rail.classList.add('swing');
    tone(500,.1,'triangle',.12);
  });
})();

/* =============== Planche a decouper =============== */
(function(){
  const board = el('div','hotspot'); board.id='board'; box(board, 58,44,13,11);
  board.addEventListener('click', ()=>{
    const falling = !board.classList.contains('fallen');
    board.classList.toggle('fallen');
    if(falling){ setTimeout(()=>tone(140,.15,'square',.15), 380); }
    tone(falling?300:400,.1,'sine',.1);
  });
})();

/* =============== Coupelle de fruits =============== */
(function(){
  const bowl = el('div','hotspot'); box(bowl, 83,53,16,6);
  bowl.addEventListener('click', ()=>{
    const lemon = el('div','lemon'); lemon.textContent='🍋';
    const rect = bowl.getBoundingClientRect(); const sRect = photoFrame.getBoundingClientRect();
    lemon.style.left = (rect.left-sRect.left+rect.width*0.3)+'px';
    lemon.style.top = (rect.top-sRect.top+rect.height*0.4)+'px';
    const dir = Math.random()<0.5?-1:1;
    lemon.style.transition = 'transform 1.1s cubic-bezier(.3,.6,.3,1), opacity .3s 1s';
    photoFrame.appendChild(lemon);
    requestAnimationFrame(()=>{
      lemon.style.transform = `translate(${dir*(90+Math.random()*70)}px, ${70+Math.random()*40}px) rotate(${dir*380}deg)`;
      lemon.style.opacity='0';
    });
    tone(600,.08,'triangle',.12);
    setTimeout(()=>lemon.remove(), 1150);
  });
})();

/* =============== Etageres : tasses/verres qui tombent et cassent =============== */
const SHELF_ITEMS = [ {l:6,t:26,w:24,h:6,icon:'☕'}, {l:6,t:33,w:24,h:6,icon:'🥣'} ];
const shardsHost = [];
SHELF_ITEMS.forEach(item=>{
  const spot = el('div','hotspot'); box(spot, item.l, item.t, item.w, item.h);
  spot.dataset.broken='0';
  spot.addEventListener('click', ()=>{
    if(spot.dataset.broken==='1') return;
    spot.dataset.broken='1';
    const rect = spot.getBoundingClientRect(); const sRect = photoFrame.getBoundingClientRect();
    const startX = rect.left-sRect.left+rect.width*0.5;
    const startY = rect.top-sRect.top+rect.height*0.5;
    const floorY = sRect.height*0.86;
    const cup = el('div','falling-item'); cup.textContent = item.icon;
    cup.style.left = startX+'px'; cup.style.top = startY+'px';
    cup.style.transition='transform .6s cubic-bezier(.4,.2,.6,1)';
    photoFrame.appendChild(cup);
    requestAnimationFrame(()=>{ cup.style.transform = `translate(-6px, ${floorY-startY}px) rotate(340deg)`; });
    tone(500,.1,'sine',.15);
    setTimeout(()=>{
      cup.remove();
      noiseBurst(.35,.3); tone(1200,.05,'square',.1); tone(900,.05,'square',.08,40);
      spawnShards(startX-6, floorY);
      toast('Oups, ça a cassé ! 💥');
    }, 620);
  });
});
function spawnShards(x,y){
  const colors = ['#cfe6f5','#bfe0f2','#e8f4fb','#a9d3e8'];
  for(let i=0;i<9;i++){
    const s = el('div','shard');
    const sz = 4+Math.random()*7;
    s.style.width=sz+'px'; s.style.height=sz+'px';
    s.style.background = colors[Math.floor(Math.random()*colors.length)];
    s.style.borderRadius = Math.random()<0.5? '50%':'2px';
    const dx = (Math.random()-0.5)*70;
    s.style.left = x+'px'; s.style.top = y+'px';
    s.style.transform = `rotate(${Math.random()*360}deg)`;
    s.style.transition='transform .4s ease-out, top .4s ease-out';
    photoFrame.appendChild(s);
    requestAnimationFrame(()=>{ s.style.left=(x+dx)+'px'; s.style.top=(y+Math.random()*10)+'px'; });
    shardsHost.push(s);
  }
}

/* =============== Reinitialiser la cuisine =============== */
function resetScene(){
  document.querySelectorAll('.overlay-photo').forEach(o=>o.classList.remove('shown'));
  document.querySelectorAll('.hotspot').forEach(h=>h.classList.remove('shown'));
  document.querySelectorAll('.sink-scene').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.lamp').forEach(l=>l.classList.remove('lit'));
  document.querySelectorAll('.hood-scene').forEach(h=>h.classList.remove('on'));
  const board = document.getElementById('board'); if(board) board.classList.remove('fallen');
  document.querySelectorAll('.hotspot').forEach(p=>{ if(p.dataset && p.dataset.broken==='1') p.dataset.broken='0'; });
  shardsHost.forEach(s=>s.remove()); shardsHost.length = 0;
  toast('Cuisine rangée ! ✨');
}
/* =============== Images personnages (accueil + cuisine) =============== */
const LION_IMG = "images/lion.png";
const MALO_IMG = "images/malo.png";
const CHIEN_IMG = "images/chien.png";
document.getElementById('imgKLion').src = LION_IMG;
document.getElementById('imgKMalo').src = MALO_IMG;
document.getElementById('imgKChien').src = CHIEN_IMG;

/* =============== Navigation ecrans =============== */
function goTo(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function stopKitchen(){ goTo('home'); }

/* =============== Sons additionnels (rugissement / aboiement / victoire) =============== */
function happyChord(){ [520,660,780].forEach((f,i)=>setTimeout(()=>tone(f,.25,'triangle',.2), i*90)); }
function soundRoar(){
  if(muted) return;
  try{
    const a=ac(); const o=a.createOscillator(); const g=a.createGain();
    o.type='sawtooth';
    o.frequency.setValueAtTime(110,a.currentTime);
    o.frequency.exponentialRampToValueAtTime(70,a.currentTime+.5);
    o.frequency.exponentialRampToValueAtTime(160,a.currentTime+.75);
    o.frequency.exponentialRampToValueAtTime(60,a.currentTime+1.1);
    g.gain.setValueAtTime(.0001,a.currentTime);
    g.gain.exponentialRampToValueAtTime(.28,a.currentTime+.15);
    g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+1.15);
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+1.2);
  }catch(e){}
}
function soundBark(){
  if(muted) return;
  [0,180].forEach(delay=>{
    setTimeout(()=>{
      try{
        const a=ac(); const o=a.createOscillator(); const g=a.createGain();
        o.type='square';
        o.frequency.setValueAtTime(320,a.currentTime);
        o.frequency.exponentialRampToValueAtTime(180,a.currentTime+.13);
        g.gain.setValueAtTime(.0001,a.currentTime);
        g.gain.exponentialRampToValueAtTime(.25,a.currentTime+.02);
        g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.16);
        o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+.18);
      }catch(e){}
    }, delay);
  });
}
function burstConfetti(x,y){
  const sRect = stage.getBoundingClientRect();
  const colors = ['#ff6f9c','#ffd166','#8fd694','#6fc3ff','#c98fff'];
  for(let i=0;i<16;i++){
    const p = document.createElement('div');
    p.className='confetti-piece';
    const size = 6+Math.random()*6;
    p.style.width=size+'px'; p.style.height=size+'px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.left = (x-sRect.left)+'px'; p.style.top = (y-sRect.top)+'px';
    const dx = (Math.random()-0.5)*240;
    const dy = -(90+Math.random()*180);
    p.style.transition='transform .85s cubic-bezier(.2,.8,.3,1), opacity .85s';
    stage.appendChild(p);
    requestAnimationFrame(()=>{ p.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random()*360}deg)`; p.style.opacity='0'; });
    setTimeout(()=>p.remove(), 900);
  }
}

/* =============== Jeu des gamelles (cachees dans les placards de Malo) =============== */
const BOWL_TYPES = ['food-lion','water-lion','food-chien','water-chien'];
const BOWL_ICON = {'food-lion':'🍖','water-lion':'💧','food-chien':'🍖','water-chien':'💧'};
let kState = {};
let hotAssign = [];

function startKitchen(){
  goTo('kitchenScreen');
  document.getElementById('endKitchen').classList.remove('show');
  kState = { fedLion:false, wateredLion:false, fedChien:false, wateredChien:false };
  updateKScore();

  document.querySelectorAll('.dropzone').forEach(z=>{
    z.classList.remove('filled','hover','ready');
    z.textContent = z.dataset.need.startsWith('food') ? '🍖' : '💧';
  });

  ['kLion','kMalo','kChien'].forEach(id=>{
    const c = document.getElementById(id);
    c.classList.remove('chomp','reactshake');
    delete c.dataset.reacted;
  });

  document.querySelectorAll('.overlay-photo').forEach(o=>o.classList.remove('shown'));
  document.querySelectorAll('.hotspot').forEach(h=>{
    h.classList.remove('shown','gamelle-shown');
    const rb = h.querySelector('.reveal-bowl');
    if(rb) rb.textContent = '';
  });

  const slots = OVERLAYS.length;
  hotAssign = Array(slots).fill(null);
  const positions = [...Array(slots).keys()];
  for(let i=positions.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [positions[i],positions[j]]=[positions[j],positions[i]]; }
  BOWL_TYPES.forEach((type,idx)=>{ hotAssign[positions[idx]] = type; });

  const tray = document.getElementById('tray');
  tray.innerHTML = '<div class="tray-hint">Ouvre les placards pour trouver les gamelles 🔍</div>';
}

function revealGamelle(idx, hotspot, revealBowl){
  const type = hotAssign[idx];
  if(!type) return;
  hotAssign[idx] = null;
  revealBowl.textContent = BOWL_ICON[type];
  hotspot.classList.add('gamelle-shown');
  tone(700,.15,'triangle',.15,200);
  setTimeout(()=>spawnBowlInTray(type), 350);
  toast('Gamelle trouvée !');
  setTimeout(()=>{ hotspot.classList.remove('gamelle-shown'); revealBowl.textContent=''; }, 1300);
}

function spawnBowlInTray(type){
  const tray = document.getElementById('tray');
  const hint = tray.querySelector('.tray-hint'); if(hint) hint.remove();
  const bowl = document.createElement('div');
  bowl.className = 'bowl ' + type;
  bowl.dataset.type = type;
  bowl.textContent = BOWL_ICON[type];
  tray.appendChild(bowl);
  attachDrag(bowl);
  const zone = document.querySelector('.dropzone[data-need="'+type+'"]');
  if(zone) zone.classList.add('ready');
}

function attachDrag(bowl){
  bowl.addEventListener('pointerdown', (ev)=>{
    ev.preventDefault();
    const rect = bowl.getBoundingClientRect();
    const offX = ev.clientX-rect.left, offY = ev.clientY-rect.top;
    bowl.classList.add('dragging');
    bowl.style.left = rect.left+'px'; bowl.style.top = rect.top+'px';
    bowl.style.width = rect.width+'px'; bowl.style.height = rect.height+'px';
    document.body.appendChild(bowl);

    function move(e){
      bowl.style.left = (e.clientX-offX)+'px';
      bowl.style.top = (e.clientY-offY)+'px';
      document.querySelectorAll('.dropzone').forEach(z=>{
        const zr = z.getBoundingClientRect();
        const cx=e.clientX, cy=e.clientY;
        const over = cx>zr.left && cx<zr.right && cy>zr.top && cy<zr.bottom;
        z.classList.toggle('hover', over && !z.classList.contains('filled'));
      });
    }
    function up(e){
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      bowl.classList.remove('dragging');
      let placed = false;
      document.querySelectorAll('.dropzone').forEach(z=>{
        z.classList.remove('hover');
        if(placed) return;
        const zr = z.getBoundingClientRect();
        const cx=e.clientX, cy=e.clientY;
        const over = cx>zr.left && cx<zr.right && cy>zr.top && cy<zr.bottom;
        if(over && !z.classList.contains('filled') && z.dataset.need===bowl.dataset.type){
          placed = true;
          fillZone(z, bowl);
        }
      });
      if(!placed){
        bowl.remove();
        spawnBowlInTray(bowl.dataset.type);
        tone(260,.12,'sine',.1);
      }
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
}

function fillZone(zone, bowl){
  bowl.remove();
  zone.classList.add('filled');
  zone.style.opacity = '1';
  tone(650,.15,'triangle',.18);
  const type = zone.dataset.need;
  if(type==='food-lion') kState.fedLion = true;
  if(type==='water-lion') kState.wateredLion = true;
  if(type==='food-chien') kState.fedChien = true;
  if(type==='water-chien') kState.wateredChien = true;
  updateKScore();

  if(kState.fedLion && kState.wateredLion) reactAnimal('kLion', soundRoar, 'Le lion a bien mangé, il rugit ! 🦁');
  if(kState.fedChien && kState.wateredChien) reactAnimal('kChien', soundBark, 'Le chiot a tout englouti, il aboie ! 🐶');

  checkWin();
}

function reactAnimal(id, soundFn, msg){
  const c = document.getElementById(id);
  if(c.dataset.reacted) return;
  c.dataset.reacted = '1';
  c.classList.add('chomp');
  setTimeout(()=>{
    c.classList.remove('chomp');
    c.classList.add('reactshake');
    soundFn();
    toast(msg);
    const r = c.getBoundingClientRect();
    burstConfetti(r.left+r.width/2, r.top);
    setTimeout(()=>c.classList.remove('reactshake'), 550);
  }, 900);
}

function updateKScore(){
  const n = ['fedLion','wateredLion','fedChien','wateredChien'].filter(k=>kState[k]).length;
  document.getElementById('kScore').textContent = n;
}

function checkWin(){
  if(kState.fedLion && kState.wateredLion && kState.fedChien && kState.wateredChien){
    setTimeout(()=>{
      happyChord();
      document.getElementById('endKitchen').classList.add('show');
    }, 1200);
  }
}

/* =============== SALLE DE BAIN : images (etats) =============== */
const NORMAL_SRC = "images/normal.jpg";
const MOUSSE_SRC = "images/mousse.jpg";
const DOUCHE_SRC = "images/douche.jpg";
const DENT_SRC = "images/dent.jpg";
const MOUSSE_DENT_SRC = "images/mousse_dent.jpg";
const SOURIR_SRC = "images/sourir.jpg";
const SECHE_SRC = "images/seche.jpg";

document.getElementById('bathPhoto').src = NORMAL_SRC;

/* =============== Petits utilitaires locaux (salle de bain) =============== */
const bathPhotoFrame = document.getElementById('bathPhotoFrame');
const bathPhotoEl = document.getElementById('bathPhoto');
function bathToast(msg){
  const t = document.getElementById('bathToast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(bathToast._t); bathToast._t = setTimeout(()=>t.classList.remove('show'), 1600);
}
function setBathImage(src){ bathPhotoEl.src = src; }

/* =============== Machine a etats =============== */
let bState = 'normal'; // normal | mousse | douche | dent_ready | dent_mousse | sourire | seche
let armedAction = null;
let holdAccum = 0;
let holdActive = false;
let holdRAFid = null;
let lastFrameTime = 0;
let returnTimer = null;

const HOLD_MS = 4000;

const btnSavon = document.getElementById('btnSavon');
const btnBrosse = document.getElementById('btnBrosse');
const btnGobelet = document.getElementById('btnGobelet');
const btnSeche = document.getElementById('btnSeche');
const showerHotspot = document.getElementById('showerHotspot');
const holdBarWrap = document.getElementById('holdBarWrap');
const holdFill = document.getElementById('holdFill');
const holdEmoji = document.getElementById('holdEmoji');

const actionIcons = { savon:'🧼', brosse:'🪥', gobelet:'🥤', seche:'💨', douche:'🚿' };

function refreshButtons(){
  btnSavon.classList.toggle('disabled', bState!=='normal');
  btnSavon.classList.toggle('ready', bState==='normal' && !armedAction);
  btnBrosse.classList.toggle('disabled', bState!=='normal');
  btnBrosse.classList.toggle('ready', false);
  btnGobelet.classList.toggle('disabled', bState!=='dent_mousse');
  btnGobelet.classList.toggle('ready', bState==='dent_mousse' && !armedAction);
  btnSeche.classList.toggle('disabled', bState!=='douche');
  btnSeche.classList.toggle('ready', bState==='douche' && !armedAction);
  showerHotspot.classList.toggle('active', bState==='mousse' && !armedAction);
}

function clearReturnTimer(){ if(returnTimer){ clearTimeout(returnTimer); returnTimer=null; } }

function scheduleReturnNormal(delay){
  clearReturnTimer();
  returnTimer = setTimeout(()=>{
    bState = 'normal';
    setBathImage(NORMAL_SRC);
    refreshButtons();
  }, delay);
}

function armAction(type){
  if(armedAction) return;
  armedAction = type;
  holdAccum = 0;
  holdEmoji.textContent = actionIcons[type];
  holdFill.style.width = '0%';
  holdBarWrap.classList.add('show');
  refreshButtons();
  const hints = {
    savon:'Frotte ton doigt sur Malo pour savonner ! 🧼',
    brosse:'Frotte doucement les dents ! 🪥',
    gobelet:'Tapote pour bien rincer ! 🥤',
    seche:'Frotte pour sécher les cheveux ! 💨',
    douche:'Reste sous la douche ! 🚿'
  };
  bathToast(hints[type] || 'Continue !');
}

function cancelArm(){
  armedAction = null;
  holdActive = false;
  holdAccum = 0;
  holdBarWrap.classList.remove('show');
  refreshButtons();
}

function frameLoop(ts){
  if(!lastFrameTime) lastFrameTime = ts;
  const dt = ts - lastFrameTime;
  lastFrameTime = ts;
  if(holdActive && armedAction){
    holdAccum += dt;
    const pct = Math.min(holdAccum / HOLD_MS, 1);
    holdFill.style.width = (pct*100)+'%';
    if(holdAccum >= HOLD_MS){
      const done = armedAction;
      armedAction = null;
      holdActive = false;
      holdBarWrap.classList.remove('show');
      completeAction(done);
    }
  }
  holdRAFid = requestAnimationFrame(frameLoop);
}
holdRAFid = requestAnimationFrame(frameLoop);

function completeAction(type){
  bathHappy();
  if(type==='savon'){
    bState = 'mousse';
    setBathImage(MOUSSE_SRC);
    bathToast('Ça mousse partout ! 🫧');
  } else if(type==='douche'){
    bState = 'douche';
    setBathImage(DOUCHE_SRC);
    bathToast('Bien rincé ! 🚿💦');
  } else if(type==='brosse'){
    bState = 'dent_mousse';
    setBathImage(MOUSSE_DENT_SRC);
    bathToast('Les dents moussent bien ! 🦷🫧');
  } else if(type==='gobelet'){
    bState = 'sourire';
    setBathImage(SOURIR_SRC);
    bathToast('Dents toutes propres ! 😁✨');
    scheduleReturnNormal(5000);
  } else if(type==='seche'){
    bState = 'seche';
    setBathImage(SECHE_SRC);
    bathToast('Cheveux tout secs ! 💨✨');
    scheduleReturnNormal(5000);
  }
  refreshButtons();
}

/* =============== Particules pendant le maintien =============== */
function spawnParticleFor(type, x, y){
  if(type==='savon' || type==='brosse'){
    const f = document.createElement('div');
    f.className = 'foam-bit';
    const s = 14+Math.random()*26;
    f.style.width = s+'px'; f.style.height = s+'px';
    f.style.left = (x - s/2)+'px'; f.style.top = (y - s/2)+'px';
    bathPhotoFrame.appendChild(f);
    setTimeout(()=>{ if(f.parentNode) f.remove(); }, 650);
  } else if(type==='douche' || type==='gobelet'){
    const d = document.createElement('div');
    d.className = 'water-drop';
    d.style.left = x+'px'; d.style.top = (y-30)+'px';
    bathPhotoFrame.appendChild(d);
    const fr = bathPhotoFrame.getBoundingClientRect();
    requestAnimationFrame(()=>{
      d.style.transition = 'transform .55s linear, opacity .25s .3s';
      d.style.transform = 'translateY('+(fr.height)+'px)';
      d.style.opacity = '0';
    });
    setTimeout(()=>{ if(d.parentNode) d.remove(); }, 620);
  } else if(type==='seche'){
    const w = document.createElement('div');
    w.className = 'wind-swirl';
    w.textContent = Math.random()<0.5 ? '💨' : '✨';
    w.style.left = x+'px'; w.style.top = y+'px';
    w.style.transform = 'translate(-50%,-50%)';
    bathPhotoFrame.appendChild(w);
    requestAnimationFrame(()=>{
      w.style.transition = 'transform .5s ease-out, opacity .5s';
      w.style.transform = 'translate(-50%,-90%) scale(1.3)';
      w.style.opacity = '0';
    });
    setTimeout(()=>{ if(w.parentNode) w.remove(); }, 550);
  }
}

let lastToneTime = 0;
function playHoldTone(){
  const now = performance.now();
  if(now - lastToneTime > 90){
    lastToneTime = now;
    tone(480+Math.random()*220,.05,'triangle',.05);
  }
}

/* =============== Reaction "content" =============== */
function bathHappy(){
  bathPhotoFrame.classList.remove('happy-pulse'); void bathPhotoFrame.offsetWidth; bathPhotoFrame.classList.add('happy-pulse');
  happyChord();
  const icons = ['💛','⭐','😊','✨'];
  for(let i=0;i<3;i++){
    setTimeout(()=>{
      const h = document.createElement('div');
      h.className = 'happy-float';
      h.textContent = icons[Math.floor(Math.random()*icons.length)];
      h.style.left = (35+Math.random()*30)+'%';
      h.style.top = '58%';
      bathPhotoFrame.appendChild(h);
      requestAnimationFrame(()=>{
        h.style.transform = 'translateY(-100px) scale(1.3)';
        h.style.opacity = '0';
      });
      setTimeout(()=>h.remove(), 950);
    }, i*140);
  }
}

/* =============== Interactions : maintien du doigt sur l'image =============== */
bathPhotoFrame.addEventListener('pointerdown', (ev)=>{
  if(!armedAction) return;
  holdActive = true;
  const fr = bathPhotoFrame.getBoundingClientRect();
  spawnParticleFor(armedAction, ev.clientX-fr.left, ev.clientY-fr.top);
  playHoldTone();
});
bathPhotoFrame.addEventListener('pointermove', (ev)=>{
  if(!armedAction || !holdActive) return;
  if(Math.random()<0.6){
    const fr = bathPhotoFrame.getBoundingClientRect();
    spawnParticleFor(armedAction, ev.clientX-fr.left, ev.clientY-fr.top);
    playHoldTone();
  }
});
window.addEventListener('pointerup', ()=>{ holdActive = false; });
window.addEventListener('pointercancel', ()=>{ holdActive = false; });

/* =============== Boutons =============== */
btnSavon.addEventListener('click', ()=>{
  if(bState!=='normal' || armedAction) return;
  armAction('savon');
});
btnBrosse.addEventListener('click', ()=>{
  if(bState!=='normal' || armedAction) return;
  bState = 'dent_ready';
  setBathImage(DENT_SRC);
  refreshButtons();
  armAction('brosse');
});
btnGobelet.addEventListener('click', ()=>{
  if(bState!=='dent_mousse' || armedAction) return;
  armAction('gobelet');
});
btnSeche.addEventListener('click', ()=>{
  if(bState!=='douche' || armedAction) return;
  clearReturnTimer();
  armAction('seche');
});
showerHotspot.addEventListener('pointerup', (ev)=>{
  ev.preventDefault();
  if(bState!=='mousse' || armedAction) return;
  armAction('douche');
});
showerHotspot.addEventListener('click', (ev)=>{
  ev.preventDefault();
});

function resetBath(){
  clearReturnTimer();
  cancelArm();
  bState = 'normal';
  setBathImage(NORMAL_SRC);
  document.querySelectorAll('.foam-bit, .water-drop, .wind-swirl, .happy-float').forEach(e=>e.remove());
  refreshButtons();
  bathToast('Salle de bain rangée ! ✨');
}

function startBath(){
  goTo('bathroomScreen');
  resetBath();
}
function stopBath(){
  clearReturnTimer();
  cancelArm();
  goTo('home');
}
function toggleBathMute(){
  muted = !muted;
  document.getElementById('bSoundToggle').textContent = muted ? '🔇' : '🔊';
  const kBtn = document.getElementById('soundToggle'); if(kBtn) kBtn.textContent = muted ? '🔇' : '🔊';
}

/* =======================
   PUZZLE 24 PIECES
======================= */

const PUZZLE_IMAGES = [
    "dent.png",
    "fondmalo.PNG",
    "malo-toutou.png"
];
const ROWS = 2;
const COLS = 4;
const TOTAL = ROWS * COLS;

// Ces valeurs sont recalculées à chaque ouverture du puzzle par computeLayout()
// pour toujours tenir dans la largeur de l'écran du téléphone, quelle que soit sa taille.
let CELL, TAB, BOARD_W, BOARD_H, PIECE_BOX, MARGIN, TRAY_GAP, TRAY_PAD,
    TRAY_COLS, TRAY_ROWS, TRAY_W, TRAY_H, ARENA_W, ARENA_H,
    BOARD_X, BOARD_Y, TRAY_X, TRAY_Y, SNAP_DIST;

function computeLayout(){

    // Largeur réellement disponible sur l'écran (marge de sécurité un peu plus large pour ne JAMAIS rien tronquer)
    const availW = Math.max(260, Math.min(window.innerWidth - 30, 560));

    MARGIN = 12;
    TRAY_GAP = 8;
    TRAY_PAD = 10;

    // Emplacement des pièces réduit (petits crans) : plus de place laissée pour agrandir l'image
    const TAB_RATIO = 0.13;
    let cell = Math.floor((availW - 2*MARGIN - 6) / (COLS + 2*TAB_RATIO));
    cell = Math.max(60, Math.min(cell, 140));

    CELL = cell;
    TAB = Math.round(cell * TAB_RATIO);
    BOARD_W = COLS * CELL;
    BOARD_H = ROWS * CELL;
    PIECE_BOX = CELL + 2 * TAB;

    // La pioche s'adapte : autant de colonnes que la largeur le permet, et s'étale sur plusieurs lignes si besoin
    TRAY_COLS = Math.max(2, Math.floor((availW - 2*TRAY_PAD - 6 + TRAY_GAP) / (PIECE_BOX + TRAY_GAP)));
    TRAY_COLS = Math.min(TRAY_COLS, TOTAL);
    TRAY_ROWS = Math.ceil(TOTAL / TRAY_COLS);

    TRAY_W = TRAY_COLS * PIECE_BOX + (TRAY_COLS - 1) * TRAY_GAP + 2 * TRAY_PAD;
    TRAY_H = TRAY_ROWS * PIECE_BOX + (TRAY_ROWS - 1) * TRAY_GAP + 2 * TRAY_PAD;
    ARENA_W = Math.max(BOARD_W + 2 * TAB, TRAY_W) + 2 * MARGIN;
    BOARD_X = (ARENA_W - BOARD_W) / 2;
    BOARD_Y = MARGIN + 16;                 // un peu d'air au-dessus de l'image
    TRAY_X = (ARENA_W - TRAY_W) / 2;
    TRAY_Y = BOARD_Y + BOARD_H + MARGIN * 2;
    ARENA_H = TRAY_Y + TRAY_H + MARGIN;
    SNAP_DIST = Math.round(CELL * 0.6);
}

let currentPuzzle = 0;
let pieceEls = [];
let dragEl = null;
let dragOffX = 0, dragOffY = 0;


function startPuzzle(index = null) {

const picker = document.getElementById("puzzlePickerGrid");
const pickerBox = document.getElementById("puzzlePicker");
const boardWrap = document.getElementById("puzzleBoardWrap");

    // Ouvre l'écran Puzzle
    goTo("puzzleScreen");

    if (index === null) {

        pickerBox.style.display = "block";
        boardWrap.style.display = "none";
        picker.innerHTML = "";

        PUZZLE_IMAGES.forEach((img, i) => {

const card = document.createElement("div");
card.className = "puzzle-pick-card";

card.innerHTML = `
    <img src="${img}">
    <div class="pp-label">Puzzle ${i + 1}</div>
`;

card.onclick = () => startPuzzle(i);

picker.appendChild(card);

        });

        document.getElementById("pzResetBtn").style.display = "none";
        document.getElementById("pzScorePill").style.display = "none";

        return;
    }

    currentPuzzle = index;

    pickerBox.style.display = "none";
    boardWrap.style.display = "block";

    document.getElementById("pzResetBtn").style.display = "inline-flex";
    document.getElementById("pzScorePill").style.display = "inline-flex";

    createPuzzle();

}
function stopPuzzle(){

    goTo('home');

}

/* --- Bouton Aventure : ouvre le jeu "Le Monde de Malo" (fichier séparé) --- */
function startAventure(){
    window.location.href = 'aventure.html';
}

/* --- Génère un contour de pièce de puzzle (avec crans) en chemin SVG --- */
function edgeSeg(A, B, v){
    if (v === 0) return `L ${B.x},${B.y} `;
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const ux = dx/len, uy = dy/len;
    const chord = len * 0.5;
    const r = chord / 2;
    const midx = (A.x+B.x)/2, midy = (A.y+B.y)/2;
    const pax = midx - ux*chord/2, pay = midy - uy*chord/2;
    const pbx = midx + ux*chord/2, pby = midy + uy*chord/2;
    const sweep = v === 1 ? 1 : 0;
    return `L ${pax},${pay} A ${r},${r} 0 0,${sweep} ${pbx},${pby} L ${B.x},${B.y} `;
}

function buildPiecePath(edges){
    const p = TAB;
    const TL={x:p,y:p}, TR={x:p+CELL,y:p}, BR={x:p+CELL,y:p+CELL}, BL={x:p,y:p+CELL};
    let d = `M ${TL.x},${TL.y} `;
    d += edgeSeg(TL, TR, edges.top);
    d += edgeSeg(TR, BR, edges.right);
    d += edgeSeg(BR, BL, edges.bottom);
    d += edgeSeg(BL, TL, edges.left);
    d += 'Z';
    return d;
}

/* --- Génère aléatoirement les crans/creux partagés entre pièces voisines --- */
function genEdges(){
    const vEdges = []; // bords verticaux entre colonnes (partagés par la ligne)
    for(let r=0;r<ROWS;r++){
        vEdges.push([]);
        for(let c=0;c<COLS-1;c++) vEdges[r].push(Math.random()<0.5 ? 1 : -1);
    }
    const hEdges = []; // bords horizontaux entre lignes
    for(let r=0;r<ROWS-1;r++){
        hEdges.push([]);
        for(let c=0;c<COLS;c++) hEdges[r].push(Math.random()<0.5 ? 1 : -1);
    }
    return {vEdges, hEdges};
}

function pieceEdges(r, c, vEdges, hEdges){
    return {
        top:    r===0 ? 0 : -hEdges[r-1][c],
        bottom: r===ROWS-1 ? 0 : hEdges[r][c],
        left:   c===0 ? 0 : -vEdges[r][c-1],
        right:  c===COLS-1 ? 0 : vEdges[r][c]
    };
}

function createPuzzle(){

    computeLayout();

    const arena = document.getElementById('puzzleArena');
    arena.innerHTML = '';
    arena.style.width = ARENA_W + 'px';
    arena.style.height = ARENA_H + 'px';

    // Image cible affichée en transparence, comme guide (à l'échelle des pièces)
    const target = document.createElement('div');
    target.id = 'puzzleTarget';
    target.style.position = 'absolute';
    target.style.left = BOARD_X + 'px';
    target.style.top = BOARD_Y + 'px';
    target.style.width = BOARD_W + 'px';
    target.style.height = BOARD_H + 'px';
    target.style.backgroundImage = `url(${PUZZLE_IMAGES[currentPuzzle]})`;
    target.style.backgroundSize = `${BOARD_W}px ${BOARD_H}px`;
    target.style.opacity = '.32';
    target.style.pointerEvents = 'none';
    arena.appendChild(target);

    // Carte "pioche" : zone bien délimitée où les pièces sont rangées, une par une
    const trayCard = document.createElement('div');
    trayCard.className = 'pz-tray-card';
    trayCard.style.left = TRAY_X + 'px';
    trayCard.style.top = TRAY_Y + 'px';
    trayCard.style.width = TRAY_W + 'px';
    trayCard.style.height = TRAY_H + 'px';
    arena.appendChild(trayCard);

    const trayLabel = document.createElement('div');
    trayLabel.className = 'pz-tray-label';
    trayLabel.textContent = '🧺 Pioche';
    trayLabel.style.left = (TRAY_X + 10) + 'px';
    trayLabel.style.top = (TRAY_Y - 14) + 'px';
    arena.appendChild(trayLabel);

    // SVG contenant les découpes (clip-path) de chaque pièce
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    const defs = document.createElementNS(svgNS, 'defs');
    svg.appendChild(defs);
    arena.appendChild(svg);

    const {vEdges, hEdges} = genEdges();

    // Liste des pièces, puis mélange de l'ORDRE de rangement dans la pioche
    // (les pièces gardent leur forme/emplacement cible, seul leur rangement change)
    const order = [];
    for(let i=0;i<TOTAL;i++) order.push(i);
    for(let i=order.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [order[i],order[j]] = [order[j],order[i]];
    }

    pieceEls = [];

    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){

            const id = r*COLS + c;
            const edges = pieceEdges(r, c, vEdges, hEdges);

            const clipId = 'pzclip' + id;
            const clipPath = document.createElementNS(svgNS, 'clipPath');
            clipPath.setAttribute('id', clipId);
            clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', buildPiecePath(edges));
            clipPath.appendChild(path);
            defs.appendChild(clipPath);

            const div = document.createElement('div');
            div.className = 'jz-piece';
            div.dataset.id = id;
            div.style.width = PIECE_BOX + 'px';
            div.style.height = PIECE_BOX + 'px';
            div.style.backgroundImage = `url(${PUZZLE_IMAGES[currentPuzzle]})`;
            div.style.backgroundSize = `${BOARD_W}px ${BOARD_H}px`;
            div.style.backgroundPosition = `${TAB - c*CELL}px ${TAB - r*CELL}px`;
            div.style.clipPath = `url(#${clipId})`;
            div.style.webkitClipPath = `url(#${clipId})`;
            div.style.animationDelay = (Math.random()*2).toFixed(2) + 's';

            // Contour de la pièce (superposé, pour bien la distinguer)
            const outlineSvg = document.createElementNS(svgNS, 'svg');
            outlineSvg.setAttribute('width', PIECE_BOX);
            outlineSvg.setAttribute('height', PIECE_BOX);
            outlineSvg.style.cssText = 'position:absolute; left:0; top:0; pointer-events:none;';
            const outlinePath = document.createElementNS(svgNS, 'path');
            outlinePath.setAttribute('d', buildPiecePath(edges));
            outlinePath.setAttribute('fill', 'none');
            outlinePath.setAttribute('stroke', '#ffffff');
            outlinePath.setAttribute('stroke-width', '3');
            outlineSvg.appendChild(outlinePath);
            const outlinePath2 = document.createElementNS(svgNS, 'path');
            outlinePath2.setAttribute('d', buildPiecePath(edges));
            outlinePath2.setAttribute('fill', 'none');
            outlinePath2.setAttribute('stroke', '#2a1a55');
            outlinePath2.setAttribute('stroke-width', '1.2');
            outlineSvg.appendChild(outlinePath2);
            div.appendChild(outlineSvg);

            // Position correcte (coin haut-gauche de la boîte de la pièce) sur le plateau
            const correctX = BOARD_X + c*CELL - TAB;
            const correctY = BOARD_Y + r*CELL - TAB;
            div.dataset.cx = correctX;
            div.dataset.cy = correctY;

            // Position de départ : bien rangée dans la grille de la pioche (pas de chevauchement)
            const slot = order.indexOf(id);
            const trayR = Math.floor(slot / TRAY_COLS);
            const trayC = slot % TRAY_COLS;
            const startX = TRAY_X + TRAY_PAD + trayC * (PIECE_BOX + TRAY_GAP);
            const startY = TRAY_Y + TRAY_PAD + trayR * (PIECE_BOX + TRAY_GAP);
            div.style.left = startX + 'px';
            div.style.top = startY + 'px';

            attachDragHandlers(div);

            arena.appendChild(div);
            pieceEls.push(div);
        }
    }

    // Bannière de victoire
    const win = document.createElement("div");
    win.id = "puzzleWinBanner";
    win.className = "puzzle-win-banner";
    win.innerHTML = `
        <div class="win-card">
            <div class="win-title">🎉 Bravo Malo ! 🎉</div>
            <div class="win-emojis">⭐🎊✨🎊⭐</div>
            <button class="pill" onclick="startPuzzle()" style="pointer-events:auto;">🔁 Rejouer</button>
        </div>
    `;
    arena.appendChild(win);

    // Toast
    const toast = document.createElement("div");
    toast.id = "pzToast";
    toast.className = "pz-toast";
    arena.appendChild(toast);

    updateScore();
}

/* Le bouton "Mélanger" régénère un nouveau puzzle (formes + dispersion) */
function shufflePuzzle(){
    createPuzzle();
}

function attachDragHandlers(div){

    div.addEventListener('pointerdown', (e) => {
        if (div.classList.contains('placed')) return;
        e.preventDefault();
        div.setPointerCapture(e.pointerId);
        const arenaRect = document.getElementById('puzzleArena').getBoundingClientRect();
        dragEl = div;
        dragOffX = e.clientX - arenaRect.left - parseFloat(div.style.left);
        dragOffY = e.clientY - arenaRect.top - parseFloat(div.style.top);
        div.style.zIndex = 100;
        div.classList.add('dragging');
    });

    div.addEventListener('pointermove', (e) => {
        if (dragEl !== div) return;
        const arenaRect = document.getElementById('puzzleArena').getBoundingClientRect();
        let x = e.clientX - arenaRect.left - dragOffX;
        let y = e.clientY - arenaRect.top - dragOffY;
        div.style.left = x + 'px';
        div.style.top = y + 'px';
    });

    const dropHandler = (e) => {
        if (dragEl !== div) return;
        dragEl = null;
        div.classList.remove('dragging');
        div.style.zIndex = 2;

        const cx = parseFloat(div.dataset.cx), cy = parseFloat(div.dataset.cy);
        const x = parseFloat(div.style.left), y = parseFloat(div.style.top);
        const dist = Math.hypot(x-cx, y-cy);

        if (dist < SNAP_DIST) {
            div.style.left = cx + 'px';
            div.style.top = cy + 'px';
            div.classList.add('placed');
            div.style.zIndex = 1;
            div.style.cursor = 'default';
            tone(650, .12, 'triangle', .12);
            updateScore();
        }
    };

    div.addEventListener('pointerup', dropHandler);
    div.addEventListener('pointercancel', dropHandler);
}

function updateScore(){

    const ok = pieceEls.filter(d => d.classList.contains('placed')).length;

    document.getElementById("pzScore").textContent = ok;

    const banner = document.getElementById("puzzleWinBanner");

    if (ok === TOTAL) {
        banner.classList.add('show');
        tone(880, .2, 'triangle', .15);
    } else {
        banner.classList.remove('show');
    }

}


refreshButtons();
