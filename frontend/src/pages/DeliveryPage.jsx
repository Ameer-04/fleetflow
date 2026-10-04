import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  createDelivery,
  getDeliveries,
  updateDelivery,
  changeDeliveryStatus,
  deleteDelivery,
} from "../services/delivery.api";

import DeliveryForm from "../components/DeliveryForm";
import DeliveryStatusBadge from "../components/deliveryStatusBadge";
import DeliveryStatusModal from "../components/DeliveryStatusModal";

import Modal from "../components/Modal";
import useDebounce from "../components/hooks/useDebounce";

const DeliveriesPage = () => {
  const { user } = useAuth();
  const canManage = ["admin", "dispatcher"].includes(user?.role);
  const canDelete = user?.role === "admin";
  const [deliveries, setDeliveries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] =
    useState(false);
  const [statusLoading, setStatusLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingDelivery, setEditingDelivery] =
    useState(null);

  const [statusDelivery, setStatusDelivery] =
    useState(null);

  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDeliveries({
        page,
        limit: 20,
        search: debouncedSearch,
        status,
        priority,
      });

      setDeliveries(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load deliveries"
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority]);

  useEffect(() => {
    const load = async () => {
      await loadDeliveries();
    };

    load();
  }, [loadDeliveries]);

  if (!canManage) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Delivery operations</p>
        <h1 className="mt-3 text-2xl font-bold text-white">Access restricted</h1>
        <p className="mt-2 text-sm text-slate-400">Deliveries are available to administrators and dispatchers.</p>
      </div>
    );
  }

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);

      await createDelivery(data);

      setShowForm(false);

      await loadDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create delivery"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setFormLoading(true);

      await updateDelivery(
        editingDelivery._id,
        data
      );

      setEditingDelivery(null);

      await loadDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update delivery"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    try {
      setStatusLoading(true);

      await changeDeliveryStatus(
        statusDelivery._id,
        nextStatus
      );

      setStatusDelivery(null);

      await loadDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update delivery status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async (delivery) => {
    const confirmed = window.confirm(
      `Delete delivery ${delivery.trackingNumber}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDelivery(delivery._id);

      await loadDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete delivery"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Deliveries
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage delivery orders and their
            operational status.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          + New Delivery
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
        <div className="grid gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search deliveries..."
          className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="ready_for_dispatch">
            Ready for dispatch
          </option>
          <option value="dispatched">
            Dispatched
          </option>
          <option value="picked_up">
            Picked up
          </option>
          <option value="in_transit">
            In transit
          </option>
          <option value="out_for_delivery">
            Out for delivery
          </option>
          <option value="delivered">
            Delivered
          </option>
          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/20">
        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Loading deliveries...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No deliveries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">
                    Tracking
                  </th>

                  <th className="px-4 py-3">
                    Customer
                  </th>

                  <th className="px-4 py-3">
                    Destination
                  </th>

                  <th className="px-4 py-3">
                    Package
                  </th>

                  <th className="px-4 py-3">
                    Priority
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {deliveries.map((delivery) => (
                  <tr
                    key={delivery._id}
                    className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-4 font-medium">
                      {delivery.trackingNumber}
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        {delivery.customer.name}
                      </div>

                      <div className="text-xs text-slate-400">
                        {delivery.customer.phone}
                      </div>
                    </td>

                    <td className="max-w-xs px-4 py-4">
                      <div className="truncate">
                        {
                          delivery.destination
                            .address
                        }
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {delivery.package.quantity} ×{" "}
                      {delivery.package.description}
                      <div className="text-xs text-slate-400">
                        {delivery.package.weight}{" "}
                        {delivery.package.weightUnit}
                      </div>
                    </td>

                    <td className="px-4 py-4 capitalize">
                      {delivery.priority}
                    </td>

                    <td className="px-4 py-4">
                      <DeliveryStatusBadge
                        status={delivery.status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setStatusDelivery(
                              delivery
                            )
                          }
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
                        >
                          Status
                        </button>

                        <button
                          onClick={() =>
                            setEditingDelivery(
                              delivery
                            )
                          }
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-400/10"
                        >
                          Edit
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(delivery)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {pagination.page} of{" "}
            {pagination.pages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => current - 1)
              }
              className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create */}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create Delivery"
      >
        <DeliveryForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit */}

      <Modal
        open={Boolean(editingDelivery)}
        onClose={() => setEditingDelivery(null)}
        title="Edit Delivery"
      >
        <DeliveryForm
          delivery={editingDelivery}
          onSubmit={handleUpdate}
          onCancel={() =>
            setEditingDelivery(null)
          }
          loading={formLoading}
        />
      </Modal>

      {/* Status */}

      <DeliveryStatusModal
        key={statusDelivery?._id || "closed"}
        delivery={statusDelivery}
        onClose={() => setStatusDelivery(null)}
        onSubmit={handleStatusChange}
        loading={statusLoading}
      />
      </div>
    </div>
  );
};

export default DeliveriesPage;