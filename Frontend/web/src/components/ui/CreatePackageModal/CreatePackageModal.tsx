import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { type SingleValue } from "react-select";
import { InputField } from "../InputField/InputField";
import { Button } from "../Button/Button";
import { CustomSelect } from "../CustomSelectMenu/CustomSelect";
import "../../ui/CreateUserModal/createUserModal.css";
import type { PackageFormState } from "../../../pages/PackagesPage/PackagesPage";

interface SelectOption {
  value: string;
  label: string;
}

const initialFormState: PackageFormState = {
  name: "",
  validityMonths: "",
  offersCount: "",
  type: "",
};

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackageFormState) => Promise<void>;
}

export const CreatePackageModal: React.FC<CreatePackageModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<PackageFormState>(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [backendError, setBackendError] = useState<string | null>(null);

    useEffect(() => {
      if (isOpen) {
        setFormData(initialFormState);
        setErrors({});
        setBackendError(null);
      }
    }, [isOpen]);

    const typeOptions: SelectOption[] = [
      { value: "creator", label: t("packagesPage.typeCreator") },
      { value: "brand", label: t("packagesPage.typeBrand") },
    ];

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === "validityMonths" || name === "offersCount") {
        setFormData((prev) => ({
          ...prev,
          [name]: value === "" ? "" : Number(value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    };

    const handleSingleSelectChange = (
      selected: SingleValue<SelectOption>,
      name: string,
    ) => {
      setFormData((prev) => {
        const updated = { ...prev, [name]: selected ? selected.value : "" };
        if (name === "type" && selected?.value !== "brand") {
          updated.offersCount = "";
        }
        return updated;
      });
    };

    const validate = (): boolean => {
      const fieldErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        fieldErrors.name = t("errors.required");
      }
      if (!formData.type) {
        fieldErrors.type = t("errors.required");
      }
      if (!formData.validityMonths || formData.validityMonths <= 0) {
        fieldErrors.validityMonths = t("errors.required");
      }
      if (
        formData.type === "brand" &&
        (formData.offersCount === "" || formData.offersCount < 0)
      ) {
        fieldErrors.offersCount = t("errors.required");
      }

      setErrors(fieldErrors);
      return Object.keys(fieldErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setBackendError(null);

      if (!validate()) return;

      try {
        await onSubmit(formData);
      } catch (error: any) {
        if (error && Array.isArray(error.message) && error.message.length > 0) {
          const firstMsg = error.message[0];
          const cleanMsg = firstMsg.includes(":")
            ? firstMsg.split(":")[1].trim()
            : firstMsg;
          setBackendError(cleanMsg);
        } else if (typeof error?.message === "string") {
          setBackendError(error.message);
        } else {
          setBackendError(t("errors.somethingWentWrong"));
        }
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>{t("packagesPage.createModal.title")}</h2>
            <FiX className="close-icon" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              <div className="form-column">
                <InputField
                  label={t("packagesPage.table.name")}
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  hasError={!!errors.name}
                  errorMessage={errors.name}
                />
                <CustomSelect
                  label={t("packagesPage.table.type")}
                  required
                  options={typeOptions}
                  value={typeOptions.find((o) => o.value === formData.type)}
                  onChange={(val) => handleSingleSelectChange(val, "type")}
                  placeholder={t("packagesPage.selectType")}
                  error={errors.type}
                />
              </div>

              <div className="form-column">
                <InputField
                  label={t("packagesPage.table.validityMonths")}
                  name="validityMonths"
                  type="number"
                  required
                  value={
                    formData.validityMonths === ""
                      ? ""
                      : String(formData.validityMonths)
                  }
                  onChange={handleChange}
                  hasError={!!errors.validityMonths}
                  errorMessage={errors.validityMonths}
                />
                {formData.type === "brand" && (
                  <InputField
                    label={t("packagesPage.table.offersCount")}
                    name="offersCount"
                    type="number"
                    required
                    value={
                      formData.offersCount === ""
                        ? ""
                        : String(formData.offersCount)
                    }
                    onChange={handleChange}
                    hasError={!!errors.offersCount}
                    errorMessage={errors.offersCount}
                  />
                )}
              </div>
            </div>

            {backendError && (
              <div className="general-error">{backendError}</div>
            )}

            <div className="modal-footer">
              <Button type="submit" className="btn-create-submit">
                {t("packagesPage.createBtnSubmit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
