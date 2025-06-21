import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { monthlyReportQueries, monthlyReportHelpers } from '@/lib/supabase-monthly-reports';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Check, MessageSquare, Calendar, User } from 'lucide-react';

const MonthlyReportsReview = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await monthlyReportQueries.getAllMonthlyReportsForReview();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load monthly reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId: string, status: 'reviewed' | 'approved') => {
    if (!user) return;

    try {
      setReviewing(true);
      await monthlyReportQueries.reviewMonthlyReport(
        reportId,
        user.id,
        status,
        reviewFeedback || undefined
      );

      toast({
        title: "Report Reviewed",
        description: `Report has been ${status}`
      });

      setSelectedReport(null);
      setReviewFeedback('');
      loadReports();
    } catch (error) {
      console.error('Error reviewing report:', error);
      toast({
        title: "Error",
        description: "Failed to review report",
        variant: "destructive"
      });
    } finally {
      setReviewing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Monthly Reports Review
          </CardTitle>
          <p className="text-sm text-gray-600">
            Review and approve advisor monthly reports
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.submission_status === 'submitted').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.submission_status === 'reviewed').length}
              </div>
              <div className="text-sm text-gray-600">Reviewed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.submission_status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advisor</TableHead>
                <TableHead>Report Period</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">{report.advisors?.full_name}</div>
                        <div className="text-sm text-gray-500">{report.advisors?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {monthlyReportHelpers.formatMonthName(report.month)} {report.year}
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.submitted_at ? 
                      new Date(report.submitted_at).toLocaleDateString() : 
                      'Not submitted'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={`${monthlyReportHelpers.getStatusColor(report.submission_status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(report.submission_status)}
                      {report.submission_status.charAt(0).toUpperCase() + report.submission_status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Review Report - {report.advisors?.full_name} 
                              ({monthlyReportHelpers.formatMonthName(report.month)} {report.year})
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedReport && (
                            <div className="space-y-6">
                              {/* Report Status */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Report Status</h4>
                                  <Badge className={monthlyReportHelpers.getStatusColor(selectedReport.submission_status)}>
                                    {selectedReport.submission_status.charAt(0).toUpperCase() + selectedReport.submission_status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>Submitted: {new Date(selectedReport.submitted_at).toLocaleString()}</p>
                                  {selectedReport.reviewed_at && (
                                    <p>Reviewed: {new Date(selectedReport.reviewed_at).toLocaleString()}</p>
                                  )}
                                </div>
                              </div>

                              {/* Report Content */}
                              <div className="space-y-4">
                                <h4 className="font-medium">Report Content</h4>
                                {selectedReport.content && (
                                  <div className="space-y-4">
                                    {/* Calculated Metrics */}
                                    {selectedReport.content.calculated_metrics && (
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <h5 className="font-medium mb-2">Performance Metrics</h5>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>Sessions: {selectedReport.content.calculated_metrics.sessions_conducted}</div>
                                          <div>Hours: {selectedReport.content.calculated_metrics.total_hours}</div>
                                          <div>Founders: {selectedReport.content.calculated_metrics.founders_worked_with}</div>
                                          <div>Avg Rating: {selectedReport.content.calculated_metrics.average_rating?.toFixed(1)}</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Report Fields */}
                                    {Object.entries(selectedReport.content).map(([key, value]) => {
                                      if (key === 'calculated_metrics') return null;
                                      return (
                                        <div key={key} className="border-b pb-3">
                                          <h5 className="font-medium text-sm capitalize mb-1">
                                            {key.replace(/_/g, ' ')}
                                          </h5>
                                          <p className="text-sm text-gray-600">{String(value)}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Previous Feedback */}
                              {selectedReport.admin_feedback && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                  <h5 className="font-medium mb-2">Previous Feedback</h5>
                                  <p className="text-sm text-gray-600">{selectedReport.admin_feedback}</p>
                                </div>
                              )}

                              {/* Review Actions */}
                              {selectedReport.submission_status !== 'approved' && (
                                <div className="space-y-4 border-t pt-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Feedback (Optional)
                                    </label>
                                    <Textarea
                                      value={reviewFeedback}
                                      onChange={(e) => setReviewFeedback(e.target.value)}
                                      placeholder="Add feedback for the advisor..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleReview(selectedReport.id, 'reviewed')}
                                      disabled={reviewing}
                                      variant="outline"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      {reviewing ? 'Processing...' : 'Mark as Reviewed'}
                                    </Button>
                                    <Button
                                      onClick={() => handleReview(selectedReport.id, 'approved')}
                                      disabled={reviewing}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      {reviewing ? 'Processing...' : 'Approve Report'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {reports.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No monthly reports to review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReportsReview;