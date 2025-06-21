
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Eye, User, Mail, MapPin, Briefcase } from "lucide-react";

interface Application {
  id: string;
  application_type: 'founder' | 'advisor';
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  form_data: any;
  created_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const ApplicationReview = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('application_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setActionLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', currentUser.user.id)
        .single();

      if (!adminUser) throw new Error("Admin user not found");

      const result = await supabase.rpc('approve_application', {
        application_id: applicationId,
        reviewer_id: adminUser.id
      });

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Application approved successfully",
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', currentUser.user.id)
        .single();

      if (!adminUser) throw new Error("Admin user not found");

      const result = await supabase.rpc('reject_application', {
        application_id: applicationId,
        reviewer_id: adminUser.id,
        reason: rejectionReason
      });

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Application rejected",
      });

      setRejectionReason("");
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderApplicationDetails = (app: Application) => {
    const formData = app.form_data;
    
    if (app.application_type === 'founder') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700">Startup Name</label>
              <p className="text-gray-900">{formData.startupName || 'Not provided'}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Location</label>
              <p className="text-gray-900">{form_data.location || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-700">Current Stage</label>
            <p className="text-gray-900">{formData.stage || 'Not provided'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Biggest Challenge</label>
            <p className="text-gray-900">{formData.challenge || 'Not provided'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Win Definition</label>
            <p className="text-gray-900">{formData.winDefinition || 'Not provided'}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700">LinkedIn</label>
              <p className="text-gray-900">{formData.linkedin || 'Not provided'}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Location</label>
              <p className="text-gray-900">{formData.location || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-700">Experience</label>
            <p className="text-gray-900">{formData.experience || 'Not provided'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Expertise Areas</label>
            <p className="text-gray-900">
              {Array.isArray(formData.expertise) ? formData.expertise.join(', ') : 'Not provided'}
            </p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading applications...</div>;
  }

  const pendingApps = applications.filter(app => app.status === 'pending');
  const reviewedApps = applications.filter(app => app.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Application Review</h2>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            {pendingApps.length} Pending
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            {reviewedApps.length} Reviewed
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewedApps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No pending applications
              </CardContent>
            </Card>
          ) : (
            pendingApps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.full_name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {app.email}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {app.application_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(app.status)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Application Details - {app.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {renderApplicationDetails(app)}
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handleReject(app.id)}
                                disabled={actionLoading}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleApprove(app.id)}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                            {app.status === 'pending' && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Rejection Reason (if rejecting)
                                </label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Provide a reason for rejection..."
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedApps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No reviewed applications
              </CardContent>
            </Card>
          ) : (
            reviewedApps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.full_name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {app.email}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {app.application_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    {app.reviewed_at && (
                      <span>Reviewed {new Date(app.reviewed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  {app.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {app.rejection_reason}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationReview;
