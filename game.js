const $=id=>document.getElementById(id),rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const C=$('c'),XW=C.getContext('2d'),HC=$('h'),XH=HC.getContext('2d'),PS=2,FNT="ui-monospace,'Cascadia Mono',Menlo,Consolas,'Courier New',monospace";let X=XW,W,H,VG;
{const fd=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'font');Object.defineProperty(XH,'font',{set(v){fd.set.call(this,v.replace('system-ui',FNT))},get(){return fd.get.call(this)}})}
function rs(){W=innerWidth;H=innerHeight;C.width=Math.ceil(W/PS);C.height=Math.ceil(H/PS);HC.width=W;HC.height=H;VG=XH.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.8);VG.addColorStop(0,'#0000');VG.addColorStop(1,'#000b')}rs();addEventListener('resize',rs);
function drawNums(ox,oy){G.fx.forEach(f=>{if(f.k)return;const age=.6-f.t,p=clamp(age/.6,0,1),lab=typeof f.v!='number',crit=f.c&&!lab;
 const sc=1+(1-ez(p))*1.15,fs=crit?30:lab?16:18;
 X.save();X.translate(f.x+ox,f.y+oy-p*48);X.scale(sc,sc);X.globalAlpha=p<.15?p/.15:1;
 X.font='bold '+fs+'px '+FNT;X.textAlign='center';X.lineJoin='round';
 const col=crit?'#ffd24a':lab?'#8fd8ff':'#ffffff';
 X.strokeStyle='#000';X.lineWidth=6;X.strokeText(f.v,0,0);
 X.shadowColor=col;X.shadowBlur=crit?16:9;X.fillStyle=col;X.fillText(f.v,0,0);X.restore()});
 X.globalAlpha=1;X.textAlign='left'}
function drawJoy(){const d=$('db'),p=G.p;d.style.setProperty('--cd',p.ch<1?(p.dc/dcd()*360)+'deg':'0deg');d.textContent=p.cm>1?'Dash '+p.ch:'Dash';
 $('ub').classList.toggle('on',G.state=='run'&&!G.ult&&!G.mode&&G.uk>=ultNeed());const sb=$('sb'),ks=ABK.filter(k=>pv(k));sb.classList.toggle('on',ks.length>0&&G.state!='over');if(ks.length){const m=Math.max(...ks.map(k=>G.ac[k]));sb.style.setProperty('--cs',m>0?(m/Math.max(...ks.map(k=>abCd(k)))*360)+'deg':'0deg');sb.textContent='Skill'}
 const co=matchMedia('(pointer:coarse)').matches;if(!joy&&!co)return;const bx=joy?joy.bx:Math.min(110,W*.2),by=joy?joy.by:H-130,kx=joy?joy.kx:bx,ky=joy?joy.ky:by;
 X.globalAlpha=joy?.75:.28;X.fillStyle='#ffffff30';X.strokeStyle='#fff';X.lineWidth=3;X.beginPath();X.arc(bx,by,JR,0,7);X.fill();X.stroke();
 X.globalAlpha=joy?.9:.32;X.fillStyle='#fff';X.beginPath();X.arc(kx,ky,26,0,7);X.fill();X.strokeStyle='#0005';X.stroke();X.globalAlpha=1}
/* ---------- save: local + cloud (db capability) ---------- */
const D0={gold:0,u:{},ch:'mage',own:['mage'],best:{t:0,rd:0,k:0},runs:0,tk:0,ach:{},ts:0,hist:[],set:{num:1,shake:1,fx:1,snd:1,spd:1,diff:0,mods:{}}};
const LS='ms4',BAK=[LS+'_b1',LS+'_b2',LS+'_b3'],LEGACY=['ms3','ms2'];let M,cloud=null,dirty=false,ct=0;
function norm(){M.u=M.u||{};M.ach=M.ach||{};M.set=Object.assign({},D0.set,M.set);M.set.mods=Object.assign({},M.set.mods);M.hist=M.hist||[];M.best=Object.assign({},D0.best,M.best);M.own=M.own||['mage'];
 if(!M.rf2){const OB={hp:40,dmg:40,spd:40,xp:40,mag:30,arm:80,cdr:60,greed:50,rev:400,crit:50,area:50,rr:120,regen:60,dsh:70,heal:90,slot:800,wslot:1500,dch:1200,sk:100,pierce:200,bhunt:100,ultc:140,hstart:80},NB={hp:60,dmg:70,spd:60,xp:70,mag:50,arm:200,cdr:120,greed:100,rev:800,crit:100,area:100,rr:200,regen:100,dsh:120,heal:150,slot:1800,wslot:3500,dch:3000,sk:180,pierce:400,bhunt:200,ultc:250,hstart:150};let r=0;for(const k in M.u){for(let i=0;i<M.u[k];i++)r+=Math.max(Math.round((OB[k]||50)*(1+i*.8)),Math.round((NB[k]||100)*(1.5+i*1.4)))}M.gold=(M.gold||0)+r;M.u={};M.rf2=1;M.ts=Date.now();try{localStorage.setItem(LS,JSON.stringify(M))}catch(e){}if(r>0)setTimeout(()=>toast('All upgrades refunded: +'+r+' gold'),600)}}
function loadSave(){const c=[];const rd=k=>{try{const s=localStorage.getItem(k);if(!s)return;const o=JSON.parse(s);if(o&&typeof o=='object'&&o.set)c.push(o)}catch(e){}};[LS,...BAK,...LEGACY].forEach(rd);c.sort((a,b)=>(b.ts||0)-(a.ts||0));return c[0]||null}
try{M=Object.assign({},D0,loadSave()||{})}catch(e){M=Object.assign({},D0)}norm();
function grant(){if(!M.g10k){M.gold=(M.gold||0)+10000;M.g10k=1;M.ts=Date.now();try{localStorage.setItem(LS,JSON.stringify(M))}catch(e){}}}grant();
const setStat=t=>{const e=$('cs');if(e)e.textContent=t};
function save(){M.ts=Date.now();let s;try{s=JSON.stringify(M)}catch(e){return}
 try{const p1=localStorage.getItem(BAK[0]),p2=localStorage.getItem(BAK[1]),cur=localStorage.getItem(LS);
  if(p2)localStorage.setItem(BAK[2],p2);if(p1)localStorage.setItem(BAK[1],p1);if(cur)localStorage.setItem(BAK[0],cur);
  localStorage.setItem(LS,s)}catch(e){}
 const sv=$('sv');if(sv)sv.textContent='✓ saved '+new Date().toLocaleTimeString();dirty=true;schedCloud()}
function schedCloud(){if(!cloud||ct)return;ct=setTimeout(async()=>{ct=0;if(!dirty)return;dirty=false;try{await cloud.set({d:JSON.stringify(M),ts:M.ts});setStat('Progress saved to your account')}catch(e){dirty=true;setStat('Saved on this device only')}},2500)}
(async()=>{try{if(!window.claude){setStat('Saved on this device');return}
 const db=await claude.use('db'),us=await claude.use('user');if(!db||!us){setStat('Saved on this device');return}
 const id=await us.id();if(!id){setStat('Saved on this device');return}
 cloud=db.doc('data/users/'+id+'/save');const s=await cloud.get();
 if(s.exists&&!(G&&G.state!='over')){const c=JSON.parse(s.data().d);if((c.ts||0)>(M.ts||0)){M=Object.assign({},D0,c);norm();grant();try{localStorage.setItem(LS,JSON.stringify(M))}catch(e){}menu()}else{dirty=true;schedCloud()}}else{dirty=true;schedCloud()}
 setStat('Progress saved to your account')}catch(e){setStat('Saved on this device')}})();
