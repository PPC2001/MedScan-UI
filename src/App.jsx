import React, { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import PatientsPage from "./pages/PatientsPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import PricingPage from "./pages/PricingPage";

function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setActiveTab("patient-detail");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "landing":
        return <LandingPage setActiveTab={setActiveTab} />;
      case "patients":
        return <PatientsPage onSelectPatient={handleSelectPatient} />;
      case "patient-detail":
        return (
          <PatientDetailPage
            patientId={selectedPatientId}
            onBack={() => {
              setSelectedPatientId(null);
              setActiveTab("patients");
            }}
          />
        );
      case "pricing":
        return <PricingPage />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;
