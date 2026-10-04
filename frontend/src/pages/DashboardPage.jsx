import { useEffect, useState } from "react";
import { getDashboardOverview } from "../services/dashboard.service";

const StatCard = ({
  title,
  value,
  subtitle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
      <p className="text-sm font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const response =
          await getDashboardOverview();

        setDashboard(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-200">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {
    deliveries,
    priorities,
    vehicles,
    drivers,
    dispatches,
    recentDispatches,
  } = dashboard;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Overview of your FleetFlow operations.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Deliveries"
          value={deliveries.total}
          subtitle={`${deliveries.delivered} delivered`}
        />

        <StatCard
          title="Active Deliveries"
          value={
            deliveries.dispatched +
            deliveries.picked_up +
            deliveries.in_transit +
            deliveries.out_for_delivery
          }
          subtitle="Currently operational"
        />

        <StatCard
          title="Available Vehicles"
          value={vehicles.available}
          subtitle={`${vehicles.total} total vehicles`}
        />

        <StatCard
          title="Available Drivers"
          value={drivers.availability.available}
          subtitle={`${drivers.employment.active} active drivers`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Dispatches"
          value={
            dispatches.assigned +
            dispatches.started
          }
        />

        <StatCard
          title="In Transit"
          value={deliveries.in_transit}
        />

        <StatCard
          title="Out for Delivery"
          value={deliveries.out_for_delivery}
        />

        <StatCard
          title="Urgent Deliveries"
          value={priorities.urgent}
        />
      </div>

      {/* Main analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery status */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">
            Delivery Status
          </h2>

          <div className="mt-5 space-y-3">
            {[
              [
                "Pending",
                deliveries.pending,
              ],
              [
                "Confirmed",
                deliveries.confirmed,
              ],
              [
                "Ready for Dispatch",
                deliveries.ready_for_dispatch,
              ],
              [
                "Dispatched",
                deliveries.dispatched,
              ],
              [
                "Picked Up",
                deliveries.picked_up,
              ],
              [
                "In Transit",
                deliveries.in_transit,
              ],
              [
                "Out for Delivery",
                deliveries.out_for_delivery,
              ],
              [
                "Delivered",
                deliveries.delivered,
              ],
              [
                "Cancelled",
                deliveries.cancelled,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-400">
                  {label}
                </span>

                <span className="font-semibold">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet status */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">
            Fleet Status
          </h2>

          <div className="mt-5 space-y-3">
            {[
              ["Available", vehicles.available],
              ["Assigned", vehicles.assigned],
              [
                "In Transit",
                vehicles.in_transit,
              ],
              [
                "Maintenance",
                vehicles.maintenance,
              ],
              ["Inactive", vehicles.inactive],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-400">
                  {label}
                </span>

                <span className="font-semibold">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority + driver availability */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">
            Delivery Priority
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">
                Low
              </p>
              <p className="mt-1 text-2xl font-bold">
                {priorities.low}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">
                Normal
              </p>
              <p className="mt-1 text-2xl font-bold">
                {priorities.normal}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">
                High
              </p>
              <p className="mt-1 text-2xl font-bold">
                {priorities.high}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">
                Urgent
              </p>
              <p className="mt-1 text-2xl font-bold">
                {priorities.urgent}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">
            Driver Availability
          </h2>

          <div className="mt-5 space-y-3">
            {[
              [
                "Available",
                drivers.availability.available,
              ],
              [
                "On Delivery",
                drivers.availability.on_delivery,
              ],
              [
                "Unavailable",
                drivers.availability.unavailable,
              ],
              [
                "On Leave",
                drivers.availability.on_leave,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-400">
                  {label}
                </span>

                <span className="font-semibold">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent dispatches */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/20">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold text-white">
            Recent Dispatches
          </h2>
        </div>

        {recentDispatches.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No dispatch activity yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Tracking
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Driver
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Vehicle
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Delivery
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Dispatch
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">
                {recentDispatches.map(
                  (dispatch) => (
                    <tr key={dispatch._id}>
                      <td className="px-5 py-4 text-sm font-medium">
                        {
                          dispatch.delivery
                            ?.trackingNumber
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {dispatch.driver
                          ?.user?.name ||
                          dispatch.driver
                            ?.user?.email ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {dispatch.vehicle
                          ?.registrationNumber ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs capitalize text-slate-300">
                          {dispatch.delivery?.status?.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs capitalize text-emerald-300">
                          {dispatch.status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default DashboardPage;