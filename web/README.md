# Uvosoft Publishing (Full multi-page site)

## Includes
- Artistic entrance + home slideshow
- About, Services, Cover Designs, Public Blog, Contact
- Firebase Auth + Firestore: Login, Profile, Community, Post Book, Admin approvals
- Manual payment via WhatsApp: joinStatus = pending_payment then admin approves

## Setup
1) Edit `js/config.js` and add your WhatsApp number (no +)
2) Upload everything to your GitHub repo (root)
3) Enable GitHub Pages

## Make yourself admin
- Sign up once
- Copy your UID from Firebase Auth users list
- Firestore: users/{UID} set:
  - role: "admin"
  - joinStatus: "active"
