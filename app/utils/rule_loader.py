import json
import os
from typing import List, Dict
from app.models.rules import (
    CriterionDefinition,
    MetricDefinition,
    ScoringRule,
    DecisionRule
)

class RuleLoader:
    def __init__(self, rules_dir: str = "backend/rules"):
        self.rules_dir = rules_dir

    def load_criterion_definitions(self) -> List[CriterionDefinition]:
        path = os.path.join(self.rules_dir, "criterion_definitions.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [CriterionDefinition(**item) for item in data]

    def load_metric_definitions(self) -> List[MetricDefinition]:
        path = os.path.join(self.rules_dir, "metric_definitions.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [MetricDefinition(**item) for item in data]

    def load_scoring_rules(self) -> List[ScoringRule]:
        path = os.path.join(self.rules_dir, "metric_to_criterion_scoring_rules.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [ScoringRule(**item) for item in data]

    def load_decision_rules(self) -> List[DecisionRule]:
        # Combine stage and step decision rules
        stage_path = os.path.join(self.rules_dir, "stage_decision_rules.json")
        step_path = os.path.join(self.rules_dir, "step_decision_rules.json")
        
        rules = []
        if os.path.exists(stage_path):
            with open(stage_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                rules.extend([DecisionRule(**item) for item in data])
        
        if os.path.exists(step_path):
            with open(step_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                rules.extend([DecisionRule(**item) for item in data])
        
        return rules
