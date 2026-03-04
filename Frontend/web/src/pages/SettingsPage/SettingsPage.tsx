import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { updateProfile } from "../../../../shared/api/auth/auth";
import { settingsSchema } from "../Login/schemas/loginValidation";
import "./settings.css";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, loginUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [surName, setSurName] = useState(user?.surName ?? "");
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const result = settingsSchema.safeParse({
      name: name.trim(),
      surName: surName.trim(),
      email,
      emailConfirmation,
      password,
      passwordConfirmation,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const payload: Record<string, string> = {
      name: name.trim(),
      surName: surName.trim(),
    };

    if (email) {
      payload.email = email;
      payload.emailConfirmation = emailConfirmation;
    }
    if (password) {
      payload.password = password;
      payload.passwordConfirmation = passwordConfirmation;
    }

    try {
      const updated = await updateProfile(payload);
      if (updated.access_token) {
        loginUser(updated.access_token);
      }
      showToast(t("settingsPage.successMessage"), "success");
      setEmail("");
      setEmailConfirmation("");
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

      <div className="settings-grid">
        <InputField
          label={t("settingsPage.name")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("settingsPage.name")}
          hasError={!!errors.name}
          errorMessage={errors.name ? t(errors.name) : undefined}
        />
        <InputField
          label={t("settingsPage.surname")}
          required
          value={surName}
          onChange={(e) => setSurName(e.target.value)}
          placeholder={t("settingsPage.surname")}
          hasError={!!errors.surName}
          errorMessage={errors.surName ? t(errors.surName) : undefined}
        />
      </div>

      <h2 className="settings-section-title">
        {t("settingsPage.newEmailTitle")}
      </h2>
      <div className="settings-grid">
        <InputField
          label={t("settingsPage.newEmail")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("settingsPage.newEmailPlaceholder")}
          hasError={!!errors.email}
          errorMessage={errors.email ? t(errors.email) : undefined}
        />
        <InputField
          label={t("settingsPage.emailConfirm")}
          type="email"
          value={emailConfirmation}
          onChange={(e) => setEmailConfirmation(e.target.value)}
          placeholder={t("settingsPage.newEmailPlaceholder")}
          hasError={!!errors.emailConfirmation}
          errorMessage={
            errors.emailConfirmation
              ? t(errors.emailConfirmation)
              : undefined
          }
        />
      </div>

      <h2 className="settings-section-title">
        {t("settingsPage.newPasswordTitle")}
      </h2>
      <div className="settings-grid">
        <InputField
          label={t("settingsPage.newPassword")}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="*****"
          hasError={!!errors.password}
          errorMessage={errors.password ? t(errors.password) : undefined}
        />
        <InputField
          label={t("settingsPage.passwordConfirm")}
          type="password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="*****"
          hasError={!!errors.passwordConfirmation}
          errorMessage={
            errors.passwordConfirmation
              ? t(errors.passwordConfirmation)
              : undefined
          }
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
