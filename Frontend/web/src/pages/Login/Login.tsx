import { useState } from "react";
import "./login.css";
import loginImage from "../../images/LoginImage.jpg";
import { InputField } from "../../components/ui/InputField/InputField";
import { Button } from "../../components/ui/Button/Button";
import { forgotPasswordSchema, loginSchema } from "./schemas/loginValidation";

export const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState<"login" | "forgot" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Stav pre chyby
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [forgotErrors, setForgotErrors] = useState<{ email?: string }>({});

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      // Zobrazíme chyby pod inputom
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      console.log("Prihlásenie OK", result.data);
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
      console.log("Obnova hesla OK, posielam email na:", email);
      setView("sent");
    }
  };

  return (
    <div className="login-page">
      <img src={loginImage} alt="Login background" className="login-bg" />

      <div className="login-form-container">
        {/* Nadpis podľa aktuálneho view */}
        <h1 className={`login-title ${view}`}>
          {view === "login" && (
            <>
              Prihlásenie <br /> do účtu
            </>
          )}
          {view === "forgot" && "Zabudnuté heslo"}
          {view === "sent" && (
            <>
              Odoslali sme e-mail <br /> do tvojej schránky
            </>
          )}
        </h1>

        {/* LOGIN VIEW */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <InputField
              label="E-mail"
              type="email"
              placeholder="Zadajte e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              hasError={!!errors.email}
              errorMessage={errors.email}
            />

            <InputField
              label="Heslo"
              type="password"
              placeholder="Zadajte heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              hasError={!!errors.password}
              errorMessage={errors.password}
            />

            <div className="form-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Zapamätať si
              </label>
            </div>

            <Button type="submit">Prihlásiť</Button>
            <Button
              variant="outlined"
              type="button"
              onClick={() => setView("forgot")}
            >
              Zabudnuté heslo
            </Button>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === "forgot" && (
          <form onSubmit={handleForgotSubmit}>
            <p className="forgot-description">Zadaj svoju e-mailovú adresu.</p>
            <InputField
              label="E-mail"
              type="email"
              placeholder="Zadajte e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              hasError={!!forgotErrors.email}
              errorMessage={forgotErrors.email}
            />
            <Button type="submit">Obnoviť heslo</Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setView("login")}
            >
              Späť na prihlásenie
            </Button>
          </form>
        )}

        {/* EMAIL SENT VIEW */}
        {view === "sent" && (
          <>
            <p className="sent-description">
              E-mail bol odoslaný. Ak e-mail neobdržíš <br />
              do 5-10 minút, skús ho poslať znovu alebo kontaktuj našu podporu.
            </p>
            <Button type="button" onClick={() => setView("login")}>
              Späť na prihlásenie
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
