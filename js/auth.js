import { loadFirebase } from "./firebase.js";
import { toast } from "./ui.js";

let ctxPromise=null;
export function fb(){ if(!ctxPromise) ctxPromise = loadFirebase(); return ctxPromise; }

export async function onAuth(cb){
  const { authMod, auth } = await fb();
  return authMod.onAuthStateChanged(auth, cb);
}

export async function signUpEmail(email, password, name){
  const { authMod, fsMod, auth, db } = await fb();
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  await authMod.updateProfile(cred.user, { displayName: name || "" });
  await fsMod.setDoc(fsMod.doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name: name || "",
    email,
    role: "member",
    joinStatus: "free",
    createdAt: fsMod.serverTimestamp(),
    updatedAt: fsMod.serverTimestamp()
  }, { merge:true });
  toast("Account created.");
  return cred.user;
}

export async function signInEmail(email, password){
  const { authMod, auth } = await fb();
  const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
  toast("Welcome back.");
  return cred.user;
}

export async function signOut(){
  const { authMod, auth } = await fb();
  await authMod.signOut(auth);
  toast("Signed out.");
}

export async function getUserDoc(uid){
  const { fsMod, db } = await fb();
  const snap = await fsMod.getDoc(fsMod.doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function requireRole(allowed){
  const { auth } = await fb();
  const user = auth.currentUser;
  if(!user) return { ok:false, reason:"not_signed_in" };
  const doc = await getUserDoc(user.uid);
  const role = doc?.role || "member";
  if(allowed.includes(role)) return { ok:true, user, role, doc };
  return { ok:false, reason:"forbidden", role, doc };
}

export async function requestJoinCommunity({ whatsappNumber, message }){
  const { fsMod, auth, db } = await fb();
  const user = auth.currentUser;
  if(!user) throw new Error("Not signed in");
  await fsMod.setDoc(fsMod.doc(db, "users", user.uid), {
    joinStatus: "pending_payment",
    joinRequestedAt: fsMod.serverTimestamp(),
    updatedAt: fsMod.serverTimestamp()
  }, { merge:true });
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

export async function updateProfile({ name, penName, bio, website }){
  const { fsMod, auth, db } = await fb();
  const user = auth.currentUser;
  if(!user) throw new Error("Not signed in");
  await fsMod.setDoc(fsMod.doc(db, "users", user.uid), {
    name: name ?? "",
    penName: penName ?? "",
    bio: bio ?? "",
    website: website ?? "",
    updatedAt: fsMod.serverTimestamp()
  }, { merge:true });
  toast("Profile updated.");
}
