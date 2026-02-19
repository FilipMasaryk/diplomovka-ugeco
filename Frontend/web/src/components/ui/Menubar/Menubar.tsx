import { type FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiUsers,
  FiTag,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiChevronDown,
  FiLayout,
  FiBell,
  FiGlobe,
  FiSmile,
} from "react-icons/fi";
import "./menubar.css";
import type { UserRole } from "../../../types/userRoles";
import avatarImg from "../../../images/test.jpg";

interface MenubarProps {
  role: UserRole;
}

export const Menubar: FC<MenubarProps> = ({ role }) => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState<string>("overview"); // Používame kľúče pre active state
  const [brandsOpen, setBrandsOpen] = useState<boolean>(false);
  const [newsOpen, setNewsOpen] = useState<boolean>(false);
  const [brandSelectorOpen, setBrandSelectorOpen] = useState<boolean>(false);
  const renderMenuItem = (
    id: string, // ID pre preklad a active state
    label: string, // Preložený text
    icon: React.ReactNode,
    hasSubmenu?: boolean,
    isOpen?: boolean,
    onClickSubmenu?: () => void,
  ) => {
    const isActive = activeItem === id;

    return (
      <div className="menu-section">
        <div
          className={`menu-item ${isActive ? "active" : ""}`}
          onClick={() => {
            if (hasSubmenu && onClickSubmenu) {
              onClickSubmenu();
            } else {
              setActiveItem(id);
            }
          }}
        >
          {icon}
          <span>{label}</span>
          {hasSubmenu && (
            <FiChevronDown className={`chevron ${isOpen ? "rotate" : ""}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className="menubar">
      {role === "brand_manager" && (
        <div className="brand-selector-section">
          <div
            className={`brand-selector-box ${brandSelectorOpen ? "active" : ""}`}
            onClick={() => setBrandSelectorOpen(!brandSelectorOpen)}
          >
            {/* HLAVNÁ VYBRATÁ ZNAČKA */}
            <div className="brand-selector-content">
              <div className="brand-icon-wrapper">
                <img
                  src={avatarImg}
                  alt="current-brand"
                  className="brand-img"
                />
              </div>
              <span className="brand-name">Gems</span>
              <FiChevronDown
                className={`brand-chevron ${brandSelectorOpen ? "rotate" : ""}`}
              />
            </div>
            {brandSelectorOpen && (
              <div className="brand-dropdown">
                <div className="brand-dropdown-item">
                  <div className="brand-icon-wrapper">
                    <img
                      src={avatarImg}
                      alt="other-brand"
                      className="brand-img"
                    />
                  </div>
                  <span className="brand-name">Iná Značka</span>
                </div>

                <div className="brand-dropdown-item">
                  <div className="brand-icon-wrapper">
                    <img
                      src={avatarImg}
                      alt="another-brand"
                      className="brand-img"
                    />
                  </div>
                  <span className="brand-name">Ďalšia Značka</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN & SUBADMIN */}
      {(role === "admin" || role === "subadmin") && (
        <>
          {renderMenuItem(
            "overview",
            t("menubar.overview"),
            <FiLayout className="menu-icon" />,
          )}
          {renderMenuItem(
            "users",
            t("menubar.users"),
            <FiUsers className="menu-icon" />,
          )}
          {renderMenuItem(
            "brands",
            t("menubar.brands"),
            <FiTag className="menu-icon" />,
            true,
            brandsOpen,
            () => setBrandsOpen(!brandsOpen),
          )}
          {brandsOpen && (
            <div className="submenu">
              <div
                className={`submenu-item ${activeItem === "brandList" ? "active" : ""}`}
                onClick={() => setActiveItem("brandList")}
              >
                {t("menubar.brandList")}
              </div>
              <div
                className={`submenu-item ${activeItem === "offerList" ? "active" : ""}`}
                onClick={() => setActiveItem("offerList")}
              >
                {t("menubar.offerList")}
              </div>
            </div>
          )}
          {renderMenuItem(
            "stats",
            t("menubar.stats"),
            <FiBarChart2 className="menu-icon" />,
          )}
        </>
      )}

      {/* CREATOR */}
      {role === "creator" && (
        <>
          {renderMenuItem(
            "offers",
            t("menubar.offers"),
            <FiLayout className="menu-icon" />,
          )}
          {renderMenuItem(
            "profile",
            t("menubar.profile"),
            <FiUsers className="menu-icon" />,
          )}
        </>
      )}

      {/* BRAND MANAGER */}
      {role === "brand_manager" && (
        <>
          {renderMenuItem(
            "overview",
            t("menubar.overview"),
            <FiLayout className="menu-icon" />,
          )}
          {renderMenuItem(
            "myOffers",
            t("menubar.myOffers"),
            <FiLayout className="menu-icon" />,
          )}
          {renderMenuItem(
            "managers",
            t("menubar.managers"),
            <FiSmile className="menu-icon" />,
          )}
        </>
      )}

      <div className="divider" />

      {/* SPOLOČNÉ MENU */}
      {renderMenuItem(
        "settings",
        t("menubar.settings"),
        <FiSettings className="menu-icon" />,
      )}

      {role === "admin" || role === "subadmin" ? (
        <>
          {renderMenuItem(
            "news",
            t("menubar.news"),
            <FiBell className="menu-icon" />,
            true,
            newsOpen,
            () => setNewsOpen(!newsOpen),
          )}
          {newsOpen && (
            <div className="submenu">
              <div
                className={`submenu-item ${activeItem === "newsAdmin" ? "active" : ""}`}
                onClick={() => setActiveItem("newsAdmin")}
              >
                {t("menubar.admin")}
              </div>
              <div
                className={`submenu-item ${activeItem === "newsCreator" ? "active" : ""}`}
                onClick={() => setActiveItem("newsCreator")}
              >
                {t("menubar.creator")}
              </div>
              <div
                className={`submenu-item ${activeItem === "newsBrand" ? "active" : ""}`}
                onClick={() => setActiveItem("newsBrand")}
              >
                {t("menubar.brand")}
              </div>
            </div>
          )}
          {renderMenuItem(
            "translations",
            t("menubar.translations"),
            <FiGlobe className="menu-icon" />,
          )}
        </>
      ) : (
        renderMenuItem(
          "support",
          t("menubar.support"),
          <FiHelpCircle className="menu-icon" />,
        )
      )}
    </aside>
  );
};
