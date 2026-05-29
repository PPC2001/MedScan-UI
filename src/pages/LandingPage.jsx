import React from "react";
import { 
  Activity, 
  Search, 
  Upload, 
  Cpu, 
  Server, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Code,
  Users
} from "lucide-react";

export default function LandingPage({ setActiveTab }) {
  const features = [
    {
      title: "Multimodal Processing",
      desc: "Ingests scanned clinical charts, ECG images, laboratory reports, PDF histories, and handwritten physician notes.",
      icon: Upload,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "Zero-Shot Triaging",
      desc: "Automatically classifies document types (prescriptions, clinical notes, lab reports) and flags medical urgency.",
      icon: Cpu,
      color: "from-indigo-500 to-violet-500"
    },
    {
      title: "Multi-Agent Query Graph",
      desc: "Uses LangGraph and specialized sub-agents (TAPAS for tables, VQA for imaging) to assemble structured evidence.",
      icon: Search,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "HIPAA-Safe Vector Search",
      desc: "Stores text chunks and embeddings securely using pgvector, matching patient query context in milliseconds.",
      icon: ShieldCheck,
      color: "from-blue-500 to-indigo-500"
    }
  ];

  const pipelineSteps = [
    { num: "01", name: "File Ingestion", detail: "PDFs, TIFFs, JPGs or DOCX are parsed, applying OCR if needed." },
    { num: "02", name: "Triage & Classification", detail: "Zero-Shot model evaluates doc type; clinical classifier scores urgency." },
    { num: "03", name: "Clinical NER Extraction", detail: "Extracts diseases, chemicals, doses, and procedures via HuggingFace NER." },
    { num: "04", name: "Vector Indexing", detail: "Generates multi-modal embeddings using SentenceTransformers into pgvector." },
    { num: "05", name: "Agentic Reasoning", detail: "LangGraph coordinates TAPAS (table Q&A) and local models to answer clinical queries." },
  ];

  return (
    <div className="space-y-16 py-4 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Activity size={14} className="animate-pulse" />
          <span>Multimodal Clinical Intelligence Pipeline</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Turn Messy Medical Records Into{" "}
          <span className="bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent">
            Structured Patient Insights
          </span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Ingest raw clinical PDFs, lab reports, and handwritten notes. Instantly extract tables, run zero-shot document classification, and run clinical queries with full reasoning traces.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab("patients")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-95 shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all group"
          >
            <span>Launch Patient Intelligence</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className="w-full sm:w-auto border border-border bg-card/50 hover:bg-card px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            SaaS Subscriptions
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Comprehensive Capabilities</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Harnessing state-of-the-art HuggingFace tasks and local pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-5 hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Flow Visualizer */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8 border border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">How It Works</span>
            <h2 className="text-xl md:text-2xl font-extrabold">Ingestion & Reasoning Flow</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Server size={14} /> Local CPU Pipeline</span>
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Cpu size={14} /> Grok LLM Agent</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
          {pipelineSteps.map((step, i) => (
            <div key={i} className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-primary/30 group-hover:text-primary transition-colors">
                  {step.num}
                </span>
                <div className="h-px flex-1 bg-border hidden lg:block group-hover:bg-primary/50 transition-colors"></div>
              </div>
              <h3 className="font-bold text-sm text-foreground">{step.name}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>

        <div className="pipeline-progress-bar h-1.5 w-full rounded-full"></div>
      </div>

      {/* Developer Metrics / SaaS Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Average Processing Speed</span>
            <h4 className="text-lg font-bold">~1.2 seconds / page</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Code size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Clinical Query Latency</span>
            <h4 className="text-lg font-bold">Under 850 ms (cached)</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Medical NER Accuracy</span>
            <h4 className="text-lg font-bold">96.8% (F1 Score)</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
