# Sensors Dashboard

## Backend – FastAPI Service

All commands below assume you run them from the `backend` directory:

```bash
cd sensors-dashboard/backend
```

### 1. Create and activate virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # macOS / Linux
# .venv\Scripts\activate   # Windows (PowerShell or cmd)
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the backend

Use `uvicorn` to start the FastAPI app defined in `app/main.py`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at:

- **API root**: `http://localhost:8000`
- **Health check**: `http://localhost:8000/health`
- **Main sensors endpoint**: `http://localhost:8000/api/sensors`

### 4. Deactivate virtual environment (optional)

When you are done working:

```bash
deactivate
```
