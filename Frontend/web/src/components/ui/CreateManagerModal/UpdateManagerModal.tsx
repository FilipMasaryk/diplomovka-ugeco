import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { InputField } from "../InputField/InputField";
import { Button } from "../Button/Button";
import { useToast } from "../../../context/useToast";
import "../CreateUserModal/createUserModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: { name: string; surName: string }) => Promise<void>;
  managerData: { id: string; name: string; surName: string };
}

export const UpdateManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  managerData,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [name, setName] = useState(managerData.name);
  const [surName, setSurName] = useState(managerData.surName);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName(managerData.name);
      setSurName(managerData.surName);
      setErrors({});
    }
  }, [isOpen, managerData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "errors.required";
    if (!surName.trim()) errs.surName = "errors.required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await onSubmit(managerData.id, { name, surName });
    } catch (error: any) {
      if (typeof error?.message === "string") {
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
          <h2>{t("managersPage.updateModal.title")}</h2>
          <FiX className="close-icon" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-column">
              <InputField
                label={t("usersPage.table.name")}
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                hasError={!!errors.name}
                errorMessage={errors.name ? t(errors.name) : ""}
              />
            </div>
            <div className="form-column">
              <InputField
                label={t("usersPage.table.surName")}
                name="surName"
                required
                value={surName}
                onChange={(e) => setSurName(e.target.value)}
                hasError={!!errors.surName}
                errorMessage={errors.surName ? t(errors.surName) : ""}
              />
            </div>
          </div>

          <div className="modal-footer">
            <Button type="submit" className="btn-create-submit">
              {t("managersPage.updateBtnSubmit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
