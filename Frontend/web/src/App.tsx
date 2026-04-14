import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "./components/ui/Navbar/Navbar";
import { Login } from "./pages/Login/Login";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { BrandProvider } from "./context/BrandContext";
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
import { ResetPasswordPage } from "./pages/ResetPasswordPage/ResetPasswordPage";
import { SettingsPage } from "./pages/SettingsPage/SettingsPage";
import { NewsPage } from "./pages/NewsPage/NewsPage";
import { ManagersPage } from "./pages/ManagersPage/ManagersPage";
import { BrandSettingsPage } from "./pages/BrandSettingsPage/BrandSettingsPage";
import { CreatorOffersPage } from "./pages/CreatorOffersPage/CreatorOffersPage";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { StatsPage } from "./pages/StatsPage/StatsPage";
import { SupportPage } from "./pages/SupportPage/SupportPage";
import { useBrand } from "./context/useBrand";
import { UserRole } from "./types/userRoles";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    const main = document.querySelector(".main-content");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

const DefaultPage = () => {
  const { user } = useAuth();
  if (user?.role === "creator") {
    return <Navigate to="/creator-offers" replace />;
  }
  return <Dashboard />;
};

const BrandOffersPage = () => {
  const { t } = useTranslation();
  const { selectedBrand } = useBrand();
  if (!selectedBrand) {
    return (
      <div className="users-page">
        <div
          className="no-data-text"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          {t("noBrandSelected")}
        </div>
      </div>
    );
  }
  return <OffersPage brandId={selectedBrand._id} />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <ScrollToTop />
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
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DefaultPage />
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
              path="/managers"
              element={
                <ProtectedRoute roles={[UserRole.BRAND_MANAGER]}>
                  <ManagersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-offers"
              element={
                <ProtectedRoute roles={[UserRole.BRAND_MANAGER]}>
                  <BrandOffersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand-settings"
              element={
                <ProtectedRoute roles={[UserRole.BRAND_MANAGER]}>
                  <BrandSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator-offers"
              element={
                <ProtectedRoute roles={[UserRole.CREATOR]}>
                  <CreatorOffersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={[UserRole.CREATOR]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator-offers/:id"
              element={
                <ProtectedRoute roles={[UserRole.CREATOR]}>
                  <OfferDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <ProtectedRoute
                  roles={[
                    UserRole.ADMIN,
                    UserRole.SUBADMIN,
                    UserRole.BRAND_MANAGER,
                  ]}
                >
                  <OffersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers/new"
              element={
                <ProtectedRoute
                  roles={[
                    UserRole.ADMIN,
                    UserRole.SUBADMIN,
                    UserRole.BRAND_MANAGER,
                  ]}
                >
                  <CreateOfferPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers/:id"
              element={
                <ProtectedRoute
                  roles={[
                    UserRole.ADMIN,
                    UserRole.SUBADMIN,
                    UserRole.BRAND_MANAGER,
                  ]}
                >
                  <OfferDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUBADMIN]}>
                  <StatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute
                  roles={[
                    UserRole.CREATOR,
                    UserRole.BRAND_MANAGER,
                  ]}
                >
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/:target"
              element={
                <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUBADMIN]}>
                  <NewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <NewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers/:id/edit"
              element={
                <ProtectedRoute
                  roles={[
                    UserRole.ADMIN,
                    UserRole.SUBADMIN,
                    UserRole.BRAND_MANAGER,
                  ]}
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
    <ToastProvider>
      <AuthProvider>
        <BrandProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </BrandProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
