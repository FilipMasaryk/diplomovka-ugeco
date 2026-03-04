import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import {
  getOffersStats,
  getMonthlyStats,
  type MonthlyStats,
} from "../../../../shared/api/stats/stats";
import { ChartCard } from "../../components/ui/ChartCard/ChartCard";
import "./dashboard.css";

interface Stats {
  totalOffers: number;
  activeOffers: number;
  creatorsCount: number;
}

const formatMonth = (ym: string, locale: string): string => {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  const name = date.toLocaleDateString(locale, { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin" || user?.role === "subadmin";

  useEffect(() => {
    const fetchAll = async () => {
      if (!token || !isAdmin) return;
      try {
        const [statsData, monthlyData] = await Promise.all([
          getOffersStats(token),
          getMonthlyStats(token),
        ]);
        setStats(statsData);
        setMonthly(monthlyData);
      } catch (error) {
        console.error("Stats error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token, isAdmin]);

  const locale = i18n.language === "eng" ? "en" : i18n.language;

  const creatorsChartData = useMemo(
    () =>
      monthly?.creatorsMonthly.map((d) => ({
        name: formatMonth(d.month, locale),
        value: d.count,
      })) ?? [],
    [monthly, locale],
  );

  const offersChartData = useMemo(
    () =>
      monthly?.offersMonthly.map((d) => ({
        name: formatMonth(d.month, locale),
        value: d.count,
      })) ?? [],
    [monthly, locale],
  );

  const chartSubtitle = useMemo(() => {
    if (!monthly || monthly.creatorsMonthly.length === 0) return "";
    const first = monthly.creatorsMonthly[0].month;
    const last = monthly.creatorsMonthly[monthly.creatorsMonthly.length - 1].month;
    return `${formatMonth(first, locale)} - ${formatMonth(last, locale)} ${last.split("-")[0]}`;
  }, [monthly, locale]);

  if (!isAdmin) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">{t("dashboard.creatorsCount")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.creatorsCount}
          </div>
          <div className="stat-footer">{t("dashboard.allCountries")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">{t("dashboard.totalOffers")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.totalOffers}
          </div>
          <div className="stat-footer">{t("dashboard.allCountries")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">{t("dashboard.activeOffers")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.activeOffers}
          </div>
          <div className="stat-footer">{t("dashboard.allCountries")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">{t("dashboard.countriesCount")}</div>
          <div className="stat-value">6</div>
          <div className="stat-footer">&nbsp;</div>
        </div>
      </div>

      {!loading && monthly && (
        <div className="charts-grid">
          <ChartCard
            title={t("dashboard.creatorsChartTitle")}
            subtitle={chartSubtitle}
            footer={t("dashboard.allCountries")}
            data={creatorsChartData}
          />
          <ChartCard
            title={t("dashboard.offersChartTitle")}
            subtitle={chartSubtitle}
            footer={t("dashboard.allCountries")}
            data={offersChartData}
          />
        </div>
      )}
    </div>
  );
};