/* ---------- audio: sfx + synthesized BGM/boss theme ---------- */
let AC;const ST={};
function ac(){try{AC=AC||new AudioContext();if(AC.state=='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f,d,type,v,when,slide){const a=ac();if(!a)return;const t=when??a.currentTime;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(1,f),t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(1,slide),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}
function sx(k,f,d=.08,t='square',v=.04){if(!M.set.snd)return;const n=performance.now();if(ST[k]&&n-ST[k]<70)return;ST[k]=n;tone(f,d,t,v)}
const MU={mode:'calm',next:0,step:0},ASC=[110,130.81,146.83,164.81,196,220,261.63,329.63];
function music(){if(!M.set.snd)return;const a=ac();if(!a||a.state!='running')return;
 const boss=!!(G&&G.state=='run'&&G.en.some(e=>e.boss&&!e.dead)),target=boss?'boss':'calm';
 if(MU.mode!=target){MU.mode=target;MU.step=0;MU.next=Math.max(MU.next,a.currentTime+.05)}
 while(a.currentTime>MU.next-.1){const t=MU.next,s=MU.step++;
  if(MU.mode=='boss'){const d=.21;
   if(s%4==0)tone(55,d*1.9,'sine',.15,t,40);else if(s%4==2)tone(98,d,'sine',.1,t);
   if(s%2==1)tone(196+rnd(0,40),d*.5,'triangle',.045,t);
   const ch=s%8<4?[220,261.63,329.63]:[174.61,220,261.63];
   ch.forEach(f=>tone(f,d*1.7,'sawtooth',.028,t));
   if(s%16==8)[440,523.25,659.25,880].forEach(f=>tone(f,d*3.5,'square',.022,t));
   MU.next=t+d}
  else{const d=.55,mel=[0,3,2,4,5,4,2,3][s%8];
   if(s%2==0)tone(ASC[mel]*2,d*1.9,'triangle',.024,t);
   tone(55,d*2.2,'sine',.045,t,50);
   if(s%8==0)[220,329.63,440].forEach(f=>tone(f,d*4,'sine',.016,t));
   MU.next=t+d}}}
function bossSting(){if(!M.set.snd)return;const a=ac();if(!a)return;const t0=a.currentTime+.05;
 [110,110,130.81,164.81,220,261.63].forEach((f,i)=>tone(f,.4,'sawtooth',.045,t0+i*.1));
 tone(55,1.6,'sine',.22,t0+.6,27.5);[220,277.18,329.63,440].forEach(f=>tone(f,1.4,'square',.03,t0+.6))}
function ultRiser(){if(!M.set.snd)return;const a=ac();if(!a)return;const t0=a.currentTime+.02;
 [220,277.18,329.63,440,554.37,659.25].forEach((f,i)=>tone(f,.32,'sawtooth',.04,t0+i*.07))}
function toast(t){const d=$('toast');d.textContent=t;d.style.opacity=1;clearTimeout(d._t);d._t=setTimeout(()=>d.style.opacity=0,2800)}
/* ---------- data ---------- */
const DAILY=['glass','horde','fast'][Math.floor(Date.now()/864e5)%3],MD=k=>M.set.mods&&M.set.mods[k],modG=()=>(MD('glass')?1.4:1)*(MD('horde')?1.5:1)*(MD('fast')?1.25:1)*(MD(DAILY)?1.5:1),U=k=>M.u[k]||0,fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'),fmtN=v=>{v=Math.round(v);return v>=1e6?(v/1e6).toFixed(v>=1e7?0:1).replace(/\.0$/,'')+'M':v>=1e4?(v/1e3).toFixed(1).replace(/\.0$/,'')+'k':String(v)};
const CH={
mage:{n:'Mage',w:'bolt',c:'#a98bff',hp:0,sp:1,cost:0,T:{},tx:'Balanced'},
knight:{n:'Knight',w:'blades',c:'#7fc8ff',hp:40,sp:.92,cost:300,T:{arm:1},tx:'+1 armor'},
priest:{n:'Priestess',w:'aura',c:'#ffd27f',hp:10,sp:1.05,cost:700,T:{reg:1},tx:'Regenerates'},
rogue:{n:'Rogue',w:'axe',c:'#6fe39a',hp:-15,sp:1.2,cost:1200,T:{crit:.1},tx:'+10% crit'},
druid:{n:'Druid',w:'pools',c:'#7fd05a',hp:20,sp:1,cost:1800,T:{area:.15},tx:'+15% area'},
necro:{n:'Necromancer',w:'wisps',c:'#5fe0c0',hp:-10,sp:1,cost:2500,T:{xp:.2},tx:'+20% XP'},
hunter:{n:'Hunter',w:'lance',c:'#ffb35a',hp:0,sp:1.1,cost:3200,T:{dmg:.15},tx:'+15% damage'},
witch:{n:'Pyromancer',w:'meteor',c:'#ff6a5a',hp:-10,sp:1,cost:4000,T:{cd:.1},tx:'-10% cooldowns'},
monk:{n:'Monk',w:'whip',c:'#f0a070',hp:10,sp:1.1,cost:5000,T:{dmg:.05,crit:.05},tx:'+5% damage, +5% crit'},
cryo:{n:'Cryomancer',w:'shards',c:'#9fe0ff',hp:0,sp:1,cost:6000,T:{area:.1,cd:.05},tx:'+10% area, -5% cooldowns'},
engineer:{n:'Engineer',w:'turret',c:'#ffd24a',hp:10,sp:1,cost:5500,T:{cd:.05,xp:.1},tx:'-5% cooldowns, +10% XP'},
berserker:{n:'Berserker',w:'saw',c:'#ff6a4a',hp:30,sp:1.05,cost:7000,T:{dmg:.1},tx:'+10% damage, +30 HP'},
gojo:{n:'Gojo',w:'void',c:'#9fd0ff',hp:30,sp:1.15,cost:9000,T:{cd:.15,crit:.08,dmg:.12},tx:'-15% cooldowns, +8% crit, +12% damage, +30 HP. Free revive with a mini Hollow Purple. Two-tier ultimate. Max Red & Blue grants INFINITY: weak foes cannot harm you and are smashed by your aura.'},
ichigo:{n:'Ichigo',w:'zangetsu',c:'#ff9a4a',hp:20,sp:1.1,cost:12000,T:{dmg:.1,cd:.1},tx:'Soul Reaper with Zangetsu. BANKAI at 100 kills (robe turns black), Tensa Zangetsu at 500, Hollow Bankai at 1000. Ult: Getsuga Tenshō'},
lechungus:{n:'Le Chungus',w:'slam',c:'#ffb0d0',hp:80,sp:.8,cost:15000,T:{area:.2,arm:1},tx:'+80 HP, +1 armor, +20% area. Slow, but every slam is enormous. Ult: MEGACHUNGUS'},
rukia:{n:'Rukia',w:'sode',c:'#bfe8ff',hp:10,sp:1.05,cost:13000,T:{cd:.15,dmg:.05},tx:'Her blade FREEZES every 5th enemy hit. All freeze effects are heavily buffed on her. Ult: Sode no Shirayuki'},
alya:{n:'Alya',w:'heartwave',c:'#ff9ec8',hp:0,sp:1.1,cost:13000,T:{dmg:.1},tx:'Her shockwave CHARMS enemies: frozen with a blush. Ult: Heart Confession'},
goku:{n:'Goku',w:'punch',c:'#ff9a2a',hp:10,sp:1.15,cost:7500,T:{dmg:.1},tx:'35% chance to dodge every hit. Long, powerful punches'},
kaido:{n:'Kaido',w:'bagua',c:'#4a6aa8',hp:60,sp:.95,cost:9500,T:{area:.25,dmg:.05},tx:'Huge reach, +60 HP. Fireball ult, then 60s Dragon Form'}};
const TR=()=>CH[M.ch].T;
const SHOP=[['hp','Vitality','+15 max HP',10,40],['dmg','Might','+5% damage',10,40],['spd','Swiftness','+6% speed',8,40],['xp','Wisdom','+10% XP',10,40],['mag','Magnetism','+15% pickup range',8,30],['arm','Toughness','-1 damage taken',5,80],['cdr','Focus','-4% cooldowns',8,60],['greed','Greed','+10% gold',10,50],['rev','Second Wind','+1 revive per run',3,400],['crit','Precision','+2% crit chance',10,50],['area','Reach','+4% area',8,50],['rr','Fortune','+1 reroll per run',5,120],['regen','Vigor','+0.4 HP/s regen',8,60],['dsh','Agility','-6% dash cooldown',6,70],['heal','Resilience','Heal 3% max HP on level up',5,90],['slot','Passive Slot','+1 passive slot',2,800],['wslot','Weapon Slot','+1 weapon slot',1,1500],['dch','Extra Charge','+1 dash charge',1,1200],['sk','Skill Mastery','-6% ability cooldowns',5,100],['pierce','Sharpened','Projectiles pierce +1 enemy',3,200],['bhunt','Boss Hunter','+8% damage to bosses and elites',5,100],['ultc','Ult Charge','-8% kills needed for your ultimate',5,140],['hstart','Head Start','Start each run with bonus XP',5,80]];
const SH2={hp:['+10 max HP',10,60],dmg:['+3% damage',10,70],spd:['+4% speed',8,60],xp:['+6% XP',10,70],mag:['+10% pickup range',8,50],arm:['-1 damage taken',3,200],cdr:['-2.5% cooldowns',8,120],greed:['+6% gold',10,100],rev:['+1 revive per run',2,800],crit:['+1.2% crit chance',10,100],area:['+2.5% area',8,100],rr:['+1 reroll per run',3,200],regen:['+0.25 HP/s regen',8,100],dsh:['-4% dash cooldown',6,120],heal:['Heal 2% max HP on level up',5,150],slot:['+1 passive slot',1,1800],wslot:['+1 weapon slot',1,3500],dch:['+1 dash charge',1,3000],sk:['-4% ability cooldowns',5,180],pierce:['Projectiles pierce +1 enemy',2,400],bhunt:['+5% damage to bosses and elites',5,200],ultc:['-5% kills needed for your ultimate',5,250],hstart:['Start each run with bonus XP',5,150]};
SHOP.forEach(s=>{const o=SH2[s[0]];if(o){s[2]=o[0];s[3]=o[1];s[4]=o[2]}});
const ITEMS=[
{id:'bolt',n:'Arcane Bolt',t:'w',max:8,d:'More bolts, pierce and damage.',c:'#a98bff'},
{id:'void',n:'Red & Blue',t:'w',max:8,ex:'gojo',d:'Cursed Red pierces through foes while Blue pulls them into a crushing orb. At max level Gojo gains INFINITY.',c:'#7fb8ff'},
{id:'zangetsu',n:'Zangetsu',t:'w',max:8,ex:'ichigo',d:'Moon-crescent sword slashes. Grows with every Bankai stage.',c:'#e8e8f0'},
{id:'slam',n:'Chungus Slam',t:'w',max:8,ex:'lechungus',d:'A massive slam around you that damages everything and knocks foes flying.',c:'#ffb0d0'},
{id:'punch',n:'Dragon Fist',t:'w',max:8,ex:'goku',d:'Long, powerful punches that blast through a whole line of enemies.',c:'#ffb040'},
{id:'bagua',n:'Thunder Bagua',t:'w',max:8,ex:'kaido',d:'A huge club smash with enormous reach that hits a wide arc.',c:'#ff8a2a'},
{id:'blades',n:'Spirit Blades',t:'w',max:8,d:'More orbiting blades, wider orbit.',c:'#7fe8ff'},
{id:'aura',n:'Holy Aura',t:'w',max:8,d:'Bigger damaging, slowing field.',c:'#ffe080'},
{id:'storm',n:'Storm Call',t:'w',max:8,d:'More lightning strikes, faster.',c:'#fff27a'},
{id:'axe',n:'Thrown Axes',t:'w',max:8,d:'Piercing axes arc through hordes.',c:'#ff9f5a'},
{id:'nova',n:'Frost Nova',t:'w',max:8,d:'Freezing ring bursts outward.',c:'#8fd0ff'},
{id:'scythe',n:'Reaper Scythe',t:'w',max:8,d:'Boomerang that cuts both ways.',c:'#d0d0ff'},
{id:'meteor',n:'Meteor',t:'w',max:8,d:'Marks foes, then crashes down.',c:'#ff6a5a'},
{id:'lance',n:'Piercing Lance',t:'w',max:8,d:'Fast lances in your move direction.',c:'#ffd9a0'},
{id:'pools',n:'Venom Pools',t:'w',max:8,d:'Poison puddles that slow and burn.',c:'#8fe05a'},
{id:'wisps',n:'Soul Wisps',t:'w',max:8,d:'Homing spirits hunt enemies.',c:'#5fe0c0'},
{id:'whip',n:'Blood Whip',t:'w',max:8,d:'Auto-aimed lash at the nearest enemy. Extra lashes at Lv 5 and 8.',c:'#ffb888'},
{id:'shards',n:'Ice Shards',t:'w',max:8,d:'Ring of piercing shards, more each level.',c:'#9fe0ff'},
{id:'might',n:'Power Sigil',t:'p',max:5,d:'+20% damage.'},
{id:'haste',n:'Quick Hands',t:'p',max:5,d:'-12% cooldowns.'},
{id:'boots',n:'Wind Boots',t:'p',max:5,d:'+12% move speed.'},
{id:'heart',n:'Iron Heart',t:'p',max:5,d:'+25 max HP and heal.'},
{id:'titan',n:'Titan Blood',t:'p',max:5,d:'+25% max HP.'},
{id:'magnet',n:'Magnet Ring',t:'p',max:5,d:'+40% pickup range.'},
{id:'regen',n:'Blood Vial',t:'p',max:5,d:'Regenerate HP.'},
{id:'area',n:'Giant Rune',t:'p',max:5,d:'+12% area and size.'},
{id:'armor',n:'Plate Charm',t:'p',max:5,d:'-1 damage taken.'},
{id:'blood',n:'Bloodlust',t:'p',max:5,d:'Damage grows with your kills.'},
{id:'elder',n:'Ancient Tome',t:'p',max:5,d:'Damage grows every Night survived.'},
{id:'luck',n:'Clover',t:'p',max:5,d:'+15% XP, +4% crit.'},
{id:'crit',n:'Eagle Eye',t:'p',max:5,d:'+8% crit chance, stronger crits.'},
{id:'vamp',n:'Vampiric Fang',t:'p',max:5,d:'Chance to heal on kill.'},
{id:'thorns',n:'Thorn Mail',t:'p',max:5,d:'Hurt nearby foes when hit.'},
{id:'shield',n:'Aegis',t:'p',max:5,d:'Blocks a hit, recharges over time.'},
{id:'prosper',n:'Midas Coin',t:'p',max:5,d:'+15% gold, +10% gem value.'},
{id:'rage',n:'Berserker Mark',t:'p',max:5,d:'+12% damage while below half HP.'},
{id:'swift',n:'Phantom Cloak',t:'p',max:5,ds:1,d:'Longer dashes and invulnerability.'},
{id:'twin',n:'Twin Dash',t:'p',max:2,ds:1,d:'+1 dash charge.'},
{id:'sprint',n:'Featherweight',t:'p',max:5,ds:1,d:'-14% dash cooldown.'},
{id:'shadow',n:'Shadow Step',t:'p',max:5,ds:1,d:'Dashing through enemies damages them.'},
{id:'trail',n:'Fire Trail',t:'p',max:5,ds:1,d:'Dashing leaves a burning trail.'},
{id:'nova2',n:'Blink Nova',t:'p',max:5,ds:1,d:'Dashing releases a shockwave.'},
{id:'surge',n:'Adrenaline',t:'p',max:5,ds:1,d:'+15% damage for 3s after dashing.'},
{id:'grav',n:'Gravity Step',t:'p',max:1,ds:1,d:'Dashing pulls in every gem.'},
{id:'blast',n:'Shockwave',t:'p',max:5,ab:1,d:'Blast that knocks foes back. Use with Q / E / F or the Skill button.'},
{id:'mend',n:'Divine Mend',t:'p',max:5,ab:1,d:'Heals a chunk of HP on use.'},
{id:'freeze',n:'Chrono Hourglass',t:'p',max:5,ab:1,d:'Freezes all enemies briefly.'},
{id:'cry',n:'War Cry',t:'p',max:5,ab:1,d:'+40% damage and +25% speed for a while.'},
{id:'well',n:'Gravity Well',t:'p',max:5,ab:1,d:'Pulls in and damages nearby foes. Q / E / F or the Skill button.'},
{id:'chain',n:'Chain Lightning',t:'w',max:8,d:'Arcs between nearby enemies.',c:'#9fd8ff'},
{id:'saw',n:'Ricochet Saw',t:'w',max:8,d:'A saw that bounces around the screen.',c:'#c8ccd4'},
{id:'mines',n:'Rune Mines',t:'w',max:8,d:'Drops mines that blow up on contact.',c:'#ff7a3a'},
{id:'turret',n:'Auto-Turret',t:'w',max:8,d:'Deploys turrets that shoot nearby foes.',c:'#ffd24a'},
{id:'pierce',n:'Sharpened Tips',t:'p',max:5,d:'Projectiles pierce +1 enemy.'},
{id:'exec',n:'Executioner',t:'p',max:5,d:'Weakened enemies die instantly (4% HP per level).'},
{id:'chill',n:'Frost Touch',t:'p',max:5,d:'Hits can slow enemies.'},
{id:'burn',n:'Ember Touch',t:'p',max:5,d:'Hits set enemies on fire.'},
{id:'cutter',n:'Gem Cutter',t:'p',max:5,d:'+20% XP from gems.'},
{id:'dodge',n:'Evasion Charm',t:'p',max:5,d:'6% chance to dodge a hit per level.'},
{id:'knock',n:'Heavy Hands',t:'p',max:5,d:'Hits knock enemies back.'},
{id:'slayer',n:'Giant Slayer',t:'p',max:5,d:'+20% damage to bosses and elites.'},
{id:'bounty',n:'Bounty Hunter',t:'p',max:5,d:'+12% gold.'},
{id:'siphon',n:'Soul Siphon',t:'p',max:5,d:'Kills charge your ultimate 30% faster.'},
{id:'sode',n:'Sode no Shirayuki',t:'w',max:8,ex:'rukia',d:'Ice blade that FREEZES every 5th enemy it hits.',c:'#bfe8ff'},
{id:'heartwave',n:'Heart Shockwave',t:'w',max:8,ex:'alya',d:'Charming shockwave: enemies hit are frozen and blush.',c:'#ff8ab8'},
{id:'phoenix',n:'Phoenix Feather',t:'p',max:1,d:'Revive once per run at 60% HP.'},
{id:'goldrush',n:'Gold Rush',t:'p',max:3,d:'+20% gold and +5% damage per level.'},
{id:'frostbrand',n:'Frostbrand Edge',t:'p',max:5,d:'Hits can freeze enemies briefly.'}];
const EXW={meteor:'witch',lance:'hunter',pools:'druid',wisps:'necro',whip:'monk',shards:'cryo',turret:'engineer'};
ITEMS.forEach(i=>{if(!i.c)i.c='#c8b8ff';if(EXW[i.id])i.ex=EXW[i.id]});
const IT=id=>ITEMS.find(i=>i.id==id),nm=k=>IT(k)?IT(k).n:({bomb:'Bomb',thorns:'Thorn Mail',dash:'Dash effects',ult:'Ultimate',infinity:'Infinity'}[k]||k);
const EV={bolt:'haste',void:'haste',zangetsu:'might',slam:'area',sode:'haste',heartwave:'area',punch:'haste',bagua:'might',blades:'area',aura:'regen',storm:'luck',axe:'might',nova:'haste',scythe:'boots',meteor:'might',lance:'crit',pools:'area',wisps:'luck',whip:'might',shards:'haste',chain:'luck',saw:'might',mines:'area',turret:'haste'};
const DIF=[
{n:'Normal',hp:1.35,dm:1,sp:1,q:1,el:1,g:1,xp:1,nh:1,ult:1,cap:.3,bl:.35,xc:0,rv:1,rr:0,u:0,d:'A fair fight. Learn your build and keep moving.'},
{n:'Hard',hp:2.1,dm:1.3,sp:1.08,q:1.2,el:1.7,g:1.7,xp:.92,nh:.6,ult:1.15,cap:.38,bl:.22,xc:0,rv:1,rr:0,u:5,d:'Tougher and faster enemies, less healing, more elites.'},
{n:'Nightmare',hp:3.2,dm:1.65,sp:1.15,q:1.4,el:2.5,g:2.4,xp:.85,nh:.3,ult:1.3,cap:.45,bl:.12,xc:1,rv:1,rr:0,u:9,d:'Brutal. An extra champion every night and scarce healing.'},
{n:'Hardcore',hp:4.6,dm:2.1,sp:1.22,q:1.6,el:3.5,g:4,xp:.78,nh:0,ult:1.5,cap:.55,bl:.05,xc:2,rv:0,rr:-2,u:12,d:'No revives, no healing between nights, no free rerolls, two extra champions each night and almost only curses. Huge gold rewards.'}];
const BI=[{h:262,n:'Graveyard',f:'#8a6cff',t:'#2c4a3a'},{h:345,n:'Crimson Marsh',f:'#ff6a8a',t:'#5a2a3a'},{h:190,n:'Frost Hollow',f:'#8fe0ff',t:'#3a5a6a'},{h:24,n:'Ember Wastes',f:'#ffa040',t:'#6a3a1a'},{h:165,n:'Sunken Crypt',f:'#5fe0c0',t:'#1f4a44'},{h:290,n:'Void Rift',f:'#d070ff',t:'#4a2a6a'}];
const ACH=[['n5','Survive to Night 5',200,s=>s.rd>=5],['n10','Survive to Night 10',500,s=>s.rd>=10],['n15','Survive to Night 15',1200,s=>s.rd>=15],['k500','500 kills in a run',150,s=>s.kills>=500],['k2000','2000 kills in a run',600,s=>s.kills>=2000],['b1','Slay a boss',150,s=>s.bossK>=1],['b5','Slay 5 bosses in a run',500,s=>s.bossK>=5],['l30','Reach level 30',300,s=>s.lv>=30],['ev','Evolve a weapon',300,s=>Object.keys(s.ev).length>=1],['ev3','Awaken 3 weapons in a run',1000,s=>Object.keys(s.ev).length>=3],['n20','Survive to Night 20',3000,s=>s.rd>=20],['k5000','5000 kills in a run',1500,s=>s.kills>=5000],['l50','Reach level 50',800,s=>s.lv>=50],['horde8','Reach Night 8 with Horde on',500,s=>s.rd>=8&&MD('horde')],['glass8','Reach Night 8 with Glass Cannon on',500,s=>s.rd>=8&&MD('glass')],['ult1','Use an ultimate',150,s=>s.uc>=1],['ult3','Use 3 ultimates in a run',500,s=>s.uc>=3],['b10','Slay 10 bosses in a run',2000,s=>s.bossK>=10],['n25','Survive to Night 25',5000,s=>s.rd>=25],['l75','Reach level 75',1500,s=>s.lv>=75],['w6','Hold 6 weapons at once',400,s=>Object.keys(s.L).length>=6],['hard8','Reach Night 8 on Hard',1000,s=>s.rd>=8&&M.set.diff==1],['nm8','Reach Night 8 on Nightmare',2000,s=>s.rd>=8&&M.set.diff==2],['hc5','Reach Night 5 on Hardcore',3000,s=>s.rd>=5&&M.set.diff==3],['hc10','Reach Night 10 on Hardcore',8000,s=>s.rd>=10&&M.set.diff==3]];
const ET=[
{n:'imp',hp:6,sp:62,r:9,c:'#d9475f',dm:6,xp:1,from:1,w:6},{n:'zom',hp:14,sp:46,r:11,c:'#6fae4a',dm:9,xp:2,from:2,w:4},
{n:'bat',hp:9,sp:115,r:8,c:'#e8a23a',dm:7,xp:2,from:2,w:3},{n:'brute',hp:42,sp:36,r:16,c:'#8a5ccf',dm:15,xp:5,from:3,w:2},
{n:'slime',hp:18,sp:50,r:12,c:'#59d17a',dm:8,xp:2,from:4,w:3},{n:'spit',hp:16,sp:40,r:11,c:'#c0e040',dm:8,xp:4,from:4,w:2},
{n:'ghost',hp:20,sp:85,r:11,c:'#7fe8e8',dm:10,xp:4,from:5,w:2},{n:'charger',hp:30,sp:70,r:13,c:'#ff8040',dm:14,xp:5,from:6,w:2},
{n:'bomber',hp:22,sp:75,r:11,c:'#d06020',dm:12,xp:4,from:7,w:2},{n:'knight',hp:70,sp:40,r:15,c:'#8a98a8',dm:18,xp:8,from:8,w:2},
{n:'wasp',hp:5,sp:130,r:7,c:'#f0d040',dm:6,xp:2,from:4,w:3},{n:'skel',hp:12,sp:55,r:10,c:'#d8d0c0',dm:8,xp:2,from:3,w:4},
{n:'cultist',hp:14,sp:38,r:11,c:'#7a3a8a',dm:9,xp:4,from:5,w:2},{n:'boar',hp:40,sp:60,r:13,c:'#8a5a3a',dm:14,xp:5,from:5,w:2},
{n:'wraith',hp:24,sp:70,r:11,c:'#6a50c0',dm:12,xp:5,from:7,w:2},{n:'shaman',hp:28,sp:42,r:12,c:'#3aa070',dm:10,xp:6,from:8,w:1},
{n:'golem',hp:160,sp:28,r:21,c:'#6a6a78',dm:22,xp:14,from:9,w:1},{n:'reaper',hp:60,sp:90,r:14,c:'#222030',dm:20,xp:12,from:11,w:1},
{n:'goblin',hp:25,sp:140,r:9,c:'#ffd24a',dm:0,xp:10,from:99,w:0},
{n:'spider',hp:8,sp:100,r:8,c:'#3a2a3a',dm:7,xp:2,from:2,w:3},{n:'ogre',hp:95,sp:32,r:18,c:'#8a7a4a',dm:20,xp:9,from:6,w:2},
{n:'archer',hp:16,sp:45,r:10,c:'#b08a50',dm:11,xp:5,from:6,w:2},{n:'harpy',hp:22,sp:125,r:10,c:'#c06a8a',dm:12,xp:5,from:6,w:2},
{n:'stalker',hp:20,sp:85,r:10,c:'#403a60',dm:16,xp:6,from:8,w:2},{n:'summoner',hp:55,sp:34,r:13,c:'#a03a6a',dm:12,xp:10,from:10,w:1},
{n:'juggernaut',hp:420,sp:22,r:27,c:'#5a5a6a',dm:30,xp:30,from:12,w:1},
{n:'cloaker',hp:1,sp:70,r:11,c:'#9a9ab0',dm:0,xp:6,from:6,w:.04},
{n:'shade',hp:30,sp:110,r:10,c:'#1a1a2e',dm:12,xp:6,from:9,w:2},{n:'wyrm',hp:230,sp:46,r:17,c:'#5a8a3a',dm:19,xp:16,from:10,w:1},
{n:'lich',hp:170,sp:42,r:14,c:'#b0a0ff',dm:17,xp:18,from:12,w:1},{n:'mimic',hp:60,sp:34,r:12,c:'#c8a04a',dm:18,xp:12,from:11,w:1},
{n:'behemoth',hp:620,sp:24,r:30,c:'#7a2a3a',dm:34,xp:40,from:15,w:.5}];
/* ---------- menu ---------- */
function menu(){$('gold').textContent=M.gold;$('dly').textContent='Daily bonus today: '+{glass:'Glass Cannon',horde:'Horde',fast:'Fast Foes'}[DAILY]+' gives +50% extra gold.';
 $('st').textContent=`Best: Night ${M.best.rd} (${fmt(M.best.t)}) | Best kills ${M.best.k} | Total kills ${M.tk} | Runs ${M.runs}`;
 const S=M.set,sb=$('set');sb.innerHTML='';
 const tg=(l,f)=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{f();save();menu()};sb.appendChild(b)};
 DIF.forEach((d,i)=>{const b=document.createElement('button'),lk=M.best.rd<d.u;b.textContent=d.n+(lk?` (Night ${d.u})`:` x${d.g} gold`);b.disabled=lk;b.style.borderColor=S.diff==i?'#b57bff':'#555';b.onclick=()=>{S.diff=i;save();menu()};sb.appendChild(b)});
 tg('Damage numbers: '+(S.num?'On':'Off'),()=>S.num=!S.num);tg('Screen shake: '+(S.shake?'On':'Off'),()=>S.shake=!S.shake);
 tg('Particles: '+(S.fx?'High':'Low'),()=>S.fx=!S.fx);tg('Sound: '+(S.snd?'On':'Off'),()=>S.snd=!S.snd);tg('Speed: '+S.spd+'x',()=>S.spd=S.spd==1?1.5:S.spd==1.5?2:1);
 [['glass','Glass Cannon'],['horde','Horde'],['fast','Fast Foes']].forEach(([k,n])=>tg(n+': '+(S.mods[k]?'On':'Off'),()=>S.mods[k]=!S.mods[k]));
 {const dsc=document.createElement('div');dsc.style.cssText='flex-basis:100%;font-size:12px;opacity:.8;text-align:center;color:#e0b050';dsc.textContent=DIF[S.diff].n+': '+DIF[S.diff].d;sb.appendChild(dsc)}
 $('chs').innerHTML='';
 for(const k in CH){const c=CH[k],own=M.own.includes(k),b=document.createElement('button');b.style.borderColor=M.ch==k?c.c:'#444';
  b.innerHTML=`<b style="color:${c.c}">${c.n}</b><br><small>${IT(c.w).n}${IT(c.w).ex?' (signature)':''}${c.hp?' | '+(c.hp>0?'+':'')+c.hp+' HP':''}<br>${c.tx}<br>Ult: ${ULT[k].n} (${ULT[k].k=='mode'?'22s power mode':k=='gojo'?'Hollow Purple (500) / MEGA +30s buff (1000)':k=='kaido'?'Fireball + 60s Dragon Form':k=='ichigo'?'Getsuga Tenshō crescent (500/1000)':k=='lechungus'?'MEGACHUNGUS (500/1000)':k=='rukia'?'Sode no Shirayuki (500/1000)':k=='alya'?'Heart Confession (500/1000)':'super move'})</small><br>${own?(M.ch==k?'Selected':'Select'):c.cost+' gold'}`;
  b.disabled=!own&&M.gold<c.cost;b.onclick=()=>{if(!own){M.gold-=c.cost;M.own.push(k)}M.ch=k;save();menu()};$('chs').appendChild(b)}
 $('shop').innerHTML='';
 SHOP.forEach(([k,n,d,mx,bc])=>{const lv=U(k),cost=Math.round(bc*(1.5+lv*1.4)),b=document.createElement('button');
  b.innerHTML=`<b>${n}</b> ${lv}/${mx}<br><small>${d}</small><br>${lv>=mx?'MAX':cost+' gold'}`;
  b.disabled=M.gold<cost||lv>=mx;b.onclick=()=>{M.gold-=cost;M.u[k]=lv+1;save();menu()};$('shop').appendChild(b)});
 $('cdx').innerHTML=ITEMS.map(i=>`<div><b style="color:${i.c}">${i.n}</b> (${i.t=='w'?(i.ex?'signature weapon':'weapon'):i.ab?'ability':i.ds?'dash upgrade':'passive'}): ${i.d}</div>`).join('');$('hist').innerHTML=M.hist.length?M.hist.map(h=>`${h.c} | Night ${h.rd} | ${fmt(h.t)} | ${h.k} kills | ${h.d}`).join('<br>'):'No runs yet';$('ach').innerHTML=ACH.map(a=>`<div class="chip ${M.ach[a[0]]?'d':''}">${M.ach[a[0]]?'&#10003; ':''}${a[1]} (+${a[2]})</div>`).join('')}
$('ex').onclick=()=>{$('code').style.display='block';$('code').value=btoa(JSON.stringify(M));$('code').select()};
$('im').onclick=()=>{const t=$('code');if(t.style.display!='block'){t.style.display='block';t.value='';t.placeholder='Paste code, press Restore again';return}
 try{M=Object.assign({},D0,JSON.parse(atob(t.value.trim())));norm();save();t.value='';t.style.display='none';menu()}catch(e){t.value='';t.placeholder='Invalid code'}};
let rsc=0;$('rs').onclick=()=>{if(!rsc){rsc=1;$('rs').textContent='Click again to erase everything';setTimeout(()=>{rsc=0;$('rs').textContent='Reset all data'},3000);return}
 M=Object.assign({},D0,{u:{},own:['mage'],ach:{},hist:[],best:{t:0,rd:0,k:0},set:Object.assign({},D0.set,{mods:{}})});BAK.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});LEGACY.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});save();rsc=0;$('rs').textContent='Reset all data';menu()};
/* ---------- game ---------- */
let G,keys={},joy=null,raf,last;
const pause=()=>{if(!G)return;if(G.state=='run'){G.state='paused';bank();$('pinfo').innerHTML=info();$('paused').classList.add('on')}else if(G.state=='paused'){resume()}};
const resume=()=>{$('paused').classList.remove('on');G.state='run';last=performance.now()};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;
 if(k==' '||k=='shift'){e.preventDefault();dash()}if(k=='escape'||k=='p')pause();if(k=='m'){M.set.snd=!M.set.snd;save();toast('Sound '+(M.set.snd?'on':'off'))}if(k=='q'||k=='e'||k=='f')skill();if(k=='u'||k=='x')ultimate();
 if(G&&G.state=='pause'){const cc=$('cv').classList.contains('on')?$('cvc'):$('cards');if('123'.includes(k)&&cc.children[+k-1])cc.children[+k-1].click();if(k=='r'&&cc==$('cards')&&!$('rr').disabled)$('rr').click()}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
