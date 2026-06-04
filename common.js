// ============ common.js — identity, wallet, shared header ============
import { db, doc, getDoc, setDoc, updateDoc, onSnapshot, runTransaction } from './firebase.js';

const START_CHIPS = 1000;

// ---- identity (lightweight; fine for family use) ----
export function playerId(){
  let id = localStorage.getItem('gp_id');
  if(!id){ id = 'p_' + Math.random().toString(36).slice(2,10); localStorage.setItem('gp_id', id); }
  return id;
}
export function playerName(){ return localStorage.getItem('gp_name') || ''; }
export function setPlayerName(n){ localStorage.setItem('gp_name', n.trim().slice(0,20)); }

export async function ensurePlayer(){
  if(!playerName()){
    const n = prompt("Pick a name for the Parlour:", "") || "Guest";
    setPlayerName(n || "Guest");
  }
  const ref = doc(db, 'players', playerId());
  try{
    const snap = await getDoc(ref);
    if(!snap.exists()){
      await setDoc(ref, { name: playerName(), chips: START_CHIPS });
    } else if(snap.data().name !== playerName()){
      await updateDoc(ref, { name: playerName() });
    }
  }catch(e){ console.warn('wallet init failed (host over https to use Firebase):', e.message); }
}

export function watchWallet(cb){
  try{
    return onSnapshot(doc(db,'players',playerId()), s=>{ if(s.exists()) cb(s.data()); });
  }catch(e){ cb({name:playerName(),chips:START_CHIPS}); return ()=>{}; }
}

// atomic chip change; returns new balance (or null on failure)
export async function changeChips(delta){
  const ref = doc(db,'players',playerId());
  try{
    let out=null;
    await runTransaction(db, async tx=>{
      const s = await tx.get(ref);
      const cur = s.exists()? (s.data().chips||0) : START_CHIPS;
      const next = Math.max(0, cur + delta);
      tx.set(ref, { name: playerName(), chips: next }, { merge:true });
      out = next;
    });
    return out;
  }catch(e){ console.warn('chip update failed:', e.message); return null; }
}

export async function topUp(){ // free refill if broke
  return changeChips(START_CHIPS);
}

// ---- shared header ----
export function renderHeader(active){
  const games = [
    ['index.html','Hub'], ['chess.html','Chess'], ['blackjack.html','Blackjack'],
    ['roulette.html','Roulette'], ['poker.html','Poker'], ['pool.html','Pool'], ['canasta.html','Canasta']
  ];
  const bar = document.querySelector('.appbar');
  if(!bar) return;
  bar.innerHTML = `
    <div class="brand" onclick="location.href='index.html'">
      <span class="glyph">&#9824;</span><b>The Parlour</b>
    </div>
    <div class="right">
      <div class="wallet">
        <span class="coin">$</span>
        <span id="chipCount">—</span>
        <span class="who" id="whoBtn" title="Change name">${playerName()||'set name'}</span>
      </div>
    </div>`;
  document.getElementById('whoBtn').onclick = ()=>{
    const n = prompt("Change your name:", playerName());
    if(n){ setPlayerName(n); ensurePlayer(); document.getElementById('whoBtn').textContent = playerName(); }
  };
  watchWallet(w=>{
    const el = document.getElementById('chipCount');
    if(el) el.textContent = (w.chips??0).toLocaleString();
  });
}
