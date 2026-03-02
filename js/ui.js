export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
export function el(tag, props={}){
  const e=document.createElement(tag);
  Object.entries(props).forEach(([k,v])=>{
    if(k==="class") e.className=v;
    else if(k==="html") e.innerHTML=v;
    else e.setAttribute(k,v);
  });
  return e;
}
export function setLoader(active, message="Loading…"){
  const loader = qs("#route-loader");
  if(!loader) return;
  loader.classList.toggle("active", !!active);
  const msg = qs("#route-loader-msg");
  if(msg) msg.textContent = message;
}
export function toast(msg){
  const t = el("div", {class:"card", style:"position:fixed;right:16px;bottom:16px;padding:12px 14px;z-index:9999;max-width:min(360px,88vw)"});
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .25s ease"; }, 2200);
  setTimeout(()=> t.remove(), 2600);
}
