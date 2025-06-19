
import { supabase } from '@/integrations/supabase/client';

// Advisor-specific data fetching functions
export const advisorQueries = {
  // Get advisor profile with badge and metrics
  async getAdvisorProfile(advisorId: string) {
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('id', advisorId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get founders assigned to a specific advisor
  async getAssignedFounders(advisorId: string) {
    const { data, error } = await supabase
      .from('advisor_founder_assignments')
      .select(`
        *,
        founders(
          id,
          full_name,
          startup_name,
          sector,
          stage,
          top_bottleneck,
          bottleneck_status,
          email,
          website
        )
      `)
      .eq('advisor_id', advisorId)
      .eq('status', 'active');

    if (error) throw error;
    return data?.map(assignment => assignment.founders).filter(Boolean) || [];
  },

  // Get sessions for a specific advisor
  async getAdvisorSessions(advisorId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        founders(full_name, startup_name)
      `)
      .eq('advisor_id', advisorId)
      .order('session_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get advisor testimonials (quote wall)
  async getAdvisorTestimonials(advisorId: string) {
    const { data, error } = await supabase
      .from('advisor_testimonials')
      .select(`
        *,
        founders(full_name, startup_name)
      `)
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get advisor monthly reports
  async getAdvisorMonthlyReports(advisorId: string) {
    const { data, error } = await supabase
      .from('advisor_monthly_reports')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Helper functions for advisor dashboard
export const advisorHelpers = {
  // Get badge color and icon based on badge level
  getBadgeConfig(badgeLevel: string) {
    const configs = {
      'Blue Ribbon': { 
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: '🔵',
        title: 'Blue Ribbon'
      },
      'White Ribbon': { 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: '⚪',
        title: 'White Ribbon'
      },
      'Bronze Ribbon': { 
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: '🥉',
        title: 'Bronze Ribbon'
      },
      'Silver Ribbon': { 
        color: 'bg-slate-100 text-slate-800 border-slate-300',
        icon: '🥈',
        title: 'Silver Ribbon'
      },
      'Gold Ribbon': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '🥇',
        title: 'Gold Ribbon'
      },
      'Platinum Ribbon': { 
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: '💎',
        title: 'Platinum Ribbon'
      }
    };
    
    return configs[badgeLevel as keyof typeof configs] || configs['Blue Ribbon'];
  },

  // Format session status
  getSessionStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Calculate overall impact metrics
  calculateImpactMetrics(sessions: any[]) {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalRatings = completedSessions.filter(s => s.advisor_rating).length;
    const avgRating = totalRatings > 0 
      ? completedSessions.reduce((sum, s) => sum + (s.advisor_rating || 0), 0) / totalRatings 
      : 0;
    
    const totalFounders = new Set(sessions.map(s => s.founder_id)).size;
    
    return {
      sessionsCompleted: completedSessions.length,
      foundersWorkedWith: totalFounders,
      averageRating: Math.round(avgRating * 10) / 10,
      satisfactionScore: avgRating > 0 ? Math.round((avgRating / 5) * 100) : 0
    };
  }
};
