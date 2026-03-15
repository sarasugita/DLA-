/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranscriptSegment {
  segment_id: string;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
  task_id: string;
}

export interface MetricRecord {
  segment_id: string;
  metric_id: string;
  metric_value: string | number | boolean;
  metric_source: 'deterministic' | 'ai_estimated';
}

export interface CandidateCriterionRecord {
  segment_id: string;
  criterion_id: string;
  triggering_metrics: string[];
}

export interface EvidenceRecord {
  segment_id: string;
  criterion_id: string;
  evidence_quality: number; // 0-3
  independence: number; // 0-3
  explanation: string;
}

export interface CriterionScoreRecord {
  criterion_id: string;
  evidence_quality: number;
  reproducibility: number;
  independence: number;
  supporting_segments: string[];
}

export enum DLAStage {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F"
}

export interface FinalEvaluationOutput {
  stage: DLAStage;
  step: number;
  criterion_scores: CriterionScoreRecord[];
  evidence_trace: {
    segments: TranscriptSegment[];
    metrics: MetricRecord[];
    candidates: CandidateCriterionRecord[];
    evidence: EvidenceRecord[];
  };
}

export interface CSVMappings {
  criteriaMetrics: any[];      // criteria_metrics.csv
  criteriaMetricsRule: any[];  // criteria_metrics_rule.csv
  stageStepDecision: any[];    // stage_step_decision.csv
}
