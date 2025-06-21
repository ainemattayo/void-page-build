import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { monthlyReportQueries, monthlyReportHelpers } from '@/lib/supabase-monthly-reports';
import { Save, Send, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface MonthlyReportFormProps {
  advisorId: string;
  month: number;
  year: number;
  onSubmitted?: () => void;
}

const MonthlyReportForm: React.FC<MonthlyReportFormProps> = ({
  advisorId,
  month,
  year,
  onSubmitted
}) => {
  const [template, setTemplate] = useState<any>(null);
  const [existingReport, setExistingReport] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [advisorId, month, year]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load template and existing report in parallel
      const [templateData, reportData] = await Promise.all([
        monthlyReportQueries.getMonthlyReportTemplate(month, year),
        monthlyReportQueries.getMonthlyReport(advisorId, month, year)
      ]);

      setTemplate(templateData);
      setExistingReport(reportData);
      
      // Initialize form data with existing content or empty values
      if (reportData?.content) {
        setFormData(reportData.content);
      } else {
        // Initialize with empty values based on template
        const initialData: any = {};
        templateData?.template_content?.sections?.forEach((section: any) => {
          section.fields.forEach((field: any) => {
            initialData[field.name] = '';
          });
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      await monthlyReportQueries.saveDraftReport(advisorId, month, year, formData);
      toast({
        title: "Draft Saved",
        description: "Your report has been saved as a draft"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitReport = async () => {
    try {
      // Validate form
      const validation = monthlyReportHelpers.validateReportContent(formData, template);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      setSubmitting(true);
      await monthlyReportQueries.submitMonthlyReport(advisorId, month, year, formData);
      
      toast({
        title: "Report Submitted",
        description: "Your monthly report has been submitted successfully"
      });
      
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const completionPercentage = template ? 
    monthlyReportHelpers.calculateCompletionPercentage(formData, template) : 0;

  const isOverdue = monthlyReportHelpers.isReportOverdue(month, year);
  const isSubmitted = existingReport?.submission_status === 'submitted' || 
                     existingReport?.submission_status === 'reviewed' || 
                     existingReport?.submission_status === 'approved';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report template...</p>
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No template available for {monthlyReportHelpers.formatMonthName(month)} {year}</p>
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
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Monthly Report - {monthlyReportHelpers.formatMonthName(month)} {year}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Share your impact and insights from this month
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isSubmitted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Submitted
                </Badge>
              )}
              {isOverdue && !isSubmitted && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {existingReport?.submission_status === 'draft' && (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Sections */}
      {template.template_content.sections.map((section: any, sectionIndex: number) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field: any, fieldIndex: number) => (
              <div key={fieldIndex}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    rows={4}
                    disabled={isSubmitted}
                    className={validationErrors.some(error => error.includes(field.label)) ? 'border-red-300' : ''}
                  />
                ) : field.type === 'number' ? (
                  <Input
                    type="number"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    disabled={isSubmitted}
                    className={validationErrors.some(error => error.includes(field.label)) ? 'border-red-300' : ''}
                  />
                ) : (
                  <Input
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    disabled={isSubmitted}
                    className={validationErrors.some(error => error.includes(field.label)) ? 'border-red-300' : ''}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      {!isSubmitted && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <Button
                onClick={saveDraft}
                variant="outline"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                onClick={submitReport}
                disabled={submitting || completionPercentage < 100}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
            
            {completionPercentage < 100 && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                Complete all required fields to submit your report
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submitted Report Info */}
      {isSubmitted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Report Submitted</h4>
                <p className="text-sm text-green-700">
                  Submitted on {new Date(existingReport.submitted_at).toLocaleDateString()}
                  {existingReport.reviewed_at && (
                    <span> • Reviewed on {new Date(existingReport.reviewed_at).toLocaleDateString()}</span>
                  )}
                </p>
                {existingReport.admin_feedback && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-800">Admin Feedback:</p>
                    <p className="text-sm text-green-700">{existingReport.admin_feedback}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonthlyReportForm;