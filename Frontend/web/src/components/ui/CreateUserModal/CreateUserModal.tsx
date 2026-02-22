import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { type MultiValue, type SingleValue } from "react-select";
import { InputField } from "../InputField/InputField";
import { Button } from "../Button/Button";
import { CustomSelect } from "../CustomSelectMenu/CustomSelect";
import { UserRole } from "../../../types/userRoles";
import { Countries } from "../../../types/countryEnum";
import {
  fetchPackages,
  fetchBrands,
  type Package,
  type Brand,
} from "../../../../../shared/api/users/admin/users";
import { createUserSchema } from "../../../pages/UsersPage/schemas/createUserSchema";
import "./createUserModal.css";

interface SelectOption {
  value: string;
  label: string;
}

export interface FormState {
  name: string;
  surName: string;
  email: string;
  password: string;
  role: UserRole;
  countries: string[];
  brands: string[];
  package: string;
  ico: string;
}

const initialFormState: FormState = {
  name: "",
  surName: "",
  email: "",
  password: "",
  role: UserRole.CREATOR,
  countries: [],
  brands: [],
  package: "",
  ico: "",
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormState) => Promise<void>;
  initialData?: FormState;
}

export const CreateUserModal: React.FC<UserModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState<FormState>(
      initialData || initialFormState,
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [backendError, setBackendError] = useState<string | null>(null);
    const [dbPackages, setDbPackages] = useState<Package[]>([]);
    const [dbBrands, setDbBrands] = useState<Brand[]>([]);

    useEffect(() => {
      if (isOpen) {
        setFormData(initialData || initialFormState);
        setErrors({});
        setBackendError(null);

        const loadData = async () => {
          const [pkgs, brnds] = await Promise.all([
            fetchPackages(),
            fetchBrands(),
          ]);
          setDbPackages(pkgs);
          setDbBrands(brnds);
        };
        loadData();
      }
    }, [isOpen, initialData]);

    const roleOptions = Object.values(UserRole).map((role) => ({
      value: role,
      label:
        t(`roles.${role.toLowerCase()}`).charAt(0).toUpperCase() +
        t(`roles.${role.toLowerCase()}`).slice(1),
    }));

    const countryOptions = Object.values(Countries).map((c) => ({
      value: c,
      label: t(`countries.${c}`),
    }));

    const brandOptions = dbBrands.map((b) => ({ value: b._id, label: b.name }));

    const packageOptions = dbPackages
      .filter((p) => p.type === "creator")
      .map((pkg) => ({
        value: pkg._id,
        label: `${pkg.name} (${pkg.validityMonths} m)`,
      }));

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSingleSelectChange = (
      selected: SingleValue<SelectOption>,
      name: string,
    ) => {
      setFormData((prev) => {
        const newData = { ...prev, [name]: selected ? selected.value : "" };
        if (name === "role") {
          if (
            selected?.value === UserRole.ADMIN ||
            selected?.value === UserRole.SUBADMIN
          ) {
            newData.countries = [];
            newData.brands = [];
            newData.package = "";
            newData.ico = "";
          } else if (selected?.value === UserRole.BRAND_MANAGER) {
            newData.countries = [];
            newData.package = "";
            newData.ico = "";
          } else if (selected?.value === UserRole.CREATOR) {
            newData.countries = [];
            newData.brands = [];
          }
        }
        return newData;
      });
    };

    const handleMultiSelectChange = (
      selected: MultiValue<SelectOption>,
      name: string,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [name]: selected ? selected.map((v) => v.value) : [],
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setBackendError(null);

      const result = createUserSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setErrors({});

      try {
        await onSubmit(formData);
      } catch (error: any) {
        // Spracovanie backend erroru (zobrazenie len prvej správy)
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
            <h2>
              {initialData
                ? t("usersPage.updateModal.title")
                : t("usersPage.createModal.title")}
            </h2>
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

                <CustomSelect
                  label={t("usersPage.table.access")}
                  required
                  options={roleOptions}
                  value={roleOptions.find((o) => o.value === formData.role)}
                  onChange={(val) => handleSingleSelectChange(val, "role")}
                  placeholder={t("usersPage.selectRole")}
                  error={errors.role ? t(errors.role) : ""}
                />

                {formData.role !== UserRole.ADMIN && (
                  <CustomSelect
                    isMulti
                    label={t("usersPage.table.country")}
                    required
                    options={countryOptions}
                    value={countryOptions.filter((o) =>
                      formData.countries.includes(o.value),
                    )}
                    onChange={(val) =>
                      handleMultiSelectChange(val, "countries")
                    }
                    placeholder={t("usersPage.selectCountry")}
                    error={errors.countries ? t(errors.countries) : ""}
                  />
                )}

                {formData.role === UserRole.BRAND_MANAGER && (
                  <CustomSelect
                    isMulti
                    label={t("usersPage.table.brandAccess")}
                    required
                    options={brandOptions}
                    value={brandOptions.filter((o) =>
                      formData.brands.includes(o.value),
                    )}
                    onChange={(val) => handleMultiSelectChange(val, "brands")}
                    placeholder={t("usersPage.selectBrand")}
                    error={errors.brands ? t(errors.brands) : ""}
                  />
                )}

                {formData.role === UserRole.CREATOR && (
                  <>
                    <CustomSelect
                      label={t("usersPage.table.package")}
                      required
                      options={packageOptions}
                      value={packageOptions.find(
                        (o) => o.value === formData.package,
                      )}
                      onChange={(val) =>
                        handleSingleSelectChange(val, "package")
                      }
                      placeholder={t("usersPage.selectPackage")}
                      error={errors.package ? t(errors.package) : ""}
                    />
                    <InputField
                      label={t("usersPage.table.ico")}
                      name="ico"
                      value={formData.ico}
                      onChange={handleChange}
                    />
                  </>
                )}
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

            {backendError && (
              <div className="general-error">{backendError}</div>
            )}

            <div className="modal-footer">
              <Button type="submit" className="btn-create-submit">
                {initialData
                  ? t("usersPage.updateBtnSubmit")
                  : t("usersPage.createBtnSubmit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
