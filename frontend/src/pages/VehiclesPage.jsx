import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import VehicleForm from "../components/VehicleForm";
import useDebounce from "../components/hooks/useDebounce";
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from "../services/vehicle.api";

const statusLabels = {
  available: "Available",
  assigned: "Assigned",
  in_transit: "In transit",
  maintenance: "Maintenance",
  inactive: "Inactive",
};

const formatValue = (value) => String(value).replaceAll("_", " ");

const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ status: "", type: "", sortBy: "createdAt", sortOrder: "desc" });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const debouncedSearch = useDebounce(searchInput);
  const canManageVehicles = user?.role === "admin";

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getVehicles({
        page: pagination.page,
        limit: pagination.limit,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setVehicles(response.data);
      setPagination((previous) => ({ ...previous, ...response.pagination }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, debouncedSearch]);

  useEffect(() => {
    const loadVehicles = async () => {
      await fetchVehicles();
    };

    loadVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await deleteVehicle(id);
      await fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const openCreateForm = () => {
    setEditingVehicle(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingVehicle(null);
    setFormError("");
  };

  const handleFormSubmit = async (vehicleData) => {
    try {
      setSubmitting(true);
      setFormError("");

      if (editingVehicle) {
        await updateVehicle(editingVehicle._id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }

      closeForm();
      await fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setPagination((previous) => ({ ...previous, page: 1 }));
    setFilters((previous) => ({ ...previous, [field]: value }));
  };

  const handleSortChange = (event) => {
    const [sortBy, sortOrder] = event.target.value.split(":");
    setFilters((previous) => ({ ...previous, sortBy, sortOrder }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 p-6 shadow-2xl shadow-slate-950/40 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Fleet operations</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Vehicles</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Keep a clear view of every vehicle, its capacity, and its current operational state.</p>
            </div>
            {canManageVehicles && <button type="button" onClick={openCreateForm} className="relative rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/10 hover:bg-emerald-300">Add vehicle</button>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/50 px-4 py-3"><p className="text-xs text-slate-500">Showing</p><p className="mt-1 text-xl font-semibold text-white">{vehicles.length}</p></div>
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/50 px-4 py-3"><p className="text-xs text-slate-500">Total fleet</p><p className="mt-1 text-xl font-semibold text-white">{pagination.total}</p></div>
              <div className="col-span-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 sm:col-span-1"><p className="text-xs text-emerald-200/70">View</p><p className="mt-1 text-xl font-semibold text-emerald-200">{pagination.page}/{Math.max(pagination.pages, 1)}</p></div>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold text-white">Fleet directory</h2><p className="text-xs text-slate-500">Filter and sort your vehicle records.</p></div><span className="text-xs text-slate-500">{pagination.total} records</span></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <label><span className="sr-only">Search vehicles</span><input type="text" placeholder="Search registration, make, or model" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setPagination((previous) => ({ ...previous, page: 1 })); }} className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10" /></label>
            <label><span className="sr-only">Filter by status</span><select value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"><option value="">All statuses</option><option value="available">Available</option><option value="assigned">Assigned</option><option value="in_transit">In Transit</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label>
            <label><span className="sr-only">Filter by vehicle type</span><select value={filters.type} onChange={(event) => handleFilterChange("type", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"><option value="">All types</option><option value="van">Van</option><option value="truck">Truck</option><option value="pickup">Pickup</option><option value="motorcycle">Motorcycle</option><option value="refrigerated_truck">Refrigerated Truck</option></select></label>
            <label><span className="sr-only">Sort vehicles</span><select value={`${filters.sortBy}:${filters.sortOrder}`} onChange={handleSortChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"><option value="createdAt:desc">Newest</option><option value="createdAt:asc">Oldest</option><option value="registrationNumber:asc">Registration A-Z</option><option value="registrationNumber:desc">Registration Z-A</option><option value="capacity:desc">Highest Capacity</option><option value="capacity:asc">Lowest Capacity</option></select></label>
          </div>
        </section>

        {error && <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"><span>{error}</span><button type="button" onClick={() => setError("")} className="text-xs font-semibold text-rose-300 hover:text-white">Dismiss</button></div>}

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-semibold text-white">Vehicle records</h2><p className="mt-1 text-xs text-slate-500">Live results from your fleet database.</p></div>{loading && <span className="text-xs font-medium text-emerald-300">Refreshing...</span>}</div>
          {loading ? <div className="p-12 text-center text-sm text-slate-400">Loading vehicles...</div> : vehicles.length === 0 ? <div className="p-12 text-center"><p className="text-sm font-medium text-white">No vehicles found</p><p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p></div> : <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-4 font-medium sm:px-6">Registration</th><th className="px-5 py-4 font-medium sm:px-6">Vehicle</th><th className="px-5 py-4 font-medium sm:px-6">Type</th><th className="px-5 py-4 font-medium sm:px-6">Capacity</th><th className="px-5 py-4 font-medium sm:px-6">Status</th><th className="px-5 py-4 text-right font-medium sm:px-6">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-800/80">{vehicles.map((vehicle) => <tr key={vehicle._id} className="group hover:bg-slate-800/30"><td className="px-5 py-4 font-semibold text-white sm:px-6">{vehicle.registrationNumber}</td><td className="px-5 py-4 sm:px-6"><span className="text-slate-200">{vehicle.make} {vehicle.model}</span><span className="mt-1 block text-xs text-slate-500">Model year {vehicle.year}</span></td><td className="px-5 py-4 capitalize text-slate-300">{formatValue(vehicle.type)}</td><td className="px-5 py-4 text-slate-300">{vehicle.capacity} <span className="text-slate-500">{vehicle.capacityUnit}</span></td><td className="px-5 py-4"><span className="inline-flex rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-300">{statusLabels[vehicle.status] || formatValue(vehicle.status)}</span></td><td className="px-5 py-4 text-right sm:px-6">{canManageVehicles && <div className="flex justify-end gap-1"><button type="button" onClick={() => openEditForm(vehicle)} className="rounded-lg px-3 py-2 text-xs font-semibold text-sky-300 opacity-80 hover:bg-sky-400/10 hover:text-sky-200 group-hover:opacity-100">Edit</button><button type="button" onClick={() => handleDelete(vehicle._id)} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 opacity-80 hover:bg-rose-400/10 hover:text-rose-200 group-hover:opacity-100">Delete</button></div>}</td></tr>)}</tbody>
            </table>
          </div>}
        </section>

        {pagination.pages > 1 && <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-slate-400">Page <span className="font-semibold text-white">{pagination.page}</span> of {pagination.pages}</p><div className="flex gap-2"><button type="button" disabled={pagination.page === 1} onClick={() => setPagination((previous) => ({ ...previous, page: previous.page - 1 }))} className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={pagination.page === pagination.pages} onClick={() => setPagination((previous) => ({ ...previous, page: previous.page + 1 }))} className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>}
      </div>
      <Modal open={formOpen} title={editingVehicle ? "Edit vehicle" : "Add vehicle"} onClose={closeForm}>
        {formError && <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{formError}</div>}
        <VehicleForm key={editingVehicle?._id || "new"} vehicle={editingVehicle} onSubmit={handleFormSubmit} onCancel={closeForm} submitting={submitting} />
      </Modal>
    </div>
  );
};

export default VehiclesPage;
