import { initTransitions } from "./transitions.js";
import { initSlideshow } from "./slideshow.js";
import { qs } from "./ui.js";
import { onAuth, signOut, getUserDoc } from "./auth.js";
import { SITE } from "./config.js";

function initMobileMenu(){
  const btn = qs("#mobile-toggle");
  const menu = qs("#mobile-menu");
  if(!btn || !menu) return;
  btn.addEventListener("click", ()=> menu.classList.toggle("active"));
}

function wireAuthUi(){
  const authEl = qs("[data-auth]");
  if(!authEl) return;
  onAuth(async (user)=>{
    const loginLink = qs("#nav-login");
    const logoutBtn = qs("#nav-logout");
    const profileLink = qs("#nav-profile");
    const adminLink = qs("#nav-admin");
    const nameEl = qs("#nav-user");
    if(user){
      const doc = await getUserDoc(user.uid);
      const label = doc?.penName || doc?.name || user.displayName || user.email || "Member";
      if(nameEl) nameEl.textContent = label;
      if(loginLink) loginLink.style.display="none";
      if(logoutBtn) logoutBtn.style.display="inline-flex";
      if(profileLink) profileLink.style.display="inline-flex";
      if(adminLink) adminLink.style.display = (doc?.role==="admin") ? "inline-flex" : "none";
    } else {
      if(nameEl) nameEl.textContent="";
      if(loginLink) loginLink.style.display="inline-flex";
      if(logoutBtn) logoutBtn.style.display="none";
      if(profileLink) profileLink.style.display="none";
      if(adminLink) adminLink.style.display="none";
    }
  });
  const logoutBtn = qs("#nav-logout");
  if(logoutBtn){
    logoutBtn.addEventListener("click", async ()=>{
      await signOut();
      window.location.href="home.html";
    });
  }
}

function setFooterYear(){
  const y = qs("#year");
  if(y) y.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", ()=>{
  initMobileMenu();
  initTransitions();
  initSlideshow();
  wireAuthUi();
  setFooterYear();
  const b = qs("[data-brand]");
  if(b) b.textContent = SITE.brand;
});
