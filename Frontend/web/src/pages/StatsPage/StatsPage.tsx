import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import {
  getStatsOverview,
  getStatsMonthly,
  getStatsRoles,
  getStatsCategories,
  getStatsCountries,
  type OverviewStats,
  type MonthlyOverview,
  type RoleDistribution,
  type CategoryDistribution,
  type CountryDistribution,
} from "../../../../shared/api/stats/stats";
import { ChartCard } from "../../components/ui/ChartCard/ChartCard";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import "./statspage.css";

const PIE_COLORS = [
  "#00bfae",
  "#ff2941",
  "#e65c1a",
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#3b82f6",
];

const formatMonth = (ym: string, locale: string): string => {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  const name = date.toLocaleDateString(locale, { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const StatsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyOverview | null>(null);
  const [roles, setRoles] = useState<RoleDistribution[]>([]);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [countries, setCountries] = useState<CountryDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, mo, ro, ca, co] = await Promise.all([
          getStatsOverview(),
          getStatsMonthly(),
          getStatsRoles(),
          getStatsCategories(),
          getStatsCountries(),
        ]);
        setOverview(ov);
        setMonthly(mo);
        setRoles(ro);
        setCategories(ca);
        setCountries(co);
      } catch (error) {
        console.error("Stats error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const locale = i18n.language === "eng" ? "en" : i18n.language;

  const chartSubtitle = useMemo(() => {
    if (!monthly || monthly.usersMonthly.length === 0) return "";
    const first = monthly.usersMonthly[0].month;
    const last = monthly.usersMonthly[monthly.usersMonthly.length - 1].month;
    return `${formatMonth(first, locale)} - ${formatMonth(last, locale)} ${last.split("-")[0]}`;
  }, [monthly, locale]);

  const usersChartData = useMemo(
    () =>
      monthly?.usersMonthly.map((d) => ({
        name: formatMonth(d.month, locale),
        value: d.count,
      })) ?? [],
    [monthly, locale],
  );

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

  const countriesLabel =
    user?.role === "subadmin" && user.countries?.length
      ? user.countries.join(", ")
      : t("dashboard.allCountries");

  const rolesPieData = useMemo(
    () =>
      roles.map((r) => ({
        name: t(`roles.${r.role}`),
        value: r.count,
      })),
    [roles, t],
  );

  const categoriesPieData = useMemo(
    () =>
      categories.slice(0, 10).map((c) => ({
        name: t(`categories.${c.category}`),
        value: c.count,
      })),
    [categories, t],
  );

  const countriesPieData = useMemo(
    () =>
      countries.map((c) => ({
        name: c.country,
        value: c.count,
      })),
    [countries],
  );

  if (loading) {
    return (
      <div className="stats-page">
        <h1 className="stats-page-title">{t("statsPage.title")}</h1>
        <div className="loading-state">...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: t("statsPage.totalUsers"),
      value: overview?.totalUsers ?? 0,
    },
    {
      label: t("statsPage.creatorsCount"),
      value: overview?.creatorsCount ?? 0,
    },
    {
      label: t("statsPage.brandsCount"),
      value: overview?.brandsCount ?? 0,
    },
    {
      label: t("statsPage.totalOffers"),
      value: overview?.totalOffers ?? 0,
    },
    {
      label: t("statsPage.activeOffers"),
      value: overview?.activeOffers ?? 0,
    },
    {
      label: t("statsPage.countriesCount"),
      value: overview?.countriesCount ?? 0,
    },
    {
      label: t("statsPage.archivedUsers"),
      value: overview?.archivedUsers ?? 0,
    },
    {
      label: t("statsPage.assignedPackages"),
      value: overview?.assignedPackages ?? 0,
    },
  ];

  return (
    <div className="stats-page">
      <h1 className="stats-page-title">{t("statsPage.title")}</h1>

      <div className="stats-cards-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-header">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-footer">{countriesLabel}</div>
          </div>
        ))}
      </div>

      <div className="stats-charts-grid">
        <ChartCard
          title={t("statsPage.usersChart")}
          subtitle={chartSubtitle}
          footer={countriesLabel}
          data={usersChartData}
        />
        <ChartCard
          title={t("statsPage.offersChart")}
          subtitle={chartSubtitle}
          footer={countriesLabel}
          data={offersChartData}
        />
        <ChartCard
          title={t("statsPage.creatorsChart")}
          subtitle={chartSubtitle}
          footer={countriesLabel}
          data={creatorsChartData}
        />
      </div>

      <div className="stats-pie-grid">
        <PieCard title={t("statsPage.rolesPie")} data={rolesPieData} footer={countriesLabel} />
        <PieCard title={t("statsPage.categoriesPie")} data={categoriesPieData} footer={countriesLabel} />
        <PieCard title={t("statsPage.countriesPie")} data={countriesPieData} footer={countriesLabel} />
      </div>
    </div>
  );
};

const PieCard = ({
  title,
  data,
  footer,
}: {
  title: string;
  data: { name: string; value: number }[];
  footer: string;
}) => (
  <div className="pie-card">
    <p className="pie-card-title">{title}</p>
    <div className="pie-card-body">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5eaf0",
              fontSize: 13,
              fontFamily: "Inter",
            }}
            isAnimationActive={false}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, fontFamily: "Inter" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="pie-card-footer">{footer}</div>
  </div>
);
