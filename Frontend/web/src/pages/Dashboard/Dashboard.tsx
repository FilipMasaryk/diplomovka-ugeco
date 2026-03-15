import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { useBrand } from "../../context/useBrand";
import {
  getOffersStats,
  getMonthlyStats,
  type MonthlyStats,
} from "../../../../shared/api/stats/stats";
import {
  fetchPublishedNews,
  type NewsItem,
} from "../../../../shared/api/news/news";
import {
  fetchBrandStats,
  type BrandStats,
} from "../../../../shared/api/brands/brands";
import { ChartCard } from "../../components/ui/ChartCard/ChartCard";
import { FiCheckCircle, FiBell, FiAlertTriangle } from "react-icons/fi";
import "./dashboard.css";

interface Stats {
  totalOffers: number;
  activeOffers: number;
  creatorsCount: number;
  countriesCount: number;
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
  const isBrandManager = user?.role === "brand_manager";
  const { selectedBrand } = useBrand();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [brandStats, setBrandStats] = useState<BrandStats | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!token) return;
      if (isAdmin) {
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
      } else {
        try {
          const data = await fetchPublishedNews();
          setNewsItems(data);
        } catch (error) {
          console.error("News error:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAll();
  }, [token, isAdmin]);

  useEffect(() => {
    if (!isBrandManager || !selectedBrand) return;
    fetchBrandStats(selectedBrand._id).then(setBrandStats);
  }, [isBrandManager, selectedBrand]);

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

  const countriesLabel =
    user?.role === "subadmin" && user.countries?.length
      ? user.countries.join(", ")
      : t("dashboard.allCountries");

  const categoryIcon = (category: string) => {
    switch (category) {
      case "fix":
        return <FiCheckCircle className="news-category-icon fix" />;
      case "feature":
        return <FiBell className="news-category-icon feature" />;
      case "bug":
        return <FiAlertTriangle className="news-category-icon bug" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("sk-SK");

  if (!isAdmin) {
    return (
      <div className="dashboard-wrapper dashboard-news">
        {isBrandManager && brandStats && (
          <div className="stats-grid brand-stats-grid">
            <div className="stat-card">
              <div className="stat-header">{t("dashboard.totalOffers")}</div>
              <div className="stat-value">{brandStats.totalOffers}</div>
              <div className="stat-footer">{selectedBrand?.name}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">{t("dashboard.activeOffers")}</div>
              <div className="stat-value">{brandStats.activeOffers}</div>
              <div className="stat-footer">{selectedBrand?.name}</div>
            </div>
          </div>
        )}
        <h1 className="dashboard-title">{t("dashboard.newsTitle")}</h1>
        {loading ? (
          <div className="loading-state">{t("newsPage.loading")}</div>
        ) : newsItems.length === 0 ? (
          <div className="no-data-text">{t("newsPage.noData")}</div>
        ) : (
          <div className="news-cards-grid">
            {newsItems.map((item) => (
              <div key={item._id} className="news-card">
                <div className="news-card-header">
                  <h3 className="news-card-title">
                    {item.title || t("newsPage.noTitle")}
                  </h3>
                  {categoryIcon(item.category)}
                </div>
                {item.description && (
                  <p className="news-card-description">{item.description}</p>
                )}
                {item.image && (
                  <img
                    src={`http://localhost:3000${item.image}`}
                    alt={item.title}
                    className="news-card-image"
                  />
                )}
                <div className="news-card-footer">
                  <span className="news-card-date">
                    {formatDate(item.publishedAt || item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">{t("dashboard.creatorsCount")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.creatorsCount}
          </div>
          <div className="stat-footer">{countriesLabel}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">{t("dashboard.totalOffers")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.totalOffers}
          </div>
          <div className="stat-footer">{countriesLabel}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">{t("dashboard.activeOffers")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.activeOffers}
          </div>
          <div className="stat-footer">{countriesLabel}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">{t("dashboard.countriesCount")}</div>
          <div className="stat-value">
            {loading ? "..." : stats?.countriesCount}
          </div>
          <div className="stat-footer">&nbsp;</div>
        </div>
      </div>

      {!loading && monthly && (
        <div className="charts-grid">
          <ChartCard
            title={t("dashboard.creatorsChartTitle")}
            subtitle={chartSubtitle}
            footer={countriesLabel}
            data={creatorsChartData}
          />
          <ChartCard
            title={t("dashboard.offersChartTitle")}
            subtitle={chartSubtitle}
            footer={countriesLabel}
            data={offersChartData}
          />
        </div>
      )}
    </div>
  );
};
