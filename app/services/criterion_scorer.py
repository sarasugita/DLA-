from typing import List, Dict
from app.models.domain import MetricRecord, CriterionScore, EvidenceRecord
from app.models.rules import ScoringRule

class CriterionScorer:
    def __init__(self, scoring_rules: List[ScoringRule]):
        # Group rules by criterion_id
        self.rules_by_criterion: Dict[str, List[ScoringRule]] = {}
        for rule in scoring_rules:
            if rule.criterion_id not in self.rules_by_criterion:
                self.rules_by_criterion[rule.criterion_id] = []
            self.rules_by_criterion[rule.criterion_id].append(rule)

    def score_criteria(self, metrics: List[MetricRecord], validated_evidence: List[EvidenceRecord]) -> List[CriterionScore]:
        scores = []
        
        # Group validated evidence by criterion_id
        evidence_by_crit: Dict[str, List[EvidenceRecord]] = {}
        for ev in validated_evidence:
            if not ev.is_valid:
                continue
            if ev.criterion_id not in evidence_by_crit:
                evidence_by_crit[ev.criterion_id] = []
            evidence_by_crit[ev.criterion_id].append(ev)

        for criterion_id, evidences in evidence_by_crit.items():
            # Evidence Quality (EQ): Average of validated evidence quality
            eq = sum(e.evidence_quality for e in evidences) / len(evidences)
            
            # Independence (IND): Average of validated independence
            ind = sum(e.independence for e in evidences) / len(evidences)
            
            # Reproducibility (REP): 
            # 0: Only 1 evidence
            # 1: 2-3 evidences
            # 2: 4+ evidences
            count = len(evidences)
            if count >= 4:
                rep = 2
            elif count >= 2:
                rep = 1
            else:
                rep = 0
            
            supporting_segments = list(set(e.segment_id for e in evidences))
            
            scores.append(CriterionScore(
                criterion_id=criterion_id,
                evidence_quality=eq,
                reproducibility=rep,
                independence=ind,
                supporting_segments=supporting_segments
            ))

        return scores
