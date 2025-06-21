import { supabase } from '@/integrations/supabase/client';

// Monthly reporting data fetching functions
export const monthlyReportQueries = {
  // Get monthly report template for a specific month/year
  async getMonthlyReportTemplate(month: number, year: number) {
    const { data, error } = await supabase
      .from('monthly_report_templates')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  // Get advisor's monthly reports
  async getAdvisorMonthlyReports(advisorId: string) {
    const { data, error } = await supabase
      .from('advisor_monthly_reports')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get specific monthly report
  async getMonthlyReport(advisorId: string, month: number, year: number) {
    const { data, error } = await supabase
      .from('advisor_monthly_reports')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  // Get pending report reminders for advisor
  async getPendingReportReminders(advisorId: string) {
    const { data, error } = await supabase
      .from('report_submission_reminders')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('report_submitted', false)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Submit monthly report
  async submitMonthlyReport(
    advisorId: string,
    month: number,
    year: number,
    content: any
  ) {
    const { data, error } = await supabase.rpc('submit_monthly_report', {
      advisor_uuid: advisorId,
      report_month: month,
      report_year: year,
      report_content: content
    });

    if (error) throw error;
    return data;
  },

  // Save draft report
  async saveDraftReport(
    advisorId: string,
    month: number,
    year: number,
    content: any
  ) {
    const { data, error } = await supabase
      .from('advisor_monthly_reports')
      .upsert({
        advisor_id: advisorId,
        month,
        year,
        content,
        submission_status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get advisor dashboard data (includes reports)
  async getAdvisorDashboardData(advisorId: string) {
    const { data, error } = await supabase.rpc('get_advisor_dashboard_data', {
      advisor_uuid: advisorId
    });

    if (error) throw error;
    return data;
  },

  // Admin: Get all monthly reports for review
  async getAllMonthlyReportsForReview() {
    const { data, error } = await supabase
      .from('advisor_monthly_reports')
      .select(`
        *,
        advisors(full_name, email)
      `)
      .in('submission_status', ['submitted', 'reviewed'])
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Admin: Review monthly report
  async reviewMonthlyReport(
    reportId: string,
    reviewerId: string,
    status: 'reviewed' | 'approved',
    feedback?: string
  ) {
    const { data, error } = await supabase
      .from('advisor_monthly_reports')
      .update({
        submission_status: status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        admin_feedback: feedback
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Helper functions for monthly reports
export const monthlyReportHelpers = {
  // Get current month and year
  getCurrentMonthYear() {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  },

  // Get previous month and year
  getPreviousMonthYear() {
    const now = new Date();
    const prevMonth = now.getMonth(); // 0-based, so this is actually previous month
    const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = prevMonth === 0 ? 12 : prevMonth;
    
    return { month, year };
  },

  // Format month name
  formatMonthName(month: number) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  },

  // Get status color for reports
  getStatusColor(status: string) {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Check if report is overdue
  isReportOverdue(month: number, year: number) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Report is overdue if it's for a past month and we're past the 5th of the following month
    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) {
      return now.getDate() > 5; // Grace period until 5th of next month
    }
    return false;
  },

  // Validate report content against template
  validateReportContent(content: any, template: any) {
    const errors: string[] = [];
    
    if (!template?.template_content?.sections) {
      return { isValid: true, errors: [] };
    }

    template.template_content.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        if (field.required && (!content[field.name] || content[field.name].toString().trim() === '')) {
          errors.push(`${field.label} is required`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Calculate completion percentage
  calculateCompletionPercentage(content: any, template: any) {
    if (!template?.template_content?.sections) return 0;

    let totalFields = 0;
    let completedFields = 0;

    template.template_content.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        totalFields++;
        if (content[field.name] && content[field.name].toString().trim() !== '') {
          completedFields++;
        }
      });
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }
};