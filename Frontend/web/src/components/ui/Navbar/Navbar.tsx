import { useState } from "react";
import { FiBell, FiChevronDown } from "react-icons/fi";
import "./navbar.css";
import avatarImg from "../../../images/test.jpg";
import { SK, CZ, PL, DE, HU, AT } from "country-flag-icons/react/3x2";

const languages = [
  { code: "SK", component: SK },
  { code: "CZ", component: CZ },
  { code: "PL", component: PL },
  { code: "DE", component: DE },
  { code: "HU", component: HU },
  { code: "AT", component: AT },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">UGECO</span>
      </div>

      <div className="navbar-right">
        <FiBell className="icon-btn" />
        <span className="role-badge">ADMIN</span>

        <div className="user">
          <img src={avatarImg} alt="avatar" className="avatar" />
          <span className="username">Filip Masaryk</span>
        </div>

        {/* Dropdown kontajner */}
        <div className="lang-container">
          <div className="lang" onClick={() => setIsOpen(!isOpen)}>
            <selectedLang.component
              title={selectedLang.code}
              className="flag-icon-svg"
            />
            <span>{selectedLang.code}</span>
            <FiChevronDown className={`arrow-icon ${isOpen ? "rotate" : ""}`} />
          </div>

          {/* Samotný rozbaľovací zoznam */}
          {isOpen && (
            <div className="lang-dropdown">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="lang-option"
                  onClick={() => {
                    setSelectedLang(lang);
                    setIsOpen(false);
                  }}
                >
                  <lang.component className="flag-icon-svg" />
                  <span>{lang.code}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
