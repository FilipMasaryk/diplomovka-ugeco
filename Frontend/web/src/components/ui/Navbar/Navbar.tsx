import { useState } from "react";
import { FiBell, FiChevronDown } from "react-icons/fi";
import "./navbar.css";
import avatarImg from "../../../images/test.jpg";
import { SK, CZ, PL, DE, HU, GB } from "country-flag-icons/react/3x2";
import { useAuth } from "../../../context/useAuth";
import i18n from "../../../translation";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "SK", label: "SK", component: SK },
  { code: "GB", label: "EN", component: GB }, // Tu je zmena: code ostáva GB pre i18n, label je EN pre užívateľa
  { code: "CZ", label: "CZ", component: CZ },
  { code: "PL", label: "PL", component: PL },
  { code: "DE", label: "DE", component: DE },
  { code: "HU", label: "HU", component: HU },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    languages.find((l) => l.code === i18n.language) || languages[0],
  );
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">UGECO</span>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <FiBell className="icon-btn" />

            <span className={`role-badge role-${user.role}`}>
              {t(`roles.${user.role}`)}
            </span>

            <div className="user">
              <img src={avatarImg} alt="avatar" className="avatar" />
              <span className="username">
                {user.name} {user.surName}
              </span>
            </div>
          </>
        )}

        <div className="lang-container">
          <div className="lang" onClick={() => setIsOpen(!isOpen)}>
            <selectedLang.component
              title={selectedLang.label}
              className="flag-icon-svg"
            />
            <span>{selectedLang.label}</span>
            <FiChevronDown className={`arrow-icon ${isOpen ? "rotate" : ""}`} />
          </div>

          {isOpen && (
            <div className="lang-dropdown">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="lang-option"
                  onClick={() => {
                    setSelectedLang(lang);
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                >
                  <lang.component className="flag-icon-svg" />
                  <span>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
