import { useEffect, useRef, useState } from "react";
import { FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import "./navbar.css";
import avatarImg from "../../../images/test.jpg";
import { SK, CZ, PL, DE, HU, GB } from "country-flag-icons/react/3x2";
import { useAuth } from "../../../context/useAuth";
import i18n from "../../../translation";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "SK", label: "SK", component: SK },
  { code: "GB", label: "EN", component: GB },
  { code: "CZ", label: "CZ", component: CZ },
  { code: "PL", label: "PL", component: PL },
  { code: "DE", label: "DE", component: DE },
  { code: "HU", label: "HU", component: HU },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    languages.find((l) => l.code === i18n.language) || languages[0],
  );
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

            <div className="user-container" ref={userMenuRef}>
              <div
                className="user"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <img src={avatarImg} alt="avatar" className="avatar" />
                <span className="username">
                  {user.name} {user.surName}
                </span>
                <FiChevronDown
                  className={`arrow-icon ${userMenuOpen ? "rotate" : ""}`}
                />
              </div>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div
                    className="user-dropdown-option"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                  >
                    <FiLogOut />
                    <span>{t("navbar.logout")}</span>
                  </div>
                </div>
              )}
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
