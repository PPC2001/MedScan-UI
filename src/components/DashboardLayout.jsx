import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Users, 
  CreditCard, 
  Settings, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight, 
  ShieldAlert, 
  Database,
  BrainCircuit,
  HelpCircle
} from "lucide-react";
import { getApiConfig, saveApiConfig, api } from "../utils/api";

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // default premium dark
  
  // API settings state
  const [apiUrlSetting, setApiUrlSetting] = useState("");
  const [apiKeySetting, setApiKeySetting] = useState("");
  
  // Health status states
  const [dbHealthy, setDbHealthy] = useState("checking");
  const [apiHealthy, setApiHealthy] = useState("checking");
  
  // Subscription state from localStorage
  const [subscription, setSubscription] = useState({
    plan: "Free Trial",
    status: "active",
    expires: "N/A"
  });

  useEffect(() => {
    // Read theme
    const theme = localStorage.getItem("medscan_theme") || "dark";
    setIsDarkMode(theme === "dark");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Read current settings
    const config = getApiConfig();
    setApiUrlSetting(config.baseUrl);
    setApiKeySetting(config.apiKey);

    // Read billing state
    const savedSub = localStorage.getItem("medscan_subscription");
    if (savedSub) {
      try {
        setSubscription(JSON.parse(savedSub));
      } catch (_) {}
    }

    // Check health
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const healthData = await api.getHealth();
      setApiHealthy("healthy");
      
      // The backend returns DB status inside services.postgres
      if (healthData?.services?.postgres === "healthy") {
        setDbHealthy("healthy");
      } else {
        setDbHealthy("unhealthy");
      }
    } catch (_) {
      setApiHealthy("unhealthy");
      setDbHealthy("unhealthy");
    }
  };

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("medscan_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("medscan_theme", "light");
    }
  };

  const saveSettings = () => {
    saveApiConfig(apiUrlSetting, apiKeySetting);
    setIsSettingsOpen(false);
    // Reload health
    checkHealth();
    // Reload page view
    window.location.reload();
  };

  const navItems = [
    { id: "landing", label: "Product Overview", icon: BrainCircuit },
    { id: "patients", label: "Patient Intelligence", icon: Users },
    { id: "pricing", label: "SaaS Plans & Billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden glass-panel fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
            <Activity size={20} />
          </div>
          <span className="font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-lg">
            MedScan AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-55 w-64 glass-panel flex flex-col justify-between p-6 transition-all duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:flex"}
        ${isSidebarOpen ? "pt-20 md:pt-6" : ""}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-lg">
                MedScan AI
              </h1>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                Clinical Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === "patients" && activeTab === "patient-detail");
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? "bg-gradient-to-r from-primary/15 to-secondary/15 text-foreground border-l-4 border-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-primary" : "group-hover:text-foreground"} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={`opacity-0 transition-transform ${isActive ? "opacity-100 translate-x-0.5" : "group-hover:opacity-40"}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with System Health & Profile */}
        <div className="space-y-6 pt-6 border-t border-border">
          {/* System Health Indicators */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><Database size={13} className="text-muted-foreground" /> Database:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                dbHealthy === "healthy" ? "text-emerald-500" : dbHealthy === "checking" ? "text-amber-500 animate-pulse" : "text-rose-500"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  dbHealthy === "healthy" ? "bg-emerald-500" : dbHealthy === "checking" ? "bg-amber-500" : "bg-rose-500"
                }`}></span>
                {dbHealthy}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><Activity size={13} className="text-muted-foreground" /> Pipeline API:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                apiHealthy === "healthy" ? "text-emerald-500" : apiHealthy === "checking" ? "text-amber-500 animate-pulse" : "text-rose-500"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  apiHealthy === "healthy" ? "bg-emerald-500" : apiHealthy === "checking" ? "bg-amber-500" : "bg-rose-500"
                }`}></span>
                {apiHealthy}
              </span>
            </div>
          </div>

          {/* Pricing Tier Display */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">SaaS Account</span>
              <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {subscription.plan}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Status: <span className="text-emerald-500 font-semibold">{subscription.status}</span></p>
          </div>

          {/* Settings and Theme buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5"
            >
              <Settings size={16} />
              <span>API Settings</span>
            </button>
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 max-w-7xl mx-auto w-full overflow-x-hidden transition-all duration-300">
        {children}
      </main>

      {/* API Configuration Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 space-y-6 shadow-2xl relative border border-border">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted"
            >
              <X size={20} />
            </button>
            <div>
              <h3 className="text-lg font-bold">API Configuration</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adjust API routes and credentials to sync with your local FastAPI server.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">FastAPI Host URL</label>
                <input
                  type="text"
                  value={apiUrlSetting}
                  onChange={(e) => setApiUrlSetting(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="http://localhost:8000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Access Token / X-API-Key</label>
                <input
                  type="password"
                  value={apiKeySetting}
                  onChange={(e) => setApiKeySetting(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="medscan-dev-key-change-me"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 border border-border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
