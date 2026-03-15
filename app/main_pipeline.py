import uuid
from typing import List, Dict, Any
from app.models.domain import (
    TranscriptSegment, MetricRecord, EvidenceRecord, 
    CriterionScore, FinalEvaluationOutput, EvaluationTrace,
    MetricTrace, EvidenceTrace, LevelDecisionTrace
)
from app.utils.rule_loader import RuleLoader
from app.services.criterion_scorer import CriterionScorer
from app.services.stage_step_engine import StageStepEngine

class DLAPipeline:
    def __init__(self, rules_dir: str = "backend/rules"):
        loader = RuleLoader(rules_dir)
        
        self.criterion_definitions = {c.criterion_id: c for c in loader.load_criterion_definitions()}
        self.metric_definitions = {m.metric_id: m for m in loader.load_metric_definitions()}
        self.scoring_rules = loader.load_scoring_rules()
        self.decision_rules = loader.load_decision_rules()
        
        self.scorer = CriterionScorer(self.scoring_rules)
        self.engine = StageStepEngine(self.decision_rules)

    def run(self, session_id: str, transcript: List[TranscriptSegment]) -> FinalEvaluationOutput:
        # 1. Metric Extraction (Mocked with segment_id)
        metrics = self._mock_metric_extraction(transcript)
        
        # 2. Evidence Validation (Mocked with metric_id and segment_id)
        validated_evidence = self._mock_evidence_validation(metrics)
        
        # 3. Criterion Scoring
        criterion_scores = self.scorer.score_criteria(metrics, validated_evidence)
        
        # 4. Stage / Step Decision with Trace
        stage, step, stage_log, step_log = self.engine.decide_with_trace(criterion_scores)
        
        # 5. Build Trace Views
        metric_traces = [MetricTrace(**m.dict()) for m in metrics]
        evidence_traces = [EvidenceTrace(**e.dict()) for e in validated_evidence]
        
        segment_view = self._build_segment_view(transcript, metric_traces, evidence_traces)
        criterion_view = self._build_criterion_view(criterion_scores, evidence_traces)
        
        trace = EvaluationTrace(
            metrics=metric_traces,
            evidences=evidence_traces,
            segment_view=segment_view,
            criterion_view=criterion_view,
            stage_decision_log=stage_log,
            step_decision_log=step_log
        )
        
        return FinalEvaluationOutput(
            session_id=session_id,
            stage=stage,
            step=step,
            criteria_scores=criterion_scores,
            evaluation_trace=trace,
            overall_reasoning=f"Evaluation completed. Stage: {stage}, Step: {step}."
        )

    def _build_segment_view(self, transcript: List[TranscriptSegment], metrics: List[MetricTrace], evidences: List[EvidenceTrace]) -> List[Dict[str, Any]]:
        view = []
        for seg in transcript:
            seg_metrics = [m for m in metrics if m.segment_id == seg.segment_id]
            metric_list = []
            for m in seg_metrics:
                m_evidences = [e for e in evidences if e.metric_id == m.metric_id and e.segment_id == seg.segment_id]
                metric_list.append({
                    "metric_id": m.metric_id,
                    "name": self.metric_definitions.get(m.metric_id).name_ja if m.metric_id in self.metric_definitions else m.metric_id,
                    "value": m.value,
                    "triggered_criteria": [
                        {
                            "criterion_id": e.criterion_id,
                            "is_valid": e.is_valid,
                            "reasoning": e.reasoning
                        } for e in m_evidences
                    ]
                })
            
            view.append({
                "segment_id": seg.segment_id,
                "text": seg.text,
                "metrics": metric_list
            })
        return view

    def _build_criterion_view(self, scores: List[CriterionScore], evidences: List[EvidenceTrace]) -> List[Dict[str, Any]]:
        view = []
        for score in scores:
            crit_evidences = [e for e in evidences if e.criterion_id == score.criterion_id]
            view.append({
                "criterion_id": score.criterion_id,
                "name": self.criterion_definitions.get(score.criterion_id).name_ja if score.criterion_id in self.criterion_definitions else score.criterion_id,
                "final_score": {
                    "eq": score.evidence_quality,
                    "rep": score.reproducibility,
                    "ind": score.independence
                },
                "evidences": [
                    {
                        "segment_id": e.segment_id,
                        "metric_id": e.metric_id,
                        "is_valid": e.is_valid,
                        "reasoning": e.reasoning
                    } for e in crit_evidences
                ]
            })
        return view

    def _mock_metric_extraction(self, transcript: List[TranscriptSegment]) -> List[MetricRecord]:
        # Dummy metrics linked to segments
        return [
            MetricRecord(metric_id="M1", segment_id="seg1", value=2.0, reasoning="Narrative structure found."),
            MetricRecord(metric_id="M2", segment_id="seg3", value=1.0, reasoning="Simple reasoning found."),
            MetricRecord(metric_id="M10", segment_id="seg1", value=2.0, reasoning="Sentence level output.")
        ]

    def _mock_evidence_validation(self, metrics: List[MetricRecord]) -> List[EvidenceRecord]:
        # Dummy validation linked to metrics and segments
        return [
            EvidenceRecord(criterion_id="S2", segment_id="seg1", metric_id="M1", is_valid=True, evidence_quality=2, reproducibility=1, independence=2, reasoning="Valid narrative."),
            EvidenceRecord(criterion_id="S5", segment_id="seg3", metric_id="M2", is_valid=True, evidence_quality=1, reproducibility=1, independence=1, reasoning="Valid reasoning."),
            EvidenceRecord(criterion_id="J3", segment_id="seg1", metric_id="M10", is_valid=True, evidence_quality=2, reproducibility=1, independence=2, reasoning="Valid sentence.")
        ]

if __name__ == "__main__":
    import json
    import sys
    import uuid

    # Read input from stdin
    input_data = sys.stdin.read()
    transcript_text = ""
    try:
        if input_data:
            payload = json.loads(input_data)
            transcript_text = payload.get("transcript", "")
    except Exception:
        pass

    # Example usage
    pipeline = DLAPipeline()
    
    # Use the input text if provided, otherwise use dummy
    if transcript_text:
        # Simple split by newline for segments
        dummy_transcript = [
            TranscriptSegment(segment_id=f"seg{i+1}", task_id="T1", timestamp="00:00", text=line.strip())
            for i, line in enumerate(transcript_text.split('\n')) if line.strip()
        ]
    else:
        dummy_transcript = [
            TranscriptSegment(segment_id="seg1", task_id="T1", timestamp="00:01", text="昨日、公園に行きました。"),
            TranscriptSegment(segment_id="seg2", task_id="T1", timestamp="00:05", text="友達とサッカーをしました。"),
            TranscriptSegment(segment_id="seg3", task_id="T1", timestamp="00:10", text="楽しかったです。なぜなら、天気が良かったからです。")
        ]
    
    result = pipeline.run(session_id=str(uuid.uuid4()), transcript=dummy_transcript)
    
    # Output as JSON
    print(result.json())
