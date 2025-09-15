import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, BarChart3, Handshake, Percent } from "lucide-react";
import { useLeadStats } from "@/hooks/use-leads";

export default function StatsCards() {
  const { data: stats, isLoading } = useLeadStats("user1"); // TODO: Get user ID from auth context

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      change: stats?.totalLeadsChange || 0,
      icon: Users,
      color: "primary",
    },
    {
      title: "Active Leads",
      value: stats?.activeLeads || 0,
      change: stats?.activeLeadsChange || 0,
      icon: BarChart3,
      color: "success",
    },
    {
      title: "Conversions",
      value: stats?.conversions || 0,
      change: stats?.conversionsChange || 0,
      icon: Handshake,
      color: "warning",
    },
    {
      title: "Conversion Rate",
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      change: stats?.conversionRateChange || 0,
      icon: Percent,
      color: "accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title} data-testid={`card-stat-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground" data-testid={`text-stat-title-${index}`}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-value-${index}`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${isPositive ? 'text-success' : 'text-warning'}`}>
                    <TrendIcon className="inline h-3 w-3 mr-1" />
                    <span data-testid={`text-stat-change-${index}`}>
                      {isPositive ? '+' : ''}{stat.change}%
                    </span> from last month
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${stat.color} h-5 w-5`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
