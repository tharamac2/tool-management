import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import ToolMaster from "./pages/ToolMaster";
import StoreView from "./pages/StoreView";
import InspectorView from "./pages/InspectorView";
import Dashboard from "./pages/Dashboard";
import WorkerView from "./pages/WorkerView";
import SplitToolMatching from "./pages/SplitToolMatching";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import UsersManagement from "./pages/UsersManagement";
import SettingsPage from "./pages/SettingsPage";
import { Toaster } from "./components/ui/sonner";

// QR Code-Based Tools Management & Inspection System
export interface User {
  id: string;
  name: string;
  role:
    | "admin"
    | "store"
    | "inspector"
    | "management"
    | "worker";
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {user.role === "admin" && (
            <>
              <Route
                path="/"
                element={<Navigate to="/tool-master" replace />}
              />
              <Route
                path="/tool-master"
                element={<ToolMaster />}
              />
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />
              <Route path="/reports" element={<Reports />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route
                path="/users"
                element={<UsersManagement />}
              />
              <Route
                path="/settings"
                element={<SettingsPage />}
              />
            </>
          )}
          {user.role === "store" && (
            <>
              <Route
                path="/"
                element={<Navigate to="/store-view" replace />}
              />
              <Route
                path="/store-view"
                element={<StoreView />}
              />
            </>
          )}
          {user.role === "inspector" && (
            <>
              <Route
                path="/"
                element={<Navigate to="/inspector" replace />}
              />
              <Route
                path="/inspector"
                element={<InspectorView />}
              />
            </>
          )}
          {user.role === "management" && (
            <>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />
              <Route path="/reports" element={<Reports />} />
              <Route path="/alerts" element={<Alerts />} />
            </>
          )}
          {user.role === "worker" && (
            <>
              <Route
                path="/"
                element={<Navigate to="/worker" replace />}
              />
              <Route path="/worker" element={<WorkerView />} />
              <Route
                path="/split-tool"
                element={<SplitToolMatching />}
              />
            </>
          )}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;