import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./chartcard.css";

interface ChartCardProps {
  title: string;
  subtitle: string;
  footer: string;
  data: { name: string; value: number }[];
}

export const ChartCard = ({ title, subtitle, footer, data }: ChartCardProps) => {
  return (
    <div className="chart-card">
      <p className="chart-card-title">{title}</p>
      <p className="chart-card-subtitle">{subtitle}</p>

      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: "#181818", opacity: 0.55 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5eaf0",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00bfae"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#00bfae" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card-footer">{footer}</div>
    </div>
  );
};
