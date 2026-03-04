from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .services import load_sensors, load_metrics, load_sensor_types, prepare_sensor_rows
from .models import SensorRow

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def read_health():
    return {"status": "ok"}

@app.get("/debug/counts")
def read_counts():
  sensors = load_sensors()
  metrics = load_metrics()
  sensor_types = load_sensor_types()

  return {
      "sensors_count": len(sensors),
      "metrics_count": len(metrics["data"]["items"]),
      "sensor_types_top_keys": list(sensor_types.keys())[:5],
  }

@app.get("/debug/sensors-normalized")
def debug_sensors_normalized():
    return prepare_sensor_rows()

@app.get("/api/sensors", response_model=List[SensorRow])
def get_sensors():
    """
    Основной эндпоинт для фронтенда.
    Возвращает список сенсоров в нормализованном виде.
    """
    return prepare_sensor_rows()