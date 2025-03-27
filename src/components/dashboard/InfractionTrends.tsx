import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Infraction } from "@/types/dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InfractionTrendsProps {
  infractions: Infraction[];
}

export function InfractionTrends({ infractions }: InfractionTrendsProps) {
  // Process data for the chart
  const data = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString("es-ES", { month: "short" });

    const monthInfractions = infractions.filter((inf) => {
      const infDate = new Date(inf.date);
      return (
        infDate.getMonth() === date.getMonth() &&
        infDate.getFullYear() === date.getFullYear()
      );
    });

    return {
      month,
      typeI: monthInfractions.filter((inf) => inf.type === "Tipo I").length,
      typeII: monthInfractions.filter((inf) => inf.type === "Tipo II").length,
      typeIII: monthInfractions.filter((inf) => inf.type === "Tipo III").length,
    };
  }).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Faltas</CardTitle>
        <CardDescription>
          Evolución de faltas en los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="typeI"
                stroke="#3b82f6"
                name="Tipo I"
              />
              <Line
                type="monotone"
                dataKey="typeII"
                stroke="#eab308"
                name="Tipo II"
              />
              <Line
                type="monotone"
                dataKey="typeIII"
                stroke="#ef4444"
                name="Tipo III"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
