import pandas as pd
import json
import os

def convert_rules(data_dir="data", output_dir="backend/rules"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 1. criteria_metrics.csv -> criterion_definitions.json & metric_definitions.json
    cm_df = pd.read_csv(os.path.join(data_dir, "criteria_metrics.csv"))
    
    # Criterion Definitions
    crit_df = cm_df[["criterion_id", "criterion_name_ja", "criterion_description_ja", "axis"]].drop_duplicates()
    crit_records = crit_df.rename(columns={
        "criterion_name_ja": "name_ja",
        "criterion_description_ja": "description_ja"
    }).to_dict(orient="records")
    
    with open(os.path.join(output_dir, "criterion_definitions.json"), "w", encoding="utf-8") as f:
        json.dump(crit_records, f, ensure_ascii=False, indent=2)

    # Metric Definitions
    met_df = cm_df[["metric_id", "metric_name_ja", "metric_description_ja", "unit"]].drop_duplicates()
    met_records = met_df.rename(columns={
        "metric_name_ja": "name_ja",
        "metric_description_ja": "description_ja"
    }).to_dict(orient="records")
    
    with open(os.path.join(output_dir, "metric_definitions.json"), "w", encoding="utf-8") as f:
        json.dump(met_records, f, ensure_ascii=False, indent=2)

    # 2. criteria_metrics_rule.csv -> metric_to_criterion_scoring_rules.json
    cmr_df = pd.read_csv(os.path.join(data_dir, "criteria_metrics_rule.csv"))
    scoring_rules = cmr_df.to_dict(orient="records")
    
    with open(os.path.join(output_dir, "metric_to_criterion_scoring_rules.json"), "w", encoding="utf-8") as f:
        json.dump(scoring_rules, f, ensure_ascii=False, indent=2)

    # 3. stage_step_decision.csv -> stage_decision_rules.json & step_decision_rules.json
    ssd_df = pd.read_csv(os.path.join(data_dir, "stage_step_decision.csv"))
    
    stage_rules = ssd_df[ssd_df["axis"] == "Stage"].to_dict(orient="records")
    with open(os.path.join(output_dir, "stage_decision_rules.json"), "w", encoding="utf-8") as f:
        json.dump(stage_rules, f, ensure_ascii=False, indent=2)
        
    step_rules = ssd_df[ssd_df["axis"] == "Step"].to_dict(orient="records")
    with open(os.path.join(output_dir, "step_decision_rules.json"), "w", encoding="utf-8") as f:
        json.dump(step_rules, f, ensure_ascii=False, indent=2)

    print("Conversion complete. JSON files generated in", output_dir)

if __name__ == "__main__":
    convert_rules()