const JR=60;
C.addEventListener('pointerdown',e=>{if(joy||(e.pointerType=='touch'&&e.clientX>W*.65))return;joy={id:e.pointerId,bx:e.clientX,by:e.clientY,kx:e.clientX,ky:e.clientY,dx:0,dy:0}});
addEventListener('pointermove',e=>{if(!joy||e.pointerId!=joy.id)return;let dx=e.clientX-joy.bx,dy=e.clientY-joy.by,l=Math.hypot(dx,dy);if(l>JR){dx*=JR/l;dy*=JR/l;l=JR}joy.kx=joy.bx+dx;joy.ky=joy.by+dy;joy.dx=l>8?dx/JR:0;joy.dy=l>8?dy/JR:0});
const jend=e=>{if(joy&&e.pointerId==joy.id)joy=null};addEventListener('pointerup',jend);addEventListener('pointercancel',jend);
$('db').onpointerdown=e=>{e.stopPropagation();dash()};$('sb').onpointerdown=e=>{e.stopPropagation();skill()};$('ub').onpointerdown=e=>{e.stopPropagation();ultimate()};$('pb').onpointerdown=e=>{e.stopPropagation();pause()};
$('resume').onclick=resume;$('quit').onclick=()=>{$('paused').classList.remove('on');finish()};
addEventListener('visibilitychange',()=>{if(document.hidden&&G&&G.state!='over'){bank();if(G.state=='run')pause()}});
addEventListener('pagehide',()=>{if(G&&G.state!='over')bank()});
addEventListener('beforeunload',()=>{if(G&&G.state!='over')bank()});
setInterval(()=>{if(G&&G.state=='run')bank()},4000);
function start(){const c=CH[M.ch];
 G={t:0,rd:1,ban:3,p:{x:0,y:0,hp:0,mhp:Math.round((100+U('hp')*10+c.hp)*(MD('glass')?.5:1)),inv:0,face:1,dc:0,dt:0,ch:1+U('dch'),cm:1+U('dch'),tr:0},en:[],sh:[],gm:[],fx:[],pt:[],nv:[],rg:[],ep:[],pl:[],mt:[],L:{},P:{},ev:{},dd:{},lv:1,xp:U('hstart')*2,kills:0,bossK:0,sp:0,state:'run',tm:{},shk:0,rr:rrMax(),rev:DIF[M.set.diff].rv?U('rev')+(M.ch=='gojo'?1:0):0,banked:0,bonus:0,pend:0,rS:0,rK:0,rN:0,cm:{},cu:[],vote:0,ps:[],kt:[],kc:0,bk:10,shT:8,shOn:0,lx:1,ly:0,flash:0,ac:{blast:0,mend:0,freeze:0,cry:0,well:0},freeze:0,cry:0,boost:0,uk:0,uc:0,ult:null,mode:null,bnk:0,banner:null,infR:0,infPrev:0,mn:[],tu:[],
  ff:Array.from({length:36},()=>({x:rnd(0,W),y:rnd(0,H),p:rnd(0,6)}))};
 G.p.hp=G.p.mhp;G.L[c.w]=1;['menu','end','paused','lvl'].forEach(i=>$(i).classList.remove('on'));$('pb').classList.add('on');$('db').classList.add('on');if(!M.runs)toast('Weapons fire automatically. Grab the blue gems to level up!');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
$('play').onclick=start;$('again').onclick=()=>{$('end').classList.remove('on');$('menu').classList.add('on');menu()};
const pv=k=>G.P[k]||0;
const critC=()=>cma('crit')+mx('crit')+.08+pv('luck')*.04+pv('crit')*.08+U('crit')*.012+(TR().crit||0);
const dmgM=()=>1.15*cmv('dmgOut')*(G.mode?1.05:1)*(G.boost>0?1+pv('surge')*.15:1)*(G.cry>0?1.4:1)*(G.p.hp<G.p.mhp*.5?1+pv('rage')*.12:1)*(MD('glass')?1.6:1)*(1+pv('might')*.15+pv('goldrush')*.05)*(1+U('dmg')*.03+(TR().dmg||0))*(1+pv('blood')*Math.min(.2,G.kills/6000)+pv('elder')*(G.rd-1)*.022)*(1+(G.bnk||0)*.28);
const cdM=()=>cmv('cdm')*(G.mode?.8:1)*Math.pow(.88,pv('haste'))*(1-U('cdr')*.025-(TR().cd||0)),areaM=()=>1+pv('area')*.12+U('area')*.025+(TR().area||0)+mx('area')+cma('area')+(G.mode&&M.ch=='kaido'?.6:0)+(G.bnk>=2?.08:0);
const ULT={
mage:{n:'Arcane Cataclysm',s:'The sky bends to your will',k:'nuke',c:'#a98bff',sh:'orb',N:8},
priest:{n:'Holy Judgment',s:'Light cleanses all',k:'nuke',c:'#ffe9a0',sh:'beam',N:10},
necro:{n:'Soul Harvest',s:'Every soul answers',k:'nuke',c:'#5fe0c0',sh:'soul',N:14},
hunter:{n:'Rain of Lances',s:'Not one will escape',k:'nuke',c:'#ffd9a0',sh:'lance',N:12},
witch:{n:'Meteor Storm',s:'The heavens burn',k:'nuke',c:'#ff7a4a',sh:'fire',N:9},
cryo:{n:'Absolute Zero',s:'Time stands still',k:'nuke',c:'#9fe0ff',sh:'shard',N:10},
knight:{n:'Bastion Mode',s:'Unbreakable. Unstoppable.',k:'mode',c:'#8fd0ff',sh:'sword',N:6},
rogue:{n:'Shadow Frenzy',s:'Strike from everywhere',k:'mode',c:'#6fe39a',sh:'clone',N:6},
druid:{n:'Wild Growth',s:'Nature rises with you',k:'mode',c:'#8fe05a',sh:'leaf',N:12},
monk:{n:'Inner Peace',s:'Body and mind become one',k:'mode',c:'#ffb070',sh:'orb',N:8},
engineer:{n:'Orbital Barrage',s:'Calling in the big guns',k:'nuke',c:'#ffd24a',sh:'fire',N:10},
berserker:{n:'Bloodrage',s:'Pain is power',k:'mode',c:'#ff4a4a',sh:'clone',N:7},
gojo:{n:'Hollow Purple',n2:'Unlimited Void',s:'Throughout Heaven and Earth, I alone am the honored one',k:'nuke',c:'#b050ff',sh:'purple',N:2},
ichigo:{n:'Getsuga Tenshō',s:'A black crescent that devours everything',k:'nuke',c:'#ff3050',sh:'crescent',N:10},
lechungus:{n:'MEGACHUNGUS',s:'the chungus awakens',k:'nuke',c:'#ffb0d0',sh:'orb',N:12},
goku:{n:'Kamehameha',s:'Kaaa-meee-haaa-meee-haaa!',k:'nuke',c:'#4ac8ff',sh:'beam',N:10},
kaido:{n:'Blazing Fireball',n2:'Dragon Form',s:'The strongest creature alive',k:'nuke',c:'#ff6a2a',sh:'fire',N:6,dragon:1},
rukia:{n:'Sode no Shirayuki',s:'The coldest zanpakuto in the Soul Society',k:'nuke',c:'#bfe8ff',sh:'shard',N:12},
alya:{n:'Heart Confession',s:'My heart is pounding for you~',k:'nuke',c:'#ff8ab8',sh:'heart',N:10}};
const MX={knight:{arm:1,area:.05},rogue:{crit:.09},druid:{reg:1.5,area:.08},monk:{crit:.05,arm:.5,reg:.75},berserker:{crit:.06,reg:1},gojo:{crit:.06,area:.06}};
const mx=k=>G.mode?(MX[M.ch]&&MX[M.ch][k]||0):0,ultNeed=mg=>Math.round(((mg?1000:500)+60*G.uc)*DIF[M.set.diff].ult*cmv('ultm')*(1-U('ultc')*.05)),rrMax=()=>Math.max(0,2+U('rr')+DIF[M.set.diff].rr);
function pushAway(R,slow){const p=G.p;G.en.forEach(e=>{if(e.dead)return;const d=Math.hypot(e.x-p.x,e.y-p.y)||1;if(d<R){e.x=p.x+(e.x-p.x)/d*R;e.y=p.y+(e.y-p.y)/d*R;if(slow)e.slow=2.5}})}
function bankaiFx(t){const p=G.p;G.flash=.7;G.shk=16;for(let i=0;i<5;i++)G.rg.push({x:p.x,y:p.y,r:12+i*18,t:.8,c:t==3?'#e8e8f0':'#ff3050',big:1});
 const names=['','BANKAI!','TENSA ZANGETSU!','HOLLOW BANKAI!'],subs=['','Zangetsu compresses — the robe turns black','Sleek black blade, immense speed','The Hollow mask emerges'];
 G.banner={t:3,txt:names[t],col:t==3?'#e8e8f0':'#ff3050'};toast(names[t]+' — '+subs[t]);bossSting()}
function ultimate(){if(!G||G.state!='run'||G.ult||G.mode||(G.uk<ultNeed()&&!window.__ULT))return;const mg=M.ch=='gojo'&&G.uk>=ultNeed(1);G.uk=0;G.uc++;G.ult={t:0,mega:mg};G.ep=[];pushAway(320);G.p.inv=11;G.shk=8;G.flash=.5;ultRiser();sx('u',80,.7,'sawtooth',.09)}
function ultFinish(){ultFinish0();const p=G.p;G.sp=3;G.ep=[];p.inv=Math.max(p.inv,3);pushAway(340,1);G.rg.push({x:p.x,y:p.y,r:20,t:.5,c:'#ffffff',big:1})}
function ultFinish0(){const p=G.p,D=ULT[M.ch];
 if(D.k=='mode'){G.ult=null;G.mode={t:22.5,m:22.5};p.hp=Math.min(p.mhp,p.hp+p.mhp*.1);G.flash=.6;G.shk=12;toast(D.n+' active for 22s!');sx('md',500,.5,'triangle',.08);
  for(let i=0;i<4;i++)G.rg.push({x:p.x,y:p.y,r:10+i*20,t:.6,c:D.c,big:1});G.uk=0;return}
 G.flash=1;G.shk=22;sx('B',60,.8,'sawtooth',.1);
 G.en.forEach(e=>{if(e.dead)return;if(D.sh=='purple')hit(e,e.boss?e.mhp*.3:1e9,'ult');else if(Math.abs(e.x-p.x)<W/2+80&&Math.abs(e.y-p.y)<H/2+80)hit(e,e.boss?e.mhp*.2:1e7,'ult')});
 for(let i=0;i<28;i++){const x=p.x+rnd(-W/2,W/2),y=p.y+rnd(-H/2,H/2);G.rg.push({x,y,r:6,t:rnd(.3,.7),c:D.c,big:1});if(M.set.fx)for(let j=0;j<4;j++)G.pt.push({x,y,vx:rnd(-220,220),vy:rnd(-220,220),l:.6,c:D.c,s:4})}
 if(M.ch=='priest')p.hp=Math.min(p.mhp,p.hp+p.mhp*.5);if(M.ch=='cryo')G.freeze=5;if(M.ch=='rukia')G.freeze=8;if(M.ch=='necro')G.xp+=G.lv*1.5;
 if(D.dragon){G.mode={t:60,m:60};p.hp=Math.min(p.mhp,p.hp+p.mhp*.15);G.kt=[];for(let i=0;i<4;i++)G.rg.push({x:p.x,y:p.y,r:10+i*20,t:.6,c:D.c,big:1});toast('DRAGON FORM for 60s!')}
 if(D.sh=='purple'){for(let i=0;i<6;i++)G.rg.push({x:p.x,y:p.y-20,r:20+i*24,t:.8,c:i%2?'#ff4a4a':'#4aa8ff',big:1});G.rg.push({x:p.x,y:p.y-20,r:10,t:1,c:'#ffffff',big:1});G.shk=Math.max(G.shk,16)}
 G.rg.push({x:p.x,y:p.y-10,r:30,t:.7,c:'#ffffff',big:1});G.rg.push({x:p.x,y:p.y-10,r:14,t:.9,c:D.c,big:1});
 if(G.ult&&G.ult.mega){G.mode={t:30,m:30};p.hp=Math.min(p.mhp,p.hp+p.mhp*.1);for(let i=0;i<4;i++)G.rg.push({x:p.x,y:p.y,r:10+i*20,t:.6,c:D.c,big:1});toast((D.n2||D.n)+' active for 30s!')}
 G.ult=null;G.uk=0}
function drawPurple(t,mega){const p=G.p;X.save();X.globalCompositeOperation='lighter';
 const m=Math.min(1,Math.max(0,(t-3)/3)),sep=95*(1-m)*Math.min(1,t/2),a=t*3;
 for(const [sg,col] of [[1,'#4aa8ff'],[-1,'#ff4a4a']]){const x=p.x+Math.cos(a)*sep*sg,y=p.y-30+Math.sin(a)*sep*sg*.6,r=24+m*13;
  for(let k=0;k<4;k++){const g=X.createRadialGradient(x-k*sg*9,y,2,x-k*sg*9,y,r*(1-k*.16));g.addColorStop(0,'#fff');g.addColorStop(.4,col);g.addColorStop(1,col+'00');X.globalAlpha=.3*(1-k/4);X.fillStyle=g;X.beginPath();X.arc(x-k*sg*9,y,r*(1-k*.16),0,7);X.fill()}
  const g=X.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.4,col);g.addColorStop(1,col+'00');X.globalAlpha=1;X.fillStyle=g;X.beginPath();X.arc(x,y,r,0,7);X.fill();
  for(let i=0;i<3;i++){const aa=a*2+i*2.1;X.fillStyle=col;X.globalAlpha=.85;X.fillRect(x+Math.cos(aa)*r*1.35-2,y+Math.sin(aa)*r*1.35-2,4,4)}}
 if(t>=5.5){const k=Math.min(1,(t-5.5)/3),R=24+k*k*Math.hypot(W,H)*.78;
  for(let i=0;i<3;i++){const g=X.createRadialGradient(p.x,p.y-30,2,p.x,p.y-30,R*(1-i*.24));g.addColorStop(0,'#fff');g.addColorStop(.25,'#d890ff');g.addColorStop(.7,'#b050ff99');g.addColorStop(1,'#b050ff00');X.globalAlpha=Math.min(1,(10-t)/1.5)*(1-i*.22);X.fillStyle=g;X.beginPath();X.arc(p.x,p.y-30,R*(1-i*.24),0,7);X.fill()}
  X.strokeStyle='#e0b0ff';X.lineWidth=4;
  for(let i=0;i<3;i++){const rr=((t*320)%(R/3))+R*i/3;X.globalAlpha=Math.max(0,Math.min(1,(10-t)/1.5))*(1-rr/R);X.beginPath();X.arc(p.x,p.y-30,rr,0,7);X.stroke()}
  if(M.set.fx&&Math.random()<.6)G.pt.push({x:p.x+rnd(-R*.7,R*.7),y:p.y-30+rnd(-R*.7,R*.7),vx:rnd(-160,160),vy:rnd(-160,160),l:.7,c:Math.random()<.5?'#b050ff':'#e0b0ff',s:4})}
 X.globalAlpha=1;
 if(mega){X.strokeStyle='#fff';X.lineWidth=3;for(let i=0;i<3;i++){X.globalAlpha=.6-.15*i;X.beginPath();X.arc(p.x,p.y,36+i*16+Math.sin(t*8+i)*5+t*8,0,7);X.stroke()}}
 X.restore()}
function drawFire(t){const p=G.p,cx=p.x,cy=p.y-90;X.save();X.globalCompositeOperation='lighter';const k=Math.min(1,t/7),R=14+k*k*150+Math.sin(t*10)*4,g=X.createRadialGradient(cx,cy,4,cx,cy,R);g.addColorStop(0,'#fff6c0');g.addColorStop(.35,'#ffb030');g.addColorStop(.75,'#ff4a10cc');g.addColorStop(1,'#ff4a1000');X.fillStyle=g;X.beginPath();X.arc(cx,cy,R,0,7);X.fill();
 for(let i=0;i<10;i++){const a=t*2+i*.63,rr=R*(.8+.25*Math.sin(t*6+i));X.globalAlpha=.5;X.fillStyle='#ff7a20';X.beginPath();X.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.8,R*.18,0,7);X.fill()}
 if(t>=7){const k2=Math.min(1,(t-7)/2.5),R2=R+k2*k2*Math.hypot(W,H),g2=X.createRadialGradient(cx,cy,4,cx,cy,R2);g2.addColorStop(0,'#fff');g2.addColorStop(.5,'#ff9a30aa');g2.addColorStop(1,'#ff4a1000');X.globalAlpha=Math.max(0,Math.min(1,(10-t)/1.5));X.fillStyle=g2;X.beginPath();X.arc(cx,cy,R2,0,7);X.fill()}
 X.restore()}
const ez=k=>k<=0?0:k>=1?1:k*k*(3-2*k),GL=(x,y,r,c,a)=>{const g=X.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,c+'00');X.globalAlpha=a;X.fillStyle=g;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.globalAlpha=1};
const LY={
runes(p,t,c){const R=40+ez(t/2.5)*150,n=6;X.strokeStyle=c;X.lineWidth=3;X.globalAlpha=.8;X.beginPath();X.ellipse(p.x,p.y+14,R,R*.45,0,0,7);X.stroke();X.globalAlpha=.4;X.beginPath();X.ellipse(p.x,p.y+14,R*.6,R*.27,0,0,7);X.stroke();X.globalAlpha=.7;X.beginPath();for(let i=0;i<n;i++){const a=t*.9+i*6.283/n,b=t*.9+((i+2)%n)*6.283/n;X.moveTo(p.x+Math.cos(a)*R,p.y+14+Math.sin(a)*R*.45);X.lineTo(p.x+Math.cos(b)*R,p.y+14+Math.sin(b)*R*.45)}X.stroke();X.fillStyle=c;for(let i=0;i<12;i++){const a=-t*.6+i*.5236;X.fillRect(p.x+Math.cos(a)*R*1.1-2,p.y+14+Math.sin(a)*R*.5-2,4,4)}X.globalAlpha=1},
vortex(p,t,c){X.fillStyle=c;for(let i=0;i<40;i++){const u=(t*.35+i/40)%1,r=120*(1-u)+6,a=u*10+i*1.7;X.globalAlpha=Math.sin(u*3.14)*.9;X.fillRect(p.x+Math.cos(a)*r-2,p.y+16-u*130+Math.sin(a)*r*.3-2,4,4)}X.globalAlpha=1},
sats(p,t,c,D){const R=60+Math.min(t,7)*14,N=D.N;X.fillStyle=c;X.strokeStyle=c;X.lineWidth=3;for(let i=0;i<N;i++){const a=t*(1.5+(i%3)*.3)*(i%2?1:-1)+i*6.283/N,rr=R*(.75+.25*Math.sin(t*2+i)),x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr*.8;
 switch(D.sh){
 case 'soul':X.beginPath();X.arc(x,y,5,0,7);X.fill();X.beginPath();X.moveTo(x,y);X.lineTo(x-Math.cos(a)*14,y-Math.sin(a)*14-8);X.stroke();break;
 case 'lance':X.beginPath();X.moveTo(x,y);X.lineTo(x-Math.sin(a)*28,y+Math.cos(a)*28);X.stroke();break;
 case 'fire':X.beginPath();X.arc(x,y-20-Math.sin(t*6+i)*6,8,0,7);X.fill();X.globalAlpha=.4;X.fillRect(x-2,y-60,4,40);X.globalAlpha=1;break;
 case 'shard':X.beginPath();X.moveTo(x,y-9);X.lineTo(x+5,y);X.lineTo(x,y+9);X.lineTo(x-5,y);X.fill();break;
 case 'sword':X.fillRect(x-1.5,y-26-t*2,3,26);X.fillRect(x-6,y-6-t*2,12,2);break;
 case 'leaf':X.beginPath();X.ellipse(x,y,9,4,a,0,7);X.fill();break;
 case 'heart':X.fillStyle=c;X.beginPath();X.moveTo(x,y+5);X.bezierCurveTo(x-9,y-3,x-4,y-10,x,y-4);X.bezierCurveTo(x+4,y-10,x+9,y-3,x,y+5);X.fill();break;
 default:X.beginPath();X.arc(x,y,8,0,7);X.fill();X.globalAlpha=.3;X.beginPath();X.arc(x,y,16,0,7);X.fill();X.globalAlpha=1}}},
pillars(p,t,c){const n=Math.min(12,2+Math.floor(t*1.3));for(let i=0;i<n;i++){const a=i*6.283/n+t*.2,x=p.x+Math.cos(a)*(100+30*Math.sin(i)),y=p.y+Math.sin(a)*45+10;X.globalAlpha=.25+.2*Math.sin(t*5+i);X.fillStyle=c;X.fillRect(x-5,y-520,10,520);GL(x,y,22,c,.6)}X.globalAlpha=1},
halo(p,t,c){X.strokeStyle=c;X.lineWidth=3;X.globalAlpha=.8;X.beginPath();X.ellipse(p.x,p.y-34,14+Math.sin(t*3)*2,5,0,0,7);X.stroke();GL(p.x,p.y-34,40,c,.35);if(t>7.5){const k=ez((t-7.5)/1.5);X.globalAlpha=.7*k;X.fillStyle='#ffffff';X.fillRect(p.x-6*k,p.y-H,12*k,H*2);X.fillRect(p.x-W,p.y-6*k,W*2,12*k)}X.globalAlpha=1},
sphere(p,t,c){const k=ez((t-.8)/8),R=5+k*48+Math.sin(t*9)*2,y=p.y-62;GL(p.x,y,R*2.6,c,.5);GL(p.x,y,R*1.2,'#ffffff',.8)},
hands(p,t,c){const f=p.face||1,k=ez((t-.5)/6.5);GL(p.x+f*20,p.y-8,10+k*34+Math.sin(t*14)*2,c,.85);GL(p.x+f*20,p.y-8,5+k*14,'#ffffff',.9)},
skulls(p,t,c){const R=40+ez(t/2.5)*150;X.globalCompositeOperation='source-over';for(let i=0;i<8;i++){const a=t*.5+i*.785,x=p.x+Math.cos(a)*R*.8,y=p.y+14+Math.sin(a)*R*.36;X.fillStyle=c;X.beginPath();X.arc(x,y-4,7,0,7);X.fill();X.fillRect(x-4,y,8,5);X.fillStyle='#08140f';X.fillRect(x-4,y-6,3,3);X.fillRect(x+1,y-6,3,3)}X.globalCompositeOperation='lighter'},
ice(p,t,c){const R=40+ez(t/2.5)*150;X.fillStyle=c;X.globalAlpha=.85;for(let i=0;i<14;i++){const a=i*.4488,h=ez((t-1-i*.12)/1.2)*(30+hsh(i,1)*30),x=p.x+Math.cos(a)*R*.95,y=p.y+14+Math.sin(a)*R*.43;X.beginPath();X.moveTo(x-6,y);X.lineTo(x,y-h);X.lineTo(x+6,y);X.fill()}X.globalAlpha=1},
rain(p,t,c,D){const ln=D.sh=='lance';for(let i=0;i<30;i++){const ti=5.5+i*.13;if(t<ti)continue;const f=Math.min(1,(t-ti)/.5),x=p.x+(hsh(i,7)*2-1)*W*.42,gy=p.y+(hsh(i,3)*2-1)*H*.34,y=gy-(1-f)*520;
 if(f<1){X.strokeStyle=c;X.lineWidth=ln?3:6;X.globalAlpha=.8;X.beginPath();X.moveTo(x-(ln?0:(1-f)*60),y-60);X.lineTo(x,y);X.stroke();X.fillStyle='#ffffff';X.beginPath();X.arc(x,y,ln?3:7,0,7);X.fill()}
 else if(t-ti<.9){const q=t-ti-.5;X.strokeStyle=c;X.lineWidth=3;X.globalAlpha=Math.max(0,1-q/.4);X.beginPath();X.ellipse(x,gy,10+q*120,5+q*55,0,0,7);X.stroke()}}X.globalAlpha=1},
dome(p,t,c){const R=30+ez(t/3)*95;X.strokeStyle=c;X.lineWidth=3;X.globalAlpha=.7;X.beginPath();X.arc(p.x,p.y+10,R,Math.PI,0);X.stroke();X.globalAlpha=.22;X.fillStyle=c;X.beginPath();X.arc(p.x,p.y+10,R,Math.PI,0);X.fill();X.globalAlpha=.4;for(let i=1;i<5;i++){X.beginPath();X.arc(p.x,p.y+10,R*i/5,Math.PI,0);X.stroke()}for(let i=0;i<6;i++){const a=Math.PI+i*Math.PI/5;X.beginPath();X.moveTo(p.x,p.y+10);X.lineTo(p.x+Math.cos(a)*R,p.y+10+Math.sin(a)*R);X.stroke()}X.globalAlpha=1},
clones(p,t,c){X.globalCompositeOperation='source-over';for(let i=0;i<8;i++){const a=t*(2+i*.1)+i*.785,R=70+Math.sin(t*2+i)*18,x=p.x+Math.cos(a)*R,y=p.y+Math.sin(a)*R*.5;X.fillStyle='#0b0612';X.strokeStyle=c;X.lineWidth=2;X.beginPath();X.arc(x,y-4,7,0,7);X.fill();X.stroke();X.beginPath();X.moveTo(x-8,y+10);X.lineTo(x,y-8);X.lineTo(x+8,y+10);X.closePath();X.fill();X.stroke()}X.globalCompositeOperation='lighter'},
slashes(p,t,c){const n=Math.floor(t*3);for(let i=Math.max(0,n-6);i<=n;i++){const age=t*3-i;if(age>1)continue;const a=hsh(i,5)*3.14-1.57,L=120+hsh(i,9)*160,cx=p.x+(hsh(i,2)*2-1)*160,cy=p.y+(hsh(i,4)*2-1)*90;X.strokeStyle=c;X.lineWidth=4*(1-age)+1;X.globalAlpha=1-age;X.beginPath();X.moveTo(cx-Math.cos(a)*L/2,cy-Math.sin(a)*L/2);X.lineTo(cx+Math.cos(a)*L/2,cy+Math.sin(a)*L/2);X.stroke()}X.globalAlpha=1},
vines(p,t,c){const k=ez(t/4);X.strokeStyle=c;X.lineWidth=3;for(let i=0;i<8;i++){const a0=i*.785,pt=u=>{const aa=a0+u*3+t*.3,r=u*150;return[p.x+Math.cos(aa)*r,p.y+14+Math.sin(aa)*r*.45-Math.sin(u*3.14)*30]};X.beginPath();for(let s=0;s<=20;s++){const q=pt(s/20*k);X.lineTo(q[0],q[1])}X.globalAlpha=.8;X.stroke();if(k>.7){const q=pt(k);X.fillStyle='#ffd0f0';X.globalAlpha=.9;X.beginPath();X.arc(q[0],q[1],5+Math.sin(t*4+i)*1.5,0,7);X.fill()}}X.globalAlpha=1},
aura(p,t,c){for(let i=0;i<14;i++){const a=i*.4488,h=26+Math.sin(t*9+i*1.7)*10+ez(t/5)*40;X.globalAlpha=.55;X.fillStyle=c;X.beginPath();X.moveTo(p.x+Math.cos(a)*14,p.y+Math.sin(a)*8+6);X.lineTo(p.x+Math.cos(a)*(18+h*.2),p.y-h*1.5+Math.sin(a)*6);X.lineTo(p.x+Math.cos(a+.3)*14,p.y+Math.sin(a+.3)*8+6);X.fill()}GL(p.x,p.y-6,50+ez(t/6)*40,c,.4)},
chakra(p,t){const cols=['#ff4a4a','#ff9a30','#ffe040','#5fe070','#4ac8ff','#6a6aff','#c070ff'];for(let i=0;i<7;i++){const k=ez((t-.4*i)/1.2);if(k<=0)continue;GL(p.x+Math.sin(t*2+i)*4,p.y+8-k*(30+i*22),16+Math.sin(t*5+i)*3,cols[i],.75*k)}},
reticle(p,t,c){const R=40+ez(t/6)*170;X.strokeStyle=c;X.lineWidth=2;X.globalAlpha=.8;X.beginPath();X.ellipse(p.x,p.y+14,R,R*.45,0,0,7);X.stroke();X.beginPath();X.ellipse(p.x,p.y+14,R*.5,R*.22,0,0,7);X.stroke();X.moveTo(p.x-R*1.15,p.y+14);X.lineTo(p.x+R*1.15,p.y+14);X.moveTo(p.x,p.y+14-R*.55);X.lineTo(p.x,p.y+14+R*.55);X.stroke();X.globalAlpha=.4;X.beginPath();X.moveTo(p.x,p.y+14);X.lineTo(p.x+Math.cos(t*3)*R,p.y+14+Math.sin(t*3)*R*.45);X.stroke();X.globalAlpha=1},
orbital(p,t,c){const n=Math.min(9,Math.floor(t));for(let i=0;i<n;i++){const a=i*.698+t*.2,x=p.x+Math.cos(a)*120,y=p.y+14+Math.sin(a)*55;X.globalAlpha=.35+.25*Math.sin(t*8+i);X.fillStyle=c;X.fillRect(x-3,y-600,6,600);GL(x,y,14,c,.8)}X.globalAlpha=1},
cracks(p,t,c){const k=ez(t/5);X.strokeStyle=c;X.lineWidth=3;X.globalAlpha=.85;for(let i=0;i<9;i++){const a=i*.698+hsh(i,2)*.3;X.beginPath();X.moveTo(p.x,p.y+14);for(let s=1;s<=8;s++){const aa=a+Math.sin(s*2+i)*.25,r=s*20*k;X.lineTo(p.x+Math.cos(aa)*r,p.y+14+Math.sin(aa)*r*.45)}X.stroke()}GL(p.x,p.y+14,60+k*50,c,.35);X.globalAlpha=1},
pulse(p,t,c){for(let i=0;i<4;i++){const u=(t*1.4+i/4)%1;X.strokeStyle=c;X.lineWidth=3;X.globalAlpha=(1-u)*.8;X.beginPath();X.ellipse(p.x,p.y+14,30+u*200,12+u*85,0,0,7);X.stroke()}X.globalAlpha=1},
beam(p,t,c){if(t<7)return;const k=ez((t-7)/2),f=(p.face||1)>0?1:-1,w=(10+k*60)*(t>9.4?Math.max(0,(10-t)/.6):1),x0=f>0?p.x:p.x-W;X.globalAlpha=.8;X.fillStyle=c;X.fillRect(x0,p.y-w/2-20,W,w);X.fillStyle='#ffffff';X.fillRect(x0,p.y-w*.2-20,W,w*.4);GL(p.x+f*20,p.y-20,30+k*60,'#ffffff',.9);X.globalAlpha=1},
purple(p,t,c,D){drawPurple(t,G.ult&&G.ult.mega)},
fire(p,t){drawFire(t)},
crescent(p,t,c){const ph=t<2?t/2:Math.min(1,(t-2)/6),x=p.x+(ph-.5)*W*1.5,y=p.y-16,R=190+Math.sin(ph*Math.PI)*70;
 X.globalAlpha=.95;X.strokeStyle=c;X.lineWidth=26*(1-Math.abs(ph-.5))+6;X.lineCap='round';
 X.beginPath();X.arc(x,y,R,Math.PI*.85,Math.PI*1.85);X.stroke();
 X.strokeStyle='#ffffff';X.lineWidth=8;X.beginPath();X.arc(x,y,R-10,Math.PI*.92,Math.PI*1.78);X.stroke();
 X.globalAlpha=.35;X.strokeStyle=c;X.lineWidth=60*(1-Math.abs(ph-.5));X.beginPath();X.arc(x,y,R,Math.PI*.85,Math.PI*1.85);X.stroke();
 X.globalAlpha=1;X.lineCap='butt'},
comets(p,t,c){for(let i=0;i<10;i++){const ti=1+i*.55;if(t<ti)continue;const f=Math.min(1,(t-ti)/1.1),x=p.x+(hsh(i,11)*2-1)*W*.42,y=p.y-H*.45+f*H*.95,a=(hsh(i,3)*2-1)*.35;
  X.save();X.translate(x,y);X.rotate(a);X.globalAlpha=Math.max(0,1-f);const g=X.createLinearGradient(0,0,0,-70);g.addColorStop(0,'#fff');g.addColorStop(.3,c);g.addColorStop(1,c+'00');X.fillStyle=g;X.beginPath();X.moveTo(0,0);X.lineTo(-5,-70);X.lineTo(5,-70);X.closePath();X.fill();X.fillStyle='#fff';X.beginPath();X.arc(0,0,5+f*3,0,7);X.fill();X.restore()}X.globalAlpha=1},
wind(p,t,c){for(let i=0;i<16;i++){const u=(t*.25+i/16)%1,a=u*6.283+i;X.globalAlpha=(1-u)*.6;X.strokeStyle=c;X.lineWidth=3;X.beginPath();X.arc(p.x+Math.cos(a)*(40+u*180),p.y+10+Math.sin(a)*(20+u*70),10+u*30,t*2+i,t*2+i+2.5);X.stroke()}X.globalAlpha=1},
bounce(p,t,c){for(let i=0;i<7;i++){const a=i*6.283/7+t*.8,x=p.x+Math.cos(a)*90,y=p.y+10-Math.abs(Math.sin(t*3+i))*70;GL(x,y,18,c,.7);X.fillStyle='#fff';X.beginPath();X.arc(x,y,4,0,7);X.fill()}},
hearts(p,t,c){for(let i=0;i<10;i++){const u=(t*.2+i/10)%1,x=p.x+Math.sin(u*6+i)*130*(1-u*.4),y=p.y+20-u*270,s=6+3*Math.sin(u*9+i);X.globalAlpha=(1-u)*.9;X.fillStyle=i%2?'#ff8ab8':'#ffffff';X.save();X.translate(x,y);X.rotate(Math.sin(u*5+i)*.3);X.beginPath();X.moveTo(0,s*.5);X.bezierCurveTo(-s,-s*.4,-s*.5,-s*1.2,0,-s*.4);X.bezierCurveTo(s*.5,-s*1.2,s,-s*.4,0,s*.5);X.fill();X.restore()}X.globalAlpha=1}};
const SC={mage:['runes','vortex','sats','sphere'],priest:['runes','pillars','halo','vortex'],necro:['runes','skulls','sats','vortex'],hunter:['wind','sats','rain'],witch:['runes','comets','sats'],cryo:['runes','ice','sats','rain'],knight:['runes','dome','sats'],rogue:['clones','slashes','vortex'],druid:['runes','vines','sats','vortex'],monk:['aura','chakra','vortex'],engineer:['reticle','orbital','runes'],berserker:['cracks','pulse','vortex'],gojo:['runes','purple'],goku:['aura','hands','beam','vortex'],kaido:['fire','pulse'],ichigo:['runes','crescent','sats'],lechungus:['bounce','aura','runes'],rukia:['ice','runes','sats'],alya:['hearts','runes','sats']};
function drawUlt(){const p=G.p,D=ULT[M.ch];
 if(G.mode){if(M.ch=='gojo'){for(let i=0;i<3;i++){X.strokeStyle=['#b050ff','#4aa8ff','#ff4a4a'][i];X.globalAlpha=.55-.13*i;X.lineWidth=3;X.beginPath();X.arc(p.x,p.y,26+i*15+Math.sin(G.t*(6+i))*4,G.t*(2+i),G.t*(2+i)+4.6);X.stroke()}
   if(M.set.fx&&Math.random()<.35)G.pt.push({x:p.x+rnd(-90,90),y:p.y+rnd(-90,90),vx:rnd(-30,30),vy:rnd(-30,30),l:.5,c:'#b050ff',s:3});
   if(Math.floor(G.t*3)%7==0)G.flash=Math.max(G.flash,.1)}
  else{X.strokeStyle=D.c;X.lineWidth=3;X.globalAlpha=.45+.3*Math.sin(G.t*6);X.beginPath();X.arc(p.x,p.y,26+Math.sin(G.t*5)*3,0,7);X.stroke();X.globalAlpha=1}}
 const u=G.ult;if(!u)return;X.save();X.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const ph=(u.t*.32+i/3)%1;X.strokeStyle=D.c;X.globalAlpha=(1-ph)*.5;X.lineWidth=4*(1-ph)+1;X.beginPath();X.arc(p.x,p.y,30+ph*Math.max(W,H)*.65,0,7);X.stroke()}
 if(M.set.fx&&Math.random()<.55)G.pt.push({x:p.x+rnd(-170,170),y:p.y+rnd(-50,60),vx:0,vy:rnd(-170,-60),l:.7,c:D.c,s:3});
 for(const n of (SC[M.ch]||['runes','vortex','sats']))LY[n](p,u.t,D.c,D);
 X.restore()}
