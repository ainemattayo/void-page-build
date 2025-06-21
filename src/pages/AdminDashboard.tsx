import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Users, FileText, Calendar, Settings, LogOut } from 'lucide-react';
import FlightControl from '@/components/admin/FlightControl';
import FounderDirectory from '@/components/admin/FounderDirectory';
import AdvisorDirectory from '@/components/admin/AdvisorDirectory';
import SessionTracker from '@/components/admin/SessionTracker';
import CaseStudyLibrary from '@/components/admin/CaseStudyLibrary';
import ApplicationReview from '@/components/admin/ApplicationReview';
import MonthlyReportsReview from '@/components/admin/MonthlyReportsReview';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage the CoPilot platform</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="founders">Founders</TabsTrigger>
            <TabsTrigger value="advisors">Advisors</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="reports">Monthly Reports</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <FlightControl />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationReview />
          </TabsContent>

          <TabsContent value="founders">
            <FounderDirectory />
          </TabsContent>

          <TabsContent value="advisors">
            <AdvisorDirectory />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionTracker />
          </TabsContent>

          <TabsContent value="reports">
            <MonthlyReportsReview />
          </TabsContent>

          <TabsContent value="case-studies">
            <CaseStudyLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;