import React from "react";

const EntityFormModal = ({
  title,
  fields,
  values,
  error,
  isSubmitting,
  submitLabel,
  onChange,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[340px] rounded-[24px] bg-white p-5 text-[#265D6F] shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-[#6E828D]"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="text-sm font-medium text-[#265D6F]">
                {field.label}
              </span>

              {field.type === "select" ? (
                <select
                  value={values[field.name] || ""}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#C4CFD4] px-3 py-3 text-sm outline-none focus:border-[#265D6F]"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.name] || ""}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#C4CFD4] px-3 py-3 text-sm outline-none focus:border-[#265D6F]"
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
        </div>

        {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-3 text-sm font-semibold">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#265D6F] px-4 py-2 text-[#265D6F]"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full bg-[#265D6F] px-4 py-2 text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntityFormModal;