function drawUltHud(){const u=G.ult,D=ULT[M.ch];X.textAlign='center';
 if(u){const t=u.t,bh=Math.max(0,Math.min(1,t/.6,(10.5-t)/.5))*H*.13,ph=t<3?'CHARGING':t<7?'POWER RISING':t<9.3?'UNLEASHING':'RELEASE';
  const dm=Math.min(.55,t/1.2*.55),g=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.12,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+dm+')');X.fillStyle=g;X.fillRect(0,0,W,H);
  X.strokeStyle=D.c;X.globalAlpha=.25*Math.min(1,t/3);X.lineWidth=2;for(let i=0;i<18;i++){const a=i*.349+t*.05,r1=Math.min(W,H)*(.38+hsh(i,1)*.1),r2=r1+60+hsh(i,2)*120+Math.sin(t*6+i)*20;X.beginPath();X.moveTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1);X.lineTo(W/2+Math.cos(a)*r2,H/2+Math.sin(a)*r2);X.stroke()}X.globalAlpha=1;
  X.fillStyle='#000';X.fillRect(0,0,W,bh);X.fillRect(0,H-bh,W,bh);
  X.fillStyle=D.c;X.fillRect(0,bh-3,W*Math.min(1,t/.9),3);X.fillRect(W-W*Math.min(1,t/.9),H-bh,W*Math.min(1,t/.9),3);
  const nm=(u.mega&&D.n2)?D.n2:D.n,fs=Math.round(Math.min(46,W/13)),sl=ez(t/.9);
  X.font='bold '+fs+'px system-ui';X.fillStyle=D.c;X.strokeStyle='#000';X.lineWidth=7;X.globalAlpha=Math.min(1,t/.6);X.strokeText(nm,W/2-(1-sl)*140,bh+fs+14);X.fillText(nm,W/2-(1-sl)*140,bh+fs+14);
  const sub=D.s.slice(0,Math.floor(Math.max(0,t-1.6)*22));X.globalAlpha=1;X.font='bold 17px system-ui';X.fillStyle='#fff';X.lineWidth=4;X.strokeText(sub,W/2,bh+fs+42);X.fillText(sub,W/2,bh+fs+42);
  X.font='bold 13px system-ui';X.fillStyle=D.c;X.fillText(ph+'  '+Math.ceil(10-t)+'s  -  you are invulnerable',W/2,H-bh-14);
  X.fillStyle='#ffffff40';X.fillRect(W*.25,H-bh*.5-3,W*.5,6);X.fillStyle=D.c;X.fillRect(W*.25,H-bh*.5-3,W*.5*t/10,6);
  if(t>9.4){X.globalAlpha=(t-9.4)/.6;X.fillStyle='#fff';X.fillRect(0,0,W,H);X.globalAlpha=1}
  X.textAlign='left';return}
 const gj=M.ch=='gojo',need=gj?ultNeed(1):ultNeed(),bw=150,y=H-26;
 if(G.mode){X.fillStyle='#000a';X.fillRect(W/2-bw/2,y,bw,12);X.fillStyle=D.c;X.fillRect(W/2-bw/2,y,bw*G.mode.t/(G.mode.m||22.5),12);X.fillStyle='#fff';X.font='bold 11px system-ui';X.fillText((D.n2||D.n)+' '+Math.ceil(G.mode.t)+'s',W/2,y+10)}
 else{const rd=G.uk>=ultNeed();X.fillStyle='#000a';X.fillRect(W/2-bw/2,y,bw,12);X.fillStyle=rd&&Math.floor(G.t*4)%2?'#fff':(gj&&G.uk>=need?'#b050ff':'#ffd24a');X.fillRect(W/2-bw/2,y,bw*Math.min(1,G.uk/need),12);X.fillStyle=rd?'#000':'#fff';X.font='bold 11px system-ui';if(gj){X.fillStyle='#fff';X.fillRect(W/2-bw/2+bw*ultNeed()/need-1,y,2,12)}X.fillStyle=rd?'#000':'#fff';X.font='bold 11px system-ui';X.fillText(gj&&G.uk>=need?'MEGA ULT READY (U)':rd?(gj?'ULT READY (U) - or reach '+need+' for MEGA':'ULTIMATE READY (U)'):'Ultimate '+Math.floor(G.uk)+'/'+(gj?ultNeed()+' ('+need+' mega)':need),W/2,y+10)}
 X.textAlign='left'}
const xpNeed=()=>Math.round((8+G.lv*10+G.lv*G.lv*.45)*.9/DIF[M.set.diff].xp);
const ABD={blast:[14,1.5],mend:[30,3],freeze:[40,4],cry:[25,2],well:[22,2.5]},ABK=['blast','mend','freeze','cry','well'];
const dcd=()=>3*cmv('dcm')*Math.pow(.96,U('dsh'))*Math.pow(.86,pv('sprint')),abCd=k=>Math.max(4,(ABD[k][0]-ABD[k][1]*pv(k))*cdM()*(1-U('sk')*.04));
function skill(){if(!G||G.state!='run'||G.ult)return;const p=G.p;
 if(pv('blast')&&G.ac.blast<=0){G.ac.blast=abCd('blast');const l=pv('blast'),R=(150+20*l)*areaM();G.nv.push({x:p.x,y:p.y,r:10,R,d:(30+20*l)*dmgM(),hit:new Set(),src:'blast'});G.en.forEach(e=>{const d=Math.hypot(e.x-p.x,e.y-p.y)||1;if(d<R&&!e.boss){e.x+=(e.x-p.x)/d*70;e.y+=(e.y-p.y)/d*70}});G.shk=8;sx('b2',90,.3,'sawtooth',.07)}
 if(pv('mend')&&G.ac.mend<=0){G.ac.mend=abCd('mend');p.hp=Math.min(p.mhp,p.hp+p.mhp*(.25+.05*pv('mend')));G.rg.push({x:p.x,y:p.y,r:10,t:.5,c:'#6fe39a',big:1});sx('md',700,.3,'sine',.06)}
 if(pv('freeze')&&G.ac.freeze<=0){G.ac.freeze=abCd('freeze');G.freeze=(M.ch=='rukia'?5:3)+1.2*pv('freeze');sx('fz',200,.4,'sine',.06);G.flash=.15}
 if(pv('cry')&&G.ac.cry<=0){G.ac.cry=abCd('cry');G.cry=6+pv('cry');G.rg.push({x:p.x,y:p.y,r:10,t:.5,c:'#ff8a3a',big:1});sx('cr',150,.3,'square',.06)}
 if(pv('well')&&G.ac.well<=0){G.ac.well=abCd('well');const l=pv('well'),R=(240+20*l)*areaM();G.en.forEach(e=>{const d=Math.hypot(e.x-p.x,e.y-p.y)||1;if(d<R&&!e.boss){const m=Math.max(0,Math.min(d-20,110));e.x-=(e.x-p.x)/d*m;e.y-=(e.y-p.y)/d*m;e.slow=2;hit(e,(15+10*l)*dmgM(),'well')}});G.rg.push({x:p.x,y:p.y,r:30,t:.5,c:'#b070ff',big:1});sx('wl',120,.3,'sine',.07)}}
const magR=()=>60*cmv('mag')*(1+pv('magnet')*.4)*(1+U('mag')*.1);
const gold=()=>Math.floor((G.kills/8+G.t/15+G.rd*G.rd*1.5+G.bonus*.5)*(1+U('greed')*.06+pv('prosper')*.15+pv('bounty')*.12+pv('goldrush')*.2)*DIF[M.set.diff].g*modG()*1.5*cmv('gold'));
const hpS=()=>(1+(G.rd-1)*.65+Math.pow(G.rd-1,2)*.1)*DIF[M.set.diff].hp*cmv('hpE')*.9,spS=()=>Math.min(2.4,1+(G.rd-1)*.06)*(MD('fast')?1.25:1)*cmv('spE')*DIF[M.set.diff].sp,dmgIn=()=>cmv('dmgIn')*(1+(G.rd-1)*.2)*DIF[M.set.diff].dm*.85;
function bank(){if(!G||G.state=='over')return;const g=gold();M.gold+=g-G.banked;G.banked=g;const b=M.best;if(G.rd>b.rd)b.rd=G.rd;if(G.t>b.t)b.t=G.t;if(G.kills>b.k)b.k=G.kills;
 ACH.forEach(a=>{if(!M.ach[a[0]]&&a[3](G)){M.ach[a[0]]=1;M.gold+=a[2];toast('Achievement: '+a[1]+' (+'+a[2]+' gold)')}});save()}
function info(){const dd=Object.entries(G.dd).sort((a,b)=>b[1]-a[1]),tot=dd.reduce((s,a)=>s+a[1],0)||1;
 return '<b>Stats</b><br>Damage x'+dmgM().toFixed(2)+', Cooldown x'+cdM().toFixed(2)+', Area x'+areaM().toFixed(2)+', Crit '+Math.round(critC()*100)+'%<br><b>Weapons</b><br>'+Object.keys(G.L).map(k=>`${nm(k)} Lv ${G.L[k]}${G.ev[k]?' (Awakened)':''}`).join('<br>')+'<br><b>Passives</b><br>'+(Object.keys(G.P).map(k=>`${nm(k)} Lv ${G.P[k]}`).join('<br>')||'None')+'<br><b>Curses</b><br>'+(G.cu.map(id=>{const c=CU.find(x=>x[0]==id);return (c[2]=='p'?'+ ':'- ')+c[1]}).join('<br>')||'None')+'<br><b>Damage dealt</b><br>'+dd.slice(0,6).map(a=>`${nm(a[0])}: ${Math.round(a[1]/tot*100)}%`).join('<br>')}
const ADDK=new Set(['area','crit','armor','inv','nheal','champ','dash','regen']);
const cmv=k=>(G&&G.cm&&G.cm[k]!=null?G.cm[k]:1),cma=k=>(G&&G.cm&&G.cm[k])||0;
const CU=[
['glass','Glass Skin','n','Enemies deal 15% more damage.',{dmgIn:1.15}],
['iron','Iron Hides','n','Enemies have 20% more HP.',{hpE:1.2}],
['frenzy','Frenzy','n','Enemies move 10% faster.',{spE:1.1}],
['tide','Endless Tide','n','Enemies spawn 25% faster.',{spawn:1.25}],
['crypt','Overflowing Crypt','n','20% more enemies each night.',{quota:1.2}],
['weak','Weakness','n','You deal 10% less damage.',{dmgOut:.9}],
['frail','Frailty','n','Your max HP is reduced by 10%.',{mhp:.9}],
['slug','Sluggish','n','You move 8% slower.',{spd:.92}],
['slow','Slow Hands','n','Your cooldowns are 12% longer.',{cdm:1.12}],
['tunnel','Tunnel Vision','n','Area of effect -10%.',{area:-.1}],
['blunt','Blunt Edge','n','-5% crit chance.',{crit:-.05}],
['famine','Famine','n','You gain 15% less XP.',{xp:.85}],
['poor','Poverty','n','You earn 20% less gold.',{gold:.8}],
['lean','Lean Pickings','n','Pickup range -25%.',{mag:.75}],
['boots','Heavy Boots','n','Dash cooldown is 30% longer.',{dcm:1.3}],
['jaw','Glass Jaw','n','Shorter invincibility after being hit.',{inv:-.15}],
['hot','Hot-Headed','n','Ultimates cost 25% more kills.',{ultm:1.25}],
['giant','Dread Giant','n','Bosses have 40% more HP.',{bossHp:1.4}],
['call','Champions Call','n','One extra champion arrives each night.',{champ:1}],
['blood','Bad Blood','n','You no longer heal between nights.',{nheal:-.05}],
['plate','Brittle Plate','n','-1 armor.',{armor:-1}],
['boom','Volatile Dead','n','Slain enemies sometimes explode and hurt you.',{boom:.12}],
['bleed','Bleeding Hex','n','Lose 25% of your current HP right now.',{},()=>{G.p.hp=Math.max(1,Math.round(G.p.hp*.75))}],
['ambush','Ambush','n','A swarm attacks you right now.',{},()=>swarm()],
['squad','Elite Squad','n','Three champions appear right now.',{},()=>{for(let i=0;i<3;i++)champ()}],
['thief','Thieving Shadows','n','Lose 30% of a level of XP right now.',{},()=>{G.xp=Math.max(0,G.xp-xpNeed()*.3)}],
['double','Double Trouble','n','Enemies get +10% HP, +5% speed, +5% damage.',{hpE:1.1,spE:1.05,dmgIn:1.05}],
['rot','Rotting Treasure','n','-10% XP and -10% gold.',{xp:.9,gold:.9}],
['lethargy','Lethargy','n','-7% damage, +6% cooldowns, -4% speed.',{dmgOut:.93,cdm:1.06,spd:.96}],
['chains','Heavy Chains','n','-12% speed and 20% longer dash cooldown.',{spd:.88,dcm:1.2}],
['fury','Fury','p','+12% damage, but -8% max HP.',{dmgOut:1.12,mhp:.92}],
['draw','Quick Draw','p','Cooldowns are 10% shorter, but you deal 6% less damage.',{cdm:.9,dmgOut:.94}],
['fleet','Fleet Foot','p','+10% move speed, but enemies deal 6% more damage.',{spd:1.1,dmgIn:1.06}],
['vital','Vitality','p','+12% max HP, but you move 6% slower.',{mhp:1.12,spd:.94}],
['scholar','Scholar','p','+15% XP, but enemies have 8% more HP.',{xp:1.15,hpE:1.08}],
['prosper','Prosperity','p','+20% gold, but -8% XP.',{gold:1.2,xp:.92}],
['reach','Wide Reach','p','+10% area of effect, but cooldowns are 6% longer.',{area:.1,cdm:1.06}],
['eye','Eagle Eye','p','+6% crit chance, but you deal 5% less damage.',{crit:.06,dmgOut:.95}],
['grav','Gravity','p','+30% pickup range, but enemies move 6% faster.',{mag:1.3,spE:1.06}],
['wind','Second Wind','p','Regenerate 0.6 HP per second, but you move 5% slower.',{regen:.6,spd:.95}],
['stone','Stone Skin','p','+1 armor, but you move 6% slower.',{armor:1,spd:.94}],
['feather','Feather Foes','p','Enemies deal 10% less damage, but have 10% more HP.',{dmgIn:.9,hpE:1.1}],
['brittle','Brittle Foes','p','Enemies have 10% less HP, but spawn 15% faster.',{hpE:.9,spawn:1.15}],
['daze','Dazed Foes','p','Enemies move 8% slower, but 10% more of them come each night.',{spE:.92,quota:1.1}],
['sparse','Sparse Night','p','15% fewer enemies each night, but they have 10% more HP.',{quota:.85,hpE:1.1}],
['soul','Soul Collector','p','Ultimates cost 20% fewer kills, but you deal 6% less damage.',{ultm:.8,dmgOut:.94}],
['slip','Slippery','p','Longer invincibility after being hit, but you move 5% slower.',{inv:.15,spd:.95}],
['moon','Healing Moon','p','Heal 10% more between nights, but enemies move 5% faster.',{nheal:.1,spE:1.05}],
['dashp','Extra Dash','p','+1 dash charge, but dash cooldown is 15% longer.',{dash:1,dcm:1.15},()=>{G.p.ch++}],
['lvl','Free Level','p','Gain a free level-up now, but enemies have 10% more HP.',{hpE:1.1},()=>{G.pend++}]];
function takeCurse(c){const p=G.p;G.cu.push(c[0]);const m=c[4]||{};for(const k in m){if(k=='mhp'){const f=m[k];p.mhp=Math.max(20,Math.round(p.mhp*f));p.hp=Math.max(1,Math.min(p.mhp,Math.round(p.hp*f)));continue}G.cm[k]=ADDK.has(k)?(G.cm[k]||0)+m[k]:(G.cm[k]??1)*m[k]}if(c[5])c[5]();toast((c[2]=='p'?'Blessing: ':'Curse: ')+c[1])}
function curseVote(){G.state='pause';sx('l',200,.25,'triangle',.05);
 let pool=CU.filter(c=>!G.cu.includes(c[0]));if(pool.length<3)pool=CU.slice();
 const wt=c=>c[2]=='p'?DIF[M.set.diff].bl:1,picks=[];while(picks.length<3&&pool.length){let r=Math.random()*pool.reduce((s,c)=>s+wt(c),0),ix=0;for(;ix<pool.length-1;ix++){r-=wt(pool[ix]);if(r<=0)break}picks.push(pool.splice(ix,1)[0])}
 $('cvt').textContent='Night '+G.rd+' - Vote on a Curse';$('cvc').innerHTML='';
 picks.forEach((c,ix)=>{const pos=c[2]=='p',col=pos?'#6fe39a':'#ff5a6a',b=document.createElement('button');b.className='card';b.style.borderColor=col;
  b.innerHTML=`<b style='color:${col}'>${ix+1}. ${c[1]}</b><small style='color:${col}'>${pos?'BLESSING':'CURSE'}</small><small>${c[3]}</small>`;
  b.onclick=()=>{takeCurse(c);$('cv').classList.remove('on');G.state='run';last=performance.now()};$('cvc').appendChild(b)});
 $('cv').classList.add('on')}
function levelUp(){G.state='pause';G.rg.push({x:G.p.x,y:G.p.y,r:10,t:.5,c:'#ffd24a',big:1});sx('l',600,.25,'triangle',.06);
 const nw=Object.keys(G.L).length,np=Object.keys(G.P).length;
 const evo=Object.keys(G.L).filter(k=>G.L[k]>=8&&!G.ev[k]&&pv(EV[k])>=1).map(k=>({id:k,n:'Awakened '+nm(k),t:'e',d:'Evolution: +3 levels and +30% damage.',c:'#ffd24a'}));
 const bag=ITEMS.filter(i=>(!i.ex||i.ex==M.ch)&&(i.t=='w'?(G.L[i.id]?G.L[i.id]<i.max:nw<7+U('wslot')):(G.P[i.id]?G.P[i.id]<i.max:np<6+U('slot')))),wt=i=>i.t=='w'&&!G.L[i.id]&&i.ex?3:i.t=='w'&&!G.L[i.id]&&nw>=5?Math.pow(.3,nw-4):1,pool=[];
 while(pool.length<3&&bag.length){let r=Math.random()*bag.reduce((s,i)=>s+wt(i),0),ix=0;for(;ix<bag.length-1;ix++){r-=wt(bag[ix]);if(r<=0)break}pool.push(bag.splice(ix,1)[0])}
 const picks=[...evo.slice(0,1),...pool].slice(0,3);
 const fill=[{id:'heal',n:'Roast Chicken',t:'f',d:'Heal 40% HP.',c:'#ff8f6f'},{id:'gold',n:'Gold Pouch',t:'f',d:'+60 bonus gold.',c:'#ffd24a'}];
 while(picks.length<3)picks.push(fill[picks.length%2]);
 $('cards').innerHTML='';
 picks.forEach((i,ix)=>{const cur=i.t=='w'?G.L[i.id]||0:i.t=='p'?pv(i.id):0,b=document.createElement('button');b.className='card';b.style.borderColor=i.c;
  b.innerHTML=`<b style="color:${i.c}">${ix+1}. ${i.n}</b><small>${i.t=='f'?'Bonus':i.t=='e'?'EVOLUTION':(i.t=='w'?(i.ex?'Signature weapon ':'Weapon '):i.ab?'Ability ':i.ds?'Dash upgrade ':'Passive ')+(cur?'Lv '+cur+' to '+(cur+1):'NEW')}</small><small>${i.d}</small>${i.t=='w'?`<small style="color:#ffd24a">Evolves with ${nm(EV[i.id])}</small>`:''}`;
  b.onclick=()=>{if(i.t=='w')G.L[i.id]=cur+1;else if(i.t=='e')G.ev[i.id]=1;else if(i.t=='p'){G.P[i.id]=cur+1;
    if(i.id=='heart'){G.p.mhp+=25;G.p.hp=Math.min(G.p.mhp,G.p.hp+25)}if(i.id=='titan'){const a=Math.round(G.p.mhp*.25);G.p.mhp+=a;G.p.hp+=a}}
   else if(i.id=='heal')G.p.hp=Math.min(G.p.mhp,G.p.hp+G.p.mhp*.4);else G.bonus+=60;
   $('lvl').classList.remove('on');G.state='run';last=performance.now()};$('cards').appendChild(b)});
 $('rr').textContent=`Reroll (${G.rr})`;$('rr').disabled=G.rr<1;$('rr').onclick=()=>{G.rr--;levelUp()};$('sk').onclick=()=>{G.bonus+=25;$('lvl').classList.remove('on');G.state='run';last=performance.now()};
 $('lvl').classList.add('on')}
function finish(){if(G.state=='over')return;G.state='over';bank();M.runs++;M.tk+=G.kills;M.hist.unshift({rd:G.rd,t:Math.round(G.t),k:G.kills,c:CH[M.ch].n,d:DIF[M.set.diff].n});M.hist.length=Math.min(M.hist.length,8);save();['pb','db','sb','ub'].forEach(i=>$(i).classList.remove('on'));
 $('et').textContent='You fell on Night '+G.rd;
 $('es').innerHTML=`Time ${fmt(G.t)} | Kills ${G.kills} | Level ${G.lv} | Bosses ${G.bossK}<br>+${G.banked} gold earned (total ${M.gold})${G.rd>=M.best.rd&&G.rd>1?'<br><b style="color:#ffd24a">Best Night so far!</b>':''}`;$('einfo').innerHTML=info();$('end').classList.add('on')}
function mk(T,x,y,el,sm,hm){const h=T.n=='cloaker'?1:T.hp*hpS()*(el?10:1)*(hm||1),cn=!sm&&T.n!='goblin'?1:0;G.rS+=cn;G.rg.push({x,y,r:T.r,t:.35,c:T.c});G.en.push({cn,n:T.n,x,y,hp:h,mhp:h,sp:T.sp,r:T.r*(el?1.5:1)*(sm?.7:1),c:T.c,dm:T.dm,xp:T.xp*(el?5:1),bh:0,f:0,ph:rnd(0,6),el,sm,slow:0,a:0,sg:.6})}
const rQ=()=>Math.round(Math.min(600,(70+G.rd*25)*.9)*DIF[M.set.diff].q*(MD('horde')?2:1)*cmv('quota'));
const SD=()=>Math.max(Math.hypot(W,H)/2+60,520);
function spawn(){G.rN++;const a=rnd(0,6.283),d=SD(),av=ET.filter(t=>t.from<=G.rd);let w=rnd(0,av.reduce((s,t)=>s+t.w,0)),Tp=av[0];
 for(const t of av){if((w-=t.w)<=0){Tp=t;break}}mk(Tp,G.p.x+Math.cos(a)*d,G.p.y+Math.sin(a)*d,G.rd>=2&&Math.random()<.04*DIF[M.set.diff].el)}
function boss(){const a=rnd(0,6.283),n=G.rd/3,hp=400*(1+G.rd)*(1+G.rd*.35)*DIF[M.set.diff].hp*cmv('bossHp'),k=n%5;
 G.en.push({n:'boss',x:G.p.x+Math.cos(a)*SD(),y:G.p.y+Math.sin(a)*SD(),hp,mhp:hp,sp:55,r:34,c:['#7a1030','#30507a','#4a2a6a','#3a6a20','#7a5a10'][k],dm:25,xp:40,bh:0,f:0,ph:0,boss:1,bk:k,slow:0,a:0,tm:3});const bn=['Hellfire Lord','Rampaging Brute','Necro Summoner','Spiral Seer','Chaos Titan'][k];toast(bn+' approaches!');G.banner={t:3.2,txt:bn.toUpperCase(),col:'#ff3050'};bossSting();G.shk=Math.max(G.shk,16);G.flash=Math.max(G.flash,.3)}
function swarm(){toast('Swarm incoming!');for(let i=0;i<36;i++){const a=i*6.283/36;mk(ET[2],G.p.x+Math.cos(a)*SD(),G.p.y+Math.sin(a)*SD(),0)}}
function champ(){const av=ET.filter(t=>t.from<=G.rd&&t.n!='goblin'&&t.hp<100),T=av[Math.floor(rnd(0,av.length))],a=rnd(0,6.28);toast('A champion has arrived!');mk(T,G.p.x+Math.cos(a)*SD(),G.p.y+Math.sin(a)*SD(),1,0,1.2)}
function goblin(){toast('A treasure goblin appeared! Catch it!');const a=rnd(0,6.28);mk(ET.find(t=>t.n=='goblin'),G.p.x+Math.cos(a)*SD(),G.p.y+Math.sin(a)*SD(),0,0,3)}
function drop(x,y,k,v){G.gm.push({x,y,v:v||0,k})}
function die(e){e.dead=1;G.kills++;if(e.cn)G.rK++;if(cma('boom')&&Math.random()<cma('boom')){G.rg.push({x:e.x,y:e.y,r:10,t:.3,c:'#ff6a3a',big:1});if(Math.hypot(e.x-G.p.x,e.y-G.p.y)<70)hurt(10)}if(!G.ult&&!G.mode)G.uk+=1+pv('siphon')*.3;if(e.n=='goblin'){if(Math.random()<.5)drop(e.x,e.y,'c');G.bonus+=40}if(e.n=='bomber'){G.rg.push({x:e.x,y:e.y,r:10,t:.35,c:'#ff8a3a',big:1});if(Math.hypot(e.x-G.p.x,e.y-G.p.y)<64)hurt(e.dm*1.5,0,e)}drop(e.x,e.y,'x',e.xp*.6);sx('k',120,.06,'triangle',.03);
 if(M.set.fx){for(let i=0;i<8;i++)G.pt.push({x:e.x,y:e.y,vx:rnd(-140,140),vy:rnd(-140,140),l:.5,c:e.c,s:3});G.rg.push({x:e.x,y:e.y,r:e.r*.6,t:.25,c:e.c})}
 if(e.boss){G.bossK++;G.shk=14;G.flash=.3;for(let i=0;i<8;i++)drop(e.x+Math.cos(i)*34,e.y+Math.sin(i)*34,'x',15);if(Math.random()<.5)drop(e.x,e.y+20,'c');if(Math.random()<.4)drop(e.x+30,e.y+20,'m');sx('B',70,.5,'sawtooth',.08)}
 else{if(e.el){if(Math.random()<.25)drop(e.x,e.y,'c')}else{const r=Math.random();if(r<.004)drop(e.x+8,e.y,'h');else if(r<.00425)drop(e.x-8,e.y,'m');else if(r<.00625)drop(e.x,e.y+8,'b')}
  if(e.n=='slime'&&!e.sm)for(let i=0;i<2;i++){mk(ET[4],e.x+rnd(-12,12),e.y+rnd(-12,12),0,1,.5)}}
 if(pv('vamp')&&Math.random()<.02*pv('vamp'))G.p.hp=Math.min(G.p.mhp,G.p.hp+2)}
function hit(e,d,src){if(e.dead)return;const c=Math.random()<critC();if(c)d*=2+pv('crit')*.25;if((e.boss||e.el)&&(pv('slayer')||U('bhunt')))d*=1+.2*pv('slayer')+.05*U('bhunt');e.hp-=d;if(e.n=='cloaker')e.hp=0;if(!e.boss&&e.hp<e.mhp*.04*pv('exec'))e.hp=0;if(pv('chill')&&Math.random()<(M.ch=='rukia'?.3:.15)*pv('chill'))e.slow=Math.max(e.slow,M.ch=='rukia'?2.5:1.2);if(pv('frostbrand')&&Math.random()<.18*pv('frostbrand'))e.slow=Math.max(e.slow,1.6);if(src=='sode'){G.sodeC=(G.sodeC||0)+1;if(G.sodeC%5==0){e.slow=Math.max(e.slow,5);G.fx.push({x:e.x,y:e.y-e.r-6,v:'FROZEN',c:0,t:.8});sx('fz',300,.2,'sine',.05)}}if(pv('burn')&&src!='burn')e.burn=3;if(pv('knock')&&!e.boss){const kd=Math.hypot(e.x-G.p.x,e.y-G.p.y)||1;e.x+=(e.x-G.p.x)/kd*4*pv('knock');e.y+=(e.y-G.p.y)/kd*4*pv('knock')}e.f=.08;G.dd[src]=(G.dd[src]||0)+d;
 if(M.set.num&&G.fx.length<80)G.fx.push({x:e.x+rnd(-6,6),y:e.y-e.r,v:fmtN(d),c,t:.6});
 if(M.set.fx)for(let i=0;i<2;i++)G.pt.push({x:e.x,y:e.y,vx:rnd(-80,80),vy:rnd(-80,80),l:.3,c:e.c,s:2});
 sx('h',170+Math.random()*60,.04,'square',.02);if(e.hp<=0)die(e)}
function hurt(d,pct,src){if(window.__GOD)return;const p=G.p;if(p.inv>0)return;
 if(M.ch=='gojo'&&G.L&&G.L.void>=8&&src&&!src.boss&&!src.el){p.inv=.35;G.fx.push({x:p.x+rnd(-8,8),y:p.y-16,v:'∞',c:0,t:.6});sx('inf',900,.12,'sine',.05);return}
 if(M.ch=='goku'&&Math.random()<.35){p.inv=.3;G.fx.push({x:p.x,y:p.y-14,v:'Dodge',c:0,t:.6});return}if(pv('dodge')&&Math.random()<.06*pv('dodge')){p.inv=.35;G.fx.push({x:p.x,y:p.y-14,v:'Dodge',c:0,t:.6});return}
 if(G.shOn){G.shOn=0;G.shT=30-4*pv('shield');p.inv=.6;G.rg.push({x:p.x,y:p.y,r:10,t:.4,c:'#8ff',big:1});sx('s',500,.15,'sine',.05);return}
 {const dm0=pct?Math.max(1,Math.round(p.mhp*pct*cmv('dmgIn'))):Math.max(1,Math.round(d*dmgIn()-pv('armor')-cma('armor')-U('arm')-(TR().arm||0)-mx('arm')));p.hp-=Math.min(dm0,Math.max(1,Math.round(p.mhp*DIF[M.set.diff].cap)))}p.inv=Math.max(.15,.5+cma('inv'));G.shk=Math.max(G.shk,5);sx('d',90,.15,'sawtooth',.06);
 if(pv('thorns'))G.en.forEach(e=>{if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<80)hit(e,(12+pv('thorns')*14)*dmgM(),'thorns')})}
function dash(){if(!G||G.state!='run'||G.ult||G.p.ch<1)return;const p=G.p;p.ch--;if(p.dc<=0)p.dc=dcd();p.dt=.18+pv('swift')*.04;p.inv=Math.max(p.inv,.25+pv('swift')*.12);p.dh=new Set();sx('x',300,.1,'triangle',.05);
 if(pv('nova2'))G.nv.push({x:p.x,y:p.y,r:10,R:(110+20*pv('nova2'))*areaM(),d:(18+14*pv('nova2'))*dmgM(),hit:new Set(),src:'dash'});
 if(pv('grav'))G.gm.forEach(g=>g.pull=1);if(pv('surge'))G.boost=3}
function near(x,y,n){return G.en.filter(e=>!e.dead).map(e=>[(e.x-x)**2+(e.y-y)**2,e]).sort((a,b)=>a[0]-b[0]).slice(0,n).map(a=>a[1])}
function cd(k,base,dt){G.tm[k]=(G.tm[k]??0)-dt;if(G.tm[k]<=0){G.tm[k]=base*cdM();return true}return false}
function update(dt){const p=G.p;G.t+=dt;
 const L={};for(const k in G.L)L[k]=G.L[k]+(G.ev[k]?3:0)+(G.mode?1:0);
 if(G.rN>=rQ()&&G.rK>=Math.ceil(G.rS*.9)&&!G.en.some(e=>e.boss&&!e.dead)){const rd=G.rd+1;G.rd=rd;G.rS=0;G.rK=0;G.rN=0;G.ban=3.5;G.rr=rrMax();toast('Night cleared! Rerolls restored');p.hp=Math.min(p.mhp,p.hp+p.mhp*Math.max(0,.08+cma('nheal'))*DIF[M.set.diff].nh);G.vote=rd>=5?1:0;if(rd%3==0){boss();G.shk=10}if(rd%5==0)swarm();if(rd%8==2)goblin();if(rd%3!=0&&rd>=2)champ();for(let i=0;i<cma('champ')+DIF[M.set.diff].xc;i++)champ();bank()}
 G.ban-=dt;G.shk=Math.max(0,G.shk-dt*30);G.flash=Math.max(0,G.flash-dt);G.bk-=dt;if(G.bk<=0){bank();G.bk=5}
 if(G.banner){G.banner.t-=dt;if(G.banner.t<=0)G.banner=null}
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(joy){dx=joy.dx;dy=joy.dy}let l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;l=1}G.mv=l>.1;if(l>.1){G.lx=dx/l;G.ly=dy/l}if(dx)p.face=dx>0?1:-1;
 if(G.ult){const u=G.ult,D=ULT[M.ch];u.t+=dt;p.inv=Math.max(p.inv,.5);if(M.set.fx&&Math.random()<.9)G.pt.push({x:p.x+rnd(-70,70),y:p.y+rnd(-8,20),vx:0,vy:rnd(-130,-40),l:.8,c:D.c,s:3});if(u.t>=10)ultFinish()}
 if(G.mode){G.mode.t-=dt;for(const k in G.ac)if(G.ac[k]>0)G.ac[k]-=dt;if(G.mode.t<=0){G.mode=null;toast('Ultimate mode ended')}}
 p.cm=1+pv('twin')+U('dch')+cma('dash');if(p.ch<p.cm){p.dc-=dt;if(p.dc<=0){p.ch++;p.dc=p.ch<p.cm?dcd():0}}else p.dc=0;p.dt-=dt;G.boost-=dt;G.cry-=dt;G.freeze-=dt;for(const k in G.ac)if(G.ac[k]>0)G.ac[k]-=dt;let spd=(G.ult?0:1)*(G.mode?1.15:1)*cmv('spd')*(G.cry>0?1.25:1)*140*CH[M.ch].sp*(1+pv('boots')*.12)*(1+U('spd')*.04)*(1+(G.bnk||0)*.06);
 if(p.dt>0){spd*=3.2;if(l<.1){dx=G.lx;dy=G.ly}}
 p.x+=dx*spd*dt;p.y+=dy*spd*dt;
 if(p.dt>0){if(pv('shadow'))G.en.forEach(e=>{if(!e.dead&&!p.dh.has(e)&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+16){p.dh.add(e);hit(e,(20+16*pv('shadow'))*dmgM(),'dash');e.slow=1}});
  if(pv('trail')){p.tr-=dt;if(p.tr<=0){p.tr=.05;G.pl.push({x:p.x,y:p.y,R:22,t:2+.4*pv('trail'),tk:0,d:(8+7*pv('trail'))*dmgM(),hot:1,src:'dash'})}}}p.hp=Math.min(p.mhp,p.hp+(pv('regen')*.6+U('regen')*.25+(TR().reg||0)*.6+mx('reg')+cma('regen'))*dt);p.inv-=dt;
 if(pv('shield')&&!G.shOn){G.shT-=dt;if(G.shT<=0)G.shOn=1}
 G.sp-=dt;if(G.sp<=0&&!G.ult){const n=Math.max(1,Math.round((2+Math.floor(G.rd*1.1))*DIF[M.set.diff].q*(MD('horde')?2:1)*cmv('spawn')));for(let i=0;i<n&&G.rN<rQ()&&G.en.length<300+G.rd*25+(MD('horde')?150:0);i++)spawn();G.sp=Math.max(.08,.7-G.rd*.05)}
 const dm=dmgM(),ar=areaM(),dw=k=>dm*(G.ev[k]?1.3:1);
 if(L.bolt&&cd('bolt',1-.04*L.bolt,dt)){const n=1+(L.bolt>>1);near(p.x,p.y,n).forEach(e=>{const a=Math.atan2(e.y-p.y,e.x-p.x);
  G.sh.push({k:'b',src:'bolt',x:p.x,y:p.y,vx:Math.cos(a)*400,vy:Math.sin(a)*400,d:(8+L.bolt*4)*dw('bolt'),pi:1+Math.floor(L.bolt/3),life:1.6,hit:new Map(),r:5*ar})});sx('b',520,.05,'sine',.02)}
 if(L.void&&cd('void',1.4-.05*L.void,dt)){const n=1+(L.void>>1);near(p.x,p.y,n).forEach(e=>{const a=Math.atan2(e.y-p.y,e.x-p.x);G.sh.push({k:'b',src:'void',x:p.x,y:p.y,vx:Math.cos(a)*340,vy:Math.sin(a)*340,d:(14+L.void*7)*dw('void'),pi:4+L.void,life:1.8,hit:new Map(),r:8*ar});G.nv.push({x:e.x,y:e.y,r:10,R:(70+6*L.void)*ar,d:(10+L.void*5)*dw('void'),hit:new Set(),src:'void'});G.en.forEach(o=>{if(!o.dead&&!o.boss&&Math.hypot(o.x-e.x,o.y-e.y)<(110+4*L.void)*ar){o.x+=(e.x-o.x)*.5;o.y+=(e.y-o.y)*.5}})});sx('b',300,.12,'sine',.03)}
 if(L.punch&&cd('pn',1.1-.05*L.punch,dt)){near(p.x,p.y,1+(L.punch>>2)).forEach(t=>{const a=Math.atan2(t.y-p.y,t.x-p.x),len=(220+14*L.punch)*ar,wd=(24+2*L.punch)*ar,d=(26+10*L.punch)*dw('punch');G.en.forEach(e=>{if(e.dead)return;const rx=e.x-p.x,ry=e.y-p.y,al=rx*Math.cos(a)+ry*Math.sin(a),pe=Math.abs(-rx*Math.sin(a)+ry*Math.cos(a));if(al>-10&&al<len+e.r&&pe<wd+e.r){hit(e,d,'punch');if(!e.boss){e.x+=Math.cos(a)*28;e.y+=Math.sin(a)*28}}});G.ps.push({x:p.x,y:p.y,a,len,w:wd,t:.2,m:.2,c:'#ffb040'})});sx('pn',140,.1,'square',.05)}
 if(L.bagua&&cd('bg',2-.08*L.bagua,dt)){const t=near(p.x,p.y,1)[0];if(t){const a=Math.atan2(t.y-p.y,t.x-p.x),R=(170+16*L.bagua)*ar,sp=1+(G.mode?.4:0),d=(30+12*L.bagua)*dw('bagua');G.en.forEach(e=>{if(e.dead)return;const rx=e.x-p.x,ry=e.y-p.y,dist=Math.hypot(rx,ry);if(dist<R+e.r){let da=Math.abs(Math.atan2(ry,rx)-a);if(da>Math.PI)da=6.283-da;if(da<sp){hit(e,d,'bagua');if(!e.boss){e.x+=rx/(dist||1)*25;e.y+=ry/(dist||1)*25}}}});G.ps.push({k:'arc',x:p.x,y:p.y,a,len:R,sp,t:.25,m:.25,c:'#ff8a2a'});G.shk=Math.max(G.shk,3);sx('bg',120,.12,'sawtooth',.05)}}
 if(G.mode&&M.ch=='kaido'){G.kc=(G.kc||0)-dt;if(G.kc<=0){G.kc=.04;G.kt.unshift({x:p.x,y:p.y});if(G.kt.length>44)G.kt.pop()}if(cd('drg',.35,dt))G.en.forEach(e=>{if(!e.dead&&(e.x-p.x)**2+(e.y-p.y)**2<(110*ar+e.r)**2)hit(e,dm*(14+G.lv*1.2),'bagua')})}
 if(L.blades){G.ang=(G.ang||0)+dt*(3+L.blades*.3);const n=1+Math.ceil(L.blades*.7),R=(60+L.blades*4)*ar;G.bl=[];
  for(let i=0;i<n;i++){const a=G.ang+i*6.283/n,bx=p.x+Math.cos(a)*R,by=p.y+Math.sin(a)*R;G.bl.push([bx,by,a]);
   G.en.forEach(e=>{if(!e.dead&&G.t>e.bh&&(e.x-bx)**2+(e.y-by)**2<(e.r+12*ar)**2){hit(e,(7+L.blades*3)*dw('blades'),'blades');e.bh=G.t+.35}})}}
 if(L.aura){G.ar=(55+L.aura*10)*ar;if(cd('aura',.5,dt))G.en.forEach(e=>{if(!e.dead&&(e.x-p.x)**2+(e.y-p.y)**2<(G.ar+e.r)**2){hit(e,(4+L.aura*2.5)*dw('aura'),'aura');e.slow=.6}})}
 if(L.storm&&cd('st',2.4-.1*L.storm,dt)){G.en.filter(e=>!e.dead&&Math.abs(e.x-p.x)<W/2&&Math.abs(e.y-p.y)<H/2).sort(()=>Math.random()-.5).slice(0,1+L.storm).forEach(e=>{
  G.en.forEach(o=>{if(!o.dead&&(o.x-e.x)**2+(o.y-e.y)**2<(30*ar)**2)hit(o,(22+L.storm*9)*dw('storm'),'storm')});G.fx.push({k:'l',x:e.x,y:e.y,t:.25});sx('z',90,.2,'sawtooth',.05)})}
 if(L.axe&&cd('axe',1.4-.05*L.axe,dt)){const n=1+(L.axe>>1);for(let i=0;i<n;i++)G.sh.push({k:'a',src:'axe',x:p.x,y:p.y,vx:rnd(-110,110)+(i-n/2)*40,vy:-330-rnd(0,60),d:(14+5*L.axe)*dw('axe'),pi:99,life:2.4,hit:new Map(),r:11*ar,rot:0})}
 if(L.nova&&cd('nv',3.6-.2*L.nova,dt))G.nv.push({x:p.x,y:p.y,r:10,R:(110+15*L.nova)*ar,d:(10+4*L.nova)*dw('nova'),hit:new Set()});
 G.nv.forEach(n=>{n.r+=300*dt;G.en.forEach(e=>{if(!e.dead&&!n.hit.has(e)){const d=Math.hypot(e.x-n.x,e.y-n.y);if(d<n.r+e.r&&d>n.r-30-e.r){n.hit.add(e);if(n.d)hit(e,n.d,n.src||'nova');if(n.src=='heartwave'){if(!e.boss)e.charmed=3}else e.slow=1.5}}})});G.nv=G.nv.filter(n=>n.r<n.R);
 if(L.scythe&&cd('sc',2.2-.08*L.scythe,dt)){const n=1+(L.scythe>>2),t=near(p.x,p.y,1)[0],a0=t?Math.atan2(t.y-p.y,t.x-p.x):rnd(0,6.28);
  for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.5;G.sh.push({k:'s',src:'scythe',x:p.x,y:p.y,vx:Math.cos(a)*320,vy:Math.sin(a)*320,d:(12+5*L.scythe)*dw('scythe'),pi:999,life:4,hit:new Map(),r:16*ar,rot:0,ph:0,tt:.7})}}
 if(L.meteor&&cd('mt',3-.12*L.meteor,dt)){const n=1+(L.meteor>>2);G.en.filter(e=>!e.dead&&Math.abs(e.x-p.x)<W/2&&Math.abs(e.y-p.y)<H/2).sort(()=>Math.random()-.5).slice(0,n).forEach(e=>G.mt.push({x:e.x,y:e.y,t:.9,t0:.9,R:(46+3*L.meteor)*ar,d:(25+9*L.meteor)*dw('meteor')}))}
 G.mt.forEach(m=>{m.t-=dt;if(m.t<=0){m.dead=1;G.en.forEach(e=>{if(!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<m.R+e.r)hit(e,m.d,'meteor')});G.rg.push({x:m.x,y:m.y,r:10,t:.4,c:'#ff8a3a',big:1,R:m.R});G.shk=Math.max(G.shk,4);sx('m',60,.25,'sawtooth',.06);
  if(M.set.fx)for(let i=0;i<12;i++)G.pt.push({x:m.x,y:m.y,vx:rnd(-200,200),vy:rnd(-200,200),l:.5,c:'#ffa040',s:4})}});G.mt=G.mt.filter(m=>!m.dead);
 if(L.lance&&cd('ln',1.6-.06*L.lance,dt)){const dirs=[[G.lx,G.ly]];if(L.lance>=5)dirs.push([-G.lx,-G.ly]);if(L.lance>=8){dirs.push([-G.ly,G.lx],[G.ly,-G.lx])}
  dirs.forEach(d=>G.sh.push({k:'n',src:'lance',x:p.x,y:p.y,vx:d[0]*720,vy:d[1]*720,d:(16+6*L.lance)*dw('lance'),pi:99,life:.45,hit:new Map(),r:9*ar}));sx('n',700,.06,'triangle',.03)}
 if(L.pools&&cd('pl',2.5-.1*L.pools,dt)){const n=1+(L.pools>>2);for(let i=0;i<n;i++){const t=near(p.x,p.y,3)[Math.floor(rnd(0,3))],a=rnd(0,6.28),r=rnd(40,140);
  G.pl.push({x:t?t.x:p.x+Math.cos(a)*r,y:t?t.y:p.y+Math.sin(a)*r,R:(34+3*L.pools)*ar,t:3+.2*L.pools,tk:0,d:(6+3*L.pools)*dw('pools')})}}
 G.pl.forEach(o=>{o.t-=dt;o.tk-=dt;if(o.tk<=0){o.tk=.5;G.en.forEach(e=>{if(!e.dead&&Math.hypot(e.x-o.x,e.y-o.y)<o.R+e.r){hit(e,o.d,o.src||'pools');e.slow=.8}})}});G.pl=G.pl.filter(o=>o.t>0);
 if(L.wisps&&cd('wi',1.8-.07*L.wisps,dt)){const n=1+(L.wisps>>1);for(let i=0;i<n;i++){const a=rnd(0,6.28);G.sh.push({k:'w',src:'wisps',x:p.x,y:p.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,d:(7+3.5*L.wisps)*dw('wisps'),pi:1+(L.wisps>>2),life:3.2,hit:new Map(),r:6*ar})}}
 if(L.whip&&cd('wh',1.0-.05*L.whip,dt)){const R=(115+L.whip*9)*ar,Wd=(32+L.whip*2.5)*ar,ts=near(p.x,p.y,L.whip>=5?2:1),sides=ts.length?ts.map(t=>Math.atan2(t.y-p.y,t.x-p.x)):[p.face>0?0:Math.PI];if(L.whip>=5&&ts.length==1)sides.push(sides[0]+Math.PI);if(L.whip>=8)sides.push(sides[0]+Math.PI/2,sides[0]-Math.PI/2);
  sides.forEach(a=>{const ca=Math.cos(a),sa=Math.sin(a);G.en.forEach(e=>{if(e.dead)return;const dx=e.x-p.x,dy=e.y-p.y,al=dx*ca+dy*sa,pe=Math.abs(-dx*sa+dy*ca);if(al>-e.r&&al<R+e.r&&pe<Wd+e.r)hit(e,(16+7*L.whip)*dw('whip'),'whip')});G.fx.push({k:'wh',x:p.x,y:p.y,a,R,Wd,t:.18})});sx('w',260,.08,'sawtooth',.03)}
 if(L.zangetsu&&cd('zg',1.2-.06*L.zangetsu,dt)){const t=near(p.x,p.y,1)[0],a=t?Math.atan2(t.y-p.y,t.x-p.x):(p.face>0?0:Math.PI),bk=G.bnk||0;
  const R=(130+14*L.zangetsu+bk*34)*ar,d=(24+9*L.zangetsu+bk*16)*dw('zangetsu');
  G.en.forEach(e=>{if(e.dead)return;const rx=e.x-p.x,ry=e.y-p.y,dist=Math.hypot(rx,ry);if(dist<R+e.r){let da=Math.abs(Math.atan2(ry,rx)-a);if(da>Math.PI)da=6.283-da;if(da<.95){hit(e,d,'zangetsu');if(!e.boss){e.x+=rx/(dist||1)*30;e.y+=ry/(dist||1)*30}}}});
  G.ps.push({k:'arc',x:p.x,y:p.y,a,len:R,sp:.95,t:.32,m:.32,c:bk>=1?'#14141c':'#e8e8f0'});G.shk=Math.max(G.shk,2);sx('zg',180,.09,'sawtooth',.05)}
 if(L.slam&&cd('sl',2.2-.1*L.slam,dt)){const R=(150+18*L.slam)*ar,d=(30+12*L.slam)*dw('slam');G.nv.push({x:p.x,y:p.y,r:10,R,d,hit:new Set(),src:'slam'});G.en.forEach(e=>{if(!e.dead&&!e.boss&&Math.hypot(e.x-p.x,e.y-p.y)<R+e.r){const kd=Math.hypot(e.x-p.x,e.y-p.y)||1;e.x+=(e.x-p.x)/kd*46;e.y+=(e.y-p.y)/kd*46}});G.rg.push({x:p.x,y:p.y,r:24,t:.5,c:'#ffb0d0',big:1});G.shk=Math.max(G.shk,6);sx('sl',70,.25,'sawtooth',.08)}
 if(L.sode&&cd('so',1.6-.06*L.sode,dt)){const n=2+(L.sode>>1);near(p.x,p.y,n).forEach(e=>{const a=Math.atan2(e.y-p.y,e.x-p.x);G.sh.push({k:'i',src:'sode',x:p.x,y:p.y,vx:Math.cos(a)*380,vy:Math.sin(a)*380,d:(12+5*L.sode)*dw('sode'),pi:3+L.sode,life:1.4,hit:new Map(),r:7*ar})});sx('so',700,.06,'triangle',.03)}
 if(L.heartwave&&cd('hw',2.0-.08*L.heartwave,dt)){const R=(170+16*L.heartwave)*ar;G.nv.push({x:p.x,y:p.y,r:10,R,d:(22+9*L.heartwave)*dw('heartwave'),hit:new Set(),src:'heartwave'});G.rg.push({x:p.x,y:p.y,r:16,t:.45,c:'#ff8ab8',big:1});sx('hw',240,.18,'sine',.06)}
 if(L.shards&&cd('sd',2.4-.08*L.shards,dt)){const n=6+L.shards,o=rnd(0,6.28);for(let i=0;i<n;i++){const a=o+i*6.283/n;G.sh.push({k:'i',src:'shards',x:p.x,y:p.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,d:(9+4*L.shards)*dw('shards'),pi:2+(L.shards>>2),life:.9+L.shards*.03,hit:new Map(),r:6*ar})}sx('i',800,.06,'triangle',.03)}
 if(L.saw&&cd('sw',4-.15*L.saw,dt)){const n=1+(L.saw>>2);for(let i=0;i<n;i++){const a=rnd(0,6.28);G.sh.push({k:'r',src:'saw',x:p.x,y:p.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,d:(11+5*L.saw)*dw('saw'),pi:9999,life:5+.3*L.saw,hit:new Map(),r:14*ar,rot:0})}}
 if(L.chain&&cd('chn',1.8-.07*L.chain,dt)){let t=near(p.x,p.y,1)[0];if(t){const pts=[[p.x,p.y]],seen=new Set();for(let j=0;j<2+L.chain&&t;j++){seen.add(t);pts.push([t.x,t.y]);hit(t,(10+4*L.chain)*dw('chain')*Math.pow(.88,j),'chain');const cur=t;t=G.en.filter(e=>!e.dead&&!seen.has(e)&&Math.hypot(e.x-cur.x,e.y-cur.y)<150).sort((a,b)=>Math.hypot(a.x-cur.x,a.y-cur.y)-Math.hypot(b.x-cur.x,b.y-cur.y))[0]}G.fx.push({k:'ch',pts,t:.2});sx('c',900,.05,'sawtooth',.03)}}
 if(L.mines&&cd('mn',2.2-.08*L.mines,dt)&&G.mn.length<4+(L.mines>>1))G.mn.push({x:p.x,y:p.y,t:0,R:(50+4*L.mines)*ar,d:(30+10*L.mines)*dw('mines')});
 G.mn.forEach(m=>{m.t+=dt;if(m.t>.6&&G.en.some(e=>!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<e.r+14)){m.dead=1;G.en.forEach(e=>{if(!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<m.R+e.r)hit(e,m.d,'mines')});G.rg.push({x:m.x,y:m.y,r:8,t:.35,c:'#ff7a3a',big:1});G.shk=Math.max(G.shk,3);sx('m',70,.2,'sawtooth',.05)}});G.mn=G.mn.filter(m=>!m.dead);
 if(L.turret&&cd('tu',5-.2*L.turret,dt)&&G.tu.length<1+(L.turret>>1)){const a=rnd(0,6.28);G.tu.push({x:p.x+Math.cos(a)*40,y:p.y+Math.sin(a)*40,t:10+L.turret,fc:0})}
 G.tu.forEach(u=>{u.t-=dt;u.fc-=dt;if(u.fc<=0){const t=near(u.x,u.y,1)[0];if(t){u.fc=.5-.02*L.turret;const a=Math.atan2(t.y-u.y,t.x-u.x);u.a=a;G.sh.push({k:'b',src:'turret',x:u.x,y:u.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,d:(6+3*L.turret)*dw('turret'),pi:1+(L.turret>>2),life:1.2,hit:new Map(),r:4*ar})}else u.fc=.2}});G.tu=G.tu.filter(u=>u.t>0);
 G.sh.forEach(s=>{if(s.k=='r'){if(Math.abs(s.x-p.x)>W/2-30)s.vx=-Math.sign(s.x-p.x)*Math.abs(s.vx);if(Math.abs(s.y-p.y)>H/2-30)s.vy=-Math.sign(s.y-p.y)*Math.abs(s.vy);s.rot+=dt*20}if(s.k=='a'){s.vy+=700*dt;s.rot+=dt*14}
  if(s.k=='s'){s.rot+=dt*16;if(s.ph==0){s.tt-=dt;if(s.tt<=0)s.ph=1}else{const a=Math.atan2(p.y-s.y,p.x-s.x);s.vx=Math.cos(a)*380;s.vy=Math.sin(a)*380;if(Math.hypot(p.x-s.x,p.y-s.y)<16)s.life=0}}
  if(s.k=='w'){const t=near(s.x,s.y,1)[0];if(t){const a=Math.atan2(t.y-s.y,t.x-s.x),c=Math.atan2(s.vy,s.vx);let da=a-c;da=Math.atan2(Math.sin(da),Math.cos(da));const n=c+clamp(da,-6*dt,6*dt);s.vx=Math.cos(n)*240;s.vy=Math.sin(n)*240}
   if(M.set.fx&&Math.random()<.5)G.pt.push({x:s.x,y:s.y,vx:0,vy:0,l:.3,c:'#5fe0c0',s:3})}
  if(s.k=='b'&&M.set.fx&&Math.random()<.5)G.pt.push({x:s.x,y:s.y,vx:0,vy:0,l:.25,c:'#c9a0ff',s:3});
  s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
  G.en.forEach(e=>{if(s.life>0&&!e.dead&&(!s.hit.has(e)||G.t>s.hit.get(e))&&(e.x-s.x)**2+(e.y-s.y)**2<(e.r+s.r)**2){s.hit.set(e,s.k=='a'||s.k=='s'||s.k=='r'?G.t+.45:1e9);hit(e,s.d,s.src);if(--s.pi+pv('pierce')+U('pierce')<=0)s.life=0}})});
 G.sh=G.sh.filter(s=>s.life>0);
 if(M.ch=='gojo'&&G.L.void>=8){G.infR=(110+(G.ev.void?40:0))*ar;
  G.en.forEach(e=>{if(e.dead||e.boss||e.el)return;const d=Math.hypot(e.x-p.x,e.y-p.y)||1;
   if(d<G.infR+e.r){e.x=p.x+(e.x-p.x)/d*(G.infR+e.r);e.y=p.y+(e.y-p.y)/d*(G.infR+e.r);e.slow=Math.max(e.slow,.4);
    if(!e.iT||G.t>e.iT+.3){e.iT=G.t+.3;hit(e,(10+G.L.void*4)*dmgM()*2,'infinity')}}})}
 else G.infR=0;
 const infOn=M.ch=='gojo'&&(G.L.void||0)>=8;
 if(infOn&&!G.infPrev){G.flash=Math.max(G.flash,.4);G.shk=Math.max(G.shk,10);toast('INFINITY online — weak enemies cannot harm you');bossSting()}
 G.infPrev=infOn;
 if(M.ch=='ichigo'){const t=G.kills>=1000?3:G.kills>=500?2:G.kills>=100?1:0;if(t>(G.bnk||0))bankaiFx(t);G.bnk=t}
 const sps=spS();if(G.ult)G.en.forEach(e=>e.slow=Math.max(e.slow,.3));
 G.en.forEach(e=>{if(e.burn>0&&!e.dead){e.burn-=dt;e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.5;hit(e,(2+pv('burn')*3)*dmgM(),'burn')}}if(G.ult){const q=Math.hypot(e.x-p.x,e.y-p.y)||1;if(q<300){e.x=p.x+(e.x-p.x)/q*300;e.y=p.y+(e.y-p.y)/q*300}e.f-=dt;return}if(e.charmed>0){e.charmed-=dt;e.f-=dt;e.sg-=dt;return}if(G.freeze>0)return;const ex=p.x-e.x,ey=p.y-e.y,dist=Math.hypot(ex,ey)||1,a=Math.atan2(ey,ex);e.a=a;e.slow-=dt;e.tm=(e.tm??rnd(1,3))-dt;let sp=e.sp*sps*(e.slow>0?.5:1),ma=a;
  if(e.n=='summoner'&&e.tm<=0){e.tm=4;for(let i=0;i<2;i++)mk(ET[0],e.x+rnd(-20,20),e.y+rnd(-20,20),0)}
  if(e.n=='wraith'&&e.tm<=0){e.tm=3;e.x+=Math.cos(a)*140;e.y+=Math.sin(a)*140;G.rg.push({x:e.x,y:e.y,r:6,t:.25,c:'#b090ff'})}
  if(e.n=='shaman'&&e.tm<=0){e.tm=3;G.en.forEach(o=>{if(!o.dead&&Math.hypot(o.x-e.x,o.y-e.y)<160)o.hp=Math.min(o.mhp,o.hp+o.mhp*.2)});G.rg.push({x:e.x,y:e.y,r:8,t:.4,c:'#6fe39a',big:1})}
  if(e.n=='goblin'){ma=a+Math.PI;sp=140;e.t2=(e.t2||0)+dt;if(e.t2>22)e.dead=1}
  if(e.n=='spit'||e.n=='cultist'||e.n=='archer'||e.n=='lich'){if(dist<240)sp=0;if(e.tm<=0){e.tm=2.6;G.ep.push({x:e.x,y:e.y,vx:Math.cos(a)*170,vy:Math.sin(a)*170,l:4,d:e.dm,src:e})}}
  else if(e.n=='charger'||e.n=='boar'||e.n=='stalker'||(e.boss&&e.bk==1)){if(e.tm<=0){e.dsh=e.boss?.9:.6;e.tm=e.boss?3.5:3;e.da=a}
   if(e.dsh>0){e.dsh-=dt;sp*=3.4;ma=e.da}else if(e.tm<.7)sp=0}
  else if(e.boss&&e.tm<=0){e.tm=e.bk==3?.35:3.5;if(e.bk==0||e.bk==4){for(let i=0;i<14;i++){const q=i*6.283/14+(e.bk==4?.2:0);G.ep.push({x:e.x,y:e.y,vx:Math.cos(q)*150,vy:Math.sin(q)*150,l:5,d:e.dm*.6,src:e})}}if(e.bk==2||e.bk==4){for(let i=0;i<5;i++)mk(ET[0],e.x+rnd(-50,50),e.y+rnd(-50,50),0)}if(e.bk==3){e.sa=(e.sa||0)+.5;for(let j=0;j<3;j++){const q=e.sa+j*2.094;G.ep.push({x:e.x,y:e.y,vx:Math.cos(q)*190,vy:Math.sin(q)*190,l:5,d:e.dm*.5,src:e})}}}
  e.x+=Math.cos(ma)*sp*dt;e.y+=Math.sin(ma)*sp*dt;e.f-=dt;e.sg-=dt;
  if(dist>SD()+500&&!e.boss){const b=rnd(0,6.283);e.x=p.x+Math.cos(b)*(SD()+40);e.y=p.y+Math.sin(b)*(SD()+40)}
  if(dist<e.r+10&&!(e.sg>0))hurt(e.dm,e.boss?.5:e.n=='cloaker'?.25:0,e)});
 G.ep.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;if(Math.hypot(q.x-p.x,q.y-p.y)<14){q.l=0;hurt(q.d,0,q.src)}});G.ep=G.ep.filter(q=>q.l>0);
 for(let i=0;i<G.en.length;i+=3){const a=G.en[i];for(let j=i+1;j<Math.min(G.en.length,i+12);j++){const b=G.en[j],d=Math.hypot(a.x-b.x,a.y-b.y)||1,m=a.r+b.r;if(d<m){const k=(m-d)/2/d,ux=(a.x-b.x)*k,uy=(a.y-b.y)*k;a.x+=ux;a.y+=uy;b.x-=ux;b.y-=uy}}}
 G.en=G.en.filter(e=>!e.dead);
 const mr=magR();
 G.gm=G.gm.filter(g=>{const d=Math.hypot(p.x-g.x,p.y-g.y)||1;if(d<mr||g.pull){g.pull=1;g.x+=(p.x-g.x)/d*340*dt;g.y+=(p.y-g.y)/d*340*dt}
  if(d<14){sx('g',900,.04,'sine',.02);
   if(g.k=='x')G.xp+=g.v*1.2*cmv('xp')*DIF[M.set.diff].xp*(1+U('xp')*.06+pv('luck')*.15+pv('prosper')*.1+pv('cutter')*.2+(TR().xp||0));else if(g.k=='c'){G.xp+=xpNeed()*.5*cmv('xp');toast('Treasure! +50% XP')}
   else if(g.k=='h')p.hp=Math.min(p.mhp,p.hp+25*Math.max(.4,DIF[M.set.diff].nh));
   else if(g.k=='m'){G.gm.forEach(o=>o.pull=1);toast('Magnet!')}
   else{G.flash=.25;G.shk=8;G.en.forEach(e=>{if(!e.dead&&!e.boss&&Math.abs(e.x-p.x)<W/2&&Math.abs(e.y-p.y)<H/2)hit(e,60*dm,'bomb')});sx('m',60,.3,'sawtooth',.07)}
   return false}return true});
 G.fx.forEach(f=>f.t-=dt);G.fx=G.fx.filter(f=>f.t>0);G.ps.forEach(q=>q.t-=dt);G.ps=G.ps.filter(q=>q.t>0);G.rg.forEach(r=>{r.t-=dt;r.r+=(r.big?260:120)*dt});G.rg=G.rg.filter(r=>r.t>0);
 G.pt.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt});G.pt=G.pt.filter(q=>q.l>0);if(G.pt.length>500)G.pt.splice(0,150);
 if(p.hp<=0){if(G.rev>0||(pv('phoenix')&&!G.phx)){if(G.rev>0)G.rev--;else G.phx=1;p.hp=p.mhp*.6;p.inv=2.5;G.nv.push({x:p.x,y:p.y,r:10,R:380,d:60*dm+hpS()*20,hit:new Set()});G.ban=2.5;if(M.ch=='gojo'){G.en.forEach(e=>{if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<560)hit(e,e.boss?e.mhp*.35:1e9,'ult')});G.flash=.9;G.shk=18;for(let i=0;i<5;i++)G.rg.push({x:p.x,y:p.y-20,r:10+i*18,t:.7,c:i%2?'#ff4a4a':'#4aa8ff',big:1});G.rg.push({x:p.x,y:p.y-20,r:20,t:.9,c:'#b050ff',big:1});toast('Revived! Mini Hollow Purple!')}else toast('Revived!')}else return finish()}
 if(G.vote){G.vote=0;curseVote();return}
 if(G.pend>0){G.pend--;levelUp();return}
 const need=xpNeed();if(G.xp>=need){G.xp-=need;G.lv++;p.hp=Math.min(p.mhp,p.hp+p.mhp*.02*U('heal'));levelUp()}}
/* ---------- rendering ---------- */
const hsh=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
function drawBG(ox,oy){const b=Math.floor((G.rd-1)/3)%6,B=BI[b],T=56,x0=Math.floor(-ox/T)-1,y0=Math.floor(-oy/T)-1,nx=Math.ceil(W/T)+3,ny=Math.ceil(H/T)+3;
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const gx=x0+i,gy=y0+j,h=hsh(gx,gy),px=gx*T,py=gy*T,h2=hsh(gx+99,gy-7);
  X.fillStyle=`hsl(${B.h+8},20%,${10+Math.floor(h*3)*2.5}%)`;X.fillRect(px,py,T+1,T+1);
  if(h2<.1){X.strokeStyle=B.t;X.lineWidth=2;X.beginPath();for(let k=-1;k<2;k++){X.moveTo(px+20+k*5,py+34);X.lineTo(px+18+k*8,py+24)}X.stroke()}
  else if(h2>.975){if(b==0){X.fillStyle='#3a3548';X.beginPath();X.roundRect(px+18,py+14,18,26,[9,9,2,2]);X.fill();X.fillStyle='#524b66';X.fillRect(px+26,py+19,2,12);X.fillRect(px+22,py+23,10,2)}
   else if(b==1){X.strokeStyle='#d8c8b0';X.lineWidth=4;X.beginPath();X.moveTo(px+14,py+36);X.lineTo(px+40,py+20);X.moveTo(px+14,py+22);X.lineTo(px+40,py+36);X.stroke()}
   else if(b==2){X.fillStyle='#9fdcff';X.beginPath();X.moveTo(px+20,py+40);X.lineTo(px+26,py+10);X.lineTo(px+32,py+40);X.fill();X.fillStyle='#d8f4ff';X.beginPath();X.moveTo(px+30,py+40);X.lineTo(px+36,py+22);X.lineTo(px+42,py+40);X.fill()}
   else{X.strokeStyle=b==3?'#ff7a20':b==4?'#3affb0':'#d070ff';X.lineWidth=3;X.beginPath();X.moveTo(px+8,py+30);X.lineTo(px+24,py+22);X.lineTo(px+34,py+34);X.lineTo(px+50,py+26);X.stroke()}}
  else if(h2>.93){X.fillStyle=b==3?'#4a2a1a':'#2a2438';X.beginPath();X.ellipse(px+30,py+30,6,4,0,0,7);X.fill()}}}
function ell(x,y,w,h){X.beginPath();X.ellipse(x,y,w,h,0,0,7)}
function eyes(x,y,r,a,c){for(const s of[-1,1]){X.fillStyle=c||'#fff';X.beginPath();X.arc(x+s*r*.38,y-r*.15,r*.26,0,7);X.fill();X.fillStyle='#111';X.beginPath();X.arc(x+s*r*.38+Math.cos(a)*r*.1,y-r*.15+Math.sin(a)*r*.1,r*.12,0,7);X.fill()}}
function drawE(e){const t=G.t;let x=e.x,y=e.y+Math.sin(t*8+e.ph)*1.5,r=e.r;
 if(e.n!='cloaker'){X.fillStyle='#0007';ell(x,e.y+r*.85,r*.95,r*.35);X.fill()}
 if(e.boss){const g=X.createRadialGradient(x,y,r*.5,x,y,r*2.2);g.addColorStop(0,e.c+'aa');g.addColorStop(1,e.c+'00');X.fillStyle=g;X.beginPath();X.arc(x,y,r*2.2+Math.sin(t*5)*4,0,7);X.fill()}
 if(e.el){X.strokeStyle='#ffd24a';X.lineWidth=2;X.beginPath();X.arc(x,y,r+4+Math.sin(t*6),0,7);X.stroke()}
 if(e.n=='charger'&&e.tm<.7&&!(e.dsh>0)){X.strokeStyle='#ff4020';X.lineWidth=2;X.beginPath();X.moveTo(x,y);X.lineTo(x+Math.cos(e.a)*90,y+Math.sin(e.a)*90);X.stroke()}
 if(e.n=='bat'||e.n=='wasp'||e.n=='harpy'){const f=Math.sin(t*22+e.ph)*.7;X.fillStyle='#8a5a1a';for(const s of[-1,1]){X.beginPath();X.moveTo(x,y);X.lineTo(x+s*r*2.2,y-r*(1.4+f));X.lineTo(x+s*r*1.6,y+r*.6);X.closePath();X.fill()}}
 if(e.n=='ghost')X.globalAlpha=.78;if(e.n=='cloaker')X.globalAlpha=.05;
 X.fillStyle=e.f>0?'#fff':e.c;X.strokeStyle='#0009';X.lineWidth=2;X.beginPath();X.arc(x,y,r,0,7);if(e.n=='ghost')X.rect(x-r,y,r*2,r);X.fill();X.stroke();
 if(e.n=='ghost'){X.fillStyle='#0d0b14';for(let i=0;i<3;i++){X.beginPath();X.arc(x-r*.66+i*r*.66,y+r*1.05,r*.33,0,7);X.fill()}}
 X.fillStyle='#0000002e';X.beginPath();X.arc(x+r*.22,y+r*.26,r*.72,0,7);X.fill();
 X.fillStyle='#ffffff2a';X.beginPath();X.arc(x-r*.3,y-r*.35,r*.4,0,7);X.fill();
 if(e.n=='slime'){X.fillStyle='#ffffff55';X.beginPath();X.ellipse(x-r*.35,y-r*.5,r*.25,r*.15,-.5,0,7);X.fill()}
 if(e.n=='imp'||e.n=='brute'||e.n=='charger'||e.boss){X.fillStyle=e.boss?'#ffd24a':'#f3ead0';for(const s of[-1,1]){X.beginPath();X.moveTo(x+s*r*.5,y-r*.7);X.lineTo(x+s*r*(e.boss?.9:.75),y-r*1.5);X.lineTo(x+s*r*.1,y-r*.9);X.fill()}}
 if(e.n=='brute'){X.fillStyle='#f3ead0';for(const s of[-1,1]){X.beginPath();X.moveTo(x+s*r*.35,y+r*.3);X.lineTo(x+s*r*.5,y+r*.85);X.lineTo(x+s*r*.15,y+r*.4);X.fill()}}
 if(e.n=='zom'){X.fillStyle='#4a7a30';for(const s of[-1,1]){X.beginPath();X.arc(x+Math.cos(e.a)*r*.9+s*r*.4,y+Math.sin(e.a)*r*.9+r*.2,r*.28,0,7);X.fill()}}
 if(e.n=='spit'){X.fillStyle='#e8ff80';X.beginPath();X.arc(x+Math.cos(e.a)*r*.8,y+Math.sin(e.a)*r*.8,r*.3,0,7);X.fill()}
 if(e.n=='cultist'){X.fillStyle='#4a1a5a';X.beginPath();X.moveTo(x-r*.7,y-r*.4);X.lineTo(x,y-r*1.6);X.lineTo(x+r*.7,y-r*.4);X.fill()}
 if(e.n=='golem'){X.strokeStyle='#33333f';X.lineWidth=2;X.beginPath();X.moveTo(x-r*.5,y-r*.8);X.lineTo(x-r*.1,y);X.lineTo(x+r*.4,y+r*.6);X.stroke()}
 if(e.n=='reaper'){X.strokeStyle='#bbb';X.lineWidth=2;X.beginPath();X.moveTo(x+r*.9,y+r);X.lineTo(x+r*.9,y-r*1.4);X.arc(x+r*.4,y-r*1.4,r*.5,0,Math.PI,true);X.stroke()}
 if(e.n=='skel'){X.fillStyle='#222';X.fillRect(x-r*.3,y+r*.25,r*.6,r*.2)}
 if(e.n=='shaman'){X.fillStyle='#6fe39a';X.beginPath();X.arc(x+r,y-r*.6,r*.3,0,7);X.fill()}
 if(e.n=='spider'){X.strokeStyle='#222';X.lineWidth=2;X.beginPath();for(let i=-2;i<=2;i++){if(!i)continue;X.moveTo(x,y);X.lineTo(x+i*r*.9,y+r*.9-Math.abs(i)*r*.2)}X.stroke()}
 if(e.n=='juggernaut'||e.n=='ogre'){X.fillStyle='#444450';X.fillRect(x-r*.6,y-r*.05,r*1.2,r*.35)}
 if(e.n=='summoner'){X.fillStyle='#601a4a';X.beginPath();X.moveTo(x-r*.8,y-r*.5);X.lineTo(x,y-r*1.7);X.lineTo(x+r*.8,y-r*.5);X.fill()}
 if(e.n=='archer'){X.strokeStyle='#e8d0a0';X.lineWidth=2;X.beginPath();X.arc(x+Math.cos(e.a)*r,y+Math.sin(e.a)*r,r*.7,e.a-1.2,e.a+1.2);X.stroke()}
 eyes(x,y,r,e.a,e.boss?'#ff3050':e.n=='ghost'?'#fff':null);if(e.burn>0){X.fillStyle='#ff8a2a';X.beginPath();X.arc(x+Math.sin(G.t*20)*2,y-r-3,3,0,7);X.fill()}if(e.charmed>0){X.fillStyle='#ff8ab0';X.globalAlpha=.75;X.beginPath();X.arc(x-r*.42,y+r*.08,r*.24,0,7);X.arc(x+r*.42,y+r*.08,r*.24,0,7);X.fill();X.globalAlpha=1;X.fillStyle='#ff5a9a';const hy=y-r-8,hs=5;X.beginPath();X.moveTo(x,hy+hs*.5);X.bezierCurveTo(x-hs,hy-hs*.4,x-hs*.5,hy-hs*1.2,x,hy-hs*.4);X.bezierCurveTo(x+hs*.5,hy-hs*1.2,x+hs,hy-hs*.4,x,hy+hs*.5);X.fill()}X.globalAlpha=1}
function drawDragon(){const p=G.p,x=p.x,y=p.y,kt=G.kt||[];
 for(let i=40;i>=4;i-=4){const q=kt[i];if(!q)continue;const r=34-i*.45;X.fillStyle='#2a5f8f';X.strokeStyle='#000a';X.lineWidth=2;X.beginPath();X.arc(q.x,q.y,r,0,7);X.fill();X.stroke();X.fillStyle='#7fd0ff';X.beginPath();X.arc(q.x,q.y+r*.25,r*.5,0,7);X.fill();X.fillStyle='#e8f0ff';X.beginPath();X.moveTo(q.x-4,q.y-r);X.lineTo(q.x,q.y-r-9);X.lineTo(q.x+4,q.y-r);X.fill()}
 X.fillStyle='#3a86c0';X.strokeStyle='#000a';X.lineWidth=3;X.beginPath();X.arc(x,y,38,0,7);X.fill();X.stroke();
 X.fillStyle='#e8e8f4';for(const s of[-1,1]){X.beginPath();X.moveTo(x+s*16,y-30);X.lineTo(x+s*34,y-62);X.lineTo(x+s*28,y-26);X.fill()}
 X.fillStyle='#ffb030';for(const s of[-1,1]){X.beginPath();X.arc(x+s*14,y-8,6,0,7);X.fill()}
 X.fillStyle='#14101c';X.fillRect(x-16,y+12,32,10);X.fillStyle='#ff6a2a';X.beginPath();X.arc(x,y+30+Math.sin(G.t*12)*3,10,0,7);X.fill()}
function drawP(){const p=G.p,x=p.x,k=M.ch,c=CH[k].c,w=G.mv?Math.sin(G.t*14):0,b=Math.sin(G.t*10)*(G.mv?1.8:.6),y=p.y+b;if(G.mode&&k=='kaido'){drawDragon();return}
 
 X.fillStyle='#0008';ell(x,p.y+14,12,4);X.fill();
 if(p.dt>0){X.fillStyle=c;X.globalAlpha=.2;X.beginPath();X.ellipse(x-p.face*10,y+2,15,13,0,0,7);X.fill();X.globalAlpha=.1;X.beginPath();X.ellipse(x-p.face*20,y+2,15,13,0,0,7);X.fill();X.globalAlpha=1}
 if(G.shOn){X.strokeStyle='#8ff';X.lineWidth=2;X.globalAlpha=.7;X.beginPath();X.arc(x,y,20+Math.sin(G.t*6),0,7);X.stroke();X.globalAlpha=1}
 if(p.dt>0)X.globalAlpha=.55;else if(p.inv>0&&Math.floor(G.t*20)%2)X.globalAlpha=.4;
 X.fillStyle='#1a1424';ell(x-5,y+14+w*2,4,3);X.fill();ell(x+5,y+14-w*2,4,3);X.fill();
 X.fillStyle=c;X.strokeStyle='#000a';X.lineWidth=2;X.beginPath();X.moveTo(x-13-w,y+13);X.quadraticCurveTo(x,y-14,x+13+w,y+13);X.closePath();X.fill();X.stroke();
 X.fillStyle='#ffffff30';X.beginPath();X.moveTo(x-6,y+12);X.quadraticCurveTo(x-3,y-4,x,y-8);X.lineTo(x-2,y+12);X.fill();
 X.fillStyle=c;X.beginPath();X.arc(x,y-6,9,0,7);X.fill();X.stroke();
 X.fillStyle='#14101c';X.beginPath();X.arc(x+p.face*2,y-5,6,0,7);X.fill();
 X.fillStyle='#fff';for(const s of[-1,1]){X.beginPath();X.arc(x+p.face*3+s*2.6,y-5,1.6,0,7);X.fill()}
 X.fillStyle='#ffd24a';X.strokeStyle='#ffd24a';
 if(k=='mage'||k=='witch'){X.fillStyle=k=='mage'?'#6a4ad0':'#c03a2a';X.beginPath();X.moveTo(x-11,y-10);X.lineTo(x+p.face*3,y-28);X.lineTo(x+11,y-10);X.fill();X.fillRect(x-14,y-11,28,3)}
 else if(k=='knight'){X.fillStyle='#c8d4e0';X.beginPath();X.arc(x,y-8,9.5,Math.PI,0);X.fill();X.fillStyle='#d33';X.fillRect(x-1,y-22,3,8)}
 else if(k=='priest'){X.lineWidth=2;ell(x,y-19,8,2.5);X.stroke()}
 else if(k=='rogue'){X.fillStyle='#2a6a40';X.fillRect(x-8,y-3,16,4)}
 else if(k=='druid'){X.strokeStyle='#8a5a2a';X.lineWidth=2;X.beginPath();X.moveTo(x-6,y-14);X.lineTo(x-9,y-24);X.moveTo(x+6,y-14);X.lineTo(x+9,y-24);X.stroke()}
 else if(k=='necro'){X.fillStyle='#e8e8e8';X.beginPath();X.arc(x,y-15,3.5,0,7);X.fill()}
 else if(k=='hunter'){X.fillStyle='#d44';X.beginPath();X.moveTo(x+6,y-14);X.lineTo(x+16,y-24);X.lineTo(x+10,y-12);X.fill()}
 else if(k=='monk'){X.fillStyle='#d33';X.fillRect(x-9,y-9,18,3)}
 else if(k=='cryo'){X.fillStyle='#bff';X.beginPath();X.moveTo(x-5,y-14);X.lineTo(x,y-26);X.lineTo(x+5,y-14);X.fill()}
 else if(k=='engineer'){X.fillStyle='#ffd24a';X.fillRect(x-8,y-9,16,4);X.fillStyle='#222';X.fillRect(x-6,y-8,5,2);X.fillRect(x+1,y-8,5,2)}
 else if(k=='berserker'){X.fillStyle='#c33';X.fillRect(x-9,y-12,18,3);X.fillRect(x+9,y-12,4,2)}
 else if(k=='goku'){X.fillStyle='#0c0c12';for(let i=-2;i<=2;i++){X.beginPath();X.moveTo(x+i*4-3,y-12);X.lineTo(x+i*6,y-27-(i==0?4:0));X.lineTo(x+i*4+3,y-12);X.fill()}X.fillStyle='#4a7ad0';X.fillRect(x-10,y+4,20,3)}
 else if(k=='kaido'){X.fillStyle='#e8e8f4';for(const s of[-1,1]){X.beginPath();X.moveTo(x+s*5,y-13);X.lineTo(x+s*11,y-27);X.lineTo(x+s*10,y-12);X.fill()}X.fillStyle='#1a1a2a';X.beginPath();X.arc(x,y-9,9.5,Math.PI,0);X.fill()}
 else if(k=='gojo'){
  X.fillStyle='#20263a';X.beginPath();X.moveTo(x-13-w,y+13);X.quadraticCurveTo(x,y-14,x+13+w,y+13);X.closePath();X.fill();X.strokeStyle='#000a';X.lineWidth=2;X.stroke();
  X.fillStyle='#0e1018';X.fillRect(x-9,y-13,18,6);
  X.fillStyle='#f6f9ff';X.beginPath();X.arc(x,y-7,9.5,Math.PI,0);X.fill();
  X.beginPath();X.moveTo(x-10,y-5);
  for(let i=0;i<=6;i++){const px=x-10+i*(20/6);X.lineTo(px,y-(i%2?23:13)-(i==3?5:0))}
  X.lineTo(x+10,y-5);X.closePath();X.fill();
  X.fillStyle='#0a0a12';X.fillRect(x-10,y-9,20,5.5);
  X.fillStyle='#2c2c40';X.fillRect(x-10,y-9,20,1.6);
  X.globalAlpha=.55+.35*Math.sin(G.t*3);X.fillStyle='#7fe8ff';X.fillRect(x-6.5,y-7.2,4.5,1.8);X.fillRect(x+2,y-7.2,4.5,1.8);X.globalAlpha=1}
 else if(k=='ichigo'){const bk=G.bnk||0,robe=bk>=1?'#15151d':'#e9e9f2';
  X.fillStyle=robe;X.beginPath();X.moveTo(x-13-w,y+13);X.quadraticCurveTo(x,y-14,x+13+w,y+13);X.closePath();X.fill();X.strokeStyle='#000a';X.lineWidth=2;X.stroke();
  X.fillStyle=bk>=1?'#3a3a48':'#8a2a2a';X.fillRect(x-11,y+2,22,3);
  X.fillStyle='#f0c8a0';X.beginPath();X.arc(x,y-6,9,0,7);X.fill();
  X.fillStyle='#ff9a2a';X.beginPath();X.moveTo(x-9.5,y-6);
  for(let i=0;i<=5;i++){const px=x-9.5+i*3.8;X.lineTo(px,y-(i%2?22:12)-(i==2?6:0))}
  X.lineTo(x+9.5,y-6);X.closePath();X.fill();
  if(bk>=3){X.fillStyle='#f4f6f8';X.beginPath();X.arc(x,y-5,8.5,0,7);X.fill();X.strokeStyle='#222';X.lineWidth=2.5;X.beginPath();X.moveTo(x-3,y-12);X.lineTo(x+6,y-23);X.stroke();X.strokeStyle='#c33';X.lineWidth=2;X.beginPath();X.arc(x+p.face*3,y-5,2.6,0,7);X.stroke();X.strokeStyle='#9aa';X.lineWidth=1;for(let i=0;i<3;i++){X.beginPath();X.moveTo(x-7,y-2+i*3);X.lineTo(x+7,y-4+i*3);X.stroke()}}
  else{X.fillStyle='#20301c';X.fillRect(x+p.face*3-1,y-7,3,4);X.fillRect(x+p.face*3-6.5,y-7,3,4)}
  X.strokeStyle=bk>=1?'#101018':'#d8d8e8';X.lineWidth=3.5;X.lineCap='round';X.beginPath();X.moveTo(x+p.face*9,y+3);X.lineTo(x+p.face*24,y-13);X.stroke();X.lineCap='butt'}
 else if(k=='lechungus'){
  X.fillStyle='#0008';ell(x,p.y+16,17,5);X.fill();
  X.fillStyle=c;X.beginPath();X.ellipse(x,y+2,17,15,0,0,7);X.fill();X.strokeStyle='#000a';X.lineWidth=2;X.stroke();
  X.fillStyle=c;X.beginPath();X.arc(x,y-14,12,0,7);X.fill();X.stroke();
  X.fillStyle='#14101c';X.beginPath();X.arc(x+p.face*2,y-15,8,0,7);X.fill();
  X.fillStyle='#fff';for(const s of[-1,1]){X.beginPath();X.arc(x+p.face*3+s*3.4,y-16,2,0,7);X.fill()}
  X.fillStyle='#111';for(const s of[-1,1]){X.beginPath();X.arc(x+p.face*3+s*3.4,y-16,1,0,7);X.fill()}
  X.strokeStyle='#7a2040';X.lineWidth=2;X.beginPath();X.arc(x+p.face*2,y-10,4,.3,Math.PI-.3);X.stroke();
  X.fillStyle='#ff7aa0';X.beginPath();X.arc(x-7,y-11,2.5,0,7);X.fill();X.beginPath();X.arc(x+7+p.face*2,y-11,2.5,0,7);X.fill()}
 else if(k=='rukia'){
  X.fillStyle='#14141c';X.beginPath();X.moveTo(x-13-w,y+13);X.quadraticCurveTo(x,y-14,x+13+w,y+13);X.closePath();X.fill();X.strokeStyle='#000a';X.lineWidth=2;X.stroke();
  X.fillStyle='#f0c8a0';X.beginPath();X.arc(x,y-6,9,0,7);X.fill();
  X.fillStyle='#f4f8ff';X.beginPath();X.arc(x,y-7,10,Math.PI,0);X.fill();X.fillRect(x-10,y-12,4,20);X.fillRect(x+6,y-12,4,20);
  X.fillStyle='#7ab8e8';X.fillRect(x+p.face*3-1,y-7,3,4);X.fillRect(x+p.face*3-6.5,y-7,3,4);
  X.strokeStyle='#bfe8ff';X.lineWidth=3;X.lineCap='round';X.beginPath();X.moveTo(x+p.face*9,y+3);X.lineTo(x+p.face*22,y-16);X.stroke();X.lineCap='butt'}
 else if(k=='alya'){
  X.fillStyle='#f0e8dc';X.beginPath();X.moveTo(x-13-w,y+13);X.quadraticCurveTo(x,y-14,x+13+w,y+13);X.closePath();X.fill();X.strokeStyle='#000a';X.lineWidth=2;X.stroke();
  X.fillStyle='#a03a4a';X.fillRect(x-11,y+2,22,3);
  X.fillStyle='#f0c8a0';X.beginPath();X.arc(x,y-6,9,0,7);X.fill();
  X.fillStyle='#d8b070';X.beginPath();X.arc(x,y-7,10,Math.PI,0);X.fill();
  X.beginPath();X.moveTo(x-9,y-8);X.quadraticCurveTo(x-14,y+2,x-11,y+12);X.lineTo(x-7,y+10);X.quadraticCurveTo(x-8,y,y-8);X.fill();
  X.beginPath();X.moveTo(x+9,y-8);X.quadraticCurveTo(x+14,y+2,x+11,y+12);X.lineTo(x+7,y+10);X.quadraticCurveTo(x+8,y,x-8);X.fill();
  X.fillStyle='#e84a6a';X.fillRect(x-2,y-16,4,4);
  X.fillStyle='#4a7ad0';X.fillRect(x+p.face*3-1,y-7,3,4);X.fillRect(x+p.face*3-6.5,y-7,3,4);
  X.fillStyle='#ff8ab8';X.beginPath();X.arc(x+p.face*2,y-2,3.5,0,7);X.fill()}
 X.globalAlpha=1}
