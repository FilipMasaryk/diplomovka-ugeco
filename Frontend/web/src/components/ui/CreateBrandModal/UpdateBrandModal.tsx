import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { type SingleValue, type MultiValue } from "react-select";
import { InputField } from "../InputField/InputField";
import { Button } from "../Button/Button";
import { CustomSelect } from "../CustomSelectMenu/CustomSelect";
import { Countries } from "../../../types/countryEnum";
import { BrandCategory } from "../../../types/brandCategories";
import {
  fetchBrandPackages,
  fetchUsersForContact,
  type BrandPackage,
  type ContactUser,
} from "../../../../../shared/api/brands/brands";
import { updateBrandSchema } from "../../../pages/BrandsPage/schemas/updateBrandSchema";
import type { BrandFormState } from "./CreateBrandModal";
import "../../ui/CreateUserModal/createUserModal.css";

interface SelectOption {
  value: string;
  label: string;
}

interface UpdateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (brandId: string, data: any) => Promise<void>;
  brandData: BrandFormState & { id: string };
}

export const UpdateBrandModal: React.FC<UpdateBrandModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit, brandData }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<BrandFormState>({ ...brandData });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [backendError, setBackendError] = useState<string | null>(null);
    const [dbPackages, setDbPackages] = useState<BrandPackage[]>([]);
    const [dbUsers, setDbUsers] = useState<ContactUser[]>([]);

    useEffect(() => {
      if (isOpen) {
        setFormData({ ...brandData });
        setErrors({});
        setBackendError(null);
        fetchBrandPackages().then(setDbPackages);
        fetchUsersForContact().then(setDbUsers);
      }
    }, [isOpen, brandData]);

    const countryOptions = useMemo<SelectOption[]>(
      () =>
        Object.values(Countries).map((c) => ({
          value: c,
          label: t(`countries.${c}`),
        })),
      [t],
    );

    const categoryOptions = useMemo<SelectOption[]>(
      () =>
        Object.values(BrandCategory).map((cat) => ({
          value: cat,
          label: t(`categories.${cat}`, { defaultValue: cat }),
        })),
      [t],
    );

    const packageOptions = useMemo<SelectOption[]>(
      () =>
        dbPackages.map((pkg) => ({
          value: pkg._id,
          label: `${pkg.name} (${pkg.validityMonths} m)`,
        })),
      [dbPackages],
    );

    const userOptions = useMemo<SelectOption[]>(
      () =>
        dbUsers
          .filter(
            (u) => formData.country && u.countries?.includes(formData.country),
          )
          .map((u) => ({
            value: u._id,
            label: `${u.name}${u.surName ? ` ${u.surName}` : ""} (${u.email})`,
          })),
      [dbUsers, formData.country],
    );

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSingleSelectChange = (
      selected: SingleValue<SelectOption>,
      name: string,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [name]: selected ? selected.value : "",
      }));
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

      const result = updateBrandSchema.safeParse(formData);
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
        await onSubmit(brandData.id, formData);
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

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>{t("brandsPage.updateModal.title")}</h2>
            <FiX className="close-icon" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              <div className="form-column">
                <InputField
                  label={t("brandsPage.table.name")}
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  hasError={!!errors.name}
                  errorMessage={errors.name ? t(errors.name) : ""}
                />
                <InputField
                  label={t("brandsPage.table.ico")}
                  name="ico"
                  value={formData.ico}
                  onChange={handleChange}
                />
                <InputField
                  label={t("brandsPage.table.address")}
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  hasError={!!errors.address}
                  errorMessage={errors.address ? t(errors.address) : ""}
                />
                <InputField
                  label={t("brandsPage.table.city")}
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  hasError={!!errors.city}
                  errorMessage={errors.city ? t(errors.city) : ""}
                />
                <InputField
                  label={t("brandsPage.table.zip")}
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  hasError={!!errors.zip}
                  errorMessage={errors.zip ? t(errors.zip) : ""}
                />
                <CustomSelect
                  label={t("brandsPage.table.country")}
                  required
                  options={countryOptions}
                  value={countryOptions.find(
                    (o) => o.value === formData.country,
                  )}
                  onChange={(val) => handleSingleSelectChange(val, "country")}
                  placeholder={t("usersPage.selectCountry")}
                  error={errors.country ? t(errors.country) : ""}
                />
              </div>

              <div className="form-column">
                <CustomSelect
                  isMulti
                  label={t("brandsPage.table.categories")}
                  required
                  options={categoryOptions}
                  value={categoryOptions.filter((o) =>
                    formData.categories.includes(o.value as BrandCategory),
                  )}
                  onChange={(val) => handleMultiSelectChange(val, "categories")}
                  placeholder={t("brandsPage.selectCategory")}
                  error={errors.categories ? t(errors.categories) : ""}
                />
                <CustomSelect
                  label={t("brandsPage.table.package")}
                  options={packageOptions}
                  value={packageOptions.find(
                    (o) => o.value === formData.package,
                  )}
                  onChange={(val) => handleSingleSelectChange(val, "package")}
                  placeholder={t("brandsPage.selectPackage")}
                />
                <CustomSelect
                  label={t("brandsPage.table.mainContact")}
                  options={userOptions}
                  value={userOptions.find(
                    (o) => o.value === formData.mainContact,
                  )}
                  onChange={(val) =>
                    handleSingleSelectChange(val, "mainContact")
                  }
                  placeholder={t("brandsPage.selectContact")}
                />
              </div>
            </div>

            {backendError && (
              <div className="general-error">{backendError}</div>
            )}

            <div className="modal-footer">
              <Button type="submit" className="btn-create-submit">
                {t("brandsPage.updateBtnSubmit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
