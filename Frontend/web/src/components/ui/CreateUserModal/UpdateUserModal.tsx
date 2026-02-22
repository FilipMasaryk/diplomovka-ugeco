import React, { useState, useEffect, useMemo } from "react";
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
import type { FormState } from "../CreateUserModal/CreateUserModal";
import { updateUserSchema } from "../../../pages/UsersPage/schemas/updateUserSchema";
import "../CreateUserModal/createUserModal.css";

interface SelectOption {
  value: string;
  label: string;
}

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, data: any) => Promise<void>;
  userData: FormState & { id: string };
}

export const UpdateUserModal: React.FC<UpdateUserModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit, userData }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<FormState>({ ...userData });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [backendError, setBackendError] = useState<string | null>(null);
    const [dbPackages, setDbPackages] = useState<Package[]>([]);
    const [dbBrands, setDbBrands] = useState<Brand[]>([]);

    useEffect(() => {
      if (isOpen) {
        // Rozbalíme userData a zabezpečíme, aby polia boli polia (nie undefined)
        setFormData({
          ...userData,
          countries: userData.countries || [],
          brands: userData.brands || [],
          package: userData.package || "",
        });
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
    }, [isOpen, userData]);

    const roleOptions = useMemo(
      () =>
        Object.values(UserRole).map((role) => ({
          value: role,
          label:
            t(`roles.${role.toLowerCase()}`).charAt(0).toUpperCase() +
            t(`roles.${role.toLowerCase()}`).slice(1),
        })),
      [t],
    );

    const countryOptions = useMemo(
      () =>
        Object.values(Countries).map((c) => ({
          value: c,
          label: t(`countries.${c}`),
        })),
      [t],
    );

    const brandOptions = useMemo(
      () => dbBrands.map((b) => ({ value: b._id, label: b.name })),
      [dbBrands],
    );

    const packageOptions = useMemo(
      () =>
        dbPackages
          .filter((p) => p.type === "creator")
          .map((pkg) => ({
            value: pkg._id,
            label: `${pkg.name} (${pkg.validityMonths} m)`,
          })),
      [dbPackages],
    );

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

      // 1. Zod validácia
      const result = updateUserSchema.safeParse(formData);
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

      // 2. Príprava payloadu (odstránenie hesla a nekonzistentných dát podľa role)
      const { password, ...rest } = formData;
      const cleanPayload = Object.fromEntries(
        Object.entries(rest).filter(([key, value]) => {
          if (
            formData.role === UserRole.ADMIN ||
            formData.role === UserRole.SUBADMIN
          ) {
            if (["package", "brands", "ico"].includes(key)) return false;
          }
          if (
            formData.role === UserRole.BRAND_MANAGER &&
            ["package", "ico"].includes(key)
          ) {
            return false;
          }
          if (formData.role === UserRole.CREATOR && key === "brands")
            return false;

          return true;
        }),
      );

      try {
        await onSubmit(userData.id, cleanPayload);
      } catch (error: any) {
        if (error && Array.isArray(error.message) && error.message.length > 0) {
          const firstMsg = error.message[0];
          const cleanMsg = firstMsg.includes(":")
            ? firstMsg.split(":")[1].trim()
            : firstMsg;
          setBackendError(cleanMsg);
        } else {
          setBackendError(error?.message || t("errors.somethingWentWrong"));
        }
      }
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>{t("usersPage.updateModalTitle")}</h2>
            <FiX className="close-icon" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              {/* ĽAVÝ STĹPEC */}
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

              {/* PRAVÝ STĹPEC */}
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
              </div>
            </div>

            {backendError && (
              <div className="general-error">{backendError}</div>
            )}

            <div className="modal-footer">
              <Button type="submit" className="btn-create-submit">
                {t("usersPage.updateBtnSubmit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
