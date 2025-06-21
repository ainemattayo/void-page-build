
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, BookOpen, Target, FileText, CheckCircle, Download, ExternalLink } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { founderQueries, founderHelpers } from '@/lib/supabase-founder';

const FounderDashboard = () => {
  // Demo founder ID - in real app this would come from auth context
  const founderId = "demo-founder-id";
  const [currentMonth] = useState(2); // Simulating Month 2

  // Fetch founder data
  const { data: founderProfile } = useQuery({
    queryKey: ['founder-profile', founderId],
    queryFn: () => founderQueries.getFounderProfile(founderId)
  });

  const { data: assignedAdvisors = [] } = useQuery({
    queryKey: ['assigned-advisors', founderId],
    queryFn: () => founderQueries.getAssignedAdvisors(founderId)
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['founder-sessions', founderId],
    queryFn: () => founderQueries.getFounderSessions(founderId)
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['founder-goals', founderId],
    queryFn: () => founderQueries.getFounderGoals(founderId)
  });

  const { data: reflections = [] } = useQuery({
    queryKey: ['founder-reflections', founderId],
    queryFn: () => founderQueries.getFounderReflections(founderId)
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['published-resources'],
    queryFn: () => founderQueries.getPublishedResources()
  });

  // Calculate metrics
  const upcomingSessions = founderHelpers.getUpcomingSessions(sessions);
  const pastSessions = founderHelpers.getPastSessions(sessions);
  const overallProgress = founderHelpers.calculateOverallProgress(goals);
  const completedSessions = pastSessions.filter(s => s.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-blue-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Founder Dashboard</h1>
              <p className="text-sm text-gray-600">Month {currentMonth} of 6 • Welcome to CoPilot</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">Active Pilot</Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Your 6-Month Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={(currentMonth / 6) * 100} className="w-full" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Month 1: Setup</span>
                <span>Month 3: Masterclass</span>
                <span>Month 6: Case Study</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="advisors">My Advisors</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="resources">Toolkit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Welcome Back! 👋</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    You're making great progress in your CoPilot journey. Here's what's coming up this month:
                  </p>
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 3).map((session, index) => (
                      <div key={index} className="flex items-start">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <span className="text-sm">
                          {session.title || 'Advisory Session'} - {founderHelpers.formatSessionDate(session.session_date)}
                        </span>
                      </div>
                    ))}
                    {goals.filter(g => g.status === 'active').slice(0, 2).map((goal, index) => (
                      <div key={index} className="flex items-start">
                        <Target className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <span className="text-sm">Work on: {goal.goal_title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{completedSessions}</div>
                    <div className="text-sm text-gray-600">Sessions Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{assignedAdvisors.length}</div>
                    <div className="text-sm text-gray-600">Active Advisors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{overallProgress}%</div>
                    <div className="text-sm text-gray-600">Goal Progress</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Your Goals Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.filter(g => g.status === 'active').map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.goal_title}</span>
                      <span className="text-sm text-gray-600">{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="w-full" />
                    {goal.goal_description && (
                      <p className="text-sm text-gray-600">{goal.goal_description}</p>
                    )}
                  </div>
                ))}
                {goals.filter(g => g.status === 'active').length === 0 && (
                  <p className="text-gray-500 text-center py-4">No active goals yet. Goals will be set during onboarding.</p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Reflection */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Reflections 💭</CardTitle>
              </CardHeader>
              <CardContent>
                {reflections.slice(0, 3).map((reflection) => (
                  <div key={reflection.id} className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-blue-800">{reflection.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {reflection.reflection_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700">{reflection.content.substring(0, 200)}...</p>
                    <div className="text-xs text-blue-600 mt-2">
                      {new Date(reflection.created_at).toLocaleDateString()}
                      {reflection.shared_with_advisors && " • Shared with advisors"}
                    </div>
                  </div>
                ))}
                <Button className="w-full sm:w-auto">Share New Reflection</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisors" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {assignedAdvisors.map((advisor) => (
                <Card key={advisor.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {advisor.full_name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className="w-fit bg-blue-100 text-blue-800">
                        {advisor.expertise_areas?.[0] || 'Expert'}
                      </Badge>
                      <Badge className="w-fit bg-purple-100 text-purple-800">
                        {advisor.badge_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>📍 {advisor.location_city}, {advisor.location_country}</p>
                      <p>⭐ {advisor.average_session_rating?.toFixed(1)}/5 rating • {advisor.sessions_completed} sessions completed</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Next Session:</div>
                      <div className="text-sm font-medium">Schedule your next session</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Schedule Session</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {assignedAdvisors.length === 0 && (
                <div className="col-span-2 text-center text-gray-500 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No advisors assigned yet. You'll be matched with advisors soon!</p>
                </div>
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
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">{session.title || 'Advisory Session'}</div>
                        <div className="text-sm text-gray-600">
                          {founderHelpers.formatSessionDate(session.session_date)} • {session.duration_minutes || 60} min
                        </div>
                        <div className="text-sm text-gray-600">
                          with {session.advisors?.full_name}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Join Call</Button>
                        <Button size="sm" variant="outline">Reschedule</Button>
                      </div>
                    </div>
                  ))}
                  {upcomingSessions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No upcoming sessions scheduled.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{session.title || 'Advisory Session'}</div>
                        <div className="text-xs text-gray-600">
                          {founderHelpers.formatSessionDate(session.session_date)} with {session.advisors?.full_name} • {session.duration_minutes || 60} min
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {session.status}
                          </Badge>
                          {session.session_notes?.length > 0 && (
                            <Badge variant="outline" className="text-xs text-blue-600">
                              Notes Available
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  ))}
                  {pastSessions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No session history yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Founder Toolkit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">
                            {founderHelpers.getResourceTypeIcon(resource.resource_type)}
                          </span>
                          <div>
                            <div className="font-medium text-sm">{resource.title}</div>
                            <div className="text-xs text-gray-600">
                              By {resource.advisors?.full_name} • {resource.resource_type}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {resource.download_url && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {resource.file_url && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {resource.description && (
                        <p className="text-xs text-gray-600 mt-2">{resource.description}</p>
                      )}
                    </div>
                  ))}
                  {resources.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No resources available yet. Your advisors will share helpful resources here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FounderDashboard;
