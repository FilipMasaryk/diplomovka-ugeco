import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import "./navbar.css";
import { SK, CZ, PL, DE, HU, GB } from "country-flag-icons/react/3x2";
import { useAuth } from "../../../context/useAuth";
import i18n from "../../../translation";
import { useTranslation } from "react-i18next";
import {
  fetchUnreadNewsCount,
  fetchRecentNews,
  markNewsSeen,
  type NewsItem,
} from "../../../../../shared/api/news/news";
import { API_URL } from "../../../../../shared/config";

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
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadCount = () => {
      fetchUnreadNewsCount()
        .then(setUnreadCount)
        .catch(() => {});
    };
    loadCount();
    const interval = setInterval(loadCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleBellClick = useCallback(async () => {
    if (!bellOpen) {
      const news = await fetchRecentNews();
      setRecentNews(news);
      await markNewsSeen();
      setUnreadCount(0);
    }
    setBellOpen((prev) => !prev);
  }, [bellOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">UGECO</span>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <div className="bell-container" ref={bellRef}>
              <div className="bell-wrapper" onClick={handleBellClick}>
                <FiBell className="icon-btn" />
                {unreadCount > 0 && <span className="bell-dot" />}
              </div>
              {bellOpen && (
                <div className="bell-dropdown">
                  {recentNews.length === 0 ? (
                    <div className="bell-empty">{t("navbar.noNews")}</div>
                  ) : (
                    recentNews.map((item) => (
                      <div
                        key={item._id}
                        className="bell-item"
                        onClick={() => {
                          setBellOpen(false);
                          navigate("/news");
                        }}
                      >
                        <span className="bell-item-title">{item.title}</span>
                        <span className="bell-item-date">
                          {new Date(
                            item.publishedAt || item.createdAt,
                          ).toLocaleDateString("sk-SK")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <span className={`role-badge role-${user.role}`}>
              {t(`roles.${user.role}`)}
            </span>

            <div className="user-container" ref={userMenuRef}>
              <div
                className="user"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.avatar ? (
                  <img
                    src={`${API_URL}${user.avatar}`}
                    alt="avatar"
                    className="avatar"
                  />
                ) : (
                  <div className="avatar avatar-initials">
                    {user.name.charAt(0)}
                    {user.surName.charAt(0)}
                  </div>
                )}
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
