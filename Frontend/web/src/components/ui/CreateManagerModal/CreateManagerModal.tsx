import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { InputField } from "../InputField/InputField";
import { Button } from "../Button/Button";
import { useToast } from "../../../context/useToast";
import "../CreateUserModal/createUserModal.css";

export interface ManagerFormState {
  name: string;
  surName: string;
  email: string;
  password: string;
}

const initialForm: ManagerFormState = {
  name: "",
  surName: "",
  email: "",
  password: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ManagerFormState) => Promise<void>;
}

export const CreateManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ManagerFormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "errors.required";
    if (!formData.surName.trim()) errs.surName = "errors.required";
    if (!formData.email.trim()) errs.email = "errors.required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "errors.invalidEmail";
    if (!formData.password) errs.password = "errors.required";
    else if (formData.password.length < 5)
      errs.password = "errors.passwordMin";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      await onSubmit(formData);
      setFormData(initialForm);
    } catch (error: any) {
      if (error && Array.isArray(error.message) && error.message.length > 0) {
        const firstMsg = error.message[0];
        const cleanMsg = firstMsg.includes(":")
          ? firstMsg.split(":")[1].trim()
          : firstMsg;
        showToast(cleanMsg, "error");
      } else if (typeof error?.message === "string") {
        showToast(error.message, "error");
      } else {
        showToast(t("errors.somethingWentWrong"), "error");
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{t("managersPage.createModal.title")}</h2>
          <FiX className="close-icon" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-column">
              <InputField
                label={t("usersPage.table.name")}
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                hasError={!!errors.name}
                errorMessage={errors.name ? t(errors.name) : ""}
              />
              <InputField
                label={t("usersPage.table.email")}
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                hasError={!!errors.email}
                errorMessage={errors.email ? t(errors.email) : ""}
              />
            </div>
            <div className="form-column">
              <InputField
                label={t("usersPage.table.surName")}
                name="surName"
                required
                value={formData.surName}
                onChange={handleChange}
                hasError={!!errors.surName}
                errorMessage={errors.surName ? t(errors.surName) : ""}
              />
              <InputField
                label={t("usersPage.table.password")}
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
                errorMessage={errors.password ? t(errors.password) : ""}
              />
            </div>
          </div>

          <div className="modal-footer">
            <Button type="submit" className="btn-create-submit">
              {t("managersPage.createBtnSubmit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
