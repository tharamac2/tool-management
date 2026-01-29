import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
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
import ViewTool from "./pages/ViewTool";
import { Toaster } from "./components/ui/sonner";
import api from './services/api';

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
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/me');
          const userData = response.data;
          setUser({
            id: userData.username,
            name: userData.full_name || userData.username,
            role: userData.role as User['role']
          });
        } catch (error) {
          console.error("Session restoration failed", error);
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Accessible without login */}
        <Route path="/view-tool/:qrCode" element={<ViewTool />} />

        {/* Protected Routes - Requiring Login */}
        <Route
          path="*"
          element={
            !user ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  {user.role === "admin" && (
                    <>
                      <Route path="/" element={<Navigate to="/tool-master" replace />} />
                      <Route path="/tool-master" element={<ToolMaster />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/users" element={<UsersManagement />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </>
                  )}
                  {user.role === "store" && (
                    <>
                      <Route path="/" element={<Navigate to="/store-view" replace />} />
                      <Route path="/store-view" element={<StoreView />} />
                    </>
                  )}
                  {user.role === "inspector" && (
                    <>
                      <Route path="/" element={<Navigate to="/inspector" replace />} />
                      <Route path="/inspector" element={<InspectorView />} />
                    </>
                  )}
                  {user.role === "management" && (
                    <>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/alerts" element={<Alerts />} />
                    </>
                  )}
                  {user.role === "worker" && (
                    <>
                      <Route path="/" element={<Navigate to="/worker" replace />} />
                      <Route path="/worker" element={<WorkerView />} />
                      <Route path="/split-tool" element={<SplitToolMatching />} />
                    </>
                  )}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            )
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;