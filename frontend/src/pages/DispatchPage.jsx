import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getDispatches,
  startDispatch,
  updateDeliveryProgress,
  completeDispatch,
  cancelDispatch,
} from "../services/dispatch.api";
import CreateDispatchModal from "../components/createDispatchModal";
import DispatchStatusBadge from "../components/dispatchStatusBadge";

const DispatchPage = () => {
  const { user } = useAuth();
  const canManageDispatches = ["admin", "dispatcher"].includes(user?.role);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const loadDispatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDispatches({
        status: statusFilter || undefined,
        limit: 100,
      });

      setDispatches(
        response.data?.dispatches ||
          response.data ||
          []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dispatches"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const load = async () => {
      await loadDispatches();
    };

    load();
  }, [loadDispatches]);

  if (!canManageDispatches) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Dispatch operations</p>
        <h1 className="mt-3 text-2xl font-bold text-white">Access restricted</h1>
        <p className="mt-2 text-sm text-slate-400">Dispatch management is available to administrators and dispatchers.</p>
      </div>
    );
  }

  const runAction = async (id, action) => {
    try {
      setActionLoading(id);
      setError("");

      await action(id);

      await loadDispatches();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Operation failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleProgress = async (
    dispatch,
    nextStatus
  ) => {
    await runAction(dispatch._id, (id) =>
      updateDeliveryProgress(id, nextStatus)
    );
  };

  const getNextDeliveryAction = (dispatch) => {
    const deliveryStatus =
      dispatch.delivery?.status;

    switch (deliveryStatus) {
      case "picked_up":
        return {
          label: "Start Transit",
          status: "in_transit",
        };

      case "in_transit":
        return {
          label: "Out for Delivery",
          status: "out_for_delivery",
        };

      case "out_for_delivery":
        return {
          label: "Mark Delivered",
          status: "delivered",
        };

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dispatch Management
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage active driver and vehicle assignments.
          </p>
        </div>

        <button
          onClick={() =>
            setIsCreateModalOpen(true)
          }
          className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          + Create Dispatch
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-slate-300">
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">All statuses</option>
            <option value="assigned">Assigned</option>
            <option value="started">Started</option>
            <option value="completed">
              Completed
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* Dispatch table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Loading dispatches...
          </div>
        ) : dispatches.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">
              No dispatches found.
            </p>

            <button
              onClick={() =>
                setIsCreateModalOpen(true)
              }
              className="mt-3 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Create your first dispatch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Delivery
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Driver
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Vehicle
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Delivery Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Dispatch
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">
                {dispatches.map((dispatch) => {
                  const driverName =
                    dispatch.driver?.user?.name ||
                    dispatch.driver?.user?.email ||
                    "Unknown";

                  const vehicle =
                    dispatch.vehicle;

                  const nextAction =
                    getNextDeliveryAction(
                      dispatch
                    );

                  const busy =
                    actionLoading ===
                    dispatch._id;

                  return (
                    <tr
                      key={dispatch._id}
                      className="hover:bg-slate-800/30"
                    >
                      {/* Delivery */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-white">
                          {dispatch.delivery
                            ?.trackingNumber ||
                            "—"}
                        </div>

                        <div className="text-xs text-slate-400">
                          {dispatch.delivery
                            ?.customer?.name ||
                            "Unknown customer"}
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {driverName}
                      </td>

                      {/* Vehicle */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {vehicle
                          ?.registrationNumber ||
                          "—"}
                      </td>

                      {/* Delivery status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium capitalize text-slate-300">
                          {dispatch.delivery
                            ?.status?.replace(
                              /_/g,
                              " "
                            ) || "—"}
                        </span>
                      </td>

                      {/* Dispatch status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <DispatchStatusBadge
                          status={
                            dispatch.status
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {dispatch.status ===
                            "assigned" && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  runAction(
                                    dispatch._id,
                                    startDispatch
                                  )
                                }
                                className="rounded-lg bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-300 disabled:opacity-50"
                              >
                                {busy
                                  ? "..."
                                  : "Start"}
                              </button>

                              <button
                                disabled={busy}
                                onClick={() =>
                                  runAction(
                                    dispatch._id,
                                    cancelDispatch
                                  )
                                }
                                className="rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/10 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {dispatch.status ===
                            "started" &&
                            nextAction && (
                              <button
                                disabled={busy}
                                onClick={() =>
                                  handleProgress(
                                    dispatch,
                                    nextAction.status
                                  )
                                }
                                className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                              >
                                {busy
                                  ? "..."
                                  : nextAction.label}
                              </button>
                            )}

                          {dispatch.status ===
                            "started" &&
                            dispatch.delivery
                              ?.status ===
                              "delivered" && (
                              <button
                                disabled={busy}
                                onClick={() =>
                                  runAction(
                                    dispatch._id,
                                    completeDispatch
                                  )
                                }
                                className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                              >
                                {busy
                                  ? "..."
                                  : "Complete"}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateDispatchModal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        onSuccess={loadDispatches}
      />
      </div>
    </div>
  );
};

export default DispatchPage;