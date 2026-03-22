import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import {
  fetchMe,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} from "../../../../shared/api/auth/auth";
import { API_URL } from "../../../../shared/config";
import "./settings.css";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, loginUser } = useAuth();
  const { showToast } = useToast();
  const isCreator = user?.role === "creator";

  const [name, setName] = useState(user?.name ?? "");
  const [surName, setSurName] = useState(user?.surName ?? "");
  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreator) {
      fetchMe()
        .then((data) => {
          setIco(data.ico || "");
          setDic(data.dic || "");
        })
        .catch(() => {});
    }
  }, [isCreator]);

  const currentAvatarSrc = avatarPreview
    ? avatarPreview
    : user?.avatar
      ? `${API_URL}${user.avatar}`
      : null;

  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const result = await deleteAvatar();
      if (result.access_token) {
        loginUser(result.access_token);
      }
      setAvatarPreview(null);
      showToast(t("settingsPage.avatarDeleted"), "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      if (result.access_token) {
        loginUser(result.access_token);
      }
      showToast(t("settingsPage.avatarUpdated"), "success");
    } catch (err: any) {
      showToast(err.message, "error");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("errors.required");
    if (!surName.trim()) errs.surName = t("errors.required");
    if (password && !passwordConfirmation)
      errs.passwordConfirmation = t("errors.required");
    if (!password && passwordConfirmation) errs.password = t("errors.required");
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const payload: Record<string, string> = {
      name: name.trim(),
      surName: surName.trim(),
    };

    if (isCreator) {
      payload.ico = ico;
      payload.dic = dic;
    }

    if (password || passwordConfirmation) {
      payload.password = password;
      payload.passwordConfirmation = passwordConfirmation;
    }

    try {
      const updated = await updateProfile(payload);
      if (updated.access_token) {
        loginUser(updated.access_token);
      }
      showToast(t("settingsPage.successMessage"), "success");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>{t("settingsPage.title")}</h1>

      <div className="settings-avatar-section">
        {currentAvatarSrc ? (
          <img
            src={currentAvatarSrc}
            alt="avatar"
            className="settings-avatar-img"
            onClick={() => fileInputRef.current?.click()}
          />
        ) : (
          <div
            className="settings-avatar-img settings-avatar-initials"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.name.charAt(0)}
            {user?.surName.charAt(0)}
          </div>
        )}
        <div className="settings-avatar-info">
          <span className="settings-avatar-label">
            {t("settingsPage.profilePicture")}
          </span>
          <div className="settings-avatar-buttons">
            <button
              type="button"
              className="settings-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? "..." : t("settingsPage.changeAvatar")}
            </button>
            {user?.avatar && (
              <button
                type="button"
                className="settings-avatar-btn settings-avatar-btn-delete"
                onClick={handleDeleteAvatar}
                disabled={uploadingAvatar}
              >
                {t("settingsPage.deleteAvatar")}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <div className="settings-grid">
        <InputField
          label={t("settingsPage.name")}
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: "" }));
          }}
          placeholder={t("settingsPage.name")}
          hasError={!!errors.name}
          errorMessage={errors.name}
        />
        <InputField
          label={t("settingsPage.surname")}
          required
          value={surName}
          onChange={(e) => {
            setSurName(e.target.value);
            if (errors.surName) setErrors((p) => ({ ...p, surName: "" }));
          }}
          placeholder={t("settingsPage.surname")}
          hasError={!!errors.surName}
          errorMessage={errors.surName}
        />
        <InputField
          label="E-mail"
          type="email"
          value={user?.email ?? ""}
          onChange={() => {}}
          disabled
        />
      </div>

      {isCreator && (
        <>
          <h2 className="settings-section-title">
            {t("settingsPage.billingTitle")}
          </h2>
          <div className="settings-grid">
            <InputField
              label={t("settingsPage.ico")}
              value={ico}
              onChange={(e) => setIco(e.target.value)}
              placeholder={t("settingsPage.ico")}
            />
            <InputField
              label={t("settingsPage.dic")}
              value={dic}
              onChange={(e) => setDic(e.target.value)}
              placeholder={t("settingsPage.dic")}
            />
          </div>
        </>
      )}

      <h2 className="settings-section-title">
        {t("settingsPage.newPasswordTitle")}
      </h2>
      <div className="settings-grid">
        <InputField
          label={t("settingsPage.newPassword")}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: "" }));
          }}
          placeholder="*****"
          hasError={!!errors.password}
          errorMessage={errors.password}
        />
        <InputField
          label={t("settingsPage.passwordConfirm")}
          type="password"
          value={passwordConfirmation}
          onChange={(e) => {
            setPasswordConfirmation(e.target.value);
            if (errors.passwordConfirmation)
              setErrors((p) => ({ ...p, passwordConfirmation: "" }));
          }}
          placeholder="*****"
          hasError={!!errors.passwordConfirmation}
          errorMessage={errors.passwordConfirmation}
        />
      </div>

      <div className="settings-footer">
        <Button onClick={handleSubmit} disabled={submitting}>
          {t("settingsPage.saveBtn")}
        </Button>
      </div>
    </div>
  );
};
