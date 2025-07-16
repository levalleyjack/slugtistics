export const createSelectStyles = (isDarkMode) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: 50,
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
    borderWidth: "1px",
    boxShadow: state.isFocused ? `0 0 0 2px var(--ring)` : "none",
    "&:hover": {
      borderColor: "var(--border)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--card)",
    border: `1px solid var(--border)`,
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
      ? "var(--muted)"
      : "transparent",
    color: state.isSelected ? "var(--primary-foreground)" : "var(--foreground)",
    "&:hover": {
      backgroundColor: state.isSelected ? "var(--primary)" : "var(--muted)",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--foreground)",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "var(--muted-foreground)",
  }),
  input: (provided) => ({
    ...provided,
    color: "var(--foreground)",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: "var(--border)",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "var(--muted-foreground)",
    "&:hover": {
      color: "var(--foreground)",
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "var(--muted-foreground)",
    "&:hover": {
      color: "var(--foreground)",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "var(--muted)",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "var(--foreground)",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "var(--muted-foreground)",
    "&:hover": {
      backgroundColor: "var(--destructive)",
      color: "var(--destructive-foreground)",
    },
  }),
});
