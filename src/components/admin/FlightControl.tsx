import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Settings, Home, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { adminQueries, transformers } from '@/lib/supabase-admin';
import { useQuery } from '@tanstack/react-query';

const FlightControl = () => {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: adminQueries.getDashboardMetrics
  });

  const { data: timeline } = useQuery({
    queryKey: ['program-timeline'],
    queryFn: adminQueries.getProgramTimeline
  });

  const { data: forms } = useQuery({
    queryKey: ['active-forms'],
    queryFn: adminQueries.getActiveForms
  });

  const { data: calendars } = useQuery({
    queryKey: ['calendars'],
    queryFn: adminQueries.getCalendars
  });

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: adminQueries.getTools
  });

  const { data: todos } = useQuery({
    queryKey: ['pending-todos'],
    queryFn: adminQueries.getPendingTodos
  });

  const kpiSnapshot = [
    { 
      metric: "Active Founders", 
      value: metrics?.active_founders_count?.toString() || "0", 
      change: "+3", 
      trend: "up" 
    },
    { 
      metric: "Active Advisors", 
      value: metrics?.active_advisors_count?.toString() || "0", 
      change: "+1", 
      trend: "up" 
    },
    { 
      metric: "Sessions This Month", 
      value: metrics?.sessions_this_month?.toString() || "0", 
      change: "+12", 
      trend: "up" 
    },
    { 
      metric: "Case Studies Ready", 
      value: metrics?.case_studies_ready?.toString() || "0", 
      change: "+2", 
      trend: "up" 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiSnapshot.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.metric}</CardTitle>
              {kpi.trend === "up" ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {kpi.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What's Live Now */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            What's Live Now
          </CardTitle>
          <CardDescription>Quick access to active processes and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Active Forms</h4>
              <div className="space-y-1">
                {forms?.map((form) => (
                  <Button key={form.id} variant="outline" size="sm" className="w-full justify-start">
                    {form.icon} {form.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Calendars</h4>
              <div className="space-y-1">
                {calendars?.map((calendar) => (
                  <Button key={calendar.id} variant="outline" size="sm" className="w-full justify-start">
                    {calendar.icon} {calendar.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Tools</h4>
              <div className="space-y-1">
                {tools?.map((tool) => (
                  <Button key={tool.id} variant="outline" size="sm" className="w-full justify-start">
                    {tool.icon} {tool.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6-Month Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            6-Month Flight Timeline
          </CardTitle>
          <CardDescription>Track progress across the entire program lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline?.map((period, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={period.status === 'completed' ? 'default' : 
                           period.status === 'active' ? 'secondary' : 'outline'}
                  >
                    {period.status}
                  </Badge>
                  <div>
                    <h4 className="font-medium">Month {period.month_number}</h4>
                    <p className="text-sm text-gray-600">{period.title}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{period.founders_involved} Founders</div>
                  <div>{period.advisors_involved} Advisors</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* This Week's To-Dos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            This Week's To-Dos
          </CardTitle>
          <CardDescription>Critical tasks requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todos?.map((todo, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={transformers.getPriorityColor(todo.priority)}
                    className="text-xs"
                  >
                    {todo.priority}
                  </Badge>
                  <span className="font-medium">{todo.title}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Due: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'No due date'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightControl;