import React, { useState } from "react";

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
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (fieldName) => {
    setVisiblePasswords((current) => ({
      ...current,
      [fieldName]: !current[fieldName],
    }));
  };

  const eyeIcon = (show) =>
    show ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-5 0-9.27-3.11-11-8 0-1.07.22-2.09.63-3.02" />
        <path d="M6.06 6.06A10.07 10.07 0 0112 4c5 0 9.27 3.11 11 8-.27.8-.62 1.55-1.05 2.26" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

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
              ) : field.type === "password" ? (
                <div className="mt-2 flex w-full items-center rounded-xl border border-[#C4CFD4] px-3 py-2 focus-within:border-[#265D6F]">
                  <input
                    type={visiblePasswords[field.name] ? "text" : "password"}
                    value={values[field.name] || ""}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder={field.placeholder}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className="ml-2 text-[#6E828D]"
                    aria-label={
                      visiblePasswords[field.name]
                        ? `Hide ${field.label}`
                        : `Show ${field.label}`
                    }
                  >
                    {eyeIcon(Boolean(visiblePasswords[field.name]))}
                  </button>
                </div>
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
