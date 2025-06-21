
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Settings, Home, FileText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FlightControl from "@/components/admin/FlightControl";
import FounderDirectory from "@/components/admin/FounderDirectory";
import AdvisorDirectory from "@/components/admin/AdvisorDirectory";
import SessionTracker from "@/components/admin/SessionTracker";
import CaseStudyLibrary from "@/components/admin/CaseStudyLibrary";
import ApplicationReview from "@/components/admin/ApplicationReview";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("flight-control");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tseer Admin Command Center</h1>
              <p className="text-gray-600">Real-time platform oversight and management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              System Online
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="flight-control" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Flight Control
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="founders" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Founders
            </TabsTrigger>
            <TabsTrigger value="advisors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tseers
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="case-studies" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Case Studies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flight-control">
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

          <TabsContent value="case-studies">
            <CaseStudyLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
