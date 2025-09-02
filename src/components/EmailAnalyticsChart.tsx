import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EmailAnalyticsChartProps {
  dailyStats: any[];
  stats: {
    totalSent: number;
    totalFailed: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
}

export const EmailAnalyticsChart: React.FC<EmailAnalyticsChartProps> = ({ dailyStats, stats }) => {
  const chartData = dailyStats?.map(day => ({
    date: new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    sent: day.sent || 0,
    opened: day.opened || 0,
    clicked: day.clicked || 0,
    failed: day.failed || 0,
    openRate: day.sent > 0 ? Math.round((day.opened / day.sent) * 100) : 0,
    clickRate: day.sent > 0 ? Math.round((day.clicked / day.sent) * 100) : 0
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Volume d'emails (30 jours)</CardTitle>
          <CardDescription>Évolution des envois et interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  name="Envoyés"
                />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2} 
                  name="Ouverts"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicked" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2} 
                  name="Cliqués"
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2} 
                  name="Échecs"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de performance (%)</CardTitle>
          <CardDescription>Taux d'ouverture et de clic par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Bar 
                  dataKey="openRate" 
                  fill="hsl(var(--success))" 
                  name="Taux d'ouverture"
                  opacity={0.8}
                />
                <Bar 
                  dataKey="clickRate" 
                  fill="hsl(var(--warning))" 
                  name="Taux de clic"
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};