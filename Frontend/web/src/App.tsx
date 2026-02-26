import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/ui/Navbar/Navbar";
import { Login } from "./pages/Login/Login";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Menubar } from "./components/ui/Menubar/Menubar";
import { PublicRoute } from "./routes/PublicRoute";
import { UsersPage } from "./pages/UsersPage/UsersPage";
import { BrandsPage } from "./pages/BrandsPage/BrandsPage";
import { OffersPage } from "./pages/OffersPage/OffersPage";
import { CreateOfferPage } from "./pages/CreateOfferPage/CreateOfferPage";
import { OfferDetailPage } from "./pages/OfferDetailPage/OfferDetailPage";
import { PackagesPage } from "./pages/PackagesPage/PackagesPage";
import { UserRole } from "./types/userRoles";

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
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUBADMIN]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brands"
              element={
                <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUBADMIN]}>
                  <BrandsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/packages"
              element={
                <ProtectedRoute roles={[UserRole.ADMIN]}>
                  <PackagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <ProtectedRoute
                  roles={[UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER]}
                >
                  <OffersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers/new"
              element={
                <ProtectedRoute
                  roles={[UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER]}
                >
                  <CreateOfferPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers/:id"
              element={
                <ProtectedRoute
                  roles={[UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER]}
                >
                  <OfferDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers/:id/edit"
              element={
                <ProtectedRoute
                  roles={[UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER]}
                >
                  <CreateOfferPage />
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
