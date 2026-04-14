import { useTranslation } from "react-i18next";
import "./supportpage.css";

export const SupportPage = () => {
  const { t } = useTranslation();

  return (
    <div className="support-page">
      <h1>{t("supportPage.title")}</h1>
      <div className="support-card">
        <p className="support-text">{t("supportPage.description")}</p>
        <p className="support-text">
          {t("supportPage.contactText")}{" "}
          <a href="mailto:support@ugeco.cz" className="support-link">
            support@ugeco.cz
          </a>
        </p>
      </div>
    </div>
  );
};
