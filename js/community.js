import { qs, el, toast } from "./ui.js";
import { requireRole, fb } from "./auth.js";

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}
function escapeAttr(str){ return escapeHtml(str).replace(/"/g, "&quot;"); }

export async function initCommunityFeed(){
  const gate = await requireRole(["verified","admin"]);
  const box = qs("#community-gate");
  if(!gate.ok){
    if(box){
      box.innerHTML = gate.reason === "not_signed_in"
        ? `<div class="notice"><strong>Sign in required.</strong><div style="margin-top:6px">Please sign in to access the community.</div></div>`
        : `<div class="notice"><strong>Access not active yet.</strong><div style="margin-top:6px">Request access and wait for admin approval.</div></div>`;
    }
    return;
  }

  const { fsMod, db } = await fb();
  const list = qs("#post-list");
  if(!list) return;
  list.innerHTML = "";
  const q = fsMod.query(
    fsMod.collection(db, "posts"),
    fsMod.where("status", "==", "published"),
    fsMod.orderBy("createdAt", "desc"),
    fsMod.limit(30)
  );
  const snap = await fsMod.getDocs(q);
  if(snap.empty){
    list.appendChild(el("div", {class:"notice", html:"No posts yet. Verified authors can add the first book ✨"}));
    return;
  }
  snap.forEach(doc=>{
    const p = doc.data();
    const card = el("div", {class:"card post"});
    card.innerHTML = `
      <div style="display:grid;gap:10px">
        <div style="display:grid;gap:6px">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div>
              <strong style="font-size:1.05rem">${escapeHtml(p.title||"Untitled")}</strong>
              <div style="display:flex;gap:10px;flex-wrap:wrap;color:rgba(11,11,15,0.62);font-size:.9rem">
                <span>${escapeHtml(p.authorName||"Author")}</span><span>•</span><span>${escapeHtml(p.genre||"")}</span>
              </div>
            </div>
            ${p.coverUrl ? `<a href="${escapeAttr(p.coverUrl)}" target="_blank" rel="noopener" class="tag">Cover</a>` : ``}
          </div>
          <div style="color:rgba(11,11,15,0.76)">${escapeHtml(p.blurb||"").slice(0,240)}${(p.blurb||"").length>240?"…":""}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${(p.tags||[]).slice(0,6).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}
          ${p.buyLink ? `<a class="btn ghost" style="padding:.55rem .85rem" href="${escapeAttr(p.buyLink)}" target="_blank" rel="noopener">Buy / Learn more</a>` : ``}
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

export async function initPostForm(){
  const gate = await requireRole(["verified","admin"]);
  const box = qs("#post-gate");
  if(!gate.ok){
    if(box){
      box.innerHTML = `<div class="notice"><strong>Posting is for verified authors only.</strong><div style="margin-top:6px">Request access from the Community page.</div></div>`;
    }
    return;
  }
  const form = qs("#post-form");
  if(!form) return;
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      title: String(fd.get("title")||"").trim(),
      authorName: String(fd.get("authorName")|| gate.doc?.penName || gate.user.displayName || "Author").trim(),
      genre: String(fd.get("genre")||"").trim(),
      coverUrl: String(fd.get("coverUrl")||"").trim(),
      buyLink: String(fd.get("buyLink")||"").trim(),
      blurb: String(fd.get("blurb")||"").trim(),
      tags: String(fd.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean).slice(0,12),
      authorId: gate.user.uid,
      status: "pending_admin"
    };
    if(!payload.title || !payload.blurb){
      toast("Please add at least a title and a blurb.");
      return;
    }
    const { fsMod, db } = await fb();
    await fsMod.addDoc(fsMod.collection(db, "posts"), {
      ...payload,
      createdAt: fsMod.serverTimestamp(),
      updatedAt: fsMod.serverTimestamp()
    });
    form.reset();
    toast("Submitted for admin approval.");
    window.location.href = "community.html";
  });
}
