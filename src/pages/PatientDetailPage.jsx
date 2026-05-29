import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  ChevronRight,
  Database,
  Tag,
  Settings,
  RefreshCw,
  FileCode2,
  FileSpreadsheet
} from "lucide-react";
import { api } from "../utils/api";
import ClinicalQAPanel from "../components/ClinicalQAPanel";

export default function PatientDetailPage({ patientId, onBack }) {
  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Document uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("lab_report");
  const fileInputRef = useRef(null);

  // Selected document for inspector view
  const [inspectDoc, setInspectDoc] = useState(null);
  const [inspectDocLoading, setInspectDocLoading] = useState(false);

  // Poll collection to keep track of active timers
  const pollingTimers = useRef({});

  useEffect(() => {
    fetchPatientData();
    return () => {
      // Clear all active timers on unmount
      Object.values(pollingTimers.current).forEach(clearInterval);
    };
  }, [patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pData = await api.getPatient(patientId);
      setPatient(pData);
      
      const docs = await api.listPatientDocuments(patientId);
      setDocuments(docs);
      
      // Start polling for any non-terminal docs (pending / processing)
      docs.forEach(doc => {
        if (doc.status === "pending" || doc.status === "processing") {
          startPolling(doc.id);
        }
      });
    } catch (err) {
      setError(err.message || "Failed to load patient profile");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (docId) => {
    // Avoid double polling
    if (pollingTimers.current[docId]) return;

    pollingTimers.current[docId] = setInterval(async () => {
      try {
        const statusData = await api.getDocumentStatus(docId);
        
        // Update list inline
        setDocuments(prev => prev.map(d => {
          if (d.id === docId) {
            return { ...d, status: statusData.status, error_message: statusData.error_message };
          }
          return d;
        }));

        // If completed or failed, stop polling and reload full docs list
        if (statusData.status === "completed" || statusData.status === "failed") {
          clearInterval(pollingTimers.current[docId]);
          delete pollingTimers.current[docId];
          
          // Fetch complete documents list to retrieve full records (e.g. urgency labels, NER results)
          const docs = await api.listPatientDocuments(patientId);
          setDocuments(docs);

          // If currently inspecting this doc, reload inspector
          if (inspectDoc && inspectDoc.id === docId) {
            handleInspectDoc(docId);
          }
        }
      } catch (err) {
        console.error("Error polling status for doc:", docId, err);
      }
    }, 4000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadDocument(patientId, uploadDocType, file);
      
      // Add document placeholder locally
      const newDoc = {
        id: res.document_id,
        patient_id: patientId,
        filename: file.name,
        original_filename: file.name,
        doc_type: uploadDocType,
        status: "pending",
        created_at: new Date().toISOString(),
        file_size_bytes: file.size,
        mime_type: file.type
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      startPolling(res.document_id);
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Document upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document? All vector chunks and extraction logs will be wiped.")) {
      return;
    }
    
    // Clear polling if any
    if (pollingTimers.current[docId]) {
      clearInterval(pollingTimers.current[docId]);
      delete pollingTimers.current[docId];
    }

    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (inspectDoc && inspectDoc.id === docId) {
        setInspectDoc(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete document");
    }
  };

  const handleInspectDoc = async (docId) => {
    setInspectDocLoading(true);
    try {
      const docDetails = await api.getDocument(docId);
      setInspectDoc(docDetails);
    } catch (err) {
      alert("Failed to load document details: " + err.message);
    } finally {
      setInspectDocLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <RefreshCw size={30} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground font-semibold">Retrieving patient intelligence profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
        <XCircle size={40} className="text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold">Patient Not Found</h3>
        <p className="text-xs text-muted-foreground">The requested patient record could not be located in the database.</p>
        <button onClick={onBack} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold">
          Return to Patients List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      {/* Top Header Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack} 
          className="p-2 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Clinical Intake Profile</span>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            {patient.name}
            <span className="font-mono text-xs text-muted-foreground bg-muted/65 border border-border px-2 py-0.5 rounded-lg">
              {patient.mrn}
            </span>
          </h2>
        </div>
      </div>

      {/* Patient Profile Demographics Panel */}
      <div className="glass-card rounded-2xl p-5 border border-border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Demographics</span>
          <p className="text-sm font-semibold">{patient.gender} — {patient.date_of_birth}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar size={13} /> DOB: {patient.date_of_birth}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Blood & Vitals</span>
          <p className="text-sm font-semibold">Type: <span className="text-primary">{patient.blood_type || "N/A"}</span></p>
          <p className="text-[11px] text-muted-foreground truncate">Phone: {patient.phone || "None"}</p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest text-rose-500">Critical Allergies</span>
          <p className="text-xs text-rose-500 font-semibold leading-snug">{patient.allergies || "No active allergies cataloged"}</p>
          <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">{patient.notes || "No additional clinician comments recorded."}</p>
        </div>
      </div>

      {/* Grid of upload & details VS agentic panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: File upload & Pipeline logs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-border space-y-6">
            <h3 className="font-bold text-base border-b border-border pb-3">Document Ingestion Pipeline</h3>
            
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Classification Hint</label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="lab_report">Lab Report</option>
                    <option value="physician_note">Physician Note</option>
                    <option value="prescription">Prescription</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="imaging">Imaging (e.g. X-Ray)</option>
                    <option value="clinical_photo">Clinical Photograph</option>
                    <option value="hl7_fhir">HL7 / FHIR JSON</option>
                    <option value="other">Other/Unstructured</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-emerald-500 text-white font-semibold py-2 rounded-xl hover:opacity-95 text-xs shadow-md shadow-primary/10 transition-all cursor-pointer"
                  >
                    <UploadCloud size={14} />
                    <span>{uploading ? "Uploading..." : "Upload Document"}</span>
                  </button>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.docx,.txt"
                className="hidden"
              />

              <p className="text-[10px] text-muted-foreground text-center bg-muted/20 p-2 rounded-lg border border-dashed border-border leading-relaxed">
                Accepts PDF, JPG, PNG, TIFF, DOCX, TXT. Local optical character recognition (OCR) and specialized image processing are loaded asynchronously on CPU.
              </p>
            </div>

            {/* Document Ingestion List */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Ingested Records ({documents.length})</span>
              
              {documents.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl">
                  <FileText size={24} className="text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">No ingested files matching this record.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {documents.map((doc) => {
                    const isTerminal = doc.status === "completed" || doc.status === "failed";
                    const isProcessing = doc.status === "processing";
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleInspectDoc(doc.id)}
                        className={`
                          p-3.5 bg-background border rounded-xl hover:border-primary cursor-pointer transition-all flex items-start justify-between gap-4 group
                          ${inspectDoc?.id === doc.id ? "ring-2 ring-primary border-transparent" : "border-border"}
                        `}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-primary shrink-0" />
                            <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors" title={doc.original_filename}>
                              {doc.original_filename}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            {/* Ingestion Status Tags */}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                              doc.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15" :
                              doc.status === "failed" ? "bg-rose-500/10 text-rose-500 border border-rose-500/15" :
                              "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                            }`}>
                              {doc.status === "completed" && <CheckCircle2 size={9} />}
                              {doc.status === "failed" && <XCircle size={9} />}
                              {(doc.status === "pending" || doc.status === "processing") && <Clock size={9} className="animate-spin" />}
                              {doc.status}
                            </span>

                            {/* Classification Type Tag */}
                            <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border font-medium capitalize">
                              {doc.doc_type?.replace("_", " ")}
                            </span>

                            {/* File Size */}
                            <span className="text-muted-foreground font-medium">
                              {formatBytes(doc.file_size_bytes)}
                            </span>
                          </div>

                          {/* Urgency Rating & ZeroShot classification display */}
                          {doc.status === "completed" && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 mt-1">
                              {doc.urgency_label && (
                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  doc.urgency_label.includes("CRITICAL") || doc.urgency_label.includes("1") || doc.urgency_label.includes("HIGH")
                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                                    : "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                                }`}>
                                  <AlertTriangle size={8} />
                                  Urgency: {doc.urgency_label}
                                </span>
                              )}
                              
                              {doc.doc_type_confidence !== null && doc.doc_type_confidence !== undefined && (
                                <span className="text-[9px] text-muted-foreground font-semibold">
                                  Triage Match: {Math.round(doc.doc_type_confidence * 100)}%
                                </span>
                              )}
                            </div>
                          )}

                          {doc.status === "failed" && doc.error_message && (
                            <p className="text-[10px] text-rose-500 font-semibold bg-rose-500/5 p-1.5 rounded border border-rose-500/10 leading-snug">
                              Error: {doc.error_message}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 self-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDeleteDoc(doc.id, e)}
                            className="p-1.5 hover:bg-destructive/15 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                            title="Delete file"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Q&A Reasoning Dashboard */}
        <div className="lg:col-span-6">
          <ClinicalQAPanel patientId={patientId} documents={documents} />
        </div>
      </div>

      {/* Selected Document Full Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="glass-card max-w-4xl w-full rounded-2xl p-6 shadow-2xl relative border border-border max-h-[90vh] flex flex-col">
            <button
              onClick={() => setInspectDoc(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted"
            >
              <Trash2 size={20} className="rotate-45" /> {/* Close button replacement */}
            </button>
            
            <div className="space-y-1 mb-4">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Pipeline Inspector</span>
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileText size={18} className="text-primary" /> {inspectDoc.original_filename}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Document ID: {inspectDoc.id} &bull; Processed on: {inspectDoc.processed_at ? new Date(inspectDoc.processed_at).toLocaleString() : "N/A"}
              </p>
            </div>

            {/* Split layout: Raw Extracted Text VS Structured JSON Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-1 min-h-[450px]">
              
              {/* Left text pane: Raw Extracted Text */}
              <div className="flex flex-col bg-background border border-border rounded-xl p-4 overflow-hidden">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Database size={11} /> Raw Extracted Text (OCR)
                </span>
                <div className="flex-1 overflow-y-auto text-xs font-mono bg-muted/20 p-3 rounded-lg leading-relaxed whitespace-pre-wrap select-text">
                  {inspectDoc.raw_text || "No raw text has been extracted yet. The processing job may be incomplete or failed."}
                </div>
              </div>

              {/* Right text pane: JSON Structure */}
              <div className="flex flex-col bg-background border border-border rounded-xl p-4 overflow-hidden">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                  <FileCode2 size={11} className="text-emerald-500" /> Structured Extraction (Grok Agent)
                </span>
                <div className="flex-1 overflow-y-auto text-xs font-mono bg-emerald-500/[0.02] border border-emerald-500/10 p-3 rounded-lg leading-relaxed select-text">
                  {inspectDoc.structured_data ? (
                    <pre className="text-emerald-400 dark:text-emerald-300 whitespace-pre-wrap">
                      {JSON.stringify(inspectDoc.structured_data, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center py-20 text-muted-foreground text-xs font-sans">
                      <FileSpreadsheet size={30} className="mx-auto mb-2 opacity-50" />
                      No structured keys extracted. This can happen if the Grok LLM API key was missing or returned an error during Stage 9.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
              <button
                onClick={() => setInspectDoc(null)}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-90 shadow-md transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
