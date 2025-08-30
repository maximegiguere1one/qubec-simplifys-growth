import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, Target, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';

interface AnalyticsData {
  totalLeads: number;
  quizCompletions: number;
  vslViews: number;
  bookings: number;
  conversionRate: number;
  avgQuizScore: number;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLeads: 0,
    quizCompletions: 0,
    vslViews: 0,
    bookings: 0,
    conversionRate: 0,
    avgQuizScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Get quiz completions
      const { count: quizCompletions } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get VSL views
      const { count: vslViews } = await supabase
        .from('funnel_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'vsl_view');

      // Get bookings
      const { count: bookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Get average quiz score
      const { data: avgScoreData } = await supabase
        .from('quiz_sessions')
        .select('total_score')
        .eq('status', 'completed');

      const avgQuizScore = avgScoreData?.length 
        ? avgScoreData.reduce((sum, session) => sum + (session.total_score || 0), 0) / avgScoreData.length
        : 0;

      const conversionRate = totalLeads ? (bookings || 0) / totalLeads * 100 : 0;

      setAnalytics({
        totalLeads: totalLeads || 0,
        quizCompletions: quizCompletions || 0,
        vslViews: vslViews || 0,
        bookings: bookings || 0,
        conversionRate,
        avgQuizScore,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Total Leads',
      value: analytics.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Quiz Completed',
      value: analytics.quizCompletions,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'VSL Views',
      value: analytics.vslViews,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Bookings',
      value: analytics.bookings,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Avg Quiz Score',
      value: analytics.avgQuizScore.toFixed(1),
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Lead to Quiz Completion Rate:</span>
            <span className="font-medium">
              {analytics.totalLeads ? ((analytics.quizCompletions / analytics.totalLeads) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Quiz to Booking Rate:</span>
            <span className="font-medium">
              {analytics.quizCompletions ? ((analytics.bookings / analytics.quizCompletions) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Overall Funnel Conversion:</span>
            <span className="font-medium text-primary">
              {analytics.conversionRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};