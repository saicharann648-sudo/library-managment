// App.jsx — root router with localStorage-based auth (no Firebase needed)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider }  from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute    from "./components/ProtectedRoute";
import Layout            from "./components/Layout";

import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Books        from "./pages/Books";
import Members      from "./pages/Members";
import Transactions from "./pages/Transactions";
import Reports      from "./pages/Reports";
import ActivityLog  from "./pages/ActivityLog";
import Settings     from "./pages/Settings";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/"             element={<Dashboard />}    />
                    <Route path="/books"        element={<Books />}        />
                    <Route path="/members"      element={<Members />}      />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/reports"      element={<Reports />}      />
                    <Route path="/activity"     element={<ActivityLog />}  />
                    <Route path="/settings"     element={<Settings />}     />
                    <Route path="*"             element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#f1f5f9" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" } },
        }}
      />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
