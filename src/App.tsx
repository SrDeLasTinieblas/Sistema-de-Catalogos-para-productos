import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import { CatalogList } from "./components/CatalogList";
import { CatalogView } from "./components/CatalogView";
import { UploadCatalog } from "./components/UploadCatalog";
import { ManageCatalogs } from "./components/ManageCatalogs";
import { CreateCatalog } from "./components/CreateCatalog";
import { UploadProduct } from "./components/UploadProduct";

type View =
  | "home"
  | "catalogs"
  | "catalog-view"
  | "upload-catalog"
  | "manage-catalogs"
  | "create-catalog"
  | "upload-product";

function AppContent() {
  const { user, currentMode, showRegister, setShowRegister, register } = useAuth();
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedCatalogId, setSelectedCatalogId] =
    useState<string>("");
  const [previousView, setPreviousView] = useState<View>("manage-catalogs");

  const handleNavigate = (view: string) => {
    setPreviousView(currentView); // Guardar la vista actual antes de cambiar
    setCurrentView(view as View);
  };

  const handleViewCatalog = (catalogId: string) => {
    setSelectedCatalogId(catalogId);
    setCurrentView("catalog-view");
  };

  const handleBackToCatalogs = () => {
    // Regresar a la vista anterior (catalogs o manage-catalogs)
    if (previousView === "manage-catalogs" || previousView === "catalogs") {
      setCurrentView(previousView);
    } else {
      setCurrentView("catalogs"); // Fallback
    }
  };


  const handleUploadSuccess = () => {
    setCurrentView("manage-catalogs");
  };

  const handleCreateCatalogClick = () => {
    setCurrentView("create-catalog");
  };

  const handleCreateCatalogSuccess = (catalogId: string) => {
    setSelectedCatalogId(catalogId);
    setCurrentView("catalog-view");
  };

  const handleCancelCreateCatalog = () => {
    setCurrentView("manage-catalogs");
  };

  const handleUploadProductSuccess = () => {
    setCurrentView("manage-catalogs");
  };

  const handleCancelUploadProduct = () => {
    setCurrentView("manage-catalogs");
  };

  const handleRegister = async (
    email: string,
    password: string,
    name: string,
    role: 'Propietario' | 'Visitante'
  ) => {
    await register(email, password, name, role);
  };

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <main className="transition-all duration-300 ease-in-out">
        {currentView === "home" && (
          <Home onNavigate={handleNavigate} />
        )}

        {currentView === "catalogs" && (
          <CatalogList onViewCatalog={handleViewCatalog} />
        )}

        {currentView === "catalog-view" && (
          <CatalogView
            catalogId={selectedCatalogId}
            onBack={handleBackToCatalogs}
          />
        )}

        {currentView === "upload-catalog" &&
          currentMode === "Propietario" && (
            <UploadCatalog onSuccess={handleUploadSuccess} />
          )}

        {currentView === "manage-catalogs" &&
          currentMode === "Propietario" && (
            <ManageCatalogs
              onViewCatalog={handleViewCatalog}
              onCreateCatalog={handleCreateCatalogClick}
            />
          )}

        {currentView === "create-catalog" &&
          currentMode === "Propietario" && (
            <CreateCatalog
              onSuccess={handleCreateCatalogSuccess}
              onCancel={handleCancelCreateCatalog}
            />
          )}

        {currentView === "upload-product" &&
          currentMode === "Propietario" && (
            <UploadProduct
              catalogId={selectedCatalogId}
              onSuccess={handleUploadProductSuccess}
              onCancel={handleCancelUploadProduct}
            />
          )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}