// ============ common.js — accounts, wallet, ledger, games, header ============
import {
  db, auth, doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, getDocs, addDoc, query, orderBy, limit,
  serverTimestamp, runTransaction, onAuthStateChanged, signOut
} from './firebase.js';

const START_CHIPS = 1000;
let _user = null;

/* ---------- auth gate ---------- */
export function requireAuth(){
  return new Promise(resolve=>{
    onAuthStateChanged(auth, user=>{
      if(user){ _user = user; resolve(user); }
      else { location.href = 'login.html'; }
    });
  });
}
export function currentUser(){ return _user; }
export function uid(){ return _user ? _user.uid : null; }
export function userName(){ return _user ? (_user.displayName || _user.email || 'Player') : ''; }
export function signOutNow(){ signOut(auth).then(()=>location.href='login.html'); }

/* ---------- account doc ---------- */
export async function ensureAccount(user){
  _user = user || _user;
  if(!_user) return;
  const ref = doc(db,'players',_user.uid);
  try{
    const snap = await getDoc(ref);
    if(!snap.exists()){
      await setDoc(ref, { name:userName(), email:_user.email||'', chips:START_CHIPS,
        puzSolved:0, puzStreak:0, puzBest:0, createdAt:serverTimestamp() });
    }
  }catch(e){ console.warn('account init failed:', e.message); }
}

export function watchWallet(cb){
  if(!uid()){ cb({chips:0}); return ()=>{}; }
  try{ return onSnapshot(doc(db,'players',uid()), s=>{ if(s.exists()) cb(s.data()); }); }
  catch(e){ cb({chips:START_CHIPS}); return ()=>{}; }
}

/* atomic chip change + ledger entry; returns new balance */
export async function changeChips(delta, reason='Play'){
  const ref = doc(db,'players',uid());
  let next=null;
  try{
    await runTransaction(db, async tx=>{
      const s = await tx.get(ref);
      const cur = s.exists() ? (s.data().chips||0) : START_CHIPS;
      next = Math.max(0, cur + delta);
      tx.update(ref, { chips: next });
    });
    try{ await addDoc(collection(db,'players',uid(),'ledger'),
      { ts:serverTimestamp(), delta, balance:next, reason }); }catch(e){}
    return next;
  }catch(e){ console.warn('chip change failed:', e.message); return null; }
}
export async function topUp(){ return changeChips(START_CHIPS, 'Top-up'); }

export async function listLedger(n=100){
  try{ const q=query(collection(db,'players',uid(),'ledger'), orderBy('ts','desc'), limit(n));
    const snap=await getDocs(q); return snap.docs.map(d=>d.data()); }
  catch(e){ return []; }
}

/* ---------- saved games ---------- */
export async function saveGame(rec){
  try{ await addDoc(collection(db,'players',uid(),'games'), { ts:serverTimestamp(), ...rec }); }
  catch(e){ console.warn('save game failed:', e.message); }
}
export async function listGames(n=60){
  try{ const q=query(collection(db,'players',uid(),'games'), orderBy('ts','desc'), limit(n));
    const snap=await getDocs(q); return snap.docs.map(d=>({id:d.id, ...d.data()})); }
  catch(e){ return []; }
}

/* ---------- puzzle stats ---------- */
export async function recordPuzzle(success){
  const ref=doc(db,'players',uid());
  try{
    await runTransaction(db, async tx=>{
      const s=await tx.get(ref); const d=s.data()||{};
      let solved=d.puzSolved||0, streak=d.puzStreak||0, best=d.puzBest||0;
      if(success){ solved++; streak++; if(streak>best) best=streak; } else { streak=0; }
      tx.update(ref, { puzSolved:solved, puzStreak:streak, puzBest:best });
    });
  }catch(e){}
}

/* ---------- shared header ---------- */
export function renderHeader(active){
  const bar = document.querySelector('.appbar');
  if(!bar) return;
  const isHub = active==='index.html';
  const back = isHub ? '' :
    `<button id="backBtn" title="Back to the Parlour" style="background:var(--panel);border:1px solid var(--line);color:var(--text);width:40px;height:40px;border-radius:11px;font-size:24px;line-height:36px;cursor:pointer;padding:0">&#8249;</button>`;
  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      ${back}
      <div class="brand" id="brandBtn"><span class="glyph">&#9824;</span><b>The Parlour</b></div>
    </div>
    <div class="right">
      <div class="wallet">
        <span class="coin">$</span><span id="chipCount">—</span>
        <span class="who" id="whoBtn" title="Sign out">${userName()}</span>
      </div>
    </div>`;
  const goHome=()=>location.href='index.html';
  document.getElementById('brandBtn').onclick=goHome;
  const bb=document.getElementById('backBtn'); if(bb) bb.onclick=goHome;
  document.getElementById('whoBtn').onclick=()=>{ if(confirm('Sign out of the Parlour?')) signOutNow(); };
  watchWallet(w=>{ const el=document.getElementById('chipCount'); if(el) el.textContent=(w.chips??0).toLocaleString(); });
}
