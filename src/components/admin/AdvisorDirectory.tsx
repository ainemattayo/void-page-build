import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users } from "lucide-react";
import { adminQueries, transformers } from '@/lib/supabase-admin';
import { useQuery } from '@tanstack/react-query';

const AdvisorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: advisorsData, isLoading } = useQuery({
    queryKey: ['advisors-with-founders'],
    queryFn: adminQueries.getAdvisorsWithFounders
  });

  const advisors = advisorsData ? transformers.transformAdvisorData(advisorsData) : [];

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.location_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.expertise_areas?.some((exp: string) => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div>Loading advisors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Advisor Directory
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your pool of Diaspora experts and their assignments
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-50">
              {advisors.length} Active Advisors
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search advisors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              Add New Advisor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advisors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advisor</TableHead>
                <TableHead>Location & Timezone</TableHead>
                <TableHead>Expertise Areas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Founders</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdvisors.map((advisor, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{advisor.full_name}</div>
                      <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {advisor.linkedin_url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{advisor.location_city}, {advisor.location_country}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {advisor.timezone}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {advisor.expertise_areas?.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs mr-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={transformers.getAdvisorStatusColor(advisor.status)}>
                      {advisor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {advisor.foundersAssigned.map((founder: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {founder}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      <p className="text-sm text-gray-600">{advisor.notes}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorDirectory;