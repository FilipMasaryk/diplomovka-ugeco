import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/ui/Navbar/Navbar";
import { Login } from "./pages/Login/Login";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Menubar } from "./components/ui/Menubar/Menubar";
import { PublicRoute } from "./routes/PublicRoute";

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-body">
        {user && <Menubar role={user.role} />}
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
