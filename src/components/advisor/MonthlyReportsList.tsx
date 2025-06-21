import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { monthlyReportQueries, monthlyReportHelpers } from '@/lib/supabase-monthly-reports';
import { FileText, Calendar, Plus, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import MonthlyReportForm from './MonthlyReportForm';

interface MonthlyReportsListProps {
  advisorId: string;
}

const MonthlyReportsList: React.FC<MonthlyReportsListProps> = ({ advisorId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [pendingReminders, setPendingReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<{ month: number; year: number } | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, [advisorId]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [reportsData, remindersData] = await Promise.all([
        monthlyReportQueries.getAdvisorMonthlyReports(advisorId),
        monthlyReportQueries.getPendingReportReminders(advisorId)
      ]);
      
      setReports(reportsData);
      setPendingReminders(remindersData);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmitted = () => {
    setShowReportForm(false);
    setSelectedReport(null);
    loadReportsData();
  };

  const openReportForm = (month: number, year: number) => {
    setSelectedReport({ month, year });
    setShowReportForm(true);
  };

  const createNewReport = () => {
    const { month, year } = monthlyReportHelpers.getPreviousMonthYear();
    openReportForm(month, year);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monthly reports...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Monthly Reports
            </CardTitle>
            <Button onClick={createNewReport}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Pending Reports Alert */}
      {pendingReminders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Pending Reports</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have {pendingReminders.length} pending monthly report{pendingReminders.length > 1 ? 's' : ''}:
                </p>
                <div className="mt-2 space-y-1">
                  {pendingReminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-orange-700">
                        {monthlyReportHelpers.formatMonthName(reminder.month)} {reminder.year}
                        {monthlyReportHelpers.isReportOverdue(reminder.month, reminder.year) && (
                          <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReportForm(reminder.month, reminder.year)}
                      >
                        Complete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report History</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No monthly reports yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Your monthly reports will appear here once you start submitting them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">
                        {monthlyReportHelpers.formatMonthName(report.month)} {report.year}
                      </span>
                    </div>
                    
                    <Badge className={monthlyReportHelpers.getStatusColor(report.submission_status)}>
                      {report.submission_status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                      {report.submission_status === 'submitted' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {report.submission_status === 'reviewed' && <Eye className="h-3 w-3 mr-1" />}
                      {report.submission_status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {report.submission_status.charAt(0).toUpperCase() + report.submission_status.slice(1)}
                    </Badge>

                    {report.submitted_at && (
                      <span className="text-sm text-gray-500">
                        Submitted {new Date(report.submitted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Monthly Report - {monthlyReportHelpers.formatMonthName(report.month)} {report.year}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Report content display would go here */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Report Status</h4>
                            <Badge className={monthlyReportHelpers.getStatusColor(report.submission_status)}>
                              {report.submission_status.charAt(0).toUpperCase() + report.submission_status.slice(1)}
                            </Badge>
                            {report.admin_feedback && (
                              <div className="mt-3">
                                <h5 className="font-medium text-sm">Admin Feedback:</h5>
                                <p className="text-sm text-gray-600 mt-1">{report.admin_feedback}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Display report content */}
                          {report.content && (
                            <div className="space-y-4">
                              {Object.entries(report.content).map(([key, value]) => {
                                if (key === 'calculated_metrics') return null;
                                return (
                                  <div key={key} className="border-b pb-2">
                                    <h5 className="font-medium text-sm capitalize">
                                      {key.replace(/_/g, ' ')}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">{String(value)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {report.submission_status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => openReportForm(report.month, report.year)}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Form Dialog */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport && (
                <>Monthly Report - {monthlyReportHelpers.formatMonthName(selectedReport.month)} {selectedReport.year}</>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <MonthlyReportForm
              advisorId={advisorId}
              month={selectedReport.month}
              year={selectedReport.year}
              onSubmitted={handleReportSubmitted}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyReportsList;