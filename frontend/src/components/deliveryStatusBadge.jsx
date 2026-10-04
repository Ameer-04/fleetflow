const statusStyles = {
  pending:
    "border border-slate-700 bg-slate-950/60 text-slate-300",

  confirmed:
    "border border-sky-400/20 bg-sky-400/10 text-sky-300",

  ready_for_dispatch:
    "border border-violet-400/20 bg-violet-400/10 text-violet-300",

  dispatched:
    "border border-indigo-400/20 bg-indigo-400/10 text-indigo-300",

  picked_up:
    "border border-amber-400/20 bg-amber-400/10 text-amber-300",

  in_transit:
    "border border-orange-400/20 bg-orange-400/10 text-orange-300",

  out_for_delivery:
    "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300",

  delivered:
    "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

  cancelled:
    "border border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const formatStatus = (status) => {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const DeliveryStatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ||
        "border border-slate-700 bg-slate-950/60 text-slate-300"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default DeliveryStatusBadge;