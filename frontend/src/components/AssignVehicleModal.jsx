import { useEffect, useState } from "react";
import { assignVehicle } from "../services/driver.api";
import api from "../services/api";

const AssignVehicleModal = ({
  driver,
  onClose,
  onSuccess,
}) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);

        const response = await api.get("/vehicles", {
          params: {
            status: "available",
            limit: 100,
          },
        });

        setVehicles(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load available vehicles"
        );
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!vehicleId) return;

    try {
      setSubmitting(true);
      setError("");

      await assignVehicle(driver._id, vehicleId);

      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign vehicle"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-slate-950/70">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Assign Vehicle
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Assign a vehicle to{" "}
            <span className="font-medium">
              {driver.user?.name || "this driver"}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleAssign}>
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading available vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
              No available vehicles found.
            </div>
          ) : (
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
              required
            >
              <option value="">Select vehicle</option>

              {vehicles.map((vehicle) => (
                <option
                  key={vehicle._id}
                  value={vehicle._id}
                >
                  {vehicle.registrationNumber} —{" "}
                  {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                vehicles.length === 0
              }
              className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
            >
              {submitting ? "Assigning..." : "Assign Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignVehicleModal;