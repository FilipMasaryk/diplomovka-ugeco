import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./createoffer.css";
import { CustomSelect } from "../../components/ui/CustomSelectMenu/CustomSelect";
import { FiArrowLeft } from "react-icons/fi";
import { BrandCategory } from "../../types/brandCategories";
import { OfferTarget } from "../../types/offerTarget";
import { OfferLanguage } from "../../types/offerLanguage";
import {
  createOffer,
  updateOffer,
  fetchOfferById,
  type ApiOffer,
  type PopulatedBrand,
} from "../../../../shared/api/offers/offers";
import {
  fetchBrandsForSelect,
  type BrandSelectOption,
} from "../../../../shared/api/brands/brands";
import { API_URL } from "../../../../shared/config";

interface FormState {
  name: string;
  brand: string;
  activeFrom: string;
  activeTo: string;
  paidCooperation: boolean;
  categories: string[];
  languages: string[];
  targets: string[];
  description: string;
  contact: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  pinterest: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  brand: "",
  activeFrom: "",
  activeTo: "",
  paidCooperation: true,
  categories: [],
  languages: [],
  targets: [],
  description: "",
  contact: "",
  website: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  pinterest: "",
};

const toInputDate = (iso: string): string => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const CreateOfferPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [brands, setBrands] = useState<BrandSelectOption[]>([]);
  const [loadingOffer, setLoadingOffer] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    fetchBrandsForSelect().then(setBrands);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    fetchOfferById(id).then((offer: ApiOffer | null) => {
      if (!offer) {
        navigate("/offers");
        return;
      }
      const brandRef = offer.brand as PopulatedBrand | string;
      setForm({
        name: offer.name,
        brand: typeof brandRef === "string" ? brandRef : brandRef._id,
        activeFrom: toInputDate(offer.activeFrom),
        activeTo: toInputDate(offer.activeTo),
        paidCooperation: offer.paidCooperation,
        categories: offer.categories,
        languages: offer.languages,
        targets: offer.targets,
        description: offer.description,
        contact: offer.contact ?? "",
        website: offer.website ?? "",
        facebook: offer.facebook ?? "",
        instagram: offer.instagram ?? "",
        tiktok: offer.tiktok ?? "",
        pinterest: offer.pinterest ?? "",
      });
      if (offer.image) setExistingImageUrl(offer.image);
      setLoadingOffer(false);
    });
  }, [id, isEdit, navigate]);

  const selectedBrand = brands.find((b) => b._id === form.brand) ?? null;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setIsDirty(true);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const toggleCheckbox = (key: "languages" | "targets", val: string) => {
    setForm((p) => {
      const arr = p[key] as string[];
      return {
        ...p,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
    setIsDirty(true);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setIsDirty(true);
    if (errors.image) setErrors((p) => ({ ...p, image: "" }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setBrandLogo(file);
    setIsDirty(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBrandLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setBrandLogoPreview(null);
    }
  };

  const isValidUrl = (value: string): boolean => {
    try {
      const urlToCheck = value.match(/^https?:\/\//) ? value : `https://${value}`;
      new URL(urlToCheck);
      return true;
    } catch {
      return false;
    }
  };

  const validate = (status: "active" | "concept"): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("errors.required");
    if (!form.brand) errs.brand = t("errors.required");
    if (status === "active") {
      if (!form.activeFrom) errs.activeFrom = t("errors.required");
      if (!form.activeTo) errs.activeTo = t("errors.required");
      if (!isEdit && !image) errs.image = t("errors.required");
      if (form.categories.length === 0) errs.categories = t("errors.required");
      if (form.languages.length === 0) errs.languages = t("errors.required");
      if (form.targets.length === 0) errs.targets = t("errors.required");
      if (!form.description.trim()) errs.description = t("errors.required");
    }
    const urlFields = [
      "website",
      "facebook",
      "instagram",
      "tiktok",
      "pinterest",
    ] as const;
    for (const key of urlFields) {
      if (form[key] && !isValidUrl(form[key])) {
        errs[key] = t("errors.invalidUrl");
      }
    }
    return errs;
  };

  const handleSubmit = async (status: "active" | "concept") => {
    const errs = validate(status);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("brand", form.brand);
      fd.append("paidCooperation", String(form.paidCooperation));
      fd.append("status", status);
      if (form.activeFrom) fd.append("activeFrom", form.activeFrom);
      if (form.activeTo) fd.append("activeTo", form.activeTo);
      form.categories.forEach((c) => fd.append("categories", c));
      form.languages.forEach((l) => fd.append("languages", l));
      form.targets.forEach((tgt) => fd.append("targets", tgt));
      fd.append("description", form.description);
      if (form.contact) fd.append("contact", form.contact);
      if (form.website) fd.append("website", form.website);
      if (form.facebook) fd.append("facebook", form.facebook);
      if (form.instagram) fd.append("instagram", form.instagram);
      if (form.tiktok) fd.append("tiktok", form.tiktok);
      if (form.pinterest) fd.append("pinterest", form.pinterest);
      if (image) fd.append("image", image);
      if (brandLogo) fd.append("brandLogo", brandLogo);

      setIsDirty(false);
      if (isEdit && id) {
        await updateOffer(id, fd);
      } else {
        await createOffer(fd);
      }
      navigate("/offers");
    } catch (err: unknown) {
      console.error("Failed to save offer:", err);
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        const msg =
          Array.isArray(e.message) ? e.message.join(", ") : String(e.message ?? "");
        setServerError(msg || JSON.stringify(err));
      } else {
        setServerError(String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const brandOptions = brands.map((b) => ({ value: b._id, label: b.name }));
  const categoryOptions = Object.values(BrandCategory).map((c) => ({
    value: c,
    label: t(`categories.${c}`, { defaultValue: c }),
  }));

  const previewSrc =
    imagePreview ?? (existingImageUrl ? `${API_URL}${existingImageUrl}` : null);
  const imageFileName =
    image?.name ??
    (existingImageUrl ? existingImageUrl.split("/").pop() : null);

  if (loadingOffer) {
    return (
      <div className="create-offer-page">
        <p>{t("offersPage.loading")}</p>
      </div>
    );
  }

  return (
    <div className="create-offer-page">
      <h1>
        {isEdit ? t("createOfferPage.editTitle") : t("createOfferPage.title")}
      </h1>

      {/* Paid cooperation / Barter toggle */}
      <div className="cooperation-toggle">
        <span
          className={`coop-label ${form.paidCooperation ? "active" : ""}`}
          onClick={() => setField("paidCooperation", true)}
        >
          {t("createOfferPage.paidCooperation")}
        </span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={!form.paidCooperation}
            onChange={(e) => setField("paidCooperation", !e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
        <span
          className={`coop-label ${!form.paidCooperation ? "active" : ""}`}
          onClick={() => setField("paidCooperation", false)}
        >
          {t("createOfferPage.barter")}
        </span>
      </div>

      <div className="offer-form-card">
        {/* ── Row 1-2: Name/Brand + Dates ── */}
        <div className="offer-form-grid">
          <div>
            {/* Offer name */}
            <div className="offer-field">
              <label className="offer-label">
                {t("createOfferPage.name")}{" "}
                <span className="required-star">*</span>
              </label>
              <input
                className={`offer-input ${errors.name ? "has-error" : ""}`}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder={t("createOfferPage.name")}
              />
              {errors.name && (
                <span className="offer-field-error">{errors.name}</span>
              )}
            </div>

            {/* Active from */}
            <div className="offer-field">
              <label className="offer-label">
                {t("createOfferPage.activeFrom")}{" "}
                <span className="required-star">*</span>
              </label>
              <DatePicker
                selected={form.activeFrom ? new Date(form.activeFrom) : null}
                onChange={(date: Date | null) => {
                  const val = date ? date.toISOString().split("T")[0] : "";
                  setField("activeFrom", val);
                  if (val && form.activeTo && val > form.activeTo) {
                    setField("activeTo", "");
                  }
                }}
                dateFormat="dd.MM.yyyy"
                placeholderText={t("createOfferPage.activeFrom")}
                className={`offer-input ${errors.activeFrom ? "has-error" : ""}`}
                wrapperClassName="datepicker-wrapper"
              />
              {errors.activeFrom && (
                <span className="offer-field-error">{errors.activeFrom}</span>
              )}
            </div>
          </div>

          <div>
            {/* Brand select */}
            <div className="offer-field">
              <CustomSelect
                label={t("createOfferPage.brand")}
                required
                options={brandOptions}
                value={brandOptions.find((o) => o.value === form.brand) ?? null}
                onChange={(val) => !isEdit && setField("brand", val?.value ?? "")}
                placeholder={t("createOfferPage.brand")}
                error={errors.brand}
                isDisabled={isEdit}
              />
            </div>

            {/* Active to */}
            <div className="offer-field">
              <label className="offer-label">
                {t("createOfferPage.activeTo")}{" "}
                <span className="required-star">*</span>
              </label>
              <DatePicker
                selected={form.activeTo ? new Date(form.activeTo) : null}
                onChange={(date: Date | null) =>
                  setField("activeTo", date ? date.toISOString().split("T")[0] : "")
                }
                dateFormat="dd.MM.yyyy"
                placeholderText={t("createOfferPage.activeTo")}
                className={`offer-input ${errors.activeTo ? "has-error" : ""}`}
                wrapperClassName="datepicker-wrapper"
                minDate={form.activeFrom ? new Date(form.activeFrom) : undefined}
              />
              {errors.activeTo && (
                <span className="offer-field-error">{errors.activeTo}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Brand logo upload (full width, small preview) ── */}
        <div className="offer-field offer-full-row">
          <label className="offer-label">
            {t("createOfferPage.brandLogo")}
          </label>
          <div className="image-upload-row">
            <div
              className="image-file-input-wrap"
              onClick={() => logoInputRef.current?.click()}
            >
              <span className="file-choose-btn">
                {t("createOfferPage.chooseFile")}
              </span>
              <span className="file-name">
                {brandLogo?.name ?? t("createOfferPage.imageClick")}
              </span>
            </div>
            {(brandLogoPreview || selectedBrand?.logo) ? (
              <img
                src={brandLogoPreview ?? `${API_URL}${selectedBrand?.logo}`}
                alt="brand logo"
                className="image-preview-thumb logo-preview-thumb"
              />
            ) : (
              <div className="image-preview-placeholder logo-preview-placeholder" />
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleBrandLogoChange}
          />
        </div>

        {/* ── Image upload (full width, bigger preview) ── */}
        <div className="offer-full-row">
          <div className="image-upload-row image-upload-row-large">
            <div className="image-input-col">
              <label className="offer-label">
                {t("createOfferPage.image")}
                {!isEdit && <span className="required-star">*</span>}
                <span className="offer-label-spacer" />
                <span className="offer-label-hint">
                  Formát: 400×400px, do 100Kb
                </span>
              </label>
              <div
                className={`image-file-input-wrap ${errors.image ? "has-error" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="file-choose-btn">Vybrať súbor</span>
                <span className="file-name">
                  {imageFileName ?? t("createOfferPage.imageClick")}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {errors.image && (
                <span className="offer-field-error">{errors.image}</span>
              )}
            </div>
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="preview"
                className="image-preview-thumb image-preview-large"
              />
            ) : (
              <div className="image-preview-placeholder image-preview-large" />
            )}
          </div>
        </div>

        {/* ── Row: Contact + Categories ── */}
        <div className="offer-form-grid">
          <div>
            <div className="offer-field">
              <label className="offer-label">
                {t("createOfferPage.contact")}
              </label>
              <input
                className="offer-input"
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
                placeholder={t("createOfferPage.contactPlaceholder")}
              />
            </div>
          </div>
          <div>
            <div className="offer-field">
              <CustomSelect
                label={t("createOfferPage.categories")}
                required
                isMulti
                options={categoryOptions}
                value={categoryOptions.filter((o) =>
                  form.categories.includes(o.value),
                )}
                onChange={(vals) => {
                  const selected = vals
                    ? (vals as unknown as { value: string }[]).map(
                        (v) => v.value,
                      )
                    : [];
                  setField("categories", selected);
                }}
                placeholder={t("offersPage.allCategories")}
                error={errors.categories}
              />
            </div>
          </div>
        </div>

        {/* ── Languages (full width) ── */}
        <div className="offer-full-row">
          <label className="offer-label">
            {t("createOfferPage.languages")}{" "}
            <span className="required-star">*</span>
          </label>
          <div className="offer-checkboxes-grid">
            {Object.values(OfferLanguage).map((lang) => (
              <label key={lang} className="offer-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.languages.includes(lang)}
                  onChange={() => toggleCheckbox("languages", lang)}
                />
                {t(`languages.${lang}`, { defaultValue: lang.toUpperCase() })}
              </label>
            ))}
          </div>
          {errors.languages && (
            <span className="offer-field-error">{errors.languages}</span>
          )}
        </div>

        {/* ── Targets (full width) ── */}
        <div className="offer-full-row">
          <label className="offer-label">
            {t("createOfferPage.targets")}{" "}
            <span className="required-star">*</span>
          </label>
          <div className="offer-checkboxes-grid">
            {Object.values(OfferTarget).map((tgt) => (
              <label key={tgt} className="offer-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.targets.includes(tgt)}
                  onChange={() => toggleCheckbox("targets", tgt)}
                />
                {t(`targets.${tgt}`, { defaultValue: tgt })}
              </label>
            ))}
          </div>
          {errors.targets && (
            <span className="offer-field-error">{errors.targets}</span>
          )}
        </div>

        {/* ── Description (full width) ── */}
        <div className="offer-full-row">
          <label className="offer-label">
            {t("createOfferPage.description")}{" "}
            <span className="required-star">*</span>
          </label>
          <textarea
            className={`offer-textarea ${errors.description ? "has-error" : ""}`}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={6}
          />
          {errors.description && (
            <span className="offer-field-error">{errors.description}</span>
          )}
        </div>

        <hr className="offer-section-divider" />

        {/* ── Social URLs ── */}
        {(
          ["website", "facebook", "instagram", "tiktok", "pinterest"] as const
        ).map((key) => (
          <div key={key} className="offer-url-field">
            <span className="offer-url-label">
              {t(`createOfferPage.${key}`)}
            </span>
            <input
              className={`offer-url-input ${errors[key] ? "has-error" : ""}`}
              placeholder="URL"
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
            />
            {errors[key] && (
              <span className="offer-field-error">{errors[key]}</span>
            )}
          </div>
        ))}

        {/* ── Server error ── */}
        {serverError && (
          <span className="offer-field-error" style={{ marginTop: 12 }}>
            {serverError}
          </span>
        )}

        {/* ── Footer buttons ── */}
        <div className="offer-form-footer">
          <button
            className="offer-back-btn"
            onClick={() => navigate("/offers")}
            disabled={submitting}
          >
            <FiArrowLeft />
            {t("createOfferPage.backBtn")}
          </button>
          <button
            className="offer-concept-btn"
            onClick={() => handleSubmit("concept")}
            disabled={submitting}
          >
            {t("createOfferPage.saveConceptBtn")}
          </button>
          <button
            className="offer-publish-btn"
            onClick={() => handleSubmit("active")}
            disabled={submitting}
          >
            {t("createOfferPage.publishBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};
