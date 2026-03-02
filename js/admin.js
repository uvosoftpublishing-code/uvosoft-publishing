import { qs, el, toast } from "./ui.js";
import { requireRole, fb } from "./auth.js";

function esc(str){ return String(str).replace(/[&<>"']/g, s=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s])); }
function escA(str){ return esc(str).replace(/"/g,"&quot;"); }

export async function initAdmin(){
  const gate = await requireRole(["admin"]);
  const box = qs("#admin-gate");
  if(!gate.ok){
    if(box) box.innerHTML = `<div class="notice"><strong>Admin only.</strong></div>`;
    return;
  }
  const { fsMod, db } = await fb();

  const reqList = qs("#req-list");
  if(reqList){
    reqList.innerHTML = "";
    const q = fsMod.query(fsMod.collection(db, "users"), fsMod.where("joinStatus","==","pending_payment"), fsMod.orderBy("joinRequestedAt","desc"), fsMod.limit(50));
    const snap = await fsMod.getDocs(q);
    if(snap.empty){
      reqList.appendChild(el("div",{class:"notice",html:"No join requests yet."}));
    } else {
      snap.forEach(s=>{
        const u = s.data();
        const row = el("div",{class:"card",style:"padding:14px"});
        row.innerHTML = `
          <div style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;align-items:center">
            <div>
              <strong>${esc(u.penName||u.name||u.email||"User")}</strong>
              <div style="color:rgba(11,11,15,0.62);font-size:.92rem;margin-top:4px">${esc(u.email||"")}</div>
              <div style="color:rgba(11,11,15,0.62);font-size:.92rem;margin-top:2px">Status: <span class="tag">pending payment</span></div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button class="btn" data-a="approve">Approve (Verified)</button>
              <button class="btn ghost" data-a="deny">Deny</button>
            </div>
          </div>
        `;
        row.querySelector('[data-a="approve"]').addEventListener("click", async ()=>{
          await fsMod.setDoc(fsMod.doc(db,"users",s.id), { role:"verified", joinStatus:"active", approvedAt: fsMod.serverTimestamp(), updatedAt: fsMod.serverTimestamp() }, {merge:true});
          toast("Approved as verified.");
          row.remove();
        });
        row.querySelector('[data-a="deny"]').addEventListener("click", async ()=>{
          await fsMod.setDoc(fsMod.doc(db,"users",s.id), { role:"member", joinStatus:"free", deniedAt: fsMod.serverTimestamp(), updatedAt: fsMod.serverTimestamp() }, {merge:true});
          toast("Denied.");
          row.remove();
        });
        reqList.appendChild(row);
      });
    }
  }

  const postList = qs("#pending-posts");
  if(postList){
    postList.innerHTML = "";
    const q2 = fsMod.query(fsMod.collection(db,"posts"), fsMod.where("status","==","pending_admin"), fsMod.orderBy("createdAt","desc"), fsMod.limit(50));
    const snap2 = await fsMod.getDocs(q2);
    if(snap2.empty){
      postList.appendChild(el("div",{class:"notice",html:"No pending posts."}));
    } else {
      snap2.forEach(s=>{
        const p = s.data();
        const card = el("div",{class:"card",style:"padding:14px"});
        card.innerHTML = `
          <div style="display:grid;gap:10px">
            <div>
              <strong>${esc(p.title||"Untitled")}</strong>
              <div style="color:rgba(11,11,15,0.62);font-size:.92rem;margin-top:4px">${esc(p.authorName||"Author")} • ${esc(p.genre||"")}</div>
            </div>
            <div style="color:rgba(11,11,15,0.76)">${esc((p.blurb||"").slice(0,240))}${(p.blurb||"").length>240?"…":""}</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button class="btn primary" data-a="publish">Publish</button>
              <button class="btn ghost" data-a="reject">Reject</button>
              ${p.buyLink ? `<a class="btn" style="padding:.55rem .85rem" href="${escA(p.buyLink)}" target="_blank" rel="noopener">Open link</a>` : ``}
            </div>
          </div>
        `;
        card.querySelector('[data-a="publish"]').addEventListener("click", async ()=>{
          await fsMod.setDoc(fsMod.doc(db,"posts",s.id), { status:"published", publishedAt: fsMod.serverTimestamp(), updatedAt: fsMod.serverTimestamp() }, {merge:true});
          toast("Published.");
          card.remove();
        });
        card.querySelector('[data-a="reject"]').addEventListener("click", async ()=>{
          await fsMod.setDoc(fsMod.doc(db,"posts",s.id), { status:"rejected", rejectedAt: fsMod.serverTimestamp(), updatedAt: fsMod.serverTimestamp() }, {merge:true});
          toast("Rejected.");
          card.remove();
        });
        postList.appendChild(card);
      });
    }
  }
}
