const Modal = ({
  open,
  title,
  children,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl shadow-slate-950/70">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="p-6 sm:p-7">{children}</div>
      </div>
    </div>
  );
};

export default Modal;