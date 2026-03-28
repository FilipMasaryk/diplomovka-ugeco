import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type MultiValue, type SingleValue } from "react-select";
import "./brandsettings.css";
import { InputField } from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { CustomSelect } from "../../components/ui/CustomSelectMenu/CustomSelect";
import { BrandCategory } from "../../types/brandCategories";
import {
  fetchBrandDetail,
  updateBrandSettings,
  fetchContactsByCountry,
  type BrandDetail,
  type ContactUser,
} from "../../../../shared/api/brands/brands";
import { useBrand } from "../../context/useBrand";
import { useToast } from "../../context/useToast";
import { API_URL } from "../../../../shared/config";

interface SelectOption {
  value: string;
  label: string;
}

export const BrandSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { selectedBrand, refreshBrands } = useBrand();
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [dbUsers, setDbUsers] = useState<ContactUser[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);

  const loadBrand = useCallback(async () => {
    if (!selectedBrand) return;
    setLoading(true);
    const detail = await fetchBrandDetail(selectedBrand._id);
    if (detail) {
      const [, contacts] = await Promise.all([
        Promise.resolve(),
        fetchContactsByCountry(detail.country),
      ]);
      setDbUsers(contacts);
      setBrand(detail);
      setLogoPreview(detail.logo ? `${API_URL}${detail.logo}` : "");
    }
    setLoading(false);
  }, [selectedBrand]);

  useEffect(() => {
    loadBrand();
  }, [loadBrand]);

  const categoryOptions = useMemo<SelectOption[]>(
    () =>
      Object.values(BrandCategory).map((cat) => ({
        value: cat,
        label: t(`categories.${cat}`, { defaultValue: cat }),
      })),
    [t],
  );

  const userOptions = useMemo<SelectOption[]>(
    () =>
      dbUsers.map((u) => ({
        value: u._id,
        label: `${u.name}${u.surName ? ` ${u.surName}` : ""}`,
      })),
    [dbUsers],
  );

  if (!selectedBrand) {
    return (
      <div className="brand-settings-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          {t("noBrandSelected")}
        </div>
      </div>
    );
  }

  if (loading || !brand) {
    return (
      <div className="brand-settings-page">
        <h1>{t("brandSettingsPage.title")}</h1>
        <div>{t("managersPage.loading")}</div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrand((prev) => (prev ? { ...prev, [e.target.name]: e.target.value } : prev));
  };

  const handleCategoriesChange = (selected: MultiValue<SelectOption>) => {
    setBrand((prev) =>
      prev ? { ...prev, categories: selected.map((s) => s.value) } : prev,
    );
  };

  const handleContactChange = (selected: SingleValue<SelectOption>) => {
    setBrand((prev) =>
      prev ? { ...prev, mainContact: selected?.value || "" } : prev,
    );
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setErrors((p) => ({ ...p, logo: "Maximálna veľkosť je 100KB" }));
      e.target.value = "";
      return;
    }

    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > 100 || img.height > 100) {
        setErrors((p) => ({ ...p, logo: "Maximálny rozmer je 100×100px" }));
        e.target.value = "";
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors((p) => ({ ...p, logo: "" }));
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      setErrors((p) => ({ ...p, logo: "Neplatný formát obrázka" }));
      e.target.value = "";
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;

    const errs: Record<string, string> = {};
    if (!brand.name.trim()) errs.name = "errors.required";
    if (brand.categories.length === 0) errs.categories = "errors.required";
    if (!brand.logo && !logoFile) errs.logo = "errors.required";

    const urlFields = ["website", "facebook", "instagram", "tiktok", "pinterest", "youtube"] as const;
    for (const key of urlFields) {
      const val = brand[key];
      if (val) {
        try {
          const urlToCheck = val.match(/^https?:\/\//) ? val : `https://${val}`;
          const url = new URL(urlToCheck);
          if (!url.hostname.includes(".")) throw new Error();
        } catch {
          errs[key] = "errors.invalidUrl";
        }
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const fd = new FormData();
    fd.append("name", brand.name);
    fd.append("ico", brand.ico);
    fd.append("dic", brand.dic);
    fd.append("address", brand.address);
    fd.append("city", brand.city);
    fd.append("zip", brand.zip);
    for (const cat of brand.categories) {
      fd.append("categories", cat);
    }
    if (brand.mainContact) fd.append("mainContact", brand.mainContact);
    if (brand.website) fd.append("website", brand.website);
    if (brand.facebook) fd.append("facebook", brand.facebook);
    if (brand.instagram) fd.append("instagram", brand.instagram);
    if (brand.tiktok) fd.append("tiktok", brand.tiktok);
    if (brand.pinterest) fd.append("pinterest", brand.pinterest);
    if (brand.youtube) fd.append("youtube", brand.youtube);
    if (logoFile) fd.append("logo", logoFile);

    try {
      await updateBrandSettings(selectedBrand._id, fd);
      showToast(t("brandSettingsPage.saved"), "success");
      loadBrand();
      refreshBrands();
    } catch (error: any) {
      if (error && Array.isArray(error.message) && error.message.length > 0) {
        const firstMsg = error.message[0];
        const cleanMsg = firstMsg.includes(":")
          ? firstMsg.split(":")[1].trim()
          : firstMsg;
        showToast(cleanMsg, "error");
      } else {
        showToast(error?.message || t("errors.somethingWentWrong"), "error");
      }
    }
  };

  return (
    <div className="brand-settings-page">
      <h1>{t("brandSettingsPage.title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="brand-settings-grid">
          <InputField
            label={t("brandSettingsPage.brandName")}
            name="name"
            required
            value={brand.name}
            onChange={handleChange}
            hasError={!!errors.name}
            errorMessage={errors.name ? t(errors.name) : ""}
          />
          <CustomSelect
            isMulti
            label={t("brandSettingsPage.category")}
            required
            options={categoryOptions}
            value={categoryOptions.filter((o) =>
              brand.categories.includes(o.value),
            )}
            onChange={(val) => handleCategoriesChange(val)}
            placeholder={t("brandsPage.selectCategory")}
            error={errors.categories ? t(errors.categories) : ""}
          />
        </div>

        <div className="brand-settings-grid" style={{ marginTop: 24 }}>
          <div className="brand-settings-logo-section">
            <label className="brand-settings-label">
              {t("brandSettingsPage.logo")}{" "}
              <span className="brand-settings-required">*</span>
              <span className="brand-settings-logo-hint">
                {t("brandSettingsPage.logoHint")}
              </span>
            </label>
            <div
              className={`image-file-input-wrap ${errors.logo ? "has-error" : ""}`}
              onClick={() => logoInputRef.current?.click()}
            >
              <span className="file-choose-btn">
                {t("createOfferPage.chooseFile", { defaultValue: "Vybrať súbor" })}
              </span>
              <span className="file-name">
                {logoFile?.name || (brand.logo ? brand.logo.split("/").pop() : "")}
              </span>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleLogoChange}
            />
            {errors.logo && (
              <span className="brand-settings-field-error">{t(errors.logo)}</span>
            )}
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo"
                className="brand-settings-logo-preview"
              />
            )}
          </div>
          <CustomSelect
            label={t("brandSettingsPage.mainContact")}
            options={userOptions}
            value={userOptions.find((o) => o.value === brand.mainContact) || null}
            onChange={handleContactChange}
            placeholder={t("brandsPage.selectContact")}
          />
        </div>

        {/* Social URLs */}
        <div className="brand-settings-full" style={{ marginTop: 24 }}>
          {(
            ["website", "facebook", "instagram", "tiktok", "pinterest", "youtube"] as const
          ).map((field) => (
            <InputField
              key={field}
              label={t(`brandSettingsPage.${field}`)}
              name={field}
              placeholder="URL"
              value={brand[field]}
              onChange={(e) => {
                handleChange(e);
                if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
              }}
              hasError={!!errors[field]}
              errorMessage={errors[field] ? t(errors[field]) : ""}
            />
          ))}
        </div>

        {/* Billing */}
        <h2 className="brand-settings-section-title">
          {t("brandSettingsPage.billingTitle")}
        </h2>

        <div className="brand-settings-full">
          <InputField
            label={t("brandSettingsPage.billingName")}
            name="name"
            value={brand.name}
            onChange={handleChange}
          />
        </div>

        <div className="brand-settings-grid" style={{ marginTop: 16 }}>
          <InputField
            label={t("brandSettingsPage.ico")}
            name="ico"
            value={brand.ico}
            onChange={handleChange}
          />
          <InputField
            label={t("brandSettingsPage.dic")}
            name="dic"
            value={brand.dic}
            onChange={handleChange}
          />
        </div>

        <div className="brand-settings-grid" style={{ marginTop: 16 }}>
          <InputField
            label={t("brandSettingsPage.state")}
            name="country"
            value={t(`countries.${brand.country}`)}
            disabled
          />
          <InputField
            label={t("brandSettingsPage.city")}
            name="city"
            value={brand.city}
            onChange={handleChange}
          />
        </div>

        <div className="brand-settings-grid" style={{ marginTop: 16 }}>
          <InputField
            label={t("brandSettingsPage.address")}
            name="address"
            value={brand.address}
            onChange={handleChange}
          />
          <InputField
            label={t("brandSettingsPage.zip")}
            name="zip"
            value={brand.zip}
            onChange={handleChange}
          />
        </div>

        <div className="brand-settings-footer">
          <Button type="submit" className="btn-create">
            {t("brandSettingsPage.saveBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
};
