const statusStyles = {
  assigned:
    "border border-sky-400/20 bg-sky-400/10 text-sky-300",
  started:
    "border border-amber-400/20 bg-amber-400/10 text-amber-300",
  completed:
    "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  cancelled:
    "border border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const DispatchStatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        statusStyles[status] ||
        "border border-slate-700 bg-slate-950/60 text-slate-300"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default DispatchStatusBadge;