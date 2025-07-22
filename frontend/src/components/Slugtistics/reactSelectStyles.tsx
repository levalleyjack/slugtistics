export const createSelectStyles = (isDarkMode) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: 50,
    backgroundColor: state.isDisabled ? "var(--muted)" : "var(--card)",
    borderColor: state.isDisabled ? "var(--border)" : "var(--border)",
    borderWidth: "1px",
    boxShadow:
      state.isFocused && !state.isDisabled ? `0 0 0 2px var(--ring)` : "none",
    opacity: state.isDisabled ? 0.6 : 1,
    cursor: state.isDisabled ? "not-allowed" : "default",
    "&:hover": {
      borderColor: state.isDisabled ? "var(--border)" : "var(--border)",
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
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "var(--muted-foreground)" : "var(--foreground)",
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: state.isDisabled
      ? "var(--muted-foreground)"
      : "var(--muted-foreground)",
  }),
  input: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "var(--muted-foreground)" : "var(--foreground)",
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? "var(--muted)" : "var(--border)",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isDisabled
      ? "var(--muted-foreground)"
      : "var(--muted-foreground)",
    "&:hover": {
      color: state.isDisabled ? "var(--muted-foreground)" : "var(--foreground)",
    },
  }),
  clearIndicator: (provided, state) => ({
    ...provided,
    color: state.isDisabled
      ? "var(--muted-foreground)"
      : "var(--muted-foreground)",
    "&:hover": {
      color: state.isDisabled ? "var(--muted-foreground)" : "var(--foreground)",
    },
  }),
  multiValue: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? "var(--muted)" : "var(--muted)",
    opacity: state.isDisabled ? 0.6 : 1,
  }),
  multiValueLabel: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "var(--muted-foreground)" : "var(--foreground)",
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    color: state.isDisabled
      ? "var(--muted-foreground)"
      : "var(--muted-foreground)",
    "&:hover": {
      backgroundColor: state.isDisabled ? "transparent" : "var(--destructive)",
      color: state.isDisabled
        ? "var(--muted-foreground)"
        : "var(--destructive-foreground)",
    },
  }),
});
