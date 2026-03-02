import { qs, qsa } from "./ui.js";

export function initSlideshow(){
  const root = qs("[data-slideshow]");
  if(!root) return;
  const slides = qsa(".slide", root);
  const dots = qsa(".dot", root);
  let idx = 0;
  let timer = null;
  function show(i){
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, si)=> s.classList.toggle("active", si===idx));
    dots.forEach((d, di)=> d.classList.toggle("active", di===idx));
  }
  function start(){
    stop();
    timer = setInterval(()=> show(idx+1), 6000);
  }
  function stop(){ if(timer) clearInterval(timer); timer=null; }
  dots.forEach((d, di)=> d.addEventListener("click", ()=>{ show(di); start(); }));
  let startX = null;
  root.addEventListener("touchstart", (e)=>{ startX = e.touches[0].clientX; }, {passive:true});
  root.addEventListener("touchend", (e)=>{
    if(startX==null) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if(Math.abs(dx) > 40){
      show(idx + (dx<0 ? 1 : -1));
      start();
    }
    startX=null;
  }, {passive:true});
  show(0); start();
  document.addEventListener("visibilitychange", ()=>{ if(document.hidden) stop(); else start(); });
}
