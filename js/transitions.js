import { setLoader } from "./ui.js";

export function initTransitions(){
  document.addEventListener("click", (e)=>{
    const a = e.target.closest("a[data-route]");
    if(!a) return;
    const href = a.getAttribute("href");
    if(!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if(a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const label = a.getAttribute("data-route") || "Entering…";
    setLoader(true, label);
    setTimeout(()=>{ window.location.href = href; }, 420);
  });
}
