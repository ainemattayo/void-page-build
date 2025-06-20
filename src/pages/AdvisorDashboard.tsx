
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Award, MessageSquare, FileText, Star, Clock, LogOut } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { advisorQueries, advisorHelpers } from '@/lib/supabase-advisor';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdvisorBadge from '@/components/advisor/AdvisorBadge';

const AdvisorDashboard = () => {
  const { user, signOut } = useAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);

  // Get advisor ID from authenticated user
  useEffect(() => {
    if (user) {
      const getAdvisorId = async () => {
        const { data } = await supabase
          .from('advisors')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setAdvisorId(data.id);
        }
      };
      getAdvisorId();
    }
  }, [user]);

  const { data: advisor, isLoading: advisorLoading } = useQuery({
    queryKey: ['advisor-profile', advisorId],
    queryFn: () => advisorId ? advisorQueries.getAdvisorProfile(advisorId) : null,
    enabled: !!advisorId
  });

  const { data: assignedFounders = [], isLoading: foundersLoading } = useQuery({
    queryKey: ['assigned-founders', advisorId],
    queryFn: () => advisorId ? advisorQueries.getAssignedFounders(advisorId) : [],
    enabled: !!advisorId
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['advisor-sessions', advisorId],
    queryFn: () => advisorId ? advisorQueries.getAdvisorSessions(advisorId) : [],
    enabled: !!advisorId
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['advisor-testimonials', advisorId],
    queryFn: () => advisorId ? advisorQueries.getAdvisorTestimonials(advisorId) : [],
    enabled: !!advisorId
  });

  const { data: monthlyReports = [] } = useQuery({
    queryKey: ['advisor-monthly-reports', advisorId],
    queryFn: () => advisorId ? advisorQueries.getAdvisorMonthlyReports(advisorId) : [],
    enabled: !!advisorId
  });

  const impactMetrics = advisorHelpers.calculateImpactMetrics(sessions);
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.session_date) > new Date());
  const recentSessions = sessions.filter(s => s.status === 'completed').slice(0, 5);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!advisorId || advisorLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div>Loading advisor dashboard...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-green-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advisor Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {advisor?.full_name || 'Advisor'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {advisor && (
              <AdvisorBadge 
                badgeLevel={advisor.badge_level || 'Blue Ribbon'} 
                overallScore={advisor.overall_score || 0} 
              />
            )}
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Impact Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-600" />
              Your Impact This Quarter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{impactMetrics.sessionsCompleted}</div>
                <div className="text-sm text-gray-600">Sessions Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{impactMetrics.foundersWorkedWith}</div>
                <div className="text-sm text-gray-600">Founders Mentored</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{impactMetrics.satisfactionScore}%</div>
                <div className="text-sm text-gray-600">Satisfaction Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{impactMetrics.averageRating}/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="founders">My Founders</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Welcome Back! 🚀</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Your expertise is making a real difference. Here's what's on your agenda:
                  </p>
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-start">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <span className="text-sm">
                          Session with {session.founders?.full_name} - {new Date(session.session_date).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {upcomingSessions.length === 0 && (
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-500">No upcoming sessions scheduled</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recognition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-medium">{advisor?.badge_level || 'Blue Ribbon'}</div>
                    <div className="text-xs text-gray-600">Current Badge</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="founders" className="space-y-6">
            <div className="grid gap-6">
              {foundersLoading ? (
                <div>Loading assigned founders...</div>
              ) : assignedFounders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No founders assigned yet</p>
                  </CardContent>
                </Card>
              ) : (
                assignedFounders.map((founder: any) => (
                  <Card key={founder.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{founder.full_name} - {founder.startup_name}</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Sector & Stage:</div>
                          <p className="text-sm text-gray-600">{founder.sector} • {founder.stage}</p>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Top Bottleneck:</div>
                          <p className="text-sm text-gray-600">{founder.top_bottleneck || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">View Full Profile</Button>
                        <Button size="sm" variant="outline">Schedule Session</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming sessions scheduled</p>
                  ) : (
                    upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium">{session.title || 'Advisory Session'} with {session.founders?.full_name}</div>
                          <div className="text-sm text-gray-600">{new Date(session.session_date).toLocaleString()}</div>
                        </div>
                        <Button size="sm">Join Call</Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No completed sessions yet</p>
                  ) : (
                    recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{session.title || 'Advisory Session'} - {session.founders?.full_name}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(session.session_date).toLocaleDateString()} • {session.duration_minutes} min
                            {session.advisor_rating && ` • ⭐ ${session.advisor_rating}/5`}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">View Summary</Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Quote Wall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testimonials.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No testimonials yet</p>
                  ) : (
                    testimonials.map((testimonial: any) => (
                      <div key={testimonial.id} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm italic">"{testimonial.testimonial_text}"</p>
                        <p className="text-xs text-gray-500 mt-2">- {testimonial.founders?.full_name}, {testimonial.founders?.startup_name}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{advisor?.average_session_rating?.toFixed(1) || '0.0'}/5</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{advisor?.average_likelihood_to_recommend?.toFixed(1) || '0.0'}/10</div>
                    <div className="text-sm text-gray-600">Likelihood to Recommend</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
