(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();const j=(e,t)=>t.some(n=>e instanceof n);let ee,te;function qe(){return ee||(ee=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ae(){return te||(te=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const H=new WeakMap,R=new WeakMap,q=new WeakMap;function Te(e){const t=new Promise((n,s)=>{const r=()=>{e.removeEventListener("success",a),e.removeEventListener("error",i)},a=()=>{n(g(e.result)),r()},i=()=>{s(e.error),r()};e.addEventListener("success",a),e.addEventListener("error",i)});return q.set(t,e),t}function Re(e){if(H.has(e))return;const t=new Promise((n,s)=>{const r=()=>{e.removeEventListener("complete",a),e.removeEventListener("error",i),e.removeEventListener("abort",i)},a=()=>{n(),r()},i=()=>{s(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",a),e.addEventListener("error",i),e.addEventListener("abort",i)});H.set(e,t)}let F={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return H.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return g(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function ue(e){F=e(F)}function Ue(e){return Ae().includes(e)?function(...t){return e.apply(Y(this),t),g(this.request)}:function(...t){return g(e.apply(Y(this),t))}}function Me(e){return typeof e=="function"?Ue(e):(e instanceof IDBTransaction&&Re(e),j(e,qe())?new Proxy(e,F):e)}function g(e){if(e instanceof IDBRequest)return Te(e);if(R.has(e))return R.get(e);const t=Me(e);return t!==e&&(R.set(e,t),q.set(t,e)),t}const Y=e=>q.get(e);function Be(e,t,{blocked:n,upgrade:s,blocking:r,terminated:a}={}){const i=indexedDB.open(e,t),u=g(i);return s&&i.addEventListener("upgradeneeded",c=>{s(g(i.result),c.oldVersion,c.newVersion,g(i.transaction),c)}),n&&i.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),u.then(c=>{a&&c.addEventListener("close",()=>a()),r&&c.addEventListener("versionchange",l=>r(l.oldVersion,l.newVersion,l))}).catch(()=>{}),u}const Oe=["get","getKey","getAll","getAllKeys","count"],Pe=["put","add","delete","clear"],U=new Map;function ne(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(U.get(t))return U.get(t);const n=t.replace(/FromIndex$/,""),s=t!==n,r=Pe.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||Oe.includes(n)))return;const a=async function(i,...u){const c=this.transaction(i,r?"readwrite":"readonly");let l=c.store;return s&&(l=l.index(u.shift())),(await Promise.all([l[n](...u),r&&c.done]))[0]};return U.set(t,a),a}ue(e=>({...e,get:(t,n,s)=>ne(t,n)||e.get(t,n,s),has:(t,n)=>!!ne(t,n)||e.has(t,n)}));const Ne=["continue","continuePrimaryKey","advance"],ae={},K=new WeakMap,de=new WeakMap,je={get(e,t){if(!Ne.includes(t))return e[t];let n=ae[t];return n||(n=ae[t]=function(...s){K.set(this,de.get(this)[t](...s))}),n}};async function*He(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,je);for(de.set(n,t),q.set(n,Y(t));t;)yield n,t=await(K.get(n)||t.continue()),K.delete(n)}function re(e,t){return t===Symbol.asyncIterator&&j(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&j(e,[IDBIndex,IDBObjectStore])}ue(e=>({...e,get(t,n,s){return re(t,n)?He:e.get(t,n,s)},has(t,n){return re(t,n)||e.has(t,n)}}));const Fe="receipt_analyzer",Ye=1;let M=null;function b(){return M||(M=Be(Fe,Ye,{upgrade(e,t){if(t<1){const n=e.createObjectStore("receipts",{keyPath:"id"});n.createIndex("datetime","datetime"),n.createIndex("merchant","merchant"),n.createIndex("category","category"),n.createIndex("status","status"),n.createIndex("deleted","deleted"),e.createObjectStore("photos",{keyPath:"id"}),e.createObjectStore("exchange_rates",{keyPath:"key"})}}})),M}function Q(){return crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}async function v(e){return await(await b()).put("receipts",e),e}async function V(e){return(await b()).get("receipts",e)}async function Ke(e){const t=await b(),n=await t.get("receipts",e);n&&(n.deleted=!0,await t.put("receipts",n),n.photo_blob_id&&await t.delete("photos",n.photo_blob_id))}async function E({includeDeleted:e=!1}={}){const t=await(await b()).getAll("receipts");return e?t:t.filter(n=>!n.deleted)}async function pe(e){return await(await b()).put("photos",e),e}async function X(e){return(await b()).get("photos",e)}async function Ve(e){return(await b()).get("exchange_rates",e)}async function ze(e){return await(await b()).put("exchange_rates",e),e}async function We(){var e;return(e=navigator.storage)!=null&&e.estimate?navigator.storage.estimate():null}function Ge(e,t){return`${e}_${t}`}function Je(e){return e.toISOString().slice(0,10)}function he(){return Je(new Date)}function fe(e){return e?e.slice(0,10):he()}async function Qe(e,t){var r;if(!e)return null;if(e=e.toUpperCase(),e==="USD")return 1;t=t||he();const n=Ge(e,t),s=await Ve(n);if(s)return s.usd_per_unit;try{const a=await fetch(`https://api.frankfurter.app/${t}?from=${e}&to=USD`);if(!a.ok)return null;const i=await a.json(),u=(r=i==null?void 0:i.rates)==null?void 0:r.USD;return typeof u!="number"?null:(await ze({key:n,usd_per_unit:u,fetched_at:Date.now()}),u)}catch{return null}}async function me(e,t,n){const s=await Qe(t,n);return s==null?{total_usd:null,usd_per_unit:null,date:n}:{total_usd:e*s,usd_per_unit:s,date:n}}function ye({photo_blob_id:e}){return{id:Q(),createdAt:Date.now(),datetime:null,merchant:"",merchant_address:null,subtotal:null,tax:null,total:0,currency:"",total_usd:null,usd_per_unit:null,usd_per_unit_date:null,payment_method:null,category:"other",status:"parsing",items:[],photo_blob_id:e,photo_phash:null,drive_file_id:null,confidence:{overall:"low"},raw_claude_response:null,sheets_synced:!1,sheets_synced_at:null,deleted:!1,user_edited:!1,notes:null,parse_error:null}}async function Z(e){const t=fe(e.datetime),{total_usd:n,usd_per_unit:s}=await me(e.total,e.currency,t);return e.total_usd=n,e.usd_per_unit=s,e.usd_per_unit_date=t,e.status="saved",await v(e),e}const Xe=1920,be=.9,ge=5*1024*1024,ve=1280,we=.7;async function Ze(e){const t=await createImageBitmap(e);return z(t,Xe,be).then(async n=>n.size<=ge?n:z(t,ve,we))}async function et(e){const t=await _e(e,be);if(t.size<=ge)return t;const n=await createImageBitmap(t);return z(n,ve,we)}async function z(e,t,n){const{width:s,height:r}=e,a=Math.min(1,t/Math.max(s,r)),i=Math.round(s*a),u=Math.round(r*a),c=document.createElement("canvas");return c.width=i,c.height=u,c.getContext("2d").drawImage(e,0,0,i,u),_e(c,n)}function _e(e,t){return new Promise((n,s)=>{e.toBlob(r=>r?n(r):s(new Error("toBlob failed")),"image/jpeg",t)})}function Se(e){return URL.createObjectURL(e)}const xe="settings_v1",tt=["шоколад","конфет","печенье","пирожн","торт","мармелад","зефир","chocolate","candy","cookies","cake","donut","cola","кола","pepsi","sprite","fanta","газиров","soda","чипс","chips","сухар","снек","snack","фастфуд","fast food","burger","бургер","pizza","пицц","kfc","mcdonald","энергетик","energy drink","red bull","monster","сок "," juice","мороженое","ice cream","пиво","beer","vodka","водка","вино","wine","виски","whisky","ром ","rum ","сигарет","cigarette","tobacco","табак","кофе","coffee","espresso","латте","капучино"],nt=["овощ","vegetable","помидор","огурец","морковь","капуст","фрукт","fruit","яблок","банан","ягод","куриц","chicken","рыб","fish","лосось","salmon","тунец","tuna","греч","buckwheat","овсян","oat","киноа","quinoa","йогурт без","греческий йогурт","творог","орех","nuts","миндаль","almond","вода ","water"],x={claude_api_key:"",health_rules:{unhealthy_keywords:tt,healthy_keywords:nt,custom_overrides:{}},primary_display_currency:"original",default_currency_fallback:"KGS"};function A(){try{const e=localStorage.getItem(xe);if(!e)return structuredClone(x);const t=JSON.parse(e);return{...structuredClone(x),...t,health_rules:{...x.health_rules,...t.health_rules||{}}}}catch{return structuredClone(x)}}function Ee(e){localStorage.setItem(xe,JSON.stringify(e))}function at(){const e=A();return e.health_rules=structuredClone(x.health_rules),Ee(e),e}const rt="https://api.anthropic.com/v1/messages",st="claude-sonnet-4-6",it="2023-06-01",Le=["groceries","dining","transport","utilities","health","clothing","entertainment","tech","fitness","education","travel","other"];function ot(e){const t=e.health_rules.unhealthy_keywords.join(", "),n=e.health_rules.healthy_keywords.join(", ");return`You are a receipt-parsing assistant. Extract structured data from this receipt image.

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
  "category": "one of: ${Le.join(", ")}",
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
- When unsure about any field, set its confidence to "low" rather than guessing confidently`}async function ct(e){const t=await e.arrayBuffer(),n=new Uint8Array(t);let s="";const r=32768;for(let a=0;a<n.length;a+=r)s+=String.fromCharCode.apply(null,n.subarray(a,a+r));return btoa(s)}function lt(e){return e.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim()}function ut(e){return e.error?{ok:!1,reason:e.error}:typeof e.total!="number"?{ok:!1,reason:"missing total"}:e.merchant?e.currency?(Array.isArray(e.items)||(e.items=[]),Le.includes(e.category)||(e.category="other"),e.confidence=e.confidence||{overall:"low"},{ok:!0,parsed:e}):{ok:!1,reason:"missing currency"}:{ok:!1,reason:"missing merchant"}}async function dt(e,{signal:t}={}){var i,u;const n=A();if(!n.claude_api_key)throw new Error("Missing Claude API key. Open Settings to add one.");const s=await ct(e),r={model:st,max_tokens:2e3,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:s}},{type:"text",text:ot(n)}]}]};let a;for(let c=0;c<3;c++)try{const l=await fetch(rt,{method:"POST",signal:t,headers:{"content-type":"application/json","x-api-key":n.claude_api_key,"anthropic-version":it,"anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify(r)});if(l.status===401||l.status===403)throw new Error("Invalid Claude API key (401/403). Update it in Settings.");if(l.status===429){a=new Error("Rate limited (429). Backing off."),await new Promise(p=>setTimeout(p,1e4));continue}if(!l.ok){const p=await l.text().catch(()=>"");a=new Error(`Claude API ${l.status}: ${p.slice(0,200)}`),await new Promise(h=>setTimeout(h,2e3));continue}const y=await l.json(),d=lt(((u=(i=y==null?void 0:y.content)==null?void 0:i[0])==null?void 0:u.text)||"");let f;try{f=JSON.parse(d)}catch{return{ok:!1,reason:"non-JSON response from Claude",raw:d}}const o=ut(f);return{ok:o.ok,parsed:o.parsed,reason:o.reason,raw:d}}catch(l){if(l.name==="AbortError")throw l;a=l,c<2&&await new Promise(y=>setTimeout(y,2e3))}return{ok:!1,reason:(a==null?void 0:a.message)||"unknown error"}}const pt=3;function B(e){return String(e||"").toLowerCase()}function ht(e){if(e.status!=="parsed"||!e.merchant||!e.currency||!(e.total>0))return!1;const t=e.confidence||{};return!(B(t.overall)==="low"||B(t.merchant)==="low"||B(t.total)==="low")}let L=[],I=0;const W=new Set;function ft(e){return W.add(e),()=>W.delete(e)}function G(){W.forEach(e=>e({active:I,pendingCount:L.length}))}function T(e){L.includes(e)||(L.push(e),G(),$e())}async function $e(){for(;I<pt&&L.length;){const e=L.shift();I++,G(),mt(e).finally(()=>{I--,G(),$e()})}}async function mt(e){const t=await V(e);if(!t||t.deleted)return;const n=await X(t.photo_blob_id);if(!n){t.status="parse_failed",t.parse_error="Photo missing",await v(t);return}const s=await dt(n.blob),r=await V(e);if(!r||r.deleted)return;if(!s.ok){r.status="parse_failed",r.parse_error=s.reason||"Parse failed",r.raw_claude_response=s.raw||null,await v(r);return}const a=s.parsed;if(Object.assign(r,{status:"parsed",datetime:a.datetime||null,merchant:a.merchant,merchant_address:a.merchant_address||null,subtotal:a.subtotal??null,tax:a.tax??null,total:a.total,currency:(a.currency||"USD").toUpperCase(),payment_method:a.payment_method||null,category:a.category,items:(a.items||[]).map(i=>({id:crypto.randomUUID(),name:i.name,qty:i.qty??1,unit_price:i.unit_price??null,total_price:i.total_price,health_rating:i.health_rating||"neutral",health_rating_user_override:!1})),confidence:a.confidence,raw_claude_response:s.raw,parse_error:null}),await v(r),ht(r))try{await Z(r)}catch(i){console.warn("Auto-save failed, leaving in queue for review:",i)}}async function se(e){const n=!!A().claude_api_key;e.innerHTML=`
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
      <h2 class="queue-title">Needs review <span id="queue-count" class="queue-count">0</span></h2>
      <div id="queue-grid" class="queue-grid"></div>
      <p class="muted small" id="queue-hint">Confident parses auto-save to the list. Tap a thumbnail here to review the rest.</p>
    </section>
  `;const s=e.querySelector("#cam-btn"),r=e.querySelector("#gallery-input"),a=e.querySelector("#queue-grid"),i=e.querySelector("#queue-count"),u=e.querySelector("#queue-hint"),c=[];async function l(){const o=(await E()).filter(p=>p.status!=="saved").sort((p,h)=>h.createdAt-p.createdAt);if(i.textContent=o.length,a.innerHTML="",!o.length){u.textContent="Nothing to review. Snap a receipt or check the list for saved ones.";return}u.textContent="Confident parses auto-save to the list. Tap a thumbnail here to review the rest.";for(const p of o){const h=document.createElement("a");h.className="qtile",h.href=`#/receipt/${p.id}`,h.dataset.id=p.id;const m=await X(p.photo_blob_id);if(m){const w=Se(m.blob);c.push(w),h.innerHTML=`
          <img src="${w}" alt="">
          <span class="qbadge qbadge--${p.status}">${y(p.status)}</span>
        `}else h.innerHTML='<div class="qmissing">missing</div>';a.appendChild(h)}}function y(f){return f==="parsing"?"⏳":f==="parsed"?"✓":f==="parse_failed"?"⚠️":"·"}s.addEventListener("click",()=>gt(l)),r.addEventListener("change",async f=>{const o=Array.from(f.target.files||[]);for(const p of o)await yt(p);r.value="",l()});const d=ft(()=>l());return l(),()=>{d(),c.forEach(f=>URL.revokeObjectURL(f))}}async function yt(e){const t=await Ze(e),n=Q();await pe({id:n,blob:t,mime_type:"image/jpeg",size_bytes:t.size,created_at:Date.now()});const s=ye({photo_blob_id:n});await v(s),T(s.id)}async function bt(e){const t=Q();await pe({id:t,blob:e,mime_type:"image/jpeg",size_bytes:e.size,created_at:Date.now()});const n=ye({photo_blob_id:t});await v(n),T(n.id)}async function gt(e){const t=document.createElement("div");t.className="cam-modal",t.innerHTML=`
    <video autoplay playsinline muted></video>
    <button class="cam-close" aria-label="Close">✕</button>
    <div class="cam-controls">
      <span class="cam-count" id="cam-count">0 snapped</span>
      <button class="cam-shutter" aria-label="Capture"></button>
      <span class="cam-spacer"></span>
    </div>
  `,document.body.appendChild(t);const n=t.querySelector("video"),s=t.querySelector(".cam-close"),r=t.querySelector(".cam-shutter"),a=t.querySelector("#cam-count");let i,u=0;try{i=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:3e3},height:{ideal:3e3}},audio:!1}),n.srcObject=i}catch(l){t.remove(),alert(`Camera access denied or unavailable.

`+l.message+`

On iOS: Settings → Safari → Camera → Allow.`);return}function c(){i==null||i.getTracks().forEach(l=>l.stop()),t.remove(),e==null||e()}s.addEventListener("click",c),r.addEventListener("click",async()=>{if(!n.videoWidth)return;r.classList.add("is-flash"),setTimeout(()=>r.classList.remove("is-flash"),120);const l=document.createElement("canvas");l.width=n.videoWidth,l.height=n.videoHeight,l.getContext("2d").drawImage(n,0,0);const y=await et(l);await bt(y),u++,a.textContent=`${u} snapped`,e==null||e()})}function vt(e){if(e==null)return"";const t=String(e);return/[",\n]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}function O(e){return e.map(vt).join(",")+`
`}function ke(e){var s;let n=O(["id","datetime","merchant","merchant_address","category","subtotal","tax","total","currency","total_usd","usd_per_unit","usd_per_unit_date","payment_method","confidence_overall","notes","created_at","user_edited","item_id","item_name","item_qty","item_unit_price","item_total_price","item_health"]);for(const r of e){const a=[r.id,r.datetime,r.merchant,r.merchant_address,r.category,r.subtotal,r.tax,r.total,r.currency,r.total_usd,r.usd_per_unit,r.usd_per_unit_date,r.payment_method,(s=r.confidence)==null?void 0:s.overall,r.notes,new Date(r.createdAt).toISOString(),r.user_edited];if(!r.items||r.items.length===0)n+=O([...a,"","","","","",""]);else for(const i of r.items)n+=O([...a,i.id,i.name,i.qty,i.unit_price,i.total_price,i.health_rating])}return n}function De(e,t){const n=new Blob([t],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download=e,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(s),1e3)}const P=["healthy","neutral","unhealthy"];function wt(e){const t=P.indexOf(e);return P[(t+1)%P.length]}function _t(e){return e==="healthy"?"🟢":e==="unhealthy"?"🔴":"🟡"}function St(e){const t={healthy:0,neutral:0,unhealthy:0};for(const n of e||[])t[n.health_rating]=(t[n.health_rating]||0)+1;return t}const xt=["","groceries","dining","transport","utilities","health","clothing","entertainment","tech","fitness","education","travel","other"],Ie=[{id:"all",label:"All time",days:null},{id:"7d",label:"Last 7d",days:7},{id:"30d",label:"Last 30d",days:30},{id:"90d",label:"Last 90d",days:90}];async function Et(e){let t=(await E()).filter(d=>d.status==="saved"),n={category:"",range:"all",search:""};e.innerHTML=`
    <header class="topbar">
      <h1>Receipts</h1>
      <button class="iconbtn" id="export-btn" aria-label="Export CSV">⇩</button>
    </header>
    <div class="filters">
      <select id="filter-cat">
        ${xt.map(d=>`<option value="${d}">${d||"All categories"}</option>`).join("")}
      </select>
      <select id="filter-range">
        ${Ie.map(d=>`<option value="${d.id}">${d.label}</option>`).join("")}
      </select>
      <input id="filter-search" type="search" placeholder="Search merchant or item">
    </div>
    <div class="list-summary" id="list-summary"></div>
    <ul id="list-rows" class="list-rows"></ul>
    <div class="empty hidden" id="empty">No receipts match these filters.</div>
  `;const s=e.querySelector("#filter-cat"),r=e.querySelector("#filter-range"),a=e.querySelector("#filter-search"),i=e.querySelector("#list-rows"),u=e.querySelector("#empty"),c=e.querySelector("#list-summary");s.addEventListener("change",()=>{n.category=s.value,l()}),r.addEventListener("change",()=>{n.range=r.value,l()}),a.addEventListener("input",()=>{n.search=a.value.trim().toLowerCase(),l()}),e.querySelector("#export-btn").addEventListener("click",()=>{const d=ke(t),f=new Date().toISOString().slice(0,10);De(`receipts-${f}.csv`,d)});function l(){const d=Lt(t,n);if(i.innerHTML="",!d.length){u.classList.remove("hidden"),c.textContent="";return}u.classList.add("hidden");const f=d.reduce((p,h)=>p+(h.total_usd||0),0);c.textContent=`${d.length} receipts · ≈ $${f.toFixed(2)}`;const o=$t(d);for(const[p,h]of o){const m=document.createElement("li");m.className="list-day",m.textContent=p,i.appendChild(m);for(const w of h)i.appendChild(y(w))}}function y(d){var h;const f=document.createElement("li");f.className="list-row";const o=St(d.items),p=d.total_usd!=null?`$${d.total_usd.toFixed(2)}`:"$—";return f.innerHTML=`
      <a class="list-link" href="#/receipt/${d.id}">
        <div class="list-row-main">
          <span class="list-merchant">${It(d.merchant)}</span>
          <span class="list-amount">${Dt(d.total)} ${d.currency}</span>
        </div>
        <div class="list-row-meta muted small">
          <span>${kt(d.datetime)} · ${d.category}</span>
          <span>${((h=d.items)==null?void 0:h.length)||0} items · 🔴${o.unhealthy} 🟡${o.neutral} 🟢${o.healthy} · ${p}</span>
        </div>
      </a>
    `,f}l()}function Lt(e,t){const n=Date.now(),s=Ie.find(a=>a.id===t.range),r=s!=null&&s.days?n-s.days*864e5:null;return e.filter(a=>!t.category||a.category===t.category).filter(a=>r?(a.datetime?Date.parse(a.datetime):a.createdAt)>=r:!0).filter(a=>{var u;return t.search?(a.merchant+" "+(((u=a.items)==null?void 0:u.map(c=>c.name).join(" "))||"")).toLowerCase().includes(t.search):!0}).sort((a,i)=>{const u=a.datetime?Date.parse(a.datetime):a.createdAt;return(i.datetime?Date.parse(i.datetime):i.createdAt)-u})}function $t(e){const t=new Map;for(const n of e){const s=(n.datetime||new Date(n.createdAt).toISOString()).slice(0,10);t.has(s)||t.set(s,[]),t.get(s).push(n)}return Array.from(t.entries())}function kt(e){if(!e)return"";const t=e.match(/T(\d{2}:\d{2})/);return t?t[1]:""}function Dt(e){return e==null?"":e.toLocaleString(void 0,{minimumFractionDigits:0,maximumFractionDigits:2})}function It(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}const Ct=["groceries","dining","transport","utilities","health","clothing","entertainment","tech","fitness","education","travel","other"];async function qt(e,t){const n=await V(t);if(!n){e.innerHTML='<div class="empty">Receipt not found. <a href="#/list">Back to list</a></div>';return}const s=await X(n.photo_blob_id),r=s?Se(s.blob):null;let a=structuredClone(n),i=a.total_usd;e.innerHTML=`
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

    ${r?`
      <div class="photo-wrap">
        <img src="${r}" alt="receipt">
      </div>
    `:""}

    <section class="fields">
      <div class="field ${ie(a,"datetime")}">
        <label>📅 Date & time</label>
        <input id="f-datetime" type="text" placeholder="YYYY-MM-DD or 2026-05-23T14:32" value="${_(a.datetime)}">
      </div>
      <div class="field ${ie(a,"merchant")}">
        <label>🏬 Merchant</label>
        <input id="f-merchant" type="text" value="${_(a.merchant)}">
      </div>
      <div class="field">
        <label>📍 Address</label>
        <input id="f-address" type="text" value="${_(a.merchant_address)}">
      </div>
      <div class="field">
        <label>📂 Category</label>
        <select id="f-category">
          ${Ct.map(o=>`<option value="${o}" ${o===a.category?"selected":""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>💱 Currency</label>
          <input id="f-currency" type="text" maxlength="3" value="${_(a.currency)}">
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
        <span id="usd-preview">${oe(i)}</span>
      </div>
    </section>

    <section class="field">
      <label>📝 Notes</label>
      <textarea id="f-notes" rows="2">${_(a.notes)}</textarea>
    </section>

    <div class="actions">
      <button class="btn btn--ghost" id="discard-btn">Discard</button>
      <button class="btn btn--primary" id="save-btn" ${a.status==="parsing"?"disabled":""}>
        ${a.status==="saved"?"Update":"Save"}
      </button>
    </div>
  `;const u=e.querySelector("#items-list");c();function c(){u.innerHTML="",a.items.forEach((o,p)=>{const h=document.createElement("li");h.className="item",h.innerHTML=`
        <div class="item-main">
          <input class="item-name" value="${_(o.name)}">
          <input class="item-total num" type="number" step="0.01" value="${o.total_price??""}">
        </div>
        <div class="item-meta">
          <label>×<input class="item-qty num" type="number" step="1" min="0" value="${o.qty??1}"></label>
          <label>unit <input class="item-unit num" type="number" step="0.01" value="${o.unit_price??""}"></label>
          <button class="health-pill health-pill--${o.health_rating}" data-idx="${p}">${_t(o.health_rating)} ${o.health_rating}</button>
          <button class="item-del" data-idx="${p}" aria-label="Remove">✕</button>
        </div>
      `,h.querySelector(".item-name").addEventListener("input",m=>{o.name=m.target.value}),h.querySelector(".item-total").addEventListener("input",m=>{o.total_price=S(m.target.value)}),h.querySelector(".item-qty").addEventListener("input",m=>{o.qty=S(m.target.value)??1}),h.querySelector(".item-unit").addEventListener("input",m=>{o.unit_price=S(m.target.value)}),h.querySelector(".health-pill").addEventListener("click",()=>{o.health_rating=wt(o.health_rating),o.health_rating_user_override=!0,c()}),h.querySelector(".item-del").addEventListener("click",()=>{a.items.splice(p,1),c()}),u.appendChild(h)})}e.querySelector("#add-item").addEventListener("click",()=>{a.items.push({id:crypto.randomUUID(),name:"",qty:1,unit_price:null,total_price:0,health_rating:"neutral",health_rating_user_override:!0}),c()}),f("#f-datetime",o=>{a.datetime=o||null,y()}),f("#f-merchant",o=>{a.merchant=o}),f("#f-address",o=>{a.merchant_address=o||null}),f("#f-category",o=>{a.category=o}),f("#f-currency",o=>{a.currency=o.toUpperCase(),e.querySelectorAll(".cur").forEach(p=>p.textContent=a.currency),y()}),f("#f-payment",o=>{a.payment_method=o||null}),f("#f-subtotal",o=>{a.subtotal=S(o)}),f("#f-tax",o=>{a.tax=S(o)}),f("#f-total",o=>{a.total=S(o)??0,y()}),f("#f-notes",o=>{a.notes=o||null});let l=0;async function y(){const o=++l,p=e.querySelector("#usd-preview");p.textContent="…";const h=fe(a.datetime),{total_usd:m}=await me(a.total,a.currency,h);o===l&&(p.textContent=oe(m))}e.querySelector("#del-btn").addEventListener("click",async()=>{confirm("Delete this receipt?")&&(await Ke(a.id),D("#/capture"))}),e.querySelector("#discard-btn").addEventListener("click",()=>D("#/capture")),e.querySelector("#save-btn").addEventListener("click",async()=>{a.user_edited=!0,await Z(a),D(a.status==="saved"?"#/list":"#/capture")});const d=e.querySelector("#retry-btn");d&&d.addEventListener("click",async()=>{a.status="parsing",a.parse_error=null,await v(a),T(a.id),D("#/capture")});function f(o,p){const h=e.querySelector(o);if(!h)return;const m=h.tagName==="SELECT"?"change":"input";h.addEventListener(m,w=>p(w.target.value))}return()=>{r&&URL.revokeObjectURL(r)}}function _(e){return e==null?"":String(e).replace(/"/g,"&quot;")}function S(e){if(e===""||e==null)return null;const t=Number(e);return Number.isFinite(t)?t:null}function ie(e,t){var s;return((s=e.confidence)==null?void 0:s[t])==="low"?"is-low-conf":""}function oe(e){return e==null?"$—":"$"+e.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}async function Ce(e){const t=A(),n=await We(),s=n?(n.usage/1024/1024).toFixed(1):"?",r=n?(n.quota/1024/1024).toFixed(0):"?",a=(await E()).length;e.innerHTML=`
    <header class="topbar"><h1>Settings</h1></header>

    <section class="card">
      <h2>Claude API</h2>
      <label class="field">
        <span>API key</span>
        <input id="api-key" type="password" placeholder="sk-ant-…" value="${$(t.claude_api_key)}">
      </label>
      <p class="muted small">Stored locally in your browser. Never sent anywhere except api.anthropic.com.</p>
    </section>

    <section class="card">
      <h2>Health rules</h2>
      <label class="field">
        <span>Unhealthy keywords (comma-separated)</span>
        <textarea id="unhealthy" rows="4">${$(t.health_rules.unhealthy_keywords.join(", "))}</textarea>
      </label>
      <label class="field">
        <span>Healthy keywords (comma-separated)</span>
        <textarea id="healthy" rows="4">${$(t.health_rules.healthy_keywords.join(", "))}</textarea>
      </label>
      <button class="btn btn--ghost" id="reset-health">Reset to defaults</button>
    </section>

    <section class="card">
      <h2>Currency</h2>
      <label class="field">
        <span>Default currency when ambiguous</span>
        <input id="fallback-cur" type="text" maxlength="3" value="${$(t.default_currency_fallback)}">
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
      <p class="muted small">${a} receipts · ${s} MB used of ~${r} MB available</p>
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
  `,e.querySelector("#reset-health").addEventListener("click",()=>{confirm("Reset health keywords to defaults?")&&(at(),Ce(e))}),e.querySelector("#export-all").addEventListener("click",async()=>{const i=(await E()).filter(c=>c.status==="saved"),u=ke(i);De(`receipts-${new Date().toISOString().slice(0,10)}.csv`,u)}),e.querySelector("#wipe").addEventListener("click",async()=>{var u;if(!confirm("Delete ALL local receipts and photos? This cannot be undone.")||!confirm("Really wipe everything?"))return;const i=await((u=indexedDB.databases)==null?void 0:u.call(indexedDB))||[];for(const c of i)c.name&&indexedDB.deleteDatabase(c.name);localStorage.removeItem("settings_v1"),location.reload()}),e.querySelector("#save-btn").addEventListener("click",()=>{const i={...t,claude_api_key:e.querySelector("#api-key").value.trim(),default_currency_fallback:e.querySelector("#fallback-cur").value.trim().toUpperCase()||"USD",primary_display_currency:e.querySelector("#display-cur").value,health_rules:{...t.health_rules,unhealthy_keywords:ce(e.querySelector("#unhealthy").value),healthy_keywords:ce(e.querySelector("#healthy").value)}};Ee(i),At(e.querySelector("#save-btn"))})}function ce(e){return e.split(",").map(t=>t.trim()).filter(Boolean)}function $(e){return e==null?"":String(e).replace(/"/g,"&quot;")}function At(e){const t=e.textContent;e.textContent="Saved ✓",e.disabled=!0,setTimeout(()=>{e.textContent=t,e.disabled=!1},1200)}const Tt=[{id:"capture",href:"#/capture",label:"Capture",icon:"📷"},{id:"list",href:"#/list",label:"List",icon:"📋"},{id:"settings",href:"#/settings",label:"Settings",icon:"⚙"}];function Rt(e){const t=document.createElement("nav");return t.className="tabbar",t.innerHTML=Tt.map(n=>`
    <a href="${n.href}" class="tab ${n.id===e?"is-active":""}">
      <span class="tab-icon">${n.icon}</span>
      <span class="tab-label">${n.label}</span>
    </a>
  `).join(""),t}const le=[{match:/^#?\/?$/,render:se,tab:"capture"},{match:/^#?\/capture$/,render:se,tab:"capture"},{match:/^#?\/list$/,render:Et,tab:"list"},{match:/^#?\/settings$/,render:Ce,tab:"settings"},{match:/^#?\/receipt\/([\w-]+)$/,render:qt,tab:null}];let C,k=null;function Ut(e){for(const t of le){const n=e.match(t.match);if(n)return{route:t,params:n.slice(1)}}return{route:le[0],params:[]}}async function J(){if(k){try{k()}catch{}k=null}C.innerHTML="";const e=document.createElement("main");e.className="screen",C.appendChild(e);const{route:t,params:n}=Ut(location.hash||"#/"),s=await t.render(e,...n);typeof s=="function"&&(k=s),t.tab&&C.appendChild(Rt(t.tab))}function D(e){location.hash===e?J():location.hash=e}function Mt(e){C=e,window.addEventListener("hashchange",J),J()}function N(e){return String(e||"").toLowerCase()}function Bt(e){if(e.status!=="parsed"||e.user_edited||!e.merchant||!e.currency||!(e.total>0))return!1;const t=e.confidence||{};return!(N(t.overall)==="low"||N(t.merchant)==="low"||N(t.total)==="low")}async function Ot(){Mt(document.getElementById("app"));const e=await E();for(const t of e)t.status==="parsing"?T(t.id):Bt(t)&&Z(t).catch(n=>console.warn("Startup auto-save failed for",t.id,n))}Ot();
