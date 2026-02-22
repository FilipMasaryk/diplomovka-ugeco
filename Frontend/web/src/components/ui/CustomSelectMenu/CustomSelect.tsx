import React from "react";
import Select, {
  type GroupBase,
  type Props as SelectProps,
  type StylesConfig,
} from "react-select";
import "./CustomSelect.css";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps<IsMulti extends boolean = false> extends Omit<
  SelectProps<SelectOption, IsMulti, GroupBase<SelectOption>>,
  "styles"
> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const CustomSelect = <IsMulti extends boolean = false>({
  label,
  required,
  error,
  isMulti,
  ...props
}: CustomSelectProps<IsMulti>) => {
  const customStyles: StylesConfig<SelectOption, IsMulti> = {
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      borderRadius: "6px",
      // Základný border
      border: `1px solid ${
        error
          ? "var(--color-error)"
          : state.isFocused
            ? "var(--color-primary)"
            : "var(--color-border-elements)"
      }`,
      backgroundColor: "var(--color-background-elements)",
      fontFamily: '"Inter", sans-serif',
      fontSize: "14px",
      boxShadow: "none",
      transition: "border-color 0.2s ease",
      "&:hover": {
        borderColor: error ? "var(--color-error)" : "#181818",
      },
      outline: "none",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 10px",
    }),
    input: (base) => ({
      ...base,
      margin: "0px",
      padding: "0px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "var(--color-secondary)",
      padding: "0 8px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-primary)"
        : state.isFocused
          ? "#e6f9f7"
          : "white",
      color: state.isSelected ? "white" : "#181818",
      fontSize: "14px",
      fontFamily: '"Inter", sans-serif',
      cursor: "pointer",
      "&:active": {
        backgroundColor: "var(--color-primary)",
      },
    }),
    singleValue: (base, state) => {
      const isEmptyValue = state.data?.value === "";
      return {
        ...base,
        color: isEmptyValue ? "#71717A" : "#181818",
        fontWeight: 400,
      };
    },
    placeholder: (base) => ({
      ...base,
      color: "#a0aec0",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e6f9f7",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--color-primary)",
      fontWeight: "600",
    }),
  };

  return (
    <div className="custom-select-container">
      {label && (
        <label className="custom-select-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}

      <Select isMulti={isMulti} styles={customStyles} {...props} />

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};
