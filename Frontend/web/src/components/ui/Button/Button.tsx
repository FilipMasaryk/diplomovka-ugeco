import React from "react";
import "./button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "outlined"; // nový variant
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "default",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn ${variant === "outlined" ? "btn-outlined" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
