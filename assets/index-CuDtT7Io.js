(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const P=(e,t)=>t.some(n=>e instanceof n);let Q,X;function De(){return Q||(Q=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ie(){return X||(X=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const N=new WeakMap,R=new WeakMap,q=new WeakMap;function Ce(e){const t=new Promise((n,r)=>{const s=()=>{e.removeEventListener("success",a),e.removeEventListener("error",i)},a=()=>{n(g(e.result)),s()},i=()=>{r(e.error),s()};e.addEventListener("success",a),e.addEventListener("error",i)});return q.set(t,e),t}function qe(e){if(N.has(e))return;const t=new Promise((n,r)=>{const s=()=>{e.removeEventListener("complete",a),e.removeEventListener("error",i),e.removeEventListener("abort",i)},a=()=>{n(),s()},i=()=>{r(e.error||new DOMException("AbortError","AbortError")),s()};e.addEventListener("complete",a),e.addEventListener("error",i),e.addEventListener("abort",i)});N.set(e,t)}let j={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return N.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return g(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function oe(e){j=e(j)}function Te(e){return Ie().includes(e)?function(...t){return e.apply(H(this),t),g(this.request)}:function(...t){return g(e.apply(H(this),t))}}function Ae(e){return typeof e=="function"?Te(e):(e instanceof IDBTransaction&&qe(e),P(e,De())?new Proxy(e,j):e)}function g(e){if(e instanceof IDBRequest)return Ce(e);if(R.has(e))return R.get(e);const t=Ae(e);return t!==e&&(R.set(e,t),q.set(t,e)),t}const H=e=>q.get(e);function Re(e,t,{blocked:n,upgrade:r,blocking:s,terminated:a}={}){const i=indexedDB.open(e,t),u=g(i);return r&&i.addEventListener("upgradeneeded",c=>{r(g(i.result),c.oldVersion,c.newVersion,g(i.transaction),c)}),n&&i.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),u.then(c=>{a&&c.addEventListener("close",()=>a()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),u}const Ue=["get","getKey","getAll","getAllKeys","count"],Me=["put","add","delete","clear"],U=new Map;function Z(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(U.get(t))return U.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,s=Me.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Ue.includes(n)))return;const a=async function(i,...u){const c=this.transaction(i,s?"readwrite":"readonly");let l=c.store;return r&&(l=l.index(u.shift())),(await Promise.all([l[n](...u),s&&c.done]))[0]};return U.set(t,a),a}oe(e=>({...e,get:(t,n,r)=>Z(t,n)||e.get(t,n,r),has:(t,n)=>!!Z(t,n)||e.has(t,n)}));const Be=["continue","continuePrimaryKey","advance"],ee={},F=new WeakMap,ce=new WeakMap,Oe={get(e,t){if(!Be.includes(t))return e[t];let n=ee[t];return n||(n=ee[t]=function(...r){F.set(this,ce.get(this)[t](...r))}),n}};async function*Pe(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,Oe);for(ce.set(n,t),q.set(n,H(t));t;)yield n,t=await(F.get(n)||t.continue()),F.delete(n)}function te(e,t){return t===Symbol.asyncIterator&&P(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&P(e,[IDBIndex,IDBObjectStore])}oe(e=>({...e,get(t,n,r){return te(t,n)?Pe:e.get(t,n,r)},has(t,n){return te(t,n)||e.has(t,n)}}));const Ne="receipt_analyzer",je=1;let M=null;function b(){return M||(M=Re(Ne,je,{upgrade(e,t){if(t<1){const n=e.createObjectStore("receipts",{keyPath:"id"});n.createIndex("datetime","datetime"),n.createIndex("merchant","merchant"),n.createIndex("category","category"),n.createIndex("status","status"),n.createIndex("deleted","deleted"),e.createObjectStore("photos",{keyPath:"id"}),e.createObjectStore("exchange_rates",{keyPath:"key"})}}})),M}function G(){return crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}async function v(e){return await(await b()).put("receipts",e),e}async function Y(e){return(await b()).get("receipts",e)}async function He(e){const t=await b(),n=await t.get("receipts",e);n&&(n.deleted=!0,await t.put("receipts",n),n.photo_blob_id&&await t.delete("photos",n.photo_blob_id))}async function E({includeDeleted:e=!1}={}){const t=await(await b()).getAll("receipts");return e?t:t.filter(n=>!n.deleted)}async function le(e){return await(await b()).put("photos",e),e}async function J(e){return(await b()).get("photos",e)}async function Fe(e){return(await b()).get("exchange_rates",e)}async function Ye(e){return await(await b()).put("exchange_rates",e),e}async function Ke(){var e;return(e=navigator.storage)!=null&&e.estimate?navigator.storage.estimate():null}function Ve(e,t){return`${e}_${t}`}function ze(e){return e.toISOString().slice(0,10)}function ue(){return ze(new Date)}function de(e){return e?e.slice(0,10):ue()}async function We(e,t){var s;if(!e)return null;if(e=e.toUpperCase(),e==="USD")return 1;t=t||ue();const n=Ve(e,t),r=await Fe(n);if(r)return r.usd_per_unit;try{const a=await fetch(`https://api.frankfurter.app/${t}?from=${e}&to=USD`);if(!a.ok)return null;const i=await a.json(),u=(s=i==null?void 0:i.rates)==null?void 0:s.USD;return typeof u!="number"?null:(await Ye({key:n,usd_per_unit:u,fetched_at:Date.now()}),u)}catch{return null}}async function pe(e,t,n){const r=await We(t,n);return r==null?{total_usd:null,usd_per_unit:null,date:n}:{total_usd:e*r,usd_per_unit:r,date:n}}function he({photo_blob_id:e}){return{id:G(),createdAt:Date.now(),datetime:null,merchant:"",merchant_address:null,subtotal:null,tax:null,total:0,currency:"",total_usd:null,usd_per_unit:null,usd_per_unit_date:null,payment_method:null,category:"other",status:"parsing",items:[],photo_blob_id:e,photo_phash:null,drive_file_id:null,confidence:{overall:"low"},raw_claude_response:null,sheets_synced:!1,sheets_synced_at:null,deleted:!1,user_edited:!1,notes:null,parse_error:null}}async function Ge(e){const t=de(e.datetime),{total_usd:n,usd_per_unit:r}=await pe(e.total,e.currency,t);return e.total_usd=n,e.usd_per_unit=r,e.usd_per_unit_date=t,e.status="saved",await v(e),e}const Je=1920,me=.9,fe=5*1024*1024,ye=1280,be=.7;async function Qe(e){const t=await createImageBitmap(e);return K(t,Je,me).then(async n=>n.size<=fe?n:K(t,ye,be))}async function Xe(e){const t=await ge(e,me);if(t.size<=fe)return t;const n=await createImageBitmap(t);return K(n,ye,be)}async function K(e,t,n){const{width:r,height:s}=e,a=Math.min(1,t/Math.max(r,s)),i=Math.round(r*a),u=Math.round(s*a),c=document.createElement("canvas");return c.width=i,c.height=u,c.getContext("2d").drawImage(e,0,0,i,u),ge(c,n)}function ge(e,t){return new Promise((n,r)=>{e.toBlob(s=>s?n(s):r(new Error("toBlob failed")),"image/jpeg",t)})}function ve(e){return URL.createObjectURL(e)}const _e="settings_v1",Ze=["шоколад","конфет","печенье","пирожн","торт","мармелад","зефир","chocolate","candy","cookies","cake","donut","cola","кола","pepsi","sprite","fanta","газиров","soda","чипс","chips","сухар","снек","snack","фастфуд","fast food","burger","бургер","pizza","пицц","kfc","mcdonald","энергетик","energy drink","red bull","monster","сок "," juice","мороженое","ice cream","пиво","beer","vodka","водка","вино","wine","виски","whisky","ром ","rum ","сигарет","cigarette","tobacco","табак","кофе","coffee","espresso","латте","капучино"],et=["овощ","vegetable","помидор","огурец","морковь","капуст","фрукт","fruit","яблок","банан","ягод","куриц","chicken","рыб","fish","лосось","salmon","тунец","tuna","греч","buckwheat","овсян","oat","киноа","quinoa","йогурт без","греческий йогурт","творог","орех","nuts","миндаль","almond","вода ","water"],x={claude_api_key:"",health_rules:{unhealthy_keywords:Ze,healthy_keywords:et,custom_overrides:{}},primary_display_currency:"original",default_currency_fallback:"KGS"};function T(){try{const e=localStorage.getItem(_e);if(!e)return structuredClone(x);const t=JSON.parse(e);return{...structuredClone(x),...t,health_rules:{...x.health_rules,...t.health_rules||{}}}}catch{return structuredClone(x)}}function we(e){localStorage.setItem(_e,JSON.stringify(e))}function tt(){const e=T();return e.health_rules=structuredClone(x.health_rules),we(e),e}const nt="https://api.anthropic.com/v1/messages",at="claude-sonnet-4-6",st="2023-06-01",Se=["groceries","dining","transport","utilities","health","clothing","entertainment","tech","fitness","education","travel","other"];function rt(e){const t=e.health_rules.unhealthy_keywords.join(", "),n=e.health_rules.healthy_keywords.join(", ");return`You are a receipt-parsing assistant. Extract structured data from this receipt image.

USER HEALTH PREFERENCES:
The user considers these UNHEALTHY: ${t}
The user considers these HEALTHY: ${n}
Everything else is neutral.

Return ONLY a valid JSON object, no markdown, no explanation:

{
  "datetime": "ISO 8601 like 2026-05-23T14:32:00, or just YYYY-MM-DD if no time, or null",
  "merchant": "store/business name as printed",
  "merchant_address": "address if visible, else null",
  "subtotal": number or null,
  "tax": number or null,
  "total": number (required, total amount paid),
  "currency": "ISO 4217 3-letter code (KGS, RUB, USD, EUR, etc.). Infer from language/symbols/country if not explicit. Fall back to ${e.default_currency_fallback} if truly ambiguous.",
  "payment_method": "cash | card | transfer | null",
  "category": "one of: ${Se.join(", ")}",
  "items": [
    {
      "name": "item name as printed",
      "qty": number (default 1),
      "unit_price": number or null,
      "total_price": number,
      "health_rating": "healthy | neutral | unhealthy"
    }
  ],
  "confidence": {
    "datetime": "high | medium | low",
    "merchant": "high | medium | low",
    "total": "high | medium | low",
    "items": "high | medium | low",
    "overall": "high | medium | low"
  }
}

Rules:
- Numbers are plain numbers, no currency symbols, no thousand separators
- Use period as decimal separator
- If the image is not a receipt or is unreadable, return: {"error": "<short reason>"}
- For items, if you cannot read individual prices, set unit_price/total_price as best-guess and confidence.items = "low"
- Apply health_rating based on USER HEALTH PREFERENCES above. Match keywords loosely (case-insensitive, partial matches OK).
- For non-food categories (transport, utilities, etc.), set all items health_rating = "neutral"
- When unsure about any field, set its confidence to "low" rather than guessing confidently`}async function it(e){const t=await e.arrayBuffer(),n=new Uint8Array(t);let r="";const s=32768;for(let a=0;a<n.length;a+=s)r+=String.fromCharCode.apply(null,n.subarray(a,a+s));return btoa(r)}function ot(e){return e.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim()}function ct(e){return e.error?{ok:!1,reason:e.error}:typeof e.total!="number"?{ok:!1,reason:"missing total"}:e.merchant?e.currency?(Array.isArray(e.items)||(e.items=[]),Se.includes(e.category)||(e.category="other"),e.confidence=e.confidence||{overall:"low"},{ok:!0,parsed:e}):{ok:!1,reason:"missing currency"}:{ok:!1,reason:"missing merchant"}}async function lt(e,{signal:t}={}){var i,u;const n=T();if(!n.claude_api_key)throw new Error("Missing Claude API key. Open Settings to add one.");const r=await it(e),s={model:at,max_tokens:2e3,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:r}},{type:"text",text:rt(n)}]}]};let a;for(let c=0;c<3;c++)try{const l=await fetch(nt,{method:"POST",signal:t,headers:{"content-type":"application/json","x-api-key":n.claude_api_key,"anthropic-version":st,"anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify(s)});if(l.status===401||l.status===403)throw new Error("Invalid Claude API key (401/403). Update it in Settings.");if(l.status===429){a=new Error("Rate limited (429). Backing off."),await new Promise(p=>setTimeout(p,1e4));continue}if(!l.ok){const p=await l.text().catch(()=>"");a=new Error(`Claude API ${l.status}: ${p.slice(0,200)}`),await new Promise(h=>setTimeout(h,2e3));continue}const y=await l.json(),d=ot(((u=(i=y==null?void 0:y.content)==null?void 0:i[0])==null?void 0:u.text)||"");let m;try{m=JSON.parse(d)}catch{return{ok:!1,reason:"non-JSON response from Claude",raw:d}}const o=ct(m);return{ok:o.ok,parsed:o.parsed,reason:o.reason,raw:d}}catch(l){if(l.name==="AbortError")throw l;a=l,c<2&&await new Promise(y=>setTimeout(y,2e3))}return{ok:!1,reason:(a==null?void 0:a.message)||"unknown error"}}const ut=3;let $=[],I=0;const V=new Set;function dt(e){return V.add(e),()=>V.delete(e)}function z(){V.forEach(e=>e({active:I,pendingCount:$.length}))}function A(e){$.includes(e)||($.push(e),z(),xe())}async function xe(){for(;I<ut&&$.length;){const e=$.shift();I++,z(),pt(e).finally(()=>{I--,z(),xe()})}}async function pt(e){const t=await Y(e);if(!t||t.deleted)return;const n=await J(t.photo_blob_id);if(!n){t.status="parse_failed",t.parse_error="Photo missing",await v(t);return}const r=await lt(n.blob),s=await Y(e);if(!s||s.deleted)return;if(!r.ok){s.status="parse_failed",s.parse_error=r.reason||"Parse failed",s.raw_claude_response=r.raw||null,await v(s);return}const a=r.parsed;Object.assign(s,{status:"parsed",datetime:a.datetime||null,merchant:a.merchant,merchant_address:a.merchant_address||null,subtotal:a.subtotal??null,tax:a.tax??null,total:a.total,currency:(a.currency||"USD").toUpperCase(),payment_method:a.payment_method||null,category:a.category,items:(a.items||[]).map(i=>({id:crypto.randomUUID(),name:i.name,qty:i.qty??1,unit_price:i.unit_price??null,total_price:i.total_price,health_rating:i.health_rating||"neutral",health_rating_user_override:!1})),confidence:a.confidence,raw_claude_response:r.raw,parse_error:null}),await v(s)}async function ne(e){const n=!!T().claude_api_key;e.innerHTML=`
    <header class="topbar">
      <h1>Receipt Analyzer</h1>
      <a class="iconbtn" href="#/settings" aria-label="Settings">⚙</a>
    </header>
    ${n?"":`
      <div class="banner banner--warn">
        No Claude API key set. <a href="#/settings">Open Settings</a> to add one before snapping.
      </div>
    `}
    <div class="capture-actions">
      <button class="bigbtn" id="cam-btn">
        <span class="bigbtn-icon">📷</span>
        <span class="bigbtn-label">Camera</span>
        <span class="bigbtn-sub">Snap now</span>
      </button>
      <label class="bigbtn">
        <span class="bigbtn-icon">🖼</span>
        <span class="bigbtn-label">Gallery</span>
        <span class="bigbtn-sub">Import photos</span>
        <input id="gallery-input" type="file" accept="image/*" multiple style="display:none">
      </label>
    </div>
    <section class="queue">
      <h2 class="queue-title">Queue <span id="queue-count" class="queue-count">0</span></h2>
      <div id="queue-grid" class="queue-grid"></div>
      <p class="muted small" id="queue-hint">Tap a receipt thumbnail to review and save.</p>
    </section>
  `;const r=e.querySelector("#cam-btn"),s=e.querySelector("#gallery-input"),a=e.querySelector("#queue-grid"),i=e.querySelector("#queue-count"),u=e.querySelector("#queue-hint"),c=[];async function l(){const o=(await E()).filter(p=>p.status!=="saved").sort((p,h)=>h.createdAt-p.createdAt);if(i.textContent=o.length,a.innerHTML="",!o.length){u.textContent="No receipts in queue.";return}u.textContent="Tap a receipt thumbnail to review and save.";for(const p of o){const h=document.createElement("a");h.className="qtile",h.href=`#/receipt/${p.id}`,h.dataset.id=p.id;const f=await J(p.photo_blob_id);if(f){const _=ve(f.blob);c.push(_),h.innerHTML=`
          <img src="${_}" alt="">
          <span class="qbadge qbadge--${p.status}">${y(p.status)}</span>
        `}else h.innerHTML='<div class="qmissing">missing</div>';a.appendChild(h)}}function y(m){return m==="parsing"?"⏳":m==="parsed"?"✓":m==="parse_failed"?"⚠️":"·"}r.addEventListener("click",()=>ft(l)),s.addEventListener("change",async m=>{const o=Array.from(m.target.files||[]);for(const p of o)await ht(p);s.value="",l()});const d=dt(()=>l());return l(),()=>{d(),c.forEach(m=>URL.revokeObjectURL(m))}}async function ht(e){const t=await Qe(e),n=G();await le({id:n,blob:t,mime_type:"image/jpeg",size_bytes:t.size,created_at:Date.now()});const r=he({photo_blob_id:n});await v(r),A(r.id)}async function mt(e){const t=G();await le({id:t,blob:e,mime_type:"image/jpeg",size_bytes:e.size,created_at:Date.now()});const n=he({photo_blob_id:t});await v(n),A(n.id)}async function ft(e){const t=document.createElement("div");t.className="cam-modal",t.innerHTML=`
    <video autoplay playsinline muted></video>
    <button class="cam-close" aria-label="Close">✕</button>
    <div class="cam-controls">
      <span class="cam-count" id="cam-count">0 snapped</span>
      <button class="cam-shutter" aria-label="Capture"></button>
      <span class="cam-spacer"></span>
    </div>
  `,document.body.appendChild(t);const n=t.querySelector("video"),r=t.querySelector(".cam-close"),s=t.querySelector(".cam-shutter"),a=t.querySelector("#cam-count");let i,u=0;try{i=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:3e3},height:{ideal:3e3}},audio:!1}),n.srcObject=i}catch(l){t.remove(),alert(`Camera access denied or unavailable.

`+l.message+`

On iOS: Settings → Safari → Camera → Allow.`);return}function c(){i==null||i.getTracks().forEach(l=>l.stop()),t.remove(),e==null||e()}r.addEventListener("click",c),s.addEventListener("click",async()=>{if(!n.videoWidth)return;s.classList.add("is-flash"),setTimeout(()=>s.classList.remove("is-flash"),120);const l=document.createElement("canvas");l.width=n.videoWidth,l.height=n.videoHeight,l.getContext("2d").drawImage(n,0,0);const y=await Xe(l);await mt(y),u++,a.textContent=`${u} snapped`,e==null||e()})}function yt(e){if(e==null)return"";const t=String(e);return/[",\n]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}function B(e){return e.map(yt).join(",")+`
`}function Ee(e){var r;let n=B(["id","datetime","merchant","merchant_address","category","subtotal","tax","total","currency","total_usd","usd_per_unit","usd_per_unit_date","payment_method","confidence_overall","notes","created_at","user_edited","item_id","item_name","item_qty","item_unit_price","item_total_price","item_health"]);for(const s of e){const a=[s.id,s.datetime,s.merchant,s.merchant_address,s.category,s.subtotal,s.tax,s.total,s.currency,s.total_usd,s.usd_per_unit,s.usd_per_unit_date,s.payment_method,(r=s.confidence)==null?void 0:r.overall,s.notes,new Date(s.createdAt).toISOString(),s.user_edited];if(!s.items||s.items.length===0)n+=B([...a,"","","","","",""]);else for(const i of s.items)n+=B([...a,i.id,i.name,i.qty,i.unit_price,i.total_price,i.health_rating])}return n}function $e(e,t){const n=new Blob([t],{type:"text/csv;charset=utf-8"}),r=URL.createObjectURL(n),s=document.createElement("a");s.href=r,s.download=e,document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(r),1e3)}const O=["healthy","neutral","unhealthy"];function bt(e){const t=O.indexOf(e);return O[(t+1)%O.length]}function gt(e){return e==="healthy"?"🟢":e==="unhealthy"?"🔴":"🟡"}function vt(e){const t={healthy:0,neutral:0,unhealthy:0};for(const n of e||[])t[n.health_rating]=(t[n.health_rating]||0)+1;return t}const _t=["","groceries","dining","transport","utilities","health","clothing","entertainment","tech","fitness","education","travel","other"],Le=[{id:"all",label:"All time",days:null},{id:"7d",label:"Last 7d",days:7},{id:"30d",label:"Last 30d",days:30},{id:"90d",label:"Last 90d",days:90}];async function wt(e){let t=(await E()).filter(d=>d.status==="saved"),n={category:"",range:"all",search:""};e.innerHTML=`
    <header class="topbar">
      <h1>Receipts</h1>
      <button class="iconbtn" id="export-btn" aria-label="Export CSV">⇩</button>
    </header>
    <div class="filters">
      <select id="filter-cat">
        ${_t.map(d=>`<option value="${d}">${d||"All categories"}</option>`).join("")}
      </select>
      <select id="filter-range">
        ${Le.map(d=>`<option value="${d.id}">${d.label}</option>`).join("")}
      </select>
      <input id="filter-search" type="search" placeholder="Search merchant or item">
    </div>
    <div class="list-summary" id="list-summary"></div>
    <ul id="list-rows" class="list-rows"></ul>
    <div class="empty hidden" id="empty">No receipts match these filters.</div>
  `;const r=e.querySelector("#filter-cat"),s=e.querySelector("#filter-range"),a=e.querySelector("#filter-search"),i=e.querySelector("#list-rows"),u=e.querySelector("#empty"),c=e.querySelector("#list-summary");r.addEventListener("change",()=>{n.category=r.value,l()}),s.addEventListener("change",()=>{n.range=s.value,l()}),a.addEventListener("input",()=>{n.search=a.value.trim().toLowerCase(),l()}),e.querySelector("#export-btn").addEventListener("click",()=>{const d=Ee(t),m=new Date().toISOString().slice(0,10);$e(`receipts-${m}.csv`,d)});function l(){const d=St(t,n);if(i.innerHTML="",!d.length){u.classList.remove("hidden"),c.textContent="";return}u.classList.add("hidden");const m=d.reduce((p,h)=>p+(h.total_usd||0),0);c.textContent=`${d.length} receipts · ≈ $${m.toFixed(2)}`;const o=xt(d);for(const[p,h]of o){const f=document.createElement("li");f.className="list-day",f.textContent=p,i.appendChild(f);for(const _ of h)i.appendChild(y(_))}}function y(d){var h;const m=document.createElement("li");m.className="list-row";const o=vt(d.items),p=d.total_usd!=null?`$${d.total_usd.toFixed(2)}`:"$—";return m.innerHTML=`
      <a class="list-link" href="#/receipt/${d.id}">
        <div class="list-row-main">
          <span class="list-merchant">${Lt(d.merchant)}</span>
          <span class="list-amount">${$t(d.total)} ${d.currency}</span>
        </div>
        <div class="list-row-meta muted small">
          <span>${Et(d.datetime)} · ${d.category}</span>
          <span>${((h=d.items)==null?void 0:h.length)||0} items · 🔴${o.unhealthy} 🟡${o.neutral} 🟢${o.healthy} · ${p}</span>
        </div>
      </a>
    `,m}l()}function St(e,t){const n=Date.now(),r=Le.find(a=>a.id===t.range),s=r!=null&&r.days?n-r.days*864e5:null;return e.filter(a=>!t.category||a.category===t.category).filter(a=>s?(a.datetime?Date.parse(a.datetime):a.createdAt)>=s:!0).filter(a=>{var u;return t.search?(a.merchant+" "+(((u=a.items)==null?void 0:u.map(c=>c.name).join(" "))||"")).toLowerCase().includes(t.search):!0}).sort((a,i)=>{const u=a.datetime?Date.parse(a.datetime):a.createdAt;return(i.datetime?Date.parse(i.datetime):i.createdAt)-u})}function xt(e){const t=new Map;for(const n of e){const r=(n.datetime||new Date(n.createdAt).toISOString()).slice(0,10);t.has(r)||t.set(r,[]),t.get(r).push(n)}return Array.from(t.entries())}function Et(e){if(!e)return"";const t=e.match(/T(\d{2}:\d{2})/);return t?t[1]:""}function $t(e){return e==null?"":e.toLocaleString(void 0,{minimumFractionDigits:0,maximumFractionDigits:2})}function Lt(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}const kt=["groceries","dining","transport","utilities","health","clothing","entertainment","tech","fitness","education","travel","other"];async function Dt(e,t){const n=await Y(t);if(!n){e.innerHTML='<div class="empty">Receipt not found. <a href="#/list">Back to list</a></div>';return}const r=await J(n.photo_blob_id),s=r?ve(r.blob):null;let a=structuredClone(n),i=a.total_usd;e.innerHTML=`
    <header class="topbar topbar--with-back">
      <a class="iconbtn" href="#/capture" aria-label="Back">←</a>
      <h1>${a.status==="saved"?"Receipt":"Review"}</h1>
      <button class="iconbtn" id="del-btn" aria-label="Delete">🗑</button>
    </header>

    ${a.status==="parsing"?'<div class="banner">Parsing… this may take a few seconds.</div>':""}
    ${a.status==="parse_failed"?`
      <div class="banner banner--warn">
        Parse failed: ${a.parse_error||"unknown"}.
        <button class="linkbtn" id="retry-btn">Retry parse</button>
      </div>
    `:""}

    ${s?`
      <div class="photo-wrap">
        <img src="${s}" alt="receipt">
      </div>
    `:""}

    <section class="fields">
      <div class="field ${ae(a,"datetime")}">
        <label>📅 Date & time</label>
        <input id="f-datetime" type="text" placeholder="YYYY-MM-DD or 2026-05-23T14:32" value="${w(a.datetime)}">
      </div>
      <div class="field ${ae(a,"merchant")}">
        <label>🏬 Merchant</label>
        <input id="f-merchant" type="text" value="${w(a.merchant)}">
      </div>
      <div class="field">
        <label>📍 Address</label>
        <input id="f-address" type="text" value="${w(a.merchant_address)}">
      </div>
      <div class="field">
        <label>📂 Category</label>
        <select id="f-category">
          ${kt.map(o=>`<option value="${o}" ${o===a.category?"selected":""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>💱 Currency</label>
          <input id="f-currency" type="text" maxlength="3" value="${w(a.currency)}">
        </div>
        <div class="field">
          <label>💳 Payment</label>
          <select id="f-payment">
            <option value="">—</option>
            <option value="cash" ${a.payment_method==="cash"?"selected":""}>cash</option>
            <option value="card" ${a.payment_method==="card"?"selected":""}>card</option>
            <option value="transfer" ${a.payment_method==="transfer"?"selected":""}>transfer</option>
          </select>
        </div>
      </div>
    </section>

    <section class="items">
      <h2 class="section-title">Items</h2>
      <ul id="items-list" class="items-list"></ul>
      <button class="linkbtn" id="add-item">⊕ Add item</button>
    </section>

    <section class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <input id="f-subtotal" class="num" type="number" step="0.01" value="${a.subtotal??""}">
        <span class="cur">${a.currency||""}</span>
      </div>
      <div class="totals-row">
        <span>Tax</span>
        <input id="f-tax" class="num" type="number" step="0.01" value="${a.tax??""}">
        <span class="cur">${a.currency||""}</span>
      </div>
      <div class="totals-row totals-row--total">
        <span>Total</span>
        <input id="f-total" class="num" type="number" step="0.01" value="${a.total??""}">
        <span class="cur">${a.currency||""}</span>
      </div>
      <div class="totals-row totals-row--usd muted">
        <span>≈</span>
        <span id="usd-preview">${se(i)}</span>
      </div>
    </section>

    <section class="field">
      <label>📝 Notes</label>
      <textarea id="f-notes" rows="2">${w(a.notes)}</textarea>
    </section>

    <div class="actions">
      <button class="btn btn--ghost" id="discard-btn">Discard</button>
      <button class="btn btn--primary" id="save-btn" ${a.status==="parsing"?"disabled":""}>
        ${a.status==="saved"?"Update":"Save"}
      </button>
    </div>
  `;const u=e.querySelector("#items-list");c();function c(){u.innerHTML="",a.items.forEach((o,p)=>{const h=document.createElement("li");h.className="item",h.innerHTML=`
        <div class="item-main">
          <input class="item-name" value="${w(o.name)}">
          <input class="item-total num" type="number" step="0.01" value="${o.total_price??""}">
        </div>
        <div class="item-meta">
          <label>×<input class="item-qty num" type="number" step="1" min="0" value="${o.qty??1}"></label>
          <label>unit <input class="item-unit num" type="number" step="0.01" value="${o.unit_price??""}"></label>
          <button class="health-pill health-pill--${o.health_rating}" data-idx="${p}">${gt(o.health_rating)} ${o.health_rating}</button>
          <button class="item-del" data-idx="${p}" aria-label="Remove">✕</button>
        </div>
      `,h.querySelector(".item-name").addEventListener("input",f=>{o.name=f.target.value}),h.querySelector(".item-total").addEventListener("input",f=>{o.total_price=S(f.target.value)}),h.querySelector(".item-qty").addEventListener("input",f=>{o.qty=S(f.target.value)??1}),h.querySelector(".item-unit").addEventListener("input",f=>{o.unit_price=S(f.target.value)}),h.querySelector(".health-pill").addEventListener("click",()=>{o.health_rating=bt(o.health_rating),o.health_rating_user_override=!0,c()}),h.querySelector(".item-del").addEventListener("click",()=>{a.items.splice(p,1),c()}),u.appendChild(h)})}e.querySelector("#add-item").addEventListener("click",()=>{a.items.push({id:crypto.randomUUID(),name:"",qty:1,unit_price:null,total_price:0,health_rating:"neutral",health_rating_user_override:!0}),c()}),m("#f-datetime",o=>{a.datetime=o||null,y()}),m("#f-merchant",o=>{a.merchant=o}),m("#f-address",o=>{a.merchant_address=o||null}),m("#f-category",o=>{a.category=o}),m("#f-currency",o=>{a.currency=o.toUpperCase(),e.querySelectorAll(".cur").forEach(p=>p.textContent=a.currency),y()}),m("#f-payment",o=>{a.payment_method=o||null}),m("#f-subtotal",o=>{a.subtotal=S(o)}),m("#f-tax",o=>{a.tax=S(o)}),m("#f-total",o=>{a.total=S(o)??0,y()}),m("#f-notes",o=>{a.notes=o||null});let l=0;async function y(){const o=++l,p=e.querySelector("#usd-preview");p.textContent="…";const h=de(a.datetime),{total_usd:f}=await pe(a.total,a.currency,h);o===l&&(p.textContent=se(f))}e.querySelector("#del-btn").addEventListener("click",async()=>{confirm("Delete this receipt?")&&(await He(a.id),D("#/capture"))}),e.querySelector("#discard-btn").addEventListener("click",()=>D("#/capture")),e.querySelector("#save-btn").addEventListener("click",async()=>{a.user_edited=!0,await Ge(a),D(a.status==="saved"?"#/list":"#/capture")});const d=e.querySelector("#retry-btn");d&&d.addEventListener("click",async()=>{a.status="parsing",a.parse_error=null,await v(a),A(a.id),D("#/capture")});function m(o,p){const h=e.querySelector(o);if(!h)return;const f=h.tagName==="SELECT"?"change":"input";h.addEventListener(f,_=>p(_.target.value))}return()=>{s&&URL.revokeObjectURL(s)}}function w(e){return e==null?"":String(e).replace(/"/g,"&quot;")}function S(e){if(e===""||e==null)return null;const t=Number(e);return Number.isFinite(t)?t:null}function ae(e,t){var r;return((r=e.confidence)==null?void 0:r[t])==="low"?"is-low-conf":""}function se(e){return e==null?"$—":"$"+e.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}async function ke(e){const t=T(),n=await Ke(),r=n?(n.usage/1024/1024).toFixed(1):"?",s=n?(n.quota/1024/1024).toFixed(0):"?",a=(await E()).length;e.innerHTML=`
    <header class="topbar"><h1>Settings</h1></header>

    <section class="card">
      <h2>Claude API</h2>
      <label class="field">
        <span>API key</span>
        <input id="api-key" type="password" placeholder="sk-ant-…" value="${L(t.claude_api_key)}">
      </label>
      <p class="muted small">Stored locally in your browser. Never sent anywhere except api.anthropic.com.</p>
    </section>

    <section class="card">
      <h2>Health rules</h2>
      <label class="field">
        <span>Unhealthy keywords (comma-separated)</span>
        <textarea id="unhealthy" rows="4">${L(t.health_rules.unhealthy_keywords.join(", "))}</textarea>
      </label>
      <label class="field">
        <span>Healthy keywords (comma-separated)</span>
        <textarea id="healthy" rows="4">${L(t.health_rules.healthy_keywords.join(", "))}</textarea>
      </label>
      <button class="btn btn--ghost" id="reset-health">Reset to defaults</button>
    </section>

    <section class="card">
      <h2>Currency</h2>
      <label class="field">
        <span>Default currency when ambiguous</span>
        <input id="fallback-cur" type="text" maxlength="3" value="${L(t.default_currency_fallback)}">
      </label>
      <label class="field">
        <span>Display</span>
        <select id="display-cur">
          <option value="original" ${t.primary_display_currency==="original"?"selected":""}>Original</option>
          <option value="USD" ${t.primary_display_currency==="USD"?"selected":""}>USD</option>
        </select>
      </label>
    </section>

    <section class="card">
      <h2>Data</h2>
      <p class="muted small">${a} receipts · ${r} MB used of ~${s} MB available</p>
      <div class="actions">
        <button class="btn btn--ghost" id="export-all">Export all CSV</button>
        <button class="btn btn--danger" id="wipe">Wipe local data</button>
      </div>
    </section>

    <section class="card">
      <h2>About</h2>
      <p class="muted small">Receipt Analyzer v1.0 — local-only build. Google Sheets sync coming in v1.1.</p>
    </section>

    <div class="actions actions--sticky">
      <button class="btn btn--primary" id="save-btn">Save changes</button>
    </div>
  `,e.querySelector("#reset-health").addEventListener("click",()=>{confirm("Reset health keywords to defaults?")&&(tt(),ke(e))}),e.querySelector("#export-all").addEventListener("click",async()=>{const i=(await E()).filter(c=>c.status==="saved"),u=Ee(i);$e(`receipts-${new Date().toISOString().slice(0,10)}.csv`,u)}),e.querySelector("#wipe").addEventListener("click",async()=>{var u;if(!confirm("Delete ALL local receipts and photos? This cannot be undone.")||!confirm("Really wipe everything?"))return;const i=await((u=indexedDB.databases)==null?void 0:u.call(indexedDB))||[];for(const c of i)c.name&&indexedDB.deleteDatabase(c.name);localStorage.removeItem("settings_v1"),location.reload()}),e.querySelector("#save-btn").addEventListener("click",()=>{const i={...t,claude_api_key:e.querySelector("#api-key").value.trim(),default_currency_fallback:e.querySelector("#fallback-cur").value.trim().toUpperCase()||"USD",primary_display_currency:e.querySelector("#display-cur").value,health_rules:{...t.health_rules,unhealthy_keywords:re(e.querySelector("#unhealthy").value),healthy_keywords:re(e.querySelector("#healthy").value)}};we(i),It(e.querySelector("#save-btn"))})}function re(e){return e.split(",").map(t=>t.trim()).filter(Boolean)}function L(e){return e==null?"":String(e).replace(/"/g,"&quot;")}function It(e){const t=e.textContent;e.textContent="Saved ✓",e.disabled=!0,setTimeout(()=>{e.textContent=t,e.disabled=!1},1200)}const Ct=[{id:"capture",href:"#/capture",label:"Capture",icon:"📷"},{id:"list",href:"#/list",label:"List",icon:"📋"},{id:"settings",href:"#/settings",label:"Settings",icon:"⚙"}];function qt(e){const t=document.createElement("nav");return t.className="tabbar",t.innerHTML=Ct.map(n=>`
    <a href="${n.href}" class="tab ${n.id===e?"is-active":""}">
      <span class="tab-icon">${n.icon}</span>
      <span class="tab-label">${n.label}</span>
    </a>
  `).join(""),t}const ie=[{match:/^#?\/?$/,render:ne,tab:"capture"},{match:/^#?\/capture$/,render:ne,tab:"capture"},{match:/^#?\/list$/,render:wt,tab:"list"},{match:/^#?\/settings$/,render:ke,tab:"settings"},{match:/^#?\/receipt\/([\w-]+)$/,render:Dt,tab:null}];let C,k=null;function Tt(e){for(const t of ie){const n=e.match(t.match);if(n)return{route:t,params:n.slice(1)}}return{route:ie[0],params:[]}}async function W(){if(k){try{k()}catch{}k=null}C.innerHTML="";const e=document.createElement("main");e.className="screen",C.appendChild(e);const{route:t,params:n}=Tt(location.hash||"#/"),r=await t.render(e,...n);typeof r=="function"&&(k=r),t.tab&&C.appendChild(qt(t.tab))}function D(e){location.hash===e?W():location.hash=e}function At(e){C=e,window.addEventListener("hashchange",W),W()}async function Rt(){At(document.getElementById("app"));const e=await E();for(const t of e)t.status==="parsing"&&A(t.id)}Rt();
