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
  FiChevronLeft,
  FiMenu,
  FiSidebar,
  FiPackage,
} from "react-icons/fi";
import "./menubar.css";
import type { UserRole } from "../../../types/userRoles";
import avatarImg from "../../../images/test.jpg";
import { useNavigate, useLocation } from "react-router-dom";

interface MenubarProps {
  role: UserRole;
}

export const Menubar: FC<MenubarProps> = ({ role }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("overview");
  const [brandsOpen, setBrandsOpen] = useState<boolean>(false);
  const [newsOpen, setNewsOpen] = useState<boolean>(false);
  const [brandSelectorOpen, setBrandSelectorOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const renderMenuItem = (
    path: string,
    label: string,
    icon: React.ReactNode,
    hasSubmenu?: boolean,
    isOpen?: boolean,
    onClickSubmenu?: () => void,
  ) => {
    const isActive = location.pathname === path;

    return (
      <div className="menu-section">
        <div
          className={`menu-item ${isActive ? "active" : ""} ${isCollapsed ? "collapsed-item" : ""}`}
          onClick={() => {
            if (hasSubmenu && onClickSubmenu) {
              if (isCollapsed) {
                setIsCollapsed(false);
                onClickSubmenu();
              } else {
                onClickSubmenu();
              }
            } else {
              navigate(path);
            }
          }}
          title={isCollapsed ? label : ""}
        >
          {icon}
          {!isCollapsed && <span>{label}</span>}
          {!isCollapsed && hasSubmenu && (
            <FiChevronDown className={`chevron ${isOpen ? "rotate" : ""}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className={`menubar ${isCollapsed ? "collapsed" : ""}`}>
      {/* HEADER S BUTTONOM */}
      <div
        className={`menubar-header ${isCollapsed ? "centered" : "right-aligned"}`}
      >
        <button
          className="collapse-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <FiSidebar />
        </button>
      </div>
      {/* BRAND SELECTOR (zobrazený inak pri zbalení) */}
      {role === "brand_manager" && (
        <div className="brand-selector-section">
          <div
            className={`brand-selector-box ${brandSelectorOpen ? "active" : ""} ${isCollapsed ? "collapsed-box" : ""}`}
            onClick={() =>
              !isCollapsed && setBrandSelectorOpen(!brandSelectorOpen)
            }
          >
            <div className="brand-selector-content">
              <div className="brand-icon-wrapper">
                <img
                  src={avatarImg}
                  alt="current-brand"
                  className="brand-img"
                />
              </div>
              {!isCollapsed && (
                <>
                  <span className="brand-name">Gems</span>
                  <FiChevronDown
                    className={`brand-chevron ${brandSelectorOpen ? "rotate" : ""}`}
                  />
                </>
              )}
            </div>

            {brandSelectorOpen && !isCollapsed && (
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

      <div className="menu-scroll-container">
        {/* ADMIN & SUBADMIN */}
        {(role === "admin" || role === "subadmin") && (
          <>
            {renderMenuItem(
              "/",
              t("menubar.overview"),
              <FiLayout className="menu-icon" />,
            )}
            {renderMenuItem(
              "/users",
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
            {brandsOpen && !isCollapsed && (
              <div className="submenu">
                <div
                  className={`submenu-item ${location.pathname === "/brands" ? "active" : ""}`}
                  onClick={() => navigate("/brands")}
                >
                  {t("menubar.brandList")}
                </div>
                <div
                  className={`submenu-item ${location.pathname === "/offers" ? "active" : ""}`}
                  onClick={() => navigate("/offers")}
                >
                  {t("menubar.offerList")}
                </div>
              </div>
            )}
            {role === "admin" &&
              renderMenuItem(
                "/packages",
                t("menubar.packages"),
                <FiPackage className="menu-icon" />,
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
            {newsOpen && !isCollapsed && (
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
      </div>
    </aside>
  );
};
