import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { InputField } from "../InputField/InputField";
import { Button } from "../Button/Button";
import { CustomSelect } from "../CustomSelectMenu/CustomSelect";
import { createNewsSchema } from "../../../pages/NewsPage/schemas/createNewsSchema";
import { useToast } from "../../../context/useToast";
import type { NewsItem } from "../../../../../shared/api/news/news";
import type { SingleValue } from "react-select";
import "../CreateUserModal/createUserModal.css";
import "../../../pages/CreateOfferPage/createoffer.css";
import { API_URL } from "../../../../../shared/config";
import "./createNewsModal.css";

interface SelectOption {
  value: string;
  label: string;
}

export interface NewsFormState {
  title: string;
  description: string;
  category: string;
  target: string;
}

const initialFormState: NewsFormState = {
  title: "",
  description: "",
  category: "",
  target: "all",
};

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editData?: NewsItem | null;
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<NewsFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          title: editData.title,
          description: editData.description,
          category: editData.category,
          target: editData.target,
        });
        setImagePreview(editData.image);
        setImageFile(null);
      } else {
        setFormData(initialFormState);
        setImageFile(null);
        setImagePreview(null);
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  const categoryOptions: SelectOption[] = [
    { value: "fix", label: t("newsPage.form.categoryFix") },
    { value: "feature", label: t("newsPage.form.categoryFeature") },
    { value: "bug", label: t("newsPage.form.categoryBug") },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: t("newsPage.form.imageTooLarge"),
      }));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const { image: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (status === "published") {
      const result = createNewsSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = t(issue.message);
        });
        setErrors(fieldErrors);
        return;
      }

    } else {
      setErrors({});
    }

    try {
      const fd = new FormData();
      if (formData.title) fd.append("title", formData.title);
      if (formData.description) fd.append("description", formData.description);
      if (formData.category) fd.append("category", formData.category);
      fd.append("target", formData.target);
      fd.append("status", status);
      if (imageFile) {
        fd.append("image", imageFile);
      }

      await onSubmit(fd);
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : t("errors.somethingWentWrong");
      showToast(message, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            {editData
              ? t("newsPage.createModal.editTitle")
              : t("newsPage.createModal.title")}
          </h2>
          <FiX className="close-icon" onClick={onClose} />
        </div>

        <div className="modal-form">
          <div className="input-wrapper">
            <label className="news-label">
              {t("newsPage.form.target")}
              <span className="required-star">*</span>
            </label>
            <div className="target-radios">
              {(["all", "brand_manager", "creator"] as const).map((val) => (
                <label key={val} className="radio-label">
                  <input
                    type="radio"
                    name="target"
                    value={val}
                    checked={formData.target === val}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, target: val }))
                    }
                  />
                  <span>
                    {val === "all"
                      ? t("newsPage.form.targetAll")
                      : val === "brand_manager"
                        ? t("newsPage.form.targetBrand")
                        : t("newsPage.form.targetCreator")}
                  </span>
                </label>
              ))}
            </div>
            {errors.target && (
              <span className="field-error">{errors.target}</span>
            )}
          </div>

          <div className="input-wrapper">
            <InputField
              label={t("newsPage.form.title")}
              required
              placeholder={t("newsPage.form.title")}
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              hasError={!!errors.title}
              errorMessage={errors.title}
            />
          </div>

          <div className="input-wrapper">
            <label className="news-label">
              {t("newsPage.form.description")}
              <span className="required-star">*</span>
            </label>
            <textarea
              className={`news-textarea ${errors.description ? "input-error" : ""}`}
              placeholder={t("newsPage.form.description")}
              value={formData.description}
              maxLength={2000}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <div className="char-counter">
              {t("newsPage.form.charCount")} {formData.description.length}/2000
            </div>
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="input-wrapper">
            <label className="news-label">
              {t("newsPage.form.category")}
              <span className="required-star">*</span>
            </label>
            <CustomSelect<false>
              options={categoryOptions}
              value={
                categoryOptions.find((o) => o.value === formData.category) ||
                null
              }
              onChange={(opt: SingleValue<SelectOption>) =>
                setFormData((prev) => ({
                  ...prev,
                  category: opt?.value || "",
                }))
              }
              placeholder={t("newsPage.form.selectCategory")}
              error={errors.category}
            />
          </div>

          <div className="input-wrapper">
            <div className="news-image-label-row">
              <label className="news-label">
                {t("newsPage.form.image")}
              </label>
              <span className="image-hint">max 5MB</span>
            </div>
            <div
              className={`image-file-input-wrap ${errors.image ? "has-error" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="file-choose-btn">
                {t("newsPage.form.chooseFile")}
              </span>
              <span className="file-name">
                {imageFile
                  ? imageFile.name
                  : t("newsPage.form.imageClick")}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {imagePreview && (
              <img
                src={
                  imagePreview.startsWith("blob:")
                    ? imagePreview
                    : `${API_URL}${imagePreview}`
                }
                alt="preview"
                className="news-image-preview"
              />
            )}
            {errors.image && (
              <span className="field-error">{errors.image}</span>
            )}
          </div>

          <div className="modal-footer news-modal-footer">
            <Button
              variant="outlined"
              onClick={() => handleSubmit("draft")}
            >
              {t("newsPage.saveDraft")}
            </Button>
            <Button onClick={() => handleSubmit("published")}>
              {t("newsPage.publish")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
