import { supabase } from '@/integrations/supabase/client';

// Admin dashboard data fetching functions
export const adminQueries = {
  // Get dashboard metrics
  async getDashboardMetrics() {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  // Get founders with their assigned advisors
  async getFoundersWithAdvisors() {
    const { data, error } = await supabase
      .from('founders')
      .select(`
        *,
        advisor_founder_assignments(
          advisors(
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get advisors with their assigned founders
  async getAdvisorsWithFounders() {
    const { data, error } = await supabase
      .from('advisors')
      .select(`
        *,
        advisor_founder_assignments(
          founders(
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get program timeline
  async getProgramTimeline() {
    const { data, error } = await supabase
      .from('program_timeline')
      .select('*')
      .order('month_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get active forms
  async getActiveForms() {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get calendars
  async getCalendars() {
    const { data, error } = await supabase
      .from('calendars')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get tools
  async getTools() {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get pending to-dos
  async getPendingTodos() {
    const { data, error } = await supabase
      .from('to_dos')
      .select('*')
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get sessions
  async getSessions() {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        founders(full_name, startup_name),
        advisors(full_name)
      `)
      .order('session_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get case studies
  async getCaseStudies() {
    const { data, error } = await supabase
      .from('case_studies')
      .select(`
        *,
        founders(full_name, startup_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Helper functions for data transformation
export const transformers = {
  // Transform founder data for the directory table
  transformFounderData(founders: any[]) {
    return founders.map(founder => ({
      ...founder,
      assignedAdvisors: founder.advisor_founder_assignments?.map((assignment: any) => 
        assignment.advisors.full_name
      ) || []
    }));
  },

  // Transform advisor data for the directory table
  transformAdvisorData(advisors: any[]) {
    return advisors.map(advisor => ({
      ...advisor,
      foundersAssigned: advisor.advisor_founder_assignments?.map((assignment: any) => 
        assignment.founders.full_name
      ) || []
    }));
  },

  // Get priority color for to-dos
  getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  },

  // Get stage color for founders
  getStageColor(stage: string) {
    switch (stage) {
      case 'Pre-Seed': return 'bg-yellow-100 text-yellow-800';
      case 'Seed': return 'bg-blue-100 text-blue-800';
      case 'Series A': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Get status color for advisors
  getAdvisorStatusColor(status: string) {
    return status === 'Ready to be matched' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  }
};