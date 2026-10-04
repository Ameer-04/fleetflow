import { useEffect, useState } from "react";

const initialForm = {
  customer: {
    name: "",
    phone: "",
    email: "",
  },

  pickup: {
    address: "",
    contactName: "",
    contactPhone: "",
  },

  destination: {
    address: "",
    contactName: "",
    contactPhone: "",
  },

  package: {
    description: "",
    weight: "",
    weightUnit: "kg",
    quantity: 1,
    fragile: false,
  },

  priority: "normal",
  scheduledDate: "",
  notes: "",
};

const DeliveryForm = ({
  delivery,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const resetForm = () => setForm(!delivery ? { ...initialForm } : {
      customer: {
        name: delivery.customer?.name || "",
        phone: delivery.customer?.phone || "",
        email: delivery.customer?.email || "",
      },

      pickup: {
        address: delivery.pickup?.address || "",
        contactName:
          delivery.pickup?.contactName || "",
        contactPhone:
          delivery.pickup?.contactPhone || "",
      },

      destination: {
        address:
          delivery.destination?.address || "",
        contactName:
          delivery.destination?.contactName || "",
        contactPhone:
          delivery.destination?.contactPhone || "",
      },

      package: {
        description:
          delivery.package?.description || "",
        weight: delivery.package?.weight ?? "",
        weightUnit:
          delivery.package?.weightUnit || "kg",
        quantity:
          delivery.package?.quantity ?? 1,
        fragile:
          delivery.package?.fragile ?? false,
      },

      priority: delivery.priority || "normal",

      scheduledDate: delivery.scheduledDate
        ? delivery.scheduledDate.slice(0, 10)
        : "",

      notes: delivery.notes || "",
    });
    const frame = requestAnimationFrame(resetForm);

    return () => cancelAnimationFrame(frame);
  }, [delivery]);

  const updateField = (section, field, value) => {
    setForm((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const updateRootField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...form,

      package: {
        ...form.package,
        weight: Number(form.package.weight),
        quantity: Number(form.package.quantity),
      },
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Customer */}

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
          Customer
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            required
            value={form.customer.name}
            onChange={(e) =>
              updateField(
                "customer",
                "name",
                e.target.value
              )
            }
            placeholder="Customer name"
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          />

          <input
            required
            value={form.customer.phone}
            onChange={(e) =>
              updateField(
                "customer",
                "phone",
                e.target.value
              )
            }
            placeholder="Phone"
            className="rounded-lg border px-3 py-2"
          />

          <input
            type="email"
            value={form.customer.email}
            onChange={(e) =>
              updateField(
                "customer",
                "email",
                e.target.value
              )
            }
            placeholder="Email"
            className="rounded-lg border px-3 py-2"
          />
        </div>
      </section>

      {/* Pickup */}

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
          Pickup
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            required
            value={form.pickup.address}
            onChange={(e) =>
              updateField(
                "pickup",
                "address",
                e.target.value
              )
            }
            placeholder="Pickup address"
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 md:col-span-3"
          />

          <input
            value={form.pickup.contactName}
            onChange={(e) =>
              updateField(
                "pickup",
                "contactName",
                e.target.value
              )
            }
            placeholder="Contact name"
            className="rounded-lg border px-3 py-2"
          />

          <input
            value={form.pickup.contactPhone}
            onChange={(e) =>
              updateField(
                "pickup",
                "contactPhone",
                e.target.value
              )
            }
            placeholder="Contact phone"
            className="rounded-lg border px-3 py-2"
          />
        </div>
      </section>

      {/* Destination */}

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
          Destination
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            required
            value={form.destination.address}
            onChange={(e) =>
              updateField(
                "destination",
                "address",
                e.target.value
              )
            }
            placeholder="Destination address"
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 md:col-span-3"
          />

          <input
            value={form.destination.contactName}
            onChange={(e) =>
              updateField(
                "destination",
                "contactName",
                e.target.value
              )
            }
            placeholder="Contact name"
            className="rounded-lg border px-3 py-2"
          />

          <input
            value={form.destination.contactPhone}
            onChange={(e) =>
              updateField(
                "destination",
                "contactPhone",
                e.target.value
              )
            }
            placeholder="Contact phone"
            className="rounded-lg border px-3 py-2"
          />
        </div>
      </section>

      {/* Package */}

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
          Package
        </h3>

        <div className="grid gap-4 md:grid-cols-4">
          <input
            required
            value={form.package.description}
            onChange={(e) =>
              updateField(
                "package",
                "description",
                e.target.value
              )
            }
            placeholder="Package description"
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 md:col-span-2"
          />

          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.package.weight}
            onChange={(e) =>
              updateField(
                "package",
                "weight",
                e.target.value
              )
            }
            placeholder="Weight"
            className="rounded-lg border px-3 py-2"
          />

          <select
            value={form.package.weightUnit}
            onChange={(e) =>
              updateField(
                "package",
                "weightUnit",
                e.target.value
              )
            }
            className="rounded-lg border px-3 py-2"
          >
            <option value="kg">kg</option>
            <option value="ton">ton</option>
          </select>

          <input
            required
            type="number"
            min="1"
            value={form.package.quantity}
            onChange={(e) =>
              updateField(
                "package",
                "quantity",
                e.target.value
              )
            }
            placeholder="Quantity"
            className="rounded-lg border px-3 py-2"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.package.fragile}
              onChange={(e) =>
                updateField(
                  "package",
                  "fragile",
                  e.target.checked
                )
              }
            />

            <span>Fragile</span>
          </label>
        </div>
      </section>

      {/* Order settings */}

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
          Delivery Settings
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <select
            value={form.priority}
            onChange={(e) =>
              updateRootField(
                "priority",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="low">Low priority</option>
            <option value="normal">
              Normal priority
            </option>
            <option value="high">High priority</option>
            <option value="urgent">
              Urgent priority
            </option>
          </select>

          <input
            type="date"
            value={form.scheduledDate}
            onChange={(e) =>
              updateRootField(
                "scheduledDate",
                e.target.value
              )
            }
            className="rounded-lg border px-3 py-2"
          />

          <input
            value={form.notes}
            onChange={(e) =>
              updateRootField(
                "notes",
                e.target.value
              )
            }
            placeholder="Notes"
            className="rounded-lg border px-3 py-2"
          />
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : delivery
              ? "Update Delivery"
              : "Create Delivery"}
        </button>
      </div>
    </form>
  );
};

export default DeliveryForm;