import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Info, 
  MessageSquare, 
  BarChart3,
  Search,
  ArrowRight
} from 'lucide-react';

interface Props {
  data: any;
}

export const EvaluationDebugUI: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'segment' | 'criterion' | 'decision'>('segment');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!data || !data.evaluation_trace) {
    return (
      <div className="p-12 text-center bg-zinc-50 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm max-w-md">
          <XCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Evaluation Trace Missing</h2>
          <p className="text-zinc-500 text-sm mb-6">
            The evaluation engine failed to produce a trace. This usually happens if the backend script encountered an error.
          </p>
          <div className="text-left bg-zinc-900 rounded-lg p-4 overflow-auto max-h-48">
            <pre className="text-xs text-emerald-400 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const { evaluation_trace, stage, step } = data;

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">DLA Evaluation Debugger</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
              Stage: {stage}
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
              Step: {step}
            </span>
          </div>
        </div>
        <nav className="flex bg-zinc-100 p-1 rounded-lg">
          {(['segment', 'criterion', 'decision'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} View
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-hidden flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'segment' && (
            <div className="space-y-4">
              {evaluation_trace.segment_view.map((seg: any) => (
                <div 
                  key={seg.segment_id}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedId === seg.segment_id ? 'bg-white border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-zinc-200'
                  }`}
                  onClick={() => setSelectedId(seg.segment_id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-zinc-400">{seg.segment_id}</span>
                    {seg.metrics.length > 0 && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {seg.metrics.length} Metrics Triggered
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-800 mb-3">{seg.text}</p>
                  
                  {seg.metrics.length > 0 && (
                    <div className="space-y-2 ml-4 border-l-2 border-zinc-100 pl-4">
                      {seg.metrics.map((m: any) => (
                        <div key={m.metric_id} className="text-sm">
                          <div className="flex items-center gap-2 font-medium text-zinc-600">
                            <BarChart3 size={14} />
                            {m.name} (Value: {m.value})
                          </div>
                          <div className="mt-1 space-y-1">
                            {m.triggered_criteria.map((c: any) => (
                              <div key={c.criterion_id} className="flex items-center gap-2 text-xs text-zinc-500">
                                <ArrowRight size={12} />
                                <span className="font-bold text-zinc-700">{c.criterion_id}</span>
                                {c.is_valid ? (
                                  <CheckCircle2 size={12} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={12} className="text-rose-500" />
                                )}
                                <span className="italic">"{c.reasoning}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'criterion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluation_trace.criterion_view.map((crit: any) => (
                <div key={crit.criterion_id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-zinc-900">{crit.criterion_id}: {crit.name}</h3>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-zinc-50 p-2 rounded text-center">
                      <div className="text-[10px] uppercase text-zinc-400 font-bold">EQ</div>
                      <div className="text-lg font-bold text-indigo-600">{crit.final_score.eq.toFixed(1)}</div>
                    </div>
                    <div className="flex-1 bg-zinc-50 p-2 rounded text-center">
                      <div className="text-[10px] uppercase text-zinc-400 font-bold">REP</div>
                      <div className="text-lg font-bold text-emerald-600">{crit.final_score.rep}</div>
                    </div>
                    <div className="flex-1 bg-zinc-50 p-2 rounded text-center">
                      <div className="text-[10px] uppercase text-zinc-400 font-bold">IND</div>
                      <div className="text-lg font-bold text-amber-600">{crit.final_score.ind.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Evidence Sources</div>
                    {crit.evidences.map((e: any, idx: number) => (
                      <div key={idx} className="text-xs p-2 bg-zinc-50 rounded border border-zinc-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-indigo-500">{e.segment_id}</span>
                          <span className="text-zinc-400">{e.metric_id}</span>
                        </div>
                        <p className="text-zinc-600 italic">"{e.reasoning}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'decision' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ChevronRight className="text-indigo-500" /> Stage Decision Trace
                </h2>
                <div className="space-y-3">
                  {evaluation_trace.stage_decision_log.map((log: any) => (
                    <div key={log.level} className={`p-4 rounded-xl border ${log.is_passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-zinc-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${log.is_passed ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                            {log.level}
                          </span>
                          <span className="font-bold text-zinc-900">{log.is_passed ? 'Passed' : 'Failed'}</span>
                        </div>
                        <span className="text-sm text-zinc-500 italic">{log.explanation}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {log.matches.map((m: any) => (
                          <div key={m.criterion_id} className={`text-xs p-2 rounded border flex items-center justify-between ${m.is_matched ? 'bg-white border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="flex items-center gap-2">
                              {m.is_matched ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-rose-500" />}
                              <span className="font-bold">{m.criterion_id}</span>
                              <span className="text-zinc-400">({m.requirement_type})</span>
                            </div>
                            <div className="text-[10px] font-mono">
                              ACT:{m.actual_score.eq}/{m.actual_score.rep}/{m.actual_score.ind} vs 
                              REQ:{m.required_threshold.eq}/{m.required_threshold.rep}/{m.required_threshold.ind}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
