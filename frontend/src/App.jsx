import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoutes";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import VehiclesPage from "./pages/VehiclesPage";
import DriverPage from "./pages/DriverPage";
import DeliveryPage from "./pages/DeliveryPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/vehicles" element={<VehiclesPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/drivers" element={<DriverPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/deliveries" element={<DeliveryPage />} />
    </Route>
    
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
