import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  UserPlus, 
  Trash2, 
  Calendar, 
  FileText, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { api } from "../utils/api";

export default function PatientsPage({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    date_of_birth: "",
    gender: "Male",
    mrn: "",
    phone: "",
    email: "",
    address: "",
    blood_type: "O+",
    allergies: "",
    notes: ""
  });

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listPatients(search);
      setPatients(data);
    } catch (err) {
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createPatient(newPatient);
      setIsAddOpen(false);
      // Reset form
      setNewPatient({
        name: "",
        date_of_birth: "",
        gender: "Male",
        mrn: "",
        phone: "",
        email: "",
        address: "",
        blood_type: "O+",
        allergies: "",
        notes: ""
      });
      fetchPatients();
    } catch (err) {
      setError(err.message || "Failed to create patient");
    }
  };

  const handleDeletePatient = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this patient? All associated documents and clinical logs will be removed permanently.")) {
      return;
    }
    try {
      await api.deletePatient(id);
      fetchPatients();
    } catch (err) {
      setError(err.message || "Failed to delete patient");
    }
  };

  return (
    <div className="space-y-6 py-4 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Patient Intelligence Records</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Access, triaged histories, and query agentic pipelines for clinical decisions.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 shadow-md shadow-primary/20 transition-all text-sm"
        >
          <UserPlus size={16} />
          <span>Add Patient Record</span>
        </button>
      </div>

      {/* Search and Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients by name or medical ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
        <button
          onClick={fetchPatients}
          className="p-2.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors shadow-sm"
          title="Refresh patient list"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm">
          <AlertCircle size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Patient Grid / Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Loading patient directory...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <UserPlus size={40} className="text-muted-foreground/60 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base">No patient records found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create a patient profile to upload lab reports, medical notes, or clinical imaging for pipeline parsing.
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="border border-border bg-card hover:bg-muted font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Create First Patient
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Medical Record No. (MRN)</th>
                  <th className="p-4">Demographics</th>
                  <th className="p-4">Blood & Allergies</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Added {new Date(patient.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-muted-foreground bg-muted/10 px-2.5 py-1 rounded inline-block my-3">
                      {patient.mrn}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs">{patient.gender}</span>
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                          <Calendar size={11} /> {patient.date_of_birth}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <span className="text-xs font-semibold text-foreground">Blood Type: {patient.blood_type || "N/A"}</span>
                        <span className="text-[11px] text-rose-500 font-semibold truncate" title={patient.allergies}>
                          {patient.allergies || "No allergies noted"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPatient(patient.id)}
                          className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all"
                          title="Open Profile"
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          onClick={(e) => handleDeletePatient(patient.id, e)}
                          className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="glass-card max-w-2xl w-full rounded-2xl p-6 shadow-2xl relative border border-border max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted"
            >
              <Trash2 size={20} className="rotate-45" /> {/* simple close close icon substitute */}
            </button>
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="text-primary" size={20} /> Add New Patient Record
              </h3>
              <p className="text-xs text-muted-foreground">
                Register a new clinical profile to initiate diagnostic document intelligence.
              </p>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Patient Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newPatient.name}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Medical Record Number (MRN) *</label>
                  <input
                    type="text"
                    name="mrn"
                    required
                    value={newPatient.mrn}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. PAT-9831A"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    value={newPatient.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Biological Gender *</label>
                  <select
                    name="gender"
                    required
                    value={newPatient.gender}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Blood Type</label>
                  <select
                    name="blood_type"
                    value={newPatient.blood_type}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={newPatient.phone}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 019-2831"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={newPatient.email}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john.doe@hospital.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Known Allergies</label>
                  <input
                    type="text"
                    name="allergies"
                    value={newPatient.allergies}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Comma-separated (e.g. Penicillin, Peanuts)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Clinical Remarks / Intake Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={newPatient.notes}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Summarize basic intake findings or ongoing chronic conditions..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 border border-border px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