const GEM=['#4af','#5f9','#f55'];
function arrow(tx,ty,col){const dx=tx-G.p.x,dy=ty-G.p.y;if(Math.abs(dx)<W/2-20&&Math.abs(dy)<H/2-20)return;const a=Math.atan2(dy,dx),R=Math.min(W,H)*.42,x=W/2+Math.cos(a)*R,y=H/2+Math.sin(a)*R;
 X.save();X.translate(x,y);X.rotate(a);X.fillStyle=col;X.strokeStyle='#000';X.lineWidth=2;X.beginPath();X.moveTo(12,0);X.lineTo(-8,-8);X.lineTo(-8,8);X.closePath();X.fill();X.stroke();X.restore()}
function draw(){const p=G.p,sh=M.set.shake?G.shk:0,sx_=rnd(-1,1)*sh,sy_=rnd(-1,1)*sh,ox=Math.round((W/2-p.x+sx_)/PS)*PS,oy=Math.round((H/2-p.y+sy_)/PS)*PS,B=BI[Math.floor((G.rd-1)/3)%6];
 X=XW;X.setTransform(1/PS,0,0,1/PS,0,0);X.fillStyle='#120e1c';X.fillRect(0,0,W,H);X.save();const zz=G.ult?1+.3*Math.max(0,Math.min(1,G.ult.t/1.5,(10-G.ult.t)/1.5)):1;X.translate(W/2,H/2);X.scale(zz,zz);X.translate(-W/2,-H/2);X.translate(ox,oy);drawBG(ox,oy);
 G.pl.forEach(o=>{const g=X.createRadialGradient(o.x,o.y,0,o.x,o.y,o.R);g.addColorStop(0,o.hot?'#ff9a3a99':'#8fe05a99');g.addColorStop(1,o.hot?'#c0401a44':'#4a9a2a44');X.fillStyle=g;ell(o.x,o.y,o.R,o.R*.75);X.fill();X.fillStyle='#d8ffaa';for(let i=0;i<3;i++){const a=G.t*2+i*2.1;X.beginPath();X.arc(o.x+Math.cos(a)*o.R*.5,o.y+Math.sin(a*1.3)*o.R*.35-((G.t*20+i*9)%12),2,0,7);X.fill()}});
 G.mt.forEach(m=>{const f=1-m.t/m.t0;X.strokeStyle='#ff4a2a';X.lineWidth=2;X.beginPath();X.arc(m.x,m.y,m.R,0,7);X.stroke();X.fillStyle='#ff4a2a33';X.beginPath();X.arc(m.x,m.y,m.R*f,0,7);X.fill();
  X.fillStyle='#ffb050';X.beginPath();X.arc(m.x,m.y-(1-f)*400,10,0,7);X.fill();X.fillStyle='#ff6a2a88';X.beginPath();X.arc(m.x,m.y-(1-f)*400,18,0,7);X.fill()});
 if(G.L.aura&&G.ar){const g=X.createRadialGradient(p.x,p.y,G.ar*.3,p.x,p.y,G.ar);g.addColorStop(0,'#ffe08010');g.addColorStop(1,'#ffe08055');X.fillStyle=g;X.beginPath();X.arc(p.x,p.y,G.ar,0,7);X.fill();
  X.strokeStyle='#ffe080aa';X.lineWidth=2;X.setLineDash([10,8]);X.lineDashOffset=-G.t*30;X.beginPath();X.arc(p.x,p.y,G.ar,0,7);X.stroke();X.setLineDash([])}
 G.nv.forEach(n=>{X.strokeStyle='#8fd0ff';X.lineWidth=6;X.globalAlpha=Math.max(0,1-n.r/n.R);X.beginPath();X.arc(n.x,n.y,n.r,0,7);X.stroke();X.globalAlpha=1});
 if(M.ch=='gojo'&&G.L.void>=8&&G.infR){const R=G.infR;GL(p.x,p.y,R,'#9fd0ff',.12);X.strokeStyle='#bfe0ff';X.lineWidth=2;X.globalAlpha=.75;X.setLineDash([14,10]);X.lineDashOffset=-G.t*40;X.beginPath();X.ellipse(p.x,p.y,R,R*.92,0,0,7);X.stroke();X.setLineDash([]);X.globalAlpha=1;
  for(let i=0;i<6;i++){const aa=G.t*2+i*1.047;X.fillStyle='#e8f4ff';X.fillRect(p.x+Math.cos(aa)*R-2,p.y+Math.sin(aa)*R*.92-2,4,4)}}
 G.gm.forEach(g=>{const bob=Math.sin(G.t*4+g.x)*1.5;if(g.k=='x'){X.fillStyle=GEM[g.v<5?0:g.v<15?1:2];const r=g.v<5?4:g.v<15?5:7;X.beginPath();X.moveTo(g.x,g.y-r+bob);X.lineTo(g.x+r*.8,g.y+bob);X.lineTo(g.x,g.y+r+bob);X.lineTo(g.x-r*.8,g.y+bob);X.fill();X.fillStyle='#fff8';X.fillRect(g.x-1,g.y-r*.6+bob,2,2)}
  else if(g.k=='c'){X.fillStyle='#ffd24a';X.fillRect(g.x-9,g.y-7,18,14);X.fillStyle='#a8741a';X.fillRect(g.x-9,g.y-1,18,3);X.strokeStyle='#fff8';X.strokeRect(g.x-9,g.y-7,18,14)}
  else if(g.k=='h'){X.fillStyle='#ff6f6f';X.beginPath();X.arc(g.x,g.y,7,0,7);X.fill();X.fillStyle='#fff';X.fillRect(g.x-1,g.y-4,2,8);X.fillRect(g.x-4,g.y-1,8,2)}
  else if(g.k=='m'){X.strokeStyle='#e44';X.lineWidth=4;X.beginPath();X.arc(g.x,g.y,6,Math.PI,0);X.stroke();X.fillStyle='#e44';X.fillRect(g.x-8,g.y,4,5);X.fillStyle='#48f';X.fillRect(g.x+4,g.y,4,5)}
  else{X.fillStyle='#222';X.beginPath();X.arc(g.x,g.y,7,0,7);X.fill();X.strokeStyle='#ffa040';X.lineWidth=2;X.beginPath();X.moveTo(g.x+3,g.y-6);X.lineTo(g.x+7,g.y-10);X.stroke()}});
 [...G.en].sort((a,b)=>a.y-b.y).forEach(drawE);drawP();drawUlt();
 X.globalCompositeOperation='lighter';
 G.ep.forEach(q=>{const g=X.createRadialGradient(q.x,q.y,0,q.x,q.y,14);g.addColorStop(0,'#fff');g.addColorStop(.4,'#ff5a7a');g.addColorStop(1,'#ff5a7a00');X.fillStyle=g;X.beginPath();X.arc(q.x,q.y,14,0,7);X.fill()});
 G.sh.forEach(s=>{if(s.k=='a'||s.k=='s'||s.k=='r')return;const col=s.src=='void'?'#ff4a4a':s.k=='w'?'#5fe0c0':s.k=='n'?'#ffd9a0':s.k=='i'?(s.src=='sode'?'#cfeeff':'#9fe0ff'):s.src=='sode'?'#cfeeff':s.src=='heartwave'?'#ff8ab8':'#c9a0ff';
  const sp2=Math.hypot(s.vx,s.vy)||1;
  X.globalAlpha=.4;X.strokeStyle=col;X.lineWidth=s.r*1.7;X.lineCap='round';X.beginPath();X.moveTo(s.x-s.vx/sp2*s.r*3.5,s.y-s.vy/sp2*s.r*3.5);X.lineTo(s.x,s.y);X.stroke();X.globalAlpha=1;
  if(s.k=='n'){X.strokeStyle='#ffe8c0';X.lineWidth=4;X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x-s.vx*.04,s.y-s.vy*.04);X.stroke()}
  const g=X.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*3.2);g.addColorStop(0,'#fff');g.addColorStop(.35,col);g.addColorStop(1,col+'00');X.fillStyle=g;X.beginPath();X.arc(s.x,s.y,s.r*3.2,0,7);X.fill();
  X.fillStyle='#fff';X.beginPath();X.arc(s.x,s.y,s.r,0,7);X.fill()});
 G.pt.forEach(q=>{X.globalAlpha=Math.min(1,q.l*3);X.fillStyle=q.c;X.fillRect(q.x-q.s/2,q.y-q.s/2,q.s,q.s)});X.globalAlpha=1;
 X.globalCompositeOperation='source-over';G.mn.forEach(m=>{X.fillStyle=m.t>.6?'#ff5a3a':'#7a7a8a';X.strokeStyle='#000a';X.lineWidth=2;X.beginPath();X.arc(m.x,m.y,6,0,7);X.fill();X.stroke();if(m.t>.6){X.globalAlpha=.4+.3*Math.sin(G.t*10);X.beginPath();X.arc(m.x,m.y,11,0,7);X.fill();X.globalAlpha=1}});
 G.tu.forEach(u=>{X.fillStyle='#4a4a58';X.fillRect(u.x-7,u.y-4,14,10);X.save();X.translate(u.x,u.y-2);X.rotate(u.a||0);X.fillStyle='#9a9aaa';X.fillRect(0,-2,12,4);X.restore();X.fillStyle='#ffd24a';X.fillRect(u.x-2,u.y-8,4,3)});X.globalCompositeOperation='lighter';
 G.fx.forEach(f=>{if(f.k=='ch'){X.globalAlpha=Math.min(1,f.t*6);X.strokeStyle='#9fd8ff';X.lineWidth=3;X.beginPath();f.pts.forEach((q,i)=>i?X.lineTo(q[0]+rnd(-3,3),q[1]+rnd(-3,3)):X.moveTo(q[0],q[1]));X.stroke();X.globalAlpha=1}});
 G.fx.forEach(f=>{if(f.k=='wh'){X.save();X.translate(f.x,f.y);X.rotate(f.a);X.globalAlpha=Math.min(1,f.t*5);X.fillStyle='#ffe0b8';X.beginPath();X.moveTo(0,-3);X.quadraticCurveTo(f.R*.6,-f.Wd,f.R,0);X.quadraticCurveTo(f.R*.6,f.Wd*.5,0,3);X.fill();X.restore();X.globalAlpha=1}});
 G.ps.forEach(q=>{const f=q.t/q.m;X.save();X.translate(q.x,q.y);X.rotate(q.a);X.globalAlpha=Math.min(1,f*1.6);X.fillStyle=q.c;if(q.k=='arc'){X.beginPath();X.moveTo(0,0);X.arc(0,0,q.len,-q.sp,q.sp);X.closePath();X.fill();X.globalAlpha=f*.6;X.fillStyle='#fff';X.beginPath();X.moveTo(0,0);X.arc(0,0,q.len*.7,-q.sp*.8,q.sp*.8);X.closePath();X.fill()}else{X.fillRect(0,-q.w*.5*f-2,q.len,q.w*f+4);X.fillStyle='#fff';X.fillRect(0,-3,q.len,6);X.beginPath();X.arc(q.len,0,q.w*.9*f+3,0,7);X.fill()}X.restore()});
 G.rg.forEach(r=>{X.strokeStyle=r.c;X.lineWidth=r.big?4:2;X.globalAlpha=Math.max(0,r.t*(r.big?2:3));X.beginPath();X.arc(r.x,r.y,r.r,0,7);X.stroke()});X.globalAlpha=1;
 X.globalCompositeOperation='source-over';
 G.sh.forEach(s=>{if(s.k=='a'){X.save();X.translate(s.x,s.y);X.rotate(s.rot);X.fillStyle='#ffb070';X.strokeStyle='#000a';X.lineWidth=2;X.beginPath();X.moveTo(-s.r,-s.r);X.lineTo(s.r,0);X.lineTo(-s.r,s.r);X.closePath();X.fill();X.stroke();X.fillStyle='#6a4020';X.fillRect(-s.r-4,-2,s.r,4);X.restore()}
  else if(s.k=='r'){X.save();X.translate(s.x,s.y);X.rotate(s.rot);X.fillStyle='#c8ccd4';X.strokeStyle='#000a';X.lineWidth=2;X.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?s.r*.8:s.r*1.1;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.closePath();X.fill();X.stroke();X.fillStyle='#555';X.beginPath();X.arc(0,0,s.r*.3,0,7);X.fill();X.restore()}
  else if(s.k=='s'){X.save();X.translate(s.x,s.y);X.rotate(s.rot);X.strokeStyle='#e8e8ff';X.lineWidth=5;X.shadowColor='#aaf';X.shadowBlur=10;X.beginPath();X.arc(0,0,s.r,.3,Math.PI*1.3);X.stroke();X.shadowBlur=0;X.restore()}});
 if(G.L.blades&&G.bl)G.bl.forEach(b=>{X.save();X.translate(b[0],b[1]);X.rotate(b[2]+G.t*8);const g=X.createRadialGradient(0,0,0,0,0,24);g.addColorStop(0,'#7fe8ff66');g.addColorStop(1,'#7fe8ff00');X.fillStyle=g;X.beginPath();X.arc(0,0,24,0,7);X.fill();
  X.fillStyle='#d8faff';X.strokeStyle='#3aa8c8';X.lineWidth=2;X.beginPath();X.moveTo(0,-14);X.lineTo(6,0);X.lineTo(0,14);X.lineTo(-6,0);X.closePath();X.fill();X.stroke();X.restore()});
 G.fx.forEach(f=>{if(f.k=='l'){X.strokeStyle='#fff8a0';X.lineWidth=4;X.shadowColor='#ff8';X.shadowBlur=14;X.beginPath();X.moveTo(f.x,f.y-H);let yy=f.y-H;while(yy<f.y){yy+=40;X.lineTo(f.x+rnd(-14,14),Math.min(yy,f.y))}X.stroke();X.shadowBlur=0}
  });
 X.restore();X=XH;X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,W,H);X.lineJoin='round';X.textAlign='left';drawNums(ox,oy);
 X.globalCompositeOperation='lighter';
 for(let i=0;i<0;i++){const cx=((i*520-p.x*.2+G.t*14)%(W+700)+(W+700))%(W+700)-350,cy=H*(.25+i*.28),g=X.createRadialGradient(cx,cy,0,cx,cy,320);g.addColorStop(0,B.f+'12');g.addColorStop(1,B.f+'00');X.fillStyle=g;X.fillRect(cx-320,cy-320,640,640)}
 G.ff.forEach(f=>{const fx=((f.x-p.x*.4+Math.sin(G.t+f.p)*20)%W+W)%W,fy=((f.y-p.y*.4+Math.cos(G.t*.8+f.p)*14)%H+H)%H;X.fillStyle=B.f+(Math.sin(G.t*3+f.p)>0?'cc':'55');X.beginPath();X.arc(fx,fy,1.6,0,7);X.fill()});
 X.globalCompositeOperation='source-over';
 X.fillStyle=VG;X.fillRect(0,0,W,H);
 if(G.flash>0){X.fillStyle='#fff';X.globalAlpha=G.flash;X.fillRect(0,0,W,H);X.globalAlpha=1}
 if(G.freeze>0){X.fillStyle='#6fc8ff';X.globalAlpha=.12;X.fillRect(0,0,W,H);X.globalAlpha=1}
 if(G.cry>0||G.boost>0){X.fillStyle='#ffb050';X.font='bold 13px system-ui';X.fillText((G.cry>0?'War Cry ':'')+(G.boost>0?'Adrenaline':''),10,58)}
 G.gm.forEach(g=>{if(g.k=='c')arrow(g.x,g.y,'#ffd24a')});G.en.forEach(e=>{if(e.boss)arrow(e.x,e.y,'#ff3050')});
 const need=xpNeed();X.fillStyle='#000a';X.fillRect(0,0,W,18);X.fillStyle='#5ab0e8';X.fillRect(0,0,W*G.xp/need,18);X.fillStyle='#000';X.fillRect(0,18,W,2);
 X.fillStyle='#fff';X.font='bold 12px system-ui';X.fillText('LV '+G.lv,8,13);
 X.textAlign='center';X.font='bold 22px system-ui';X.strokeStyle='#000';X.lineWidth=4;X.strokeText(fmt(G.t),W/2,46);X.fillText(fmt(G.t),W/2,46);
 X.font='bold 13px system-ui';X.fillStyle=B.f;X.fillText('NIGHT '+G.rd+'  |  '+B.n+(M.set.diff?'  |  '+DIF[M.set.diff].n:''),W/2,64);X.textAlign='left';X.fillStyle='#fff';X.fillText('Kills '+G.kills+'   Gold +'+fmtN(gold()),10,40);{const nd=Math.ceil(G.rS*.9),bs=G.en.some(e=>e.boss&&!e.dead);X.fillStyle=G.rK>=nd&&G.rN>=rQ()?'#7fff9f':'#ffd24a';X.fillText(G.rN<rQ()?'Night clear: '+G.rK+'/'+nd+' (90%) - more incoming':bs?'Defeat the boss to advance':G.rK>=nd?'Clearing...':'Night clear: '+G.rK+'/'+nd+' (90%)',10,58);X.fillStyle='#fff'}
 const bs=G.en.find(e=>e.boss);if(bs){const bw=Math.min(500,W-40);X.fillStyle='#000a';X.beginPath();X.roundRect(W/2-bw/2,74,bw,12,6);X.fill();X.fillStyle='#e22';X.beginPath();X.roundRect(W/2-bw/2,74,bw*Math.max(0,bs.hp/bs.mhp),12,6);X.fill()}
 X.fillStyle='#000a';X.beginPath();X.roundRect(W/2-45,H/2+24,90,9,4);X.fill();X.fillStyle=p.hp/p.mhp>.3?'#e83':'#f22';X.beginPath();X.roundRect(W/2-45,H/2+24,90*Math.max(0,p.hp/p.mhp),9,4);X.fill();
 if(p.ch<p.cm){X.fillStyle='#000a';X.fillRect(W/2-45,H/2+35,90,3);X.fillStyle='#9bf';X.fillRect(W/2-45,H/2+35,90*(1-p.dc/dcd()),3)}
 let ix=10;const iy=H-70;[[G.L,1],[G.P,0]].forEach(([o,w])=>{for(const k in o){const it=IT(k),ev=G.ev[k];X.fillStyle='#000a';X.fillRect(ix,iy+(w?10:-8),w?24:32,w?24:32);X.strokeStyle=ev?'#ffd24a':it.c;X.lineWidth=2;X.strokeRect(ix,iy+(w?10:-8),w?24:32,w?24:32);X.fillStyle=it.c;X.font='bold 12px system-ui';X.fillText(it.n[0],ix+5,iy+(w?24:8));X.fillStyle='#fff';X.font='10px system-ui';X.fillText(o[k],ix+(w?14:22),iy+(w?32:22));ix+=w?28:36}ix+=6});
 drawJoy();drawUltHud();
 if(G.banner){const b=G.banner,bh=Math.min(H*.17,120);X.fillStyle='#000';X.fillRect(0,0,W,bh);X.fillRect(0,H-bh,W,bh);X.textAlign='center';X.globalAlpha=Math.min(1,b.t);const fs=Math.round(Math.min(42,W/14));X.font='bold '+fs+'px '+FNT;X.fillStyle=b.col;X.strokeStyle='#000';X.lineWidth=8;X.strokeText(b.txt,W/2,bh*.66);X.fillText(b.txt,W/2,bh*.66);X.globalAlpha=1;X.textAlign='left'}
 if(G.ban>0){X.globalAlpha=Math.min(1,G.ban);X.textAlign='center';X.font='bold 44px system-ui';X.fillStyle=B.f;X.strokeStyle='#000';X.lineWidth=6;X.strokeText('NIGHT '+G.rd,W/2,H*.25);X.fillText('NIGHT '+G.rd,W/2,H*.25);
  X.font='bold 18px system-ui';X.fillStyle='#fff';X.fillText(B.n,W/2,H*.25+26);if(G.rd%3==0){X.font='bold 22px system-ui';X.fillStyle='#ff5070';X.fillText('BOSS INCOMING',W/2,H*.25+54)}X.globalAlpha=1;X.textAlign='left'}}
function loop(n){const dt=Math.min(.05,(n-last)/1000)*M.set.spd;last=n;if(G.state=='run'){update(dt);music()}draw();if(G.state!='over')raf=requestAnimationFrame(loop)}
if(window.ADMIN_MODE){window.__game={get M(){return M},get G(){return G},CH,ITEMS,start,save,giveGold:g=>{M.gold+=g;save()},god:v=>{window.__GOD=v},forceUlt:()=>{window.__ULT=1},lvl:()=>{if(G&&G.state=='run')G.xp+=xpNeed()},unlock:()=>{M.own=Object.keys(CH);save();menu()},killAll:()=>{if(G)G.en.forEach(e=>{if(!e.dead&&!e.boss)die(e)})},spawnBoss:()=>{if(G&&G.state=='run')boss()},heal:()=>{if(G)G.p.hp=G.p.mhp}}}
menu();
