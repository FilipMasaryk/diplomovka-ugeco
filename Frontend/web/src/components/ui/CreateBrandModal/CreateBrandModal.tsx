import React, { useState, useEffect } from "react";
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
import { createBrandSchema } from "../../../pages/BrandsPage/schemas/createBrandSchema";
import "../../ui/CreateUserModal/createUserModal.css";

interface SelectOption {
  value: string;
  label: string;
}

export interface BrandFormState {
  name: string;
  ico: string;
  address: string;
  city: string;
  zip: string;
  country: (typeof Countries)[keyof typeof Countries] | "";
  categories: BrandCategory[];
  package: string;
  mainContact: string;
}

const initialFormState: BrandFormState = {
  name: "",
  ico: "",
  address: "",
  city: "",
  zip: "",
  country: "",
  categories: [],
  package: "",
  mainContact: "",
};

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BrandFormState) => Promise<void>;
}

export const CreateBrandModal: React.FC<CreateBrandModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<BrandFormState>(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [backendError, setBackendError] = useState<string | null>(null);
    const [dbPackages, setDbPackages] = useState<BrandPackage[]>([]);
    const [dbUsers, setDbUsers] = useState<ContactUser[]>([]);

    useEffect(() => {
      if (isOpen) {
        setFormData(initialFormState);
        setErrors({});
        setBackendError(null);
        fetchBrandPackages().then(setDbPackages);
        fetchUsersForContact().then(setDbUsers);
      }
    }, [isOpen]);

    const countryOptions: SelectOption[] = Object.values(Countries).map(
      (c) => ({ value: c, label: t(`countries.${c}`) }),
    );

    const categoryOptions: SelectOption[] = Object.values(BrandCategory).map(
      (cat) => ({
        value: cat,
        label: t(`categories.${cat}`, { defaultValue: cat }),
      }),
    );

    const packageOptions: SelectOption[] = dbPackages.map((pkg) => ({
      value: pkg._id,
      label: `${pkg.name} (${pkg.validityMonths} m)`,
    }));

    const userOptions: SelectOption[] = dbUsers
      .filter(
        (u) => formData.country && u.countries?.includes(formData.country),
      )
      .map((u) => ({
        value: u._id,
        label: `${u.name}${u.surName ? ` ${u.surName}` : ""} (${u.email})`,
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

      const result = createBrandSchema.safeParse(formData);
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
            <h2>{t("brandsPage.createModal.title")}</h2>
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
                  label={t("brandsPage.table.address")}
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  hasError={!!errors.address}
                  errorMessage={errors.address ? t(errors.address) : ""}
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
                <CustomSelect
                  label={t("brandsPage.table.package")}
                  options={packageOptions}
                  value={packageOptions.find(
                    (o) => o.value === formData.package,
                  )}
                  onChange={(val) => handleSingleSelectChange(val, "package")}
                  placeholder={t("brandsPage.selectPackage")}
                />
              </div>

              <div className="form-column">
                <InputField
                  label={t("brandsPage.table.ico")}
                  name="ico"
                  value={formData.ico}
                  onChange={handleChange}
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
                {t("brandsPage.createBtnSubmit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
