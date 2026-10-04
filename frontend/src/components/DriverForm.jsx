import { useEffect, useState } from "react";

const initialForm = {
  user: "",
  licenseNumber: "",
  licenseExpiry: "",
  phone: "",
  address: "",
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "",
  },
  employmentStatus: "active",
  availability: "available",
  hireDate: "",
};

const formFromDriver = (driver) =>
  driver
    ? {
        user: driver.user?._id || driver.user || "",
        licenseNumber: driver.licenseNumber || "",
        licenseExpiry: driver.licenseExpiry
          ? driver.licenseExpiry.slice(0, 10)
          : "",
        phone: driver.phone || "",
        address: driver.address || "",
        emergencyContact: {
          name: driver.emergencyContact?.name || "",
          phone: driver.emergencyContact?.phone || "",
          relationship: driver.emergencyContact?.relationship || "",
        },
        employmentStatus: driver.employmentStatus || "active",
        availability: driver.availability || "available",
        hireDate: driver.hireDate ? driver.hireDate.slice(0, 10) : "",
      }
    : initialForm;

const DriverForm = ({
  driver,
  users = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form, setForm] = useState(() => formFromDriver(driver));

  useEffect(() => {
    const resetForm = () => setForm(formFromDriver(driver));
    const frame = requestAnimationFrame(resetForm);

    return () => cancelAnimationFrame(frame);
  }, [driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("emergencyContact.")) {
      const field = name.split(".")[1];

      setForm((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      emergencyContact:
        form.emergencyContact.name ||
        form.emergencyContact.phone ||
        form.emergencyContact.relationship
          ? form.emergencyContact
          : undefined,
    };

    // These are operational values and should not be edited
    // when updating an existing driver through this form.
    if (driver) {
      delete payload.user;
      delete payload.availability;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!driver && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Driver User
          </label>

          <select
            name="user"
            value={form.user}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">Select driver user</option>

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} — {user.email}
              </option>
            ))}
          </select>

          {users.length === 0 && (
            <p className="mt-2 text-sm text-amber-300">
              No available driver users found.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            License Number
          </label>

          <input
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            required
            placeholder="LIC-123456"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            License Expiry
          </label>

          <input
            type="date"
            name="licenseExpiry"
            value={form.licenseExpiry}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Phone
          </label>

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="+92 300 1234567"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hire Date
          </label>

          <input
            type="date"
            name="hireDate"
            value={form.hireDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Address
        </label>

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          placeholder="Driver address"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="border-t pt-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            name="emergencyContact.name"
            value={form.emergencyContact.name}
            onChange={handleChange}
            placeholder="Name"
            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />

          <input
            name="emergencyContact.phone"
            value={form.emergencyContact.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />

          <input
            name="emergencyContact.relationship"
            value={form.emergencyContact.relationship}
            onChange={handleChange}
            placeholder="Relationship"
            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employment Status
          </label>

          <select
            name="employmentStatus"
            value={form.employmentStatus}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {driver && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Availability
            </label>

            <input
              disabled
              value={form.availability.replace("_", " ")}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 capitalize text-gray-500"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : driver
              ? "Update Driver"
              : "Create Driver"}
        </button>
      </div>
    </form>
  );
};

export default DriverForm;