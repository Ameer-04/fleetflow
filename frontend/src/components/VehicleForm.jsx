import { useState } from "react";

const initialForm = {
  registrationNumber: "",
  make: "",
  model: "",
  year: "",
  type: "van",
  capacity: "",
  capacityUnit: "kg",
  status: "available",
};

const vehicleTypes = [
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
  { value: "pickup", label: "Pickup" },
  { value: "motorcycle", label: "Motorcycle" },
  {
    value: "refrigerated_truck",
    label: "Refrigerated Truck",
  },
];

const getInitialForm = (vehicle) => (vehicle
  ? {
      registrationNumber: vehicle.registrationNumber ?? "",
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      year: vehicle.year ?? "",
      type: vehicle.type ?? "van",
      capacity: vehicle.capacity ?? "",
      capacityUnit: vehicle.capacityUnit ?? "kg",
      status: vehicle.status ?? "available",
    }
  : { ...initialForm });

const VehicleForm = ({
  vehicle,
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const [form, setForm] = useState(() => getInitialForm(vehicle));
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(vehicle);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.registrationNumber.trim()) {
      nextErrors.registrationNumber =
        "Registration number is required";
    }

    if (!form.make.trim()) {
      nextErrors.make = "Make is required";
    }

    if (!form.model.trim()) {
      nextErrors.model = "Model is required";
    }

    const year = Number(form.year);

    if (!form.year || year < 1900 || year > new Date().getFullYear() + 1) {
      nextErrors.year = "Enter a valid year";
    }

    const capacity = Number(form.capacity);

    if (!form.capacity || capacity <= 0) {
      nextErrors.capacity =
        "Capacity must be greater than 0";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit({
      ...form,
      registrationNumber:
        form.registrationNumber.trim().toUpperCase(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      capacity: Number(form.capacity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Registration Number"
          name="registrationNumber"
          value={form.registrationNumber}
          onChange={handleChange}
          error={errors.registrationNumber}
          placeholder="KHI-1234"
        />

        <Field
          label="Make"
          name="make"
          value={form.make}
          onChange={handleChange}
          error={errors.make}
          placeholder="Toyota"
        />

        <Field
          label="Model"
          name="model"
          value={form.model}
          onChange={handleChange}
          error={errors.model}
          placeholder="Hilux"
        />

        <Field
          label="Year"
          name="year"
          type="number"
          value={form.year}
          onChange={handleChange}
          error={errors.year}
          placeholder="2024"
        />

        <SelectField
          label="Vehicle Type"
          name="type"
          value={form.type}
          onChange={handleChange}
          options={vehicleTypes}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Capacity"
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            error={errors.capacity}
            placeholder="1000"
          />

          <SelectField
            label="Unit"
            name="capacityUnit"
            value={form.capacityUnit}
            onChange={handleChange}
            options={[
              { value: "kg", label: "KG" },
              { value: "ton", label: "Ton" },
            ]}
          />
        </div>

        {isEditing && (
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              {
                value: "available",
                label: "Available",
              },
              {
                value: "assigned",
                label: "Assigned",
              },
              {
                value: "in_transit",
                label: "In Transit",
              },
              {
                value: "maintenance",
                label: "Maintenance",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ]}
          />
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : isEditing
            ? "Update Vehicle"
            : "Create Vehicle"}
        </button>
      </div>
    </form>
  );
};

const Field = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl border bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 ${
        error
          ? "border-rose-400"
          : "border-slate-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
      }`}
    />

    {error && (
      <p className="mt-1 text-xs text-rose-300">
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
      {label}
    </label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default VehicleForm;