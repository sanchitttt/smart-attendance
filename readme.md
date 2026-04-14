cloudflared login
cloudflared tunnel create smart-attendance
<!-- cloudflared tunnel route dns smart-attendance attendance-nitkkr.xyz -->


Frontend Web: npm run start

Backend: Intellj Run Button

Face Recognition Service:  .\face_env\Scripts\Activate
uvicorn api:app --reload --host 0.0.0.0 --port 8089

Proxy Service: node proxy.js

cloudflared tunnel run smart-attendance