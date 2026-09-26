import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
        <header className="mb-10 flex items-center justify-between rounded-full border border-slate-800 bg-slate-900/70 px-5 py-3 shadow-lg shadow-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-lg font-bold text-emerald-400">
              F
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">FleetFlow</p>
              <h1 className="text-lg font-semibold text-white">Operations Suite</h1>
            </div>
          </div>

          {user ? (
            <button
              onClick={logout}
              className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-sky-400 hover:text-sky-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Get Started
              </Link>
            </div>
          )}
        </header>

        <main className="flex flex-1 items-center">
          <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <section>
              <div className="mb-6 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                Smarter fleet management
              </div>

              <h2 className="max-w-xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                Move faster with an intelligent vehicle workflow.
              </h2>

              <p className="mt-6 max-w-xl text-lg text-slate-300">
                Coordinate fleets, tasks, and operations in one streamlined platform designed for modern teams.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400"
                    >
                      Create account
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500"
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Go to dashboard
                  </Link>
                )}
              </div>

              {user && (
                <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/40">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Current user</p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}
            </section>

            <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm">
              <div className="space-y-5">
                {[
                  ["Live fleet visibility", "Track vehicles, routes, and assignments across your network."],
                  ["Fast operations", "Reduce delays with faster scheduling and task updates."],
                  ["Built for scale", "Keep growing without sacrificing clarity and control."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-300">
                      ✓
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
