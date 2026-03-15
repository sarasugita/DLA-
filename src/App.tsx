import React, { useState } from 'react';
import { EvaluationDebugUI } from './components/EvaluationDebugUI';

// テスト用のサンプルデータ
const sampleData = {
  stage: "D",
  step: 5,
  evaluation_trace: {
    segment_view: [
      {
        segment_id: "seg1",
        text: "昨日、公園に行きました。友達とサッカーをしました。",
        metrics: [
          {
            metric_id: "M1",
            name: "叙述の組織化",
            value: 2.0,
            triggered_criteria: [
              { criterion_id: "S2", is_valid: true, reasoning: "時系列に沿った叙述が確認されました。" }
            ]
          }
        ]
      },
      {
        segment_id: "seg2",
        text: "楽しかったです。",
        metrics: [
          {
            metric_id: "M10",
            name: "文レベルの産出",
            value: 1.0,
            triggered_criteria: [
              { criterion_id: "J3", is_valid: true, reasoning: "単文の産出を確認。" }
            ]
          }
        ]
      },
      {
        segment_id: "seg3",
        text: "なぜなら、天気が良かったからです。",
        metrics: [
          {
            metric_id: "M2",
            name: "理由の提示",
            value: 1.0,
            triggered_criteria: [
              { criterion_id: "S5", is_valid: true, reasoning: "因果関係を示す接続詞の使用を確認。" }
            ]
          }
        ]
      }
    ],
    criterion_view: [
      {
        criterion_id: "S2",
        name: "叙述の組織化",
        final_score: { eq: 2.0, rep: 1, ind: 2.0 },
        evidences: [
          { segment_id: "seg1", metric_id: "M1", is_valid: true, reasoning: "時系列の叙述。" }
        ]
      },
      {
        criterion_id: "S5",
        name: "理由の提示",
        final_score: { eq: 1.0, rep: 1, ind: 1.0 },
        evidences: [
          { segment_id: "seg3", metric_id: "M2", is_valid: true, reasoning: "因果関係の提示。" }
        ]
      },
      {
        criterion_id: "J3",
        name: "文レベルの産出",
        final_score: { eq: 1.0, rep: 1, ind: 1.0 },
        evidences: [
          { segment_id: "seg2", metric_id: "M10", is_valid: true, reasoning: "単文の産出。" }
        ]
      }
    ],
    stage_decision_log: [
      {
        level: "F",
        is_passed: false,
        explanation: "必須基準 S6 のスコアが不足しています。",
        matches: [
          {
            criterion_id: "S6",
            requirement_type: "必須",
            is_matched: false,
            required_threshold: { eq: 2, rep: 2, ind: 2 },
            actual_score: { eq: 1.0, rep: 1, ind: 1.0 }
          }
        ]
      },
      {
        level: "E",
        is_passed: false,
        explanation: "必須基準 S4 のスコアが不足しています。",
        matches: [
          {
            criterion_id: "S4",
            requirement_type: "必須",
            is_matched: false,
            required_threshold: { eq: 2, rep: 1, ind: 2 },
            actual_score: { eq: 0, rep: 0, ind: 0 }
          }
        ]
      },
      {
        level: "D",
        is_passed: true,
        explanation: "すべての必須基準を満たしています。",
        matches: [
          {
            criterion_id: "S2",
            requirement_type: "必須",
            is_matched: true,
            required_threshold: { eq: 1, rep: 1, ind: 1 },
            actual_score: { eq: 2.0, rep: 1, ind: 2.0 }
          }
        ]
      }
    ],
    step_decision_log: [
      {
        level: "6",
        is_passed: false,
        explanation: "Step 6 の基準を満たしていません。",
        matches: [
          {
            criterion_id: "J5",
            requirement_type: "必須",
            is_matched: false,
            required_threshold: { eq: 2, rep: 1, ind: 2 },
            actual_score: { eq: 0, rep: 0, ind: 0 }
          }
        ]
      },
      {
        level: "5",
        is_passed: true,
        explanation: "Step 5 の基準をすべて満たしています。",
        matches: [
          {
            criterion_id: "J3",
            requirement_type: "必須",
            is_matched: true,
            required_threshold: { eq: 1, rep: 1, ind: 1 },
            actual_score: { eq: 1.0, rep: 1, ind: 1.0 }
          }
        ]
      }
    ]
  }
};

function App() {
  const [transcript, setTranscript] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = async () => {
    if (!transcript.trim()) {
      alert("Please enter a transcript to evaluate.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      const data = await response.json();
      setEvaluationResult(data);
    } catch (error) {
      console.error("Evaluation failed:", error);
      alert("Evaluation failed. Make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {!evaluationResult ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">DLA Evaluation Engine</h1>
            <p className="text-zinc-500">Enter the transcript below to analyze the DLA Stage and Step.</p>
          </div>
          
          <div className="w-full space-y-4">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste transcript here... (e.g., Speaker A: Hello, how are you?)"
              className="w-full h-64 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-sans text-zinc-800"
            />
            
            <button
              onClick={handleEvaluate}
              disabled={isLoading || !transcript.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Transcript...
                </span>
              ) : "Run DLA Evaluation"}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setEvaluationResult(null)}
            className="absolute top-4 right-6 z-50 px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-all"
          >
            New Evaluation
          </button>
          <EvaluationDebugUI data={evaluationResult} />
        </div>
      )}
    </div>
  );
}

export default App;
