import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import DriverForm from "../components/DriverForm";
import AssignVehicleModal from "../components/AssignVehicleModal";
import {
  createDriver,
  deleteDriver,
  getDrivers,
  unassignVehicle,
  updateDriver,
} from "../services/driver.api";
import api from "../services/api";
import useDebounce from "../components/hooks/useDebounce";

const statusClasses = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-yellow-100 text-yellow-700",
  terminated: "bg-red-100 text-red-700",
};

const availabilityClasses = {
  available: "bg-green-100 text-green-700",
  unavailable: "bg-gray-100 text-gray-700",
  on_delivery: "bg-blue-100 text-blue-700",
  on_leave: "bg-purple-100 text-purple-700",
};

const formatStatus = (value) => {
  if (!value) return "—";

  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const DriversPage = () => {
  const { user } = useAuth();
  const canManageDrivers = user?.role === "admin";
  const canAssignVehicles = ["admin", "dispatcher"].includes(user?.role);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [employmentStatus, setEmploymentStatus] =
    useState("");
  const [availability, setAvailability] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [assigningDriver, setAssigningDriver] =
    useState(null);

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDrivers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        employmentStatus:
          employmentStatus || undefined,
        availability: availability || undefined,
      });

      setDrivers(response.data || []);

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load drivers"
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, employmentStatus, availability]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get("/users", {
        params: {
          role: "driver",
          limit: 100,
        },
      });

      setUsers(response.data.data || []);
    } catch (err) {
      // Driver creation will show an empty user list.
      console.error("Failed to load driver users", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadDrivers();
    };

    load();
  }, [loadDrivers]);

  useEffect(() => {
    const load = async () => {
      await loadUsers();
    };

    load();
  }, [loadUsers]);

  if (!canAssignVehicles) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-100 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Driver operations
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">Access restricted</h1>
        <p className="mt-2 text-sm text-slate-400">
          Drivers are available to administrators and dispatchers.
        </p>
      </div>
    );
  }

  const openCreate = () => {
    setEditingDriver(null);
    setShowForm(true);
  };

  const openEdit = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError("");

      if (editingDriver) {
        await updateDriver(
          editingDriver._id,
          formData
        );
      } else {
        await createDriver(formData);
      }

      closeForm();
      await loadDrivers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save driver"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (driver) => {
    const name =
      driver.user?.name || "this driver";

    const confirmed = window.confirm(
      `Delete ${name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteDriver(driver._id);

      await loadDrivers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete driver"
      );
    }
  };

  const handleUnassign = async (driver) => {
    const confirmed = window.confirm(
      "Unassign the current vehicle from this driver?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await unassignVehicle(driver._id);

      await loadDrivers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to unassign vehicle"
      );
    }
  };

  const handleAssignmentSuccess = async () => {
    setAssigningDriver(null);
    await loadDrivers();
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Drivers
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage drivers, availability and vehicle
            assignments.
          </p>
        </div>

        {canManageDrivers && (
          <button
            onClick={openCreate}
            className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
          >
            Add driver
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="font-medium"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search drivers..."
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          />

          <select
            value={employmentStatus}
            onChange={(e) => {
              setEmploymentStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">All employment statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">All availability</option>
            <option value="available">Available</option>
            <option value="unavailable">
              Unavailable
            </option>
            <option value="on_delivery">
              On Delivery
            </option>
            <option value="on_leave">On Leave</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setEmploymentStatus("");
              setAvailability("");
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Driver
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  License
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Employment
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Availability
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vehicle
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr
                    key={driver._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {driver.user?.name ||
                          "Unknown User"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {driver.user?.email || "—"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {driver.phone}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">
                        {driver.licenseNumber}
                      </div>

                      <div className="text-sm text-gray-500">
                        Expires{" "}
                        {driver.licenseExpiry
                          ? new Date(
                              driver.licenseExpiry
                            ).toLocaleDateString()
                          : "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusClasses[
                            driver.employmentStatus
                          ] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatus(
                          driver.employmentStatus
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          availabilityClasses[
                            driver.availability
                          ] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatus(
                          driver.availability
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {driver.assignedVehicle ? (
                        <div>
                          <div className="font-medium text-gray-800">
                            {
                              driver.assignedVehicle
                                .registrationNumber
                            }
                          </div>

                          <div className="text-sm text-gray-500">
                            {
                              driver.assignedVehicle
                                .make
                            }{" "}
                            {
                              driver.assignedVehicle
                                .model
                            }
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No vehicle
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {!driver.assignedVehicle && canAssignVehicles ? (
                          <button
                            onClick={() =>
                              setAssigningDriver(
                                driver
                              )
                            }
                            disabled={
                              driver.employmentStatus !==
                                "active" ||
                              driver.availability !==
                                "available"
                            }
                            className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Assign
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUnassign(driver)
                            }
                            disabled={
                              driver.availability ===
                              "on_delivery"
                            }
                            className="rounded-md border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Unassign
                          </button>
                        )}

                        {canManageDrivers && (
                          <>
                            <button
                              onClick={() => openEdit(driver)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-400/10 hover:text-sky-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(driver)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
          <p className="text-sm text-slate-400">
            {pagination.total || 0} driver
            {pagination.total === 1 ? "" : "s"}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => current - 1)
              }
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-sm text-slate-400">
              {page} / {pagination.pages || 1}
            </span>

            <button
              disabled={
                page >= (pagination.pages || 1)
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={
          editingDriver
            ? "Edit Driver"
            : "Add Driver"
        }
      >
        <DriverForm
          driver={editingDriver}
          users={users}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          loading={formLoading}
        />
      </Modal>

      {/* Assignment Modal */}
      {assigningDriver && (
        <AssignVehicleModal
          driver={assigningDriver}
          onClose={() => setAssigningDriver(null)}
          onSuccess={handleAssignmentSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default DriversPage;