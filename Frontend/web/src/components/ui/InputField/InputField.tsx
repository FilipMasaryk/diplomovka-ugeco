import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./input.css";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const InputField = ({
  label,
  required = false,
  type = "text",
  hasError = false,
  errorMessage,
  ...props
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className={isPassword ? "password-input" : ""}>
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`input-field ${hasError ? "input-error" : ""}`}
          {...props}
        />

        {isPassword && (
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        )}
      </div>

      {hasError && errorMessage && <p className="error-text">{errorMessage}</p>}
    </div>
  );
};
