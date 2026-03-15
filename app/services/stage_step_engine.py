from typing import List, Dict, Set, Tuple
from app.models.domain import CriterionScore, LevelDecisionTrace, DecisionRuleMatch
from app.models.rules import DecisionRule

class StageStepEngine:
    def __init__(self, decision_rules: List[DecisionRule]):
        self.rules = decision_rules
        
        # Group rules by axis and level
        self.stage_rules: Dict[str, List[DecisionRule]] = {}
        self.step_rules: Dict[str, List[DecisionRule]] = {}
        
        for rule in self.rules:
            target_dict = self.stage_rules if rule.axis == "Stage" else self.step_rules
            if rule.level not in target_dict:
                target_dict[rule.level] = []
            target_dict[rule.level].append(rule)

    def decide_with_trace(self, scores: List[CriterionScore]) -> Tuple[str, int, List[LevelDecisionTrace], List[LevelDecisionTrace]]:
        # Convert scores to a map for easy lookup
        score_map = {s.criterion_id: s for s in scores}
        
        # Determine Stage (A-F)
        final_stage = "A"
        stage_traces = []
        for level in ["F", "E", "D", "C", "B", "A"]:
            trace = self._check_level_with_trace(level, self.stage_rules.get(level, []), score_map)
            stage_traces.append(trace)
            if trace.is_passed and final_stage == "A":
                final_stage = level
        
        # Determine Step (1-8)
        final_step = 1
        step_traces = []
        for level in ["8", "7", "6", "5", "4", "3", "2", "1"]:
            trace = self._check_level_with_trace(level, self.step_rules.get(level, []), score_map)
            step_traces.append(trace)
            if trace.is_passed and final_step == 1:
                final_step = int(level)
                
        return final_stage, final_step, stage_traces, step_traces

    def _check_level_with_trace(self, level: str, rules: List[DecisionRule], score_map: Dict[str, CriterionScore]) -> LevelDecisionTrace:
        if not rules:
            return LevelDecisionTrace(level=level, is_passed=False, matches=[], explanation="No rules defined for this level.")
            
        matches = []
        is_passed = True
        has_either_required = any(r.requirement_type == "いずれか必須" for r in rules)
        either_required_met = False
        
        for rule in rules:
            score = score_map.get(rule.criterion_id)
            actual = {
                "eq": score.evidence_quality if score else 0.0,
                "rep": float(score.reproducibility) if score else 0.0,
                "ind": score.independence if score else 0.0
            }
            threshold = {
                "eq": rule.evidence_quality_min,
                "rep": rule.reproducibility_min,
                "ind": rule.independence_min
            }
            
            matched = (actual["eq"] >= threshold["eq"] and 
                       actual["rep"] >= threshold["rep"] and 
                       actual["ind"] >= threshold["ind"])
            
            matches.append(DecisionRuleMatch(
                criterion_id=rule.criterion_id,
                requirement_type=rule.requirement_type,
                required_threshold=threshold,
                actual_score=actual,
                is_matched=matched
            ))
            
            if rule.requirement_type == "必須" and not matched:
                is_passed = False
            elif rule.requirement_type == "いずれか必須" and matched:
                either_required_met = True
        
        if has_either_required and not either_required_met:
            is_passed = False

        explanation = "Passed" if is_passed else "Failed"
        return LevelDecisionTrace(level=level, is_passed=is_passed, matches=matches, explanation=explanation)
