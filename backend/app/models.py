from typing import Dict, Optional

from pydantic import BaseModel


class SensorRow(BaseModel):
    id: str
    name: str
    type: str
    metrics: Dict[str, Optional[float]]