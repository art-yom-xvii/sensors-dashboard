import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"
SENSORS_FILE = DATA_DIR / "sensors_1.json"
METRICS_FILE = DATA_DIR / "metrics.json"
SENSOR_TYPES_FILE = DATA_DIR / "sensorTypes.json"

UNKNOWN_TYPE_LABEL = "Unknown type"


def load_metrics() -> dict:
    try:
        with METRICS_FILE.open("r", encoding="utf-8") as metrics_file:
            return json.load(metrics_file)
    except FileNotFoundError:
        raise RuntimeError(f"Metrics file not found: {METRICS_FILE}")
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Invalid JSON in metrics file: {error}")
    except IOError as error:
        raise RuntimeError(f"Error reading metrics file: {error}")


def load_sensor_types() -> dict:
    try:
        with SENSOR_TYPES_FILE.open("r", encoding="utf-8") as sensor_types_file:
            return json.load(sensor_types_file)
    except FileNotFoundError:
        raise RuntimeError(f"Sensor types file not found: {SENSOR_TYPES_FILE}")
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Invalid JSON in sensor types file: {error}")
    except IOError as error:
        raise RuntimeError(f"Error reading sensor types file: {error}")


def load_sensors() -> dict:
    try:
        with SENSORS_FILE.open("r", encoding="utf-8") as sensors_file:
            return json.load(sensors_file)
    except FileNotFoundError:
        raise RuntimeError(f"Sensors file not found: {SENSORS_FILE}")
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Invalid JSON in sensors file: {error}")
    except IOError as error:
        raise RuntimeError(f"Error reading sensors file: {error}")

def build_metric_definitions() -> dict:
    metrics_raw = load_metrics()
    items = metrics_raw["data"]["items"]

    result = {}

    for item in items:
        metric_id = item["id"]
        metric_name = item["name"]
        units = item.get("units", [])

        selected_unit = None
        for unit in units:
            if unit.get("selected"):
                selected_unit = unit
                break

        # If there is no selected unit, take the first one (if any)
        if selected_unit is None and units:
            selected_unit = units[0]

        if selected_unit is not None:
            unit_name = selected_unit["name"]
            precision = selected_unit.get("precision", 0)
            column_name = f"{metric_name} ({unit_name})"
        else:
            # Fallback just in case, if units is empty
            column_name = metric_name
            precision = 0

        result[metric_id] = {
            "column_name": column_name,
            "precision": precision,
        }

    return result


def get_sensor_type_label(sensor_types: dict, type_id: int | None, variant_id: int | None) -> str:
    """
    Returns a human-readable sensor type name by type and variant,
    or 'Unknown type' if no data is available.
    """
    if type_id is None or variant_id is None:
        return UNKNOWN_TYPE_LABEL



    type_str = str(type_id)
    variant_str = str(variant_id)

    type_entry = sensor_types.get(type_str)
    if not type_entry:
        return UNKNOWN_TYPE_LABEL

    variant_entry = type_entry.get(variant_str)
    if not variant_entry:
        return UNKNOWN_TYPE_LABEL

    name = variant_entry.get("name")
    if not name:
        return UNKNOWN_TYPE_LABEL

    return name

def prepare_sensor_rows() -> list[dict]:
    sensors_raw = load_sensors()
    sensor_types = load_sensor_types()
    metric_defs = build_metric_definitions()

    all_metric_ids = list(metric_defs.keys())

    result = []

    for sensor_id, sensor_data in sensors_raw.items():
        name = sensor_data.get("name") or "Unknown sensor"
        type_id = sensor_data.get("type")
        variant_id = sensor_data.get("variant")

        type_label = get_sensor_type_label(sensor_types, type_id, variant_id)

        metrics_raw = sensor_data.get("metrics", {})

        metrics_values: dict[str, float | None] = {}

        for metric_id in all_metric_ids:
            metric_info = metric_defs[metric_id]
            column_name = metric_info["column_name"]

            metric_entry = metrics_raw.get(metric_id)
            if metric_entry is not None:
                value = metric_entry.get("v")
            else:
                value = None

            metrics_values[column_name] = value

        row = {
            "id": sensor_id,
            "name": name,
            "type": type_label,
            "metrics": metrics_values,
        }
        result.append(row)

    return result