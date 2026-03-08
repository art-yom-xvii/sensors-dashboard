# Sensors Dashboard

Backend (Python) + Frontend (Vue.js).

---

## Run with Docker

From the **repository root**:

### Copy env example (if haven't already):
```bash
cp .env.example .env
```

### Run containers:
```bash
docker compose up -d
```

---

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/sensors

### Stop containers:
```bash
docker compose down
```