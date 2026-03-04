import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import loginImage from "../../images/LoginImage.jpg";
import { InputField } from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { resetPasswordSchema } from "../Login/schemas/loginValidation";
import { resetPassword } from "../../../../shared/api/auth/auth";
import { useToast } from "../../context/useToast";
import "../Login/login.css";

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    passwordConfirm?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = resetPasswordSchema.safeParse({ password, passwordConfirm });
    if (!result.success) {
      const fieldErrors: { password?: string; passwordConfirm?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field as keyof typeof fieldErrors]) {
          fieldErrors[field as keyof typeof fieldErrors] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await resetPassword(token!, password, passwordConfirm);
      setSuccess(true);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <img src={loginImage} alt="Background" className="login-bg" />

      <div className="login-form-container">
        <h1 className="login-title forgot">
          {success
            ? t("resetPassword.successTitle")
            : t("resetPassword.title")}
        </h1>

        {success ? (
          <>
            <p className="sent-description">
              {t("resetPassword.successDescription")}
            </p>
            <Button type="button" onClick={() => navigate("/login")}>
              {t("resetPassword.backToLogin")}
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="forgot-description">
              {t("resetPassword.description")}
            </p>

            <InputField
              label={t("resetPassword.password")}
              type="password"
              placeholder={t("resetPassword.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              hasError={!!errors.password}
              errorMessage={errors.password ? t(errors.password) : undefined}
            />

            <InputField
              label={t("resetPassword.passwordConfirm")}
              type="password"
              placeholder={t("resetPassword.passwordConfirm")}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              hasError={!!errors.passwordConfirm}
              errorMessage={
                errors.passwordConfirm
                  ? t(errors.passwordConfirm)
                  : undefined
              }
            />

            <Button type="submit" disabled={submitting}>
              {t("resetPassword.submitBtn")}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/login")}
            >
              {t("resetPassword.backToLogin")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
