import React, { useState } from "react";
import { 
  Send, 
  HelpCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Hourglass,
  Sliders,
  CheckCircle,
  Play,
  FileSearch,
  BadgeAlert
} from "lucide-react";
import { api } from "../utils/api";

export default function ClinicalQAPanel({ patientId, documents }) {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Configuration options
  const [maxChunks, setMaxChunks] = useState(10);
  const [includeSources, setIncludeSources] = useState(true);
  const [showTrace, setShowTrace] = useState(true);

  // Preset query prompts
  const shortcuts = [
    "What were the patient's latest HbA1c and glucose results?",
    "Summarize all active diagnoses and medication schedules",
    "List all medications with their doses",
    "Are there any critical or abnormal lab findings?"
  ];

  const handleQuerySubmit = async (e, customQuery) => {
    if (e) e.preventDefault();
    const activeQuery = customQuery || queryText;
    if (!activeQuery.trim()) return;

    if (documents.length === 0) {
      setError("Please ingest at least one medical document first to provide clinical context.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.query(patientId, activeQuery, maxChunks, includeSources);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to execute clinical query agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-border space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles size={18} className="text-primary animate-pulse" />
            <span>Clinical Agent Engine</span>
          </h3>
          <p className="text-[10px] text-muted-foreground">
            LangGraph multi-agent orchestration querying vector stores and table structures.
          </p>
        </div>
      </div>

      {/* Query Search Form */}
      <form onSubmit={(e) => handleQuerySubmit(e)} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask anything about this patient's medical records..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={loading}
            className="w-full bg-background border border-border pl-4 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !queryText.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 transition-all cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="space-y-2">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Suggested Queries</span>
          <div className="flex flex-wrap gap-1.5">
            {shortcuts.map((shortcut, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQueryText(shortcut);
                  handleQuerySubmit(null, shortcut);
                }}
                disabled={loading}
                className="text-[10px] bg-muted/65 hover:bg-primary/10 border border-border hover:border-primary/20 text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg text-left transition-all leading-normal font-medium"
              >
                {shortcut}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration collapse */}
        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <Sliders size={12} /> Parameters Config
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground flex justify-between">
                <span>Max Context Chunks</span>
                <span className="font-bold text-foreground">{maxChunks}</span>
              </label>
              <input
                type="range"
                min="3"
                max="25"
                value={maxChunks}
                onChange={(e) => setMaxChunks(parseInt(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-muted-foreground font-semibold cursor-pointer select-none" htmlFor="incl-sources">
                Attach Citation Sources
              </label>
              <input
                id="incl-sources"
                type="checkbox"
                checked={includeSources}
                onChange={(e) => setIncludeSources(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 focus:ring-offset-0"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive p-3.5 rounded-xl text-xs leading-relaxed font-medium">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>Error executing agent: {error}</span>
        </div>
      )}

      {/* Loading clinical agent trace */}
      {loading && (
        <div className="glass-panel border border-border rounded-xl p-5 text-center space-y-4 animate-pulse flex-1 flex flex-col justify-center min-h-[220px]">
          <Hourglass size={30} className="animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-foreground">Invoking Multi-Agent Coordinator...</h4>
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
              LangGraph is evaluating context chunks and routing tables to TAPAS sub-agents on local CPU threads. This might take up to 2-3 seconds for raw logic parsing.
            </p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-5 flex-1 overflow-y-auto pr-1">
          
          {/* Answer Box */}
          <div className="bg-primary/[0.03] border border-primary/20 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                <CheckCircle size={12} /> Diagnostic Synthesis
              </span>
              <span className="text-[9px] text-muted-foreground">
                Confidence: <span className="font-bold text-foreground">{Math.round(result.confidence * 100)}%</span> &bull; {result.latency_ms}ms
              </span>
            </div>
            <div className="text-xs leading-relaxed text-foreground select-text whitespace-pre-line font-medium">
              {result.answer}
            </div>
            {result.disclaimer && (
              <div className="text-[9px] text-amber-500 bg-amber-500/[0.04] p-2 rounded-lg border border-amber-500/10 flex items-start gap-1.5 mt-2 leading-relaxed">
                <BadgeAlert size={12} className="shrink-0 mt-0.5" />
                <span>{result.disclaimer}</span>
              </div>
            )}
          </div>

          {/* Reasoning trace collapsible */}
          {result.reasoning_trace && result.reasoning_trace.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTrace(!showTrace)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/75 transition-colors"
              >
                <span>Agent Reasoning Trace ({result.reasoning_trace.length} steps)</span>
                {showTrace ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showTrace && (
                <div className="p-3.5 bg-muted/10 divide-y divide-border/60 text-xs font-mono max-h-[180px] overflow-y-auto space-y-2.5">
                  {result.reasoning_trace.map((step, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex gap-2.5 text-[11px] leading-relaxed">
                      <span className="text-primary font-bold shrink-0">&gt;</span>
                      <span className="text-muted-foreground text-[10px] font-semibold bg-muted/70 px-1 rounded h-fit shrink-0">Step {idx + 1}</span>
                      <span className="text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Citation Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Source Citations</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {result.sources.map((src, idx) => (
                  <div key={idx} className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase">
                      <span className="flex items-center gap-1 text-foreground"><FileSearch size={11} /> Match #{idx+1}</span>
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                        Sim: {Math.round(src.similarity_score * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] italic text-foreground/80 leading-relaxed font-serif bg-background/50 p-2 rounded border border-border/30 truncate-3-lines">
                      &ldquo;{src.content}&rdquo;
                    </p>
                    <div className="text-[9px] text-muted-foreground font-semibold flex gap-2">
                      <span>Doc ID: {src.document_id.slice(0,8)}...</span>
                      {src.page_number && <span>Page: {src.page_number}</span>}
                      <span className="capitalize">Type: {src.chunk_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
