# Krillion · The Daily Dive (Online Multiplayer Edition)

Full-stack **Node.js + Express + Socket.IO** server hosting the pixel-exact Krillion game and **real-time multiplayer Puffer Party** (Public Rooms, Host Room, Join by 4-Letter Code, synced fuse & turns).

## Deploy on Render
Connect the `prom240352-crypto/krillion-online` GitHub repository to a Render Web Service. The included `render.yaml` configures the Node environment, `npm install` build command, `npm start` start command, automatic deploys, and `/` health check. Render provides the port through `PORT`.

## Run Locally (PC / Termux)
```bash
npm install
npm start
# Open http://localhost:3000
```
