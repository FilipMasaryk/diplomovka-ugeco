import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiInstagram } from "react-icons/fi";
import { FaTiktok, FaYoutube, FaFacebookF, FaPinterestP } from "react-icons/fa";
import {
  fetchMyProfile,
  createProfile,
  updateProfile,
  type UserProfile,
} from "../../../../shared/api/profiles/profiles";
import { BrandCategory } from "../../types/brandCategories";
import { OfferTarget } from "../../types/offerTarget";
import { Countries } from "../../types/countryEnum";
import { useToast } from "../../context/useToast";
import { API_URL } from "../../../../shared/config";
import { InputField } from "../../components/ui/InputField/InputField";
import "./profilepage.css";

const CATEGORIES = Object.values(BrandCategory);
const TARGETS = Object.values(OfferTarget);
const LANGUAGES = Object.values(Countries);

const CATEGORY_COLORS: Record<string, string> = {
  apps_and_technology: "#EF4444",
  auto_moto: "#6B7280",
  travelling: "#F59E0B",
  home_and_garden: "#22C55E",
  electronics: "#3B82F6",
  games: "#A855F7",
  music_and_dance: "#EC4899",
  food_and_drinks: "#F97316",
  books: "#78716C",
  cosmetics: "#E879A2",
  fashion: "#8B5CF6",
  family_and_kids: "#FACC15",
  services: "#0EA5E9",
  sport: "#10B981",
  experiences: "#D946EF",
  health: "#14B8A6",
  animals: "#A3784D",
  lifestyle: "#E11D48",
};

