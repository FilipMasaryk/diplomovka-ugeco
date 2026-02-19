import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Hook na preklady
import { useAuth } from "../../context/useAuth";
import { getOffersStats } from "../../../../shared/api/stats/stats";
import "./dashboard.css";

interface Stats {
  totalOffers: number;
  activeOffers: number;
  creatorsCount: number;
}

export const Dashboard = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin" || user?.role === "subadmin";

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !isAdmin) return;
      try {
        const data = await getOffersStats(token);
        setStats(data);
      } catch (error) {
        console.error("Stats error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="stats-grid">
        {/* Počet tvorcov */}
        <div className="stat-card">
          <div className="stat-header">{t("dashboard.creatorsCount")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.creatorsCount}
          </div>
          <div className="stat-footer">{t("dashboard.allCountries")}</div>
        </div>

        {/* Počet ponúk */}
        <div className="stat-card">
          <div className="stat-header">{t("dashboard.totalOffers")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.totalOffers}
          </div>
          <div className="stat-footer">{t("dashboard.allCountries")}</div>
        </div>

        {/* Počet aktívnych ponúk */}
        <div className="stat-card">
          <div className="stat-header">{t("dashboard.activeOffers")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.activeOffers}
          </div>
          <div className="stat-footer">{t("dashboard.allCountries")}</div>
        </div>

        {/* Počet krajín */}
        <div className="stat-card">
          <div className="stat-header">{t("dashboard.countriesCount")}</div>
          <div className="stat-value">6</div>
          <div className="stat-footer">&nbsp;</div>
        </div>
      </div>
    </div>
  );
};
