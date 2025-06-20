
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X, Clock, User, Mail, MapPin, Calendar } from 'lucide-react';

interface Application {
  id: string;
  email: string;
  full_name: string;
  application_type: 'founder' | 'advisor';
  form_data: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const ApplicationReview = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('application_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (applicationId: string) => {
    if (!user) return;
    
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('approve_application', {
        application_id: applicationId,
        reviewer_id: user.id
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Application Approved",
          description: "The application has been approved and user account created."
        });
        fetchApplications();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!user || !rejectionReason.trim()) return;
    
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('reject_application', {
        application_id: applicationId,
        reviewer_id: user.id,
        reason: rejectionReason
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Application Rejected",
          description: "The application has been rejected."
        });
        setRejectionReason('');
        fetchApplications();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Pending: {applications.filter(app => app.status === 'pending').length}</span>
          <span>Approved: {applications.filter(app => app.status === 'approved').length}</span>
          <span>Rejected: {applications.filter(app => app.status === 'rejected').length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{application.full_name}</span>
                    </div>
                    <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                      {getStatusIcon(application.status)}
                      {application.status}
                    </Badge>
                    <Badge variant="outline">
                      {application.application_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {application.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(application.created_at).toLocaleDateString()}
                    </div>
                    {application.form_data.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.form_data.location}
                      </div>
                    )}
                  </div>

                  {application.application_type === 'founder' && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Startup:</strong> {application.form_data.startupName}</p>
                      <p><strong>Challenge:</strong> {application.form_data.challenge?.substring(0, 100)}...</p>
                    </div>
                  )}

                  {application.application_type === 'advisor' && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Expertise:</strong> {application.form_data.expertise?.join(', ')}</p>
                      <p><strong>Experience:</strong> {application.form_data.experience?.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedApp(application)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {application.application_type === 'founder' ? 'Founder' : 'Advisor'} Application - {application.full_name}
                        </DialogTitle>
                      </DialogHeader>
                      {selectedApp && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Email:</strong> {selectedApp.email}
                            </div>
                            <div>
                              <strong>Applied:</strong> {new Date(selectedApp.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Location:</strong> {selectedApp.form_data.location}
                            </div>
                            <div>
                              <strong>Status:</strong> 
                              <Badge className={`ml-2 ${getStatusColor(selectedApp.status)}`}>
                                {selectedApp.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {selectedApp.application_type === 'founder' && (
                            <div className="space-y-3">
                              <div>
                                <strong>Startup Name:</strong> {selectedApp.form_data.startupName}
                              </div>
                              <div>
                                <strong>Website:</strong> {selectedApp.form_data.website || 'Not provided'}
                              </div>
                              <div>
                                <strong>Stage:</strong>
                                <p className="text-sm text-gray-600 mt-1">{selectedApp.form_data.stage}</p>
                              </div>
                              <div>
                                <strong>Challenge:</strong>
                                <p className="text-sm text-gray-600 mt-1">{selectedApp.form_data.challenge}</p>
                              </div>
                              <div>
                                <strong>Win Definition:</strong>
                                <p className="text-sm text-gray-600 mt-1">{selectedApp.form_data.winDefinition}</p>
                              </div>
                              <div>
                                <strong>Availability:</strong> {selectedApp.form_data.availability}
                              </div>
                            </div>
                          )}

                          {selectedApp.application_type === 'advisor' && (
                            <div className="space-y-3">
                              <div>
                                <strong>LinkedIn:</strong> {selectedApp.form_data.linkedin}
                              </div>
                              <div>
                                <strong>Expertise:</strong> {selectedApp.form_data.expertise?.join(', ')}
                              </div>
                              <div>
                                <strong>Experience:</strong>
                                <p className="text-sm text-gray-600 mt-1">{selectedApp.form_data.experience}</p>
                              </div>
                              <div>
                                <strong>Timezone:</strong> {selectedApp.form_data.timezone}
                              </div>
                              <div>
                                <strong>Challenge Type:</strong>
                                <p className="text-sm text-gray-600 mt-1">{selectedApp.form_data.challengeType}</p>
                              </div>
                              <div>
                                <strong>Availability:</strong> {selectedApp.form_data.availability}
                              </div>
                            </div>
                          )}

                          {selectedApp.status === 'pending' && (
                            <div className="flex gap-2 pt-4 border-t">
                              <Button 
                                onClick={() => handleApprove(selectedApp.id)}
                                disabled={processing}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <div className="flex flex-col gap-2 flex-1">
                                <Textarea
                                  placeholder="Reason for rejection..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  rows={2}
                                />
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleReject(selectedApp.id)}
                                  disabled={processing || !rejectionReason.trim()}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                            <div className="pt-4 border-t">
                              <strong>Rejection Reason:</strong>
                              <p className="text-sm text-gray-600 mt-1">{selectedApp.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(application.id)}
                        disabled={processing}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedApp(application);
                          setRejectionReason('');
                        }}
                        disabled={processing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No applications found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationReview;