const ensureUrl = (val: string) =>
  val.match(/^https?:\/\//) ? val : `https://${val}`;

interface FormState {
  name: string;
  languages: string[];
  categories: string[];
  creatingAs: string[];
  about: string;
  portfolio: string;
  instagram: string;
  pinterest: string;
  facebook: string;
  tiktok: string;
  youtube: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  languages: [],
  categories: [],
  creatingAs: [],
  about: "",
  portfolio: "",
  instagram: "",
  pinterest: "",
  facebook: "",
  tiktok: "",
  youtube: "",
};

const ABOUT_MAX_LENGTH = 350;

const SocialIcons: React.FC<{
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  pinterest?: string;
  linked?: boolean;
}> = ({ instagram, tiktok, youtube, facebook, pinterest, linked = false }) => {
  const Wrap = linked ? "a" : "span";
  return (
    <div className="profile-social-icons">
      {instagram && (
        <Wrap
          {...(linked ? { href: ensureUrl(instagram), target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <FiInstagram className="social-icon instagram" />
        </Wrap>
      )}
      {tiktok && (
        <Wrap
          {...(linked ? { href: ensureUrl(tiktok), target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <FaTiktok className="social-icon tiktok" />
        </Wrap>
      )}
      {youtube && (
        <Wrap
          {...(linked ? { href: ensureUrl(youtube), target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <FaYoutube className="social-icon youtube" />
        </Wrap>
      )}
      {facebook && (
        <Wrap
          {...(linked ? { href: ensureUrl(facebook), target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <FaFacebookF className="social-icon facebook" />
        </Wrap>
      )}
      {pinterest && (
        <Wrap
          {...(linked ? { href: ensureUrl(pinterest), target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <FaPinterestP className="social-icon pinterest" />
        </Wrap>
      )}
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNew = !profile;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyProfile();
    setProfile(data);
    if (data) {
      setForm({
        name: data.name || "",
        languages: data.languages || [],
        categories: data.categories || [],
        creatingAs: data.creatingAs || [],
        about: data.about || "",
        portfolio: data.portfolio || "",
        instagram: data.instagram || "",
        pinterest: data.pinterest || "",
        facebook: data.facebook || "",
        tiktok: data.tiktok || "",
        youtube: data.youtube || "",
      });
      if (!data.published) {
        setEditing(true);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setIsDirty(true);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const toggleCheckbox = (key: "languages" | "categories" | "creatingAs", val: string) => {
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

  const isValidUrl = (value: string): boolean => {
    try {
      new URL(value.match(/^https?:\/\//) ? value : `https://${value}`);
      return true;
    } catch {
      return false;
    }
  };

  const validate = (published: boolean): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (published) {
      if (!form.name.trim()) errs.name = t("errors.required");
      if (form.languages.length === 0) errs.languages = t("errors.required");
      if (form.categories.length === 0) errs.categories = t("errors.required");
      if (form.creatingAs.length === 0) errs.creatingAs = t("errors.required");
      if (!form.about.trim()) errs.about = t("errors.required");
      if (!form.portfolio.trim()) errs.portfolio = t("errors.required");
      if (!isNew && !image && !profile?.image) errs.image = t("errors.required");
      if (isNew && !image) errs.image = t("errors.required");
    }
    const urlFields = ["portfolio", "instagram", "pinterest", "facebook", "tiktok", "youtube"] as const;
    for (const key of urlFields) {
      if (form[key] && !isValidUrl(form[key])) {
        errs[key] = t("errors.invalidUrl");
      }
    }
    return errs;
  };

  const handleSubmit = async (published: boolean) => {
    const errs = validate(published);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      form.languages.forEach((l) => fd.append("languages", l));
      form.categories.forEach((c) => fd.append("categories", c));
      form.creatingAs.forEach((c) => fd.append("creatingAs", c));
      fd.append("about", form.about);
      fd.append("portfolio", form.portfolio);
      fd.append("instagram", form.instagram);
      fd.append("pinterest", form.pinterest);
      fd.append("facebook", form.facebook);
      fd.append("tiktok", form.tiktok);
      fd.append("youtube", form.youtube);
      fd.append("published", String(published));
      if (image) fd.append("image", image);

      setIsDirty(false);
      if (isNew) {
        await createProfile(fd);
      } else {
        await updateProfile(fd);
      }
      showToast(
        published ? t("profilePage.profilePublished") : t("profilePage.conceptSaved"),
        "success",
      );
      setEditing(false);
      setImage(null);
      setImagePreview(null);
      await loadProfile();
    } catch (err: unknown) {
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        const msg = Array.isArray(e.message) ? e.message.join(", ") : String(e.message ?? "");
        showToast(msg || JSON.stringify(err), "error");
      } else {
        showToast(String(err), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveModal(true);
    } else {
      setEditing(false);
    }
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    setIsDirty(false);
    setEditing(false);
    setImage(null);
    setImagePreview(null);
    if (profile) {
      setForm({
        name: profile.name || "",
        languages: profile.languages || [],
        categories: profile.categories || [],
        creatingAs: profile.creatingAs || [],
        about: profile.about || "",
        portfolio: profile.portfolio || "",
        instagram: profile.instagram || "",
        pinterest: profile.pinterest || "",
        facebook: profile.facebook || "",
        tiktok: profile.tiktok || "",
        youtube: profile.youtube || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const profileImageSrc =
    imagePreview ?? (profile?.image ? `${API_URL}${profile.image}` : null);
  const imageFileName = image?.name ?? (profile?.image ? profile.image.split("/").pop() : null);

  if (loading) {
    return <div className="profile-page"><div className="profile-loading">Loading...</div></div>;
  }

  // ─── EMPTY STATE ───
  if (!profile && !editing) {
    return (
      <div className="profile-page">
        <button className="profile-fill-btn" onClick={() => setEditing(true)}>
          {t("profilePage.fillBtn")}
        </button>
        <div className="profile-empty-card">
          <h2>{t("profilePage.emptyTitle")}</h2>
          <p>{t("profilePage.emptyDescription")}</p>
        </div>
      </div>
    );
  }

  // ─── VIEW STATE ───
  if (profile && profile.published && !editing) {
    const langDisplay = profile.languages
      .map((l) => t(`countries.${l}`, { defaultValue: l }).toLowerCase())
      .join(", ");

    return (
      <div className="profile-page">
        <button className="profile-edit-btn" onClick={() => setEditing(true)}>
          {t("profilePage.editBtn")}
        </button>
        <div className="profile-view-card">
          <div className="profile-view-header">
            {profile.image && (
              <img
                src={`${API_URL}${profile.image}`}
                alt={profile.name || ""}
                className="profile-view-image"
              />
            )}
            <h2 className="profile-view-name">{profile.name}</h2>
          </div>
          <div className="profile-view-categories">
            {profile.categories.map((cat) => (
              <span
                key={cat}
                className="profile-category-badge"
                style={{
                  borderColor: CATEGORY_COLORS[cat] || "#6B7280",
                  color: CATEGORY_COLORS[cat] || "#6B7280",
                }}
              >
                {t(`categories.${cat}`, { defaultValue: cat })}
              </span>
            ))}
          </div>
          {langDisplay && (
            <p className="profile-view-lang">
              {t("profilePage.languages")}: {langDisplay}
            </p>
          )}
          {profile.about && <p className="profile-view-about">{profile.about}</p>}
          <div className="profile-view-footer">
            {profile.portfolio && (
              <a
                href={ensureUrl(profile.portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-portfolio-btn"
              >
                {t("profilePage.viewPortfolio")}
              </a>
            )}
            <SocialIcons
              instagram={profile.instagram}
              tiktok={profile.tiktok}
              youtube={profile.youtube}
              facebook={profile.facebook}
              pinterest={profile.pinterest}
              linked
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── EDIT / CREATE STATE ───
  return (
    <div className="profile-page">
      <div className="profile-edit-layout">
        {/* Left side: preview card */}
        <div className="profile-preview-card">
          <div className="profile-preview-header">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt="" className="profile-preview-image" />
            ) : (
              <div className="profile-preview-image-placeholder" />
            )}
            <h3 className="profile-preview-name">{form.name || t("profilePage.name")}</h3>
          </div>
          <div className="profile-preview-categories">
            {form.categories.map((cat) => (
              <span
                key={cat}
                className="profile-category-badge"
                style={{
                  borderColor: CATEGORY_COLORS[cat] || "#6B7280",
                  color: CATEGORY_COLORS[cat] || "#6B7280",
                }}
              >
                {t(`categories.${cat}`, { defaultValue: cat })}
              </span>
            ))}
          </div>
          {form.languages.length > 0 && (
            <p className="profile-preview-lang">
              {t("profilePage.languages")}:{" "}
              {form.languages.map((l) => t(`countries.${l}`, { defaultValue: l }).toLowerCase()).join(", ")}
            </p>
          )}
          {form.about && <p className="profile-preview-about">{form.about}</p>}
          <div className="profile-preview-footer">
            {form.portfolio && (
              <span className="profile-portfolio-btn-preview">
                {t("profilePage.viewPortfolio")}
              </span>
            )}
            <SocialIcons
              instagram={form.instagram}
              tiktok={form.tiktok}
              youtube={form.youtube}
              facebook={form.facebook}
              pinterest={form.pinterest}
            />
          </div>
        </div>

        {/* Right side: form */}
        <div className="profile-form-section">
          {/* Name */}
          <InputField
            label={t("profilePage.name")}
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder={t("profilePage.name")}
            hasError={!!errors.name}
            errorMessage={errors.name}
          />

          {/* Languages + CreatingAs (left) | Categories (right) */}
          <div className="profile-form-grid">
            <div>
              <div className="profile-field">
                <label className="profile-label">
                  {t("profilePage.languages")} <span className="required-star">*</span>
                </label>
                <div className="profile-checkbox-list profile-checkbox-list-full">
                  {LANGUAGES.map((lang) => (
                    <label key={lang} className="profile-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.languages.includes(lang)}
                        onChange={() => toggleCheckbox("languages", lang)}
                      />
                      {t(`countries.${lang}`, { defaultValue: lang })}
                    </label>
                  ))}
                </div>
                {errors.languages && <span className="profile-field-error">{errors.languages}</span>}
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  {t("profilePage.creatingAs")} <span className="required-star">*</span>
                </label>
                <div className="profile-checkbox-list profile-checkbox-list-full">
                  {TARGETS.map((tgt) => (
                    <label key={tgt} className="profile-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.creatingAs.includes(tgt)}
                        onChange={() => toggleCheckbox("creatingAs", tgt)}
                      />
                      {t(`targets.${tgt}`, { defaultValue: tgt })}
                    </label>
                  ))}
                </div>
                {errors.creatingAs && <span className="profile-field-error">{errors.creatingAs}</span>}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label">
                {t("profilePage.categories")} <span className="required-star">*</span>
              </label>
              <div className="profile-checkbox-list profile-checkbox-list-full">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="profile-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.categories.includes(cat)}
                      onChange={() => toggleCheckbox("categories", cat)}
                    />
                    {t(`categories.${cat}`, { defaultValue: cat })}
                  </label>
                ))}
              </div>
              {errors.categories && <span className="profile-field-error">{errors.categories}</span>}
            </div>
          </div>

          {/* Image */}
          <div className="profile-field">
            <label className="profile-label">
              {t("profilePage.image")} <span className="required-star">*</span>
              <span className="profile-label-spacer" />
              <span className="profile-label-hint">{t("profilePage.imageHint")}</span>
            </label>
            <div
              className={`profile-file-input-wrap ${errors.image ? "has-error" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="file-choose-btn">{t("profilePage.chooseFile")}</span>
              <span className="file-name">
                {imageFileName ?? t("profilePage.noFile")}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            {errors.image && <span className="profile-field-error">{errors.image}</span>}
          </div>

          {/* About */}
          <div className="profile-field">
            <label className="profile-label">
              {t("profilePage.about")} <span className="required-star">*</span>
            </label>
            <textarea
              className={`profile-textarea ${errors.about ? "has-error" : ""}`}
              value={form.about}
              onChange={(e) => {
                if (e.target.value.length <= ABOUT_MAX_LENGTH) {
                  setField("about", e.target.value);
                }
              }}
              placeholder={t("profilePage.aboutPlaceholder")}
              rows={5}
            />
            <div className="profile-char-count">
              {t("profilePage.charCount")} {form.about.length}/{ABOUT_MAX_LENGTH}
            </div>
            {errors.about && <span className="profile-field-error">{errors.about}</span>}
          </div>

          {/* Social URLs - 3 column grid */}
          <div className="profile-urls-grid">
            {(["portfolio", "instagram", "pinterest", "facebook", "tiktok", "youtube"] as const).map(
              (key) => (
                <InputField
                  key={key}
                  label={t(`profilePage.${key}`)}
                  required={key === "portfolio"}
                  placeholder="URL"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  hasError={!!errors[key]}
                  errorMessage={errors[key]}
                />
              ),
            )}
          </div>

          {/* Footer buttons */}
          <div className="profile-form-footer">
            {profile?.published && (
              <button
                className="profile-back-btn"
                onClick={handleBack}
                disabled={submitting}
              >
                {t("profilePage.backBtn")}
              </button>
            )}
            <button
              className="profile-concept-btn"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {t("profilePage.saveConceptBtn")}
            </button>
            <button
              className="profile-publish-btn"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              {t("profilePage.publishBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* Leave confirmation modal */}
      {showLeaveModal && (
        <div className="profile-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("profilePage.leaveTitle")}</h3>
            <div className="profile-modal-actions">
              <button className="profile-modal-leave" onClick={confirmLeave}>
                {t("profilePage.leaveConfirm")}
              </button>
              <button className="profile-modal-stay" onClick={() => setShowLeaveModal(false)}>
                {t("profilePage.leaveCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
