import { useState } from "react";
import "./login.css";
import loginImage from "../../images/LoginImage.jpg";
import { InputField } from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { forgotPasswordSchema, loginSchema } from "./schemas/loginValidation";
import { login } from "../../../../shared/api/auth/auth";
import { useAuth } from "../../context/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState<"login" | "forgot" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [forgotErrors, setForgotErrors] = useState<{ email?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { loginUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const result = loginSchema.safeParse({ email, password, rememberMe });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      const data = await login(result.data);
      loginUser(data.access_token);
      navigate("/");
    } catch (error: any) {
      setApiError(error.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: { email?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
      });
      setForgotErrors(fieldErrors);
    } else {
      setForgotErrors({});
      setView("sent");
    }
  };

  return (
    <div className="login-page">
      <img src={loginImage} alt="Login background" className="login-bg" />

      <div className="login-form-container">
        <h1 className={`login-title ${view}`}>
          {view === "login" && t("login.title")}
          {view === "forgot" && t("login.forgotTitle")}
          {view === "sent" && t("login.sentTitle")}
        </h1>

        {view === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <InputField
              label={t("login.email")}
              type="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              hasError={!!errors.email}
              errorMessage={errors.email ? t(errors.email) : undefined}
            />

            <InputField
              label={t("login.password")}
              type="password"
              placeholder={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              hasError={!!errors.password}
              errorMessage={errors.password ? t(errors.password) : undefined}
            />

            <div className="form-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                {t("login.rememberMe")}
              </label>
            </div>

            {apiError && <p className="error-text">{apiError}</p>}

            <Button type="submit">{t("login.loginBtn")}</Button>
            <Button
              variant="outlined"
              type="button"
              onClick={() => setView("forgot")}
            >
              {t("login.forgotBtn")}
            </Button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgotSubmit}>
            <p className="forgot-description">{t("login.forgotDescription")}</p>
            <InputField
              label={t("login.email")}
              type="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              hasError={!!forgotErrors.email}
              errorMessage={
                forgotErrors.email ? t(forgotErrors.email) : undefined
              }
            />
            <Button type="submit">{t("login.resetBtn")}</Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setView("login")}
            >
              {t("login.backToLogin")}
            </Button>
          </form>
        )}

        {view === "sent" && (
          <>
            <p className="sent-description">{t("login.sentDescription")}</p>
            <Button type="button" onClick={() => setView("login")}>
              {t("login.backToLogin")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
