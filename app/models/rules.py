from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CriterionDefinition(BaseModel):
    criterion_id: str
    name_ja: str
    description_ja: str
    axis: str  # Stage or Step

class MetricDefinition(BaseModel):
    metric_id: str
    name_ja: str
    description_ja: str
    unit: str

class ScoringRule(BaseModel):
    criterion_id: str
    metric_id: str
    dimension: str  # evidence_quality, reproducibility, independence
    threshold_3: Optional[float] = None
    threshold_2: Optional[float] = None
    threshold_1: Optional[float] = None
    operator: str = ">="

class DecisionRule(BaseModel):
    axis: str  # Stage or Step
    level: str  # A-F or 1-8
    criterion_id: str
    requirement_type: str  # 必須, 補助, いずれか必須, 修飾
    evidence_quality_min: int
    reproducibility_min: int
    independence_min: int
    role_in_level: str
    notes: Optional[str] = None
