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
  FiSmile,
  FiSliders,
  FiSidebar,
  FiPackage,
} from "react-icons/fi";
import "./menubar.css";
import type { UserRole } from "../../../types/userRoles";
import { useNavigate, useLocation } from "react-router-dom";
import { useBrand } from "../../../context/useBrand";
import { API_URL } from "../../../../../shared/config";

interface MenubarProps {
  role: UserRole;
}

export const Menubar: FC<MenubarProps> = ({ role }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [brandsOpen, setBrandsOpen] = useState<boolean>(false);
  const [newsOpen, setNewsOpen] = useState<boolean>(false);
  const [brandSelectorOpen, setBrandSelectorOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { brands, selectedBrand, setSelectedBrand } = useBrand();

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
      {/* BRAND SELECTOR */}
      {role === "brand_manager" && selectedBrand && (
        <div className="brand-selector-section">
          <div
            className={`brand-selector-box ${brandSelectorOpen ? "active" : ""} ${isCollapsed ? "collapsed-box" : ""}`}
            onClick={() => setBrandSelectorOpen(!brandSelectorOpen)}
          >
            <div
              className={`brand-selector-content ${isCollapsed ? "collapsed-content" : ""}`}
            >
              <div className="brand-icon-wrapper">
                {selectedBrand.logo ? (
                  <img
                    src={`${API_URL}${selectedBrand.logo}`}
                    alt={selectedBrand.name}
                    className="brand-img"
                  />
                ) : (
                  <div className="brand-img-placeholder">
                    {selectedBrand.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span className="brand-name">{selectedBrand.name}</span>
                  <FiChevronDown
                    className={`brand-chevron ${brandSelectorOpen ? "rotate" : ""}`}
                  />
                </>
              )}
            </div>

            {brandSelectorOpen && brands.length > 1 && (
              <div
                className={`brand-dropdown ${isCollapsed ? "collapsed-dropdown" : ""}`}
              >
                {brands
                  .filter((b) => b._id !== selectedBrand._id)
                  .map((brand) => (
                    <div
                      key={brand._id}
                      className="brand-dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBrand(brand);
                        setBrandSelectorOpen(false);
                      }}
                      title={brand.name}
                    >
                      <div className="brand-icon-wrapper">
                        {brand.logo ? (
                          <img
                            src={`${API_URL}${brand.logo}`}
                            alt={brand.name}
                            className="brand-img"
                          />
                        ) : (
                          <div className="brand-img-placeholder">
                            {brand.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {!isCollapsed && (
                        <span className="brand-name">{brand.name}</span>
                      )}
                    </div>
                  ))}
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
              "/creator-offers",
              t("menubar.offers"),
              <FiLayout className="menu-icon" />,
            )}
            {renderMenuItem(
              "/profile",
              t("menubar.profile"),
              <FiUsers className="menu-icon" />,
            )}
            {renderMenuItem(
              "/news",
              t("menubar.news"),
              <FiBell className="menu-icon" />,
            )}
          </>
        )}

        {/* BRAND MANAGER */}
        {role === "brand_manager" && (
          <>
            {renderMenuItem(
              "/",
              t("menubar.overview"),
              <FiLayout className="menu-icon" />,
            )}
            {renderMenuItem(
              "/my-offers",
              t("menubar.myOffers"),
              <FiLayout className="menu-icon" />,
            )}
            {renderMenuItem(
              "/managers",
              t("menubar.managers"),
              <FiSmile className="menu-icon" />,
            )}
          </>
        )}

        <div className="divider" />

        {role === "brand_manager" &&
          renderMenuItem(
            "/brand-settings",
            t("menubar.brandSettings"),
            <FiSliders className="menu-icon" />,
          )}

        {/* SPOLOČNÉ MENU */}
        {renderMenuItem(
          "/settings",
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
                  className={`submenu-item ${location.pathname === "/news/admin" ? "active" : ""}`}
                  onClick={() => navigate("/news/admin")}
                >
                  {t("menubar.admin")}
                </div>
                <div
                  className={`submenu-item ${location.pathname === "/news/creator" ? "active" : ""}`}
                  onClick={() => navigate("/news/creator")}
                >
                  {t("menubar.creator")}
                </div>
                <div
                  className={`submenu-item ${location.pathname === "/news/brand" ? "active" : ""}`}
                  onClick={() => navigate("/news/brand")}
                >
                  {t("menubar.brand")}
                </div>
              </div>
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
