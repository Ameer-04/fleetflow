import { useState } from "react";
import Modal from "./Modal";

const transitions = {
  pending: ["confirmed", "cancelled"],

  confirmed: [
    "ready_for_dispatch",
    "cancelled",
  ],

  ready_for_dispatch: [
    "dispatched",
    "cancelled",
  ],

  dispatched: ["picked_up", "cancelled"],

  picked_up: ["in_transit"],

  in_transit: ["out_for_delivery"],

  out_for_delivery: ["delivered"],

  delivered: [],

  cancelled: [],
};

const formatStatus = (status) =>
  status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

const DeliveryStatusModal = ({
  delivery,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [status, setStatus] = useState("");

  if (!delivery) {
    return null;
  }

  const availableStatuses =
    transitions[delivery.status] || [];

  return (
    <Modal
      open={Boolean(delivery)}
      onClose={onClose}
      title="Update Delivery Status"
    >
      <div className="space-y-5">
        <div>
          <p className="text-sm text-slate-400">
            Tracking number
          </p>

          <p className="font-semibold">
            {delivery.trackingNumber}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">
            Current status
          </p>

          <p className="font-medium">
            {formatStatus(delivery.status)}
          </p>
        </div>

        {availableStatuses.length === 0 ? (
          <p className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
            This delivery has no available status
            transitions.
          </p>
        ) : (
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">
              Select next status
            </option>

            {availableStatuses.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Cancel
          </button>

          <button
            disabled={!status || loading}
            onClick={() => onSubmit(status)}
            className="rounded-xl bg-emerald-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeliveryStatusModal;