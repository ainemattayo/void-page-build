import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";
import { adminQueries } from '@/lib/supabase-admin';
import { useQuery } from '@tanstack/react-query';

const SessionTracker = () => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: adminQueries.getSessions
  });

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Session Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">All Sessions</h3>
              <Button variant="outline" size="sm">
                Schedule New Session
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions?.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.title || 'Advisory Session'}</div>
                        <div className="text-sm text-gray-500">{session.session_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.founders?.full_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.advisors?.full_name}</div>
                    </TableCell>
                    <TableCell>
                      {session.session_date ? 
                        new Date(session.session_date).toLocaleString() : 
                        'Not scheduled'
                      }
                    </TableCell>
                    <TableCell>
                      {session.duration_minutes} min
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.rating ? (
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{session.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTracker;