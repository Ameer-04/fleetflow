import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationByRole = {
  admin: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Vehicles", to: "/vehicles" },
    { label: "Drivers", to: "/drivers" },
    { label: "Deliveries", to: "/deliveries" },
    { label: "Dispatches", to: "/dispatches" },
    { label: "Admin", to: "/admin" },
  ],
  dispatcher: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Vehicles", to: "/vehicles" },
    { label: "Drivers", to: "/drivers" },
    { label: "Deliveries", to: "/deliveries" },
    { label: "Dispatches", to: "/dispatches" },
  ],
  driver: [
    { label: "Dashboard", to: "/dashboard" },
  ],
  user: [
    { label: "Dashboard", to: "/dashboard" },
  ],
};

const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const links = navigationByRole[user?.role] || navigationByRole.user;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/dashboard" className="flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-lg font-bold text-emerald-400">
              F
            </span>
            <span className="hidden sm:block">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">FleetFlow</span>
              <span className="block text-sm font-semibold text-white">Operations Suite</span>
            </span>
          </NavLink>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="max-w-32 truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-rose-400/50 hover:text-rose-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <ProtectedLayout />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <ProtectedLayout />;
};

export default ProtectedRoute;