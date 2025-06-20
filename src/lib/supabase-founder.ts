
import { supabase } from '@/integrations/supabase/client';

// Founder-specific data fetching functions
export const founderQueries = {
  // Get founder profile
  async getFounderProfile(founderId: string) {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', founderId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get founder's assigned advisors
  async getAssignedAdvisors(founderId: string) {
    const { data, error } = await supabase
      .from('advisor_founder_assignments')
      .select(`
        *,
        advisors(
          id,
          full_name,
          expertise_areas,
          location_city,
          location_country,
          badge_level,
          average_session_rating,
          sessions_completed
        )
      `)
      .eq('founder_id', founderId)
      .eq('status', 'active');

    if (error) throw error;
    return data?.map(assignment => assignment.advisors).filter(Boolean) || [];
  },

  // Get founder's sessions
  async getFounderSessions(founderId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        advisors(full_name),
        session_notes(*)
      `)
      .eq('founder_id', founderId)
      .order('session_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get founder's goals
  async getFounderGoals(founderId: string) {
    const { data, error } = await supabase
      .from('founder_goals')
      .select('*')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get founder's reflections
  async getFounderReflections(founderId: string) {
    const { data, error } = await supabase
      .from('founder_reflections')
      .select('*')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get published advisor resources (toolkit)
  async getPublishedResources() {
    const { data, error } = await supabase
      .from('advisor_resources')
      .select(`
        *,
        advisors(full_name)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new reflection/win
  async createReflection(founderId: string, reflection: {
    title: string;
    content: string;
    reflection_type: 'reflection' | 'win' | 'challenge';
    shared_with_advisors: boolean;
  }) {
    const { data, error } = await supabase
      .from('founder_reflections')
      .insert({
        founder_id: founderId,
        ...reflection
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update goal progress
  async updateGoalProgress(goalId: string, progress_percentage: number) {
    const { data, error } = await supabase
      .from('founder_goals')
      .update({ 
        progress_percentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Helper functions for founder dashboard
export const founderHelpers = {
  // Calculate overall goal progress
  calculateOverallProgress(goals: any[]) {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0);
    return Math.round(totalProgress / goals.length);
  },

  // Get upcoming sessions
  getUpcomingSessions(sessions: any[]) {
    const now = new Date();
    return sessions.filter(session => 
      session.session_date && 
      new Date(session.session_date) > now &&
      session.status === 'scheduled'
    ).sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
  },

  // Get past sessions
  getPastSessions(sessions: any[]) {
    const now = new Date();
    return sessions.filter(session => 
      session.session_date && 
      new Date(session.session_date) <= now ||
      session.status === 'completed'
    ).sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  },

  // Format session date
  formatSessionDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get resource type icon
  getResourceTypeIcon(resourceType: string) {
    switch (resourceType) {
      case 'document': return '📄';
      case 'template': return '📋';
      case 'video': return '🎥';
      case 'link': return '🔗';
      case 'tool': return '🛠️';
      default: return '📁';
    }
  }
};
