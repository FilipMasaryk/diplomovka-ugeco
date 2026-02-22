import React from "react";
import { useTranslation } from "react-i18next";
import "./ConfirmModal.css";
import { Button } from "../Button/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "primary" | "danger";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = "primary",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-buttons">
          <Button
            variant="outlined"
            onClick={onCancel}
            className="modal-btn-cancel"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={`modal-btn-confirm ${variant === "danger" ? "danger" : ""}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
