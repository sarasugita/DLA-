from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class TranscriptSegment(BaseModel):
    segment_id: str
    task_id: str
    timestamp: str
    text: str

class MetricRecord(BaseModel):
    metric_id: str
    segment_id: str
    value: float
    reasoning: str

class CandidateCriterionRecord(BaseModel):
    criterion_id: str
    segment_id: str
    metric_id: str

class EvidenceRecord(BaseModel):
    criterion_id: str
    segment_id: str
    metric_id: str
    is_valid: bool
    evidence_quality: int = Field(ge=0, le=3)
    reproducibility: int = Field(ge=0, le=3)
    independence: int = Field(ge=0, le=3)
    reasoning: str

class CriterionScore(BaseModel):
    criterion_id: str
    evidence_quality: float
    reproducibility: int
    independence: float
    supporting_segments: List[str]

# --- Trace Models ---

class MetricTrace(BaseModel):
    metric_id: str
    segment_id: str
    value: float
    reasoning: str

class EvidenceTrace(BaseModel):
    criterion_id: str
    segment_id: str
    metric_id: str
    is_valid: bool
    evidence_quality: int
    independence: int
    reasoning: str

class DecisionRuleMatch(BaseModel):
    criterion_id: str
    requirement_type: str
    required_threshold: Dict[str, int]
    actual_score: Dict[str, float]
    is_matched: bool

class LevelDecisionTrace(BaseModel):
    level: str
    is_passed: bool
    matches: List[DecisionRuleMatch]
    explanation: str

class EvaluationTrace(BaseModel):
    metrics: List[MetricTrace]
    evidences: List[EvidenceTrace]
    segment_view: List[Dict[str, Any]]
    criterion_view: List[Dict[str, Any]]
    stage_decision_log: List[LevelDecisionTrace]
    step_decision_log: List[LevelDecisionTrace]

class FinalEvaluationOutput(BaseModel):
    session_id: str
    stage: str
    step: int
    criteria_scores: List[CriterionScore]
    evaluation_trace: EvaluationTrace
    overall_reasoning: str
