import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getDeliveries } from "../services/delivery.api";
import { getDrivers } from "../services/driver.api";
import { createDispatch } from "../services/dispatch.api";

const CreateDispatchModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [form, setForm] = useState({
    deliveryId: "",
    driverId: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const [
          deliveryResponse,
          driverResponse,
        ] = await Promise.all([
          getDeliveries({
            status: "ready_for_dispatch",
            limit: 100,
          }),
          getDrivers({
            availability: "available",
            employmentStatus: "active",
            limit: 100,
          }),
        ]);

        setDeliveries(
          deliveryResponse.data?.deliveries ||
            deliveryResponse.data ||
            []
        );

        setDrivers(
          driverResponse.data?.drivers ||
            driverResponse.data ||
            []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load dispatch options"
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isOpen]);

  const selectedDriver = drivers.find(
    (driver) => driver._id === form.driverId
  );

  const assignedVehicle =
    selectedDriver?.assignedVehicle;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.deliveryId || !form.driverId) {
      setError(
        "Please select a delivery and driver"
      );
      return;
    }

    if (!assignedVehicle) {
      setError(
        "The selected driver does not have an assigned vehicle"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createDispatch({
        deliveryId: form.deliveryId,
        driverId: form.driverId,
        vehicleId:
          assignedVehicle._id || assignedVehicle,
        notes: form.notes,
      });

      setForm({
        deliveryId: "",
        driverId: "",
        notes: "",
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create dispatch"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create Dispatch"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loadingOptions ? (
          <p className="text-sm text-slate-400">
            Loading dispatch options...
          </p>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Delivery
              </label>

              <select
                name="deliveryId"
                value={form.deliveryId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
              >
                <option value="">
                  Select delivery
                </option>

                {deliveries.map((delivery) => (
                  <option
                    key={delivery._id}
                    value={delivery._id}
                  >
                    {delivery.trackingNumber} —{" "}
                    {delivery.customer?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Driver
              </label>

              <select
                name="driverId"
                value={form.driverId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
              >
                <option value="">
                  Select driver
                </option>

                {drivers.map((driver) => (
                  <option
                    key={driver._id}
                    value={driver._id}
                  >
                    {driver.user?.name ||
                      driver.user?.email ||
                      "Unnamed driver"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Vehicle
              </label>

              <input
                value={
                  assignedVehicle
                    ? assignedVehicle.registrationNumber ||
                      assignedVehicle._id
                    : "No vehicle assigned"
                }
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-slate-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                placeholder="Optional dispatch notes"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Dispatch"}
            </button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default CreateDispatchModal;