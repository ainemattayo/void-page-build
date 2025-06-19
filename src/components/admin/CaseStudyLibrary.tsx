import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { adminQueries } from '@/lib/supabase-admin';
import { useQuery } from '@tanstack/react-query';

const CaseStudyLibrary = () => {
  const { data: caseStudies, isLoading } = useQuery({
    queryKey: ['case-studies'],
    queryFn: adminQueries.getCaseStudies
  });

  if (isLoading) {
    return <div>Loading case studies...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Case Study Library
            </CardTitle>
            <Button variant="outline" size="sm">
              Create New Case Study
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {caseStudies?.filter(cs => cs.status === 'Ready').length || 0}
                </div>
                <div className="text-sm text-gray-600">Ready for Publication</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {caseStudies?.filter(cs => cs.status === 'In Progress').length || 0}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {caseStudies?.filter(cs => cs.status === 'Draft').length || 0}
                </div>
                <div className="text-sm text-gray-600">Draft</div>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseStudies?.map((caseStudy) => (
                  <TableRow key={caseStudy.id}>
                    <TableCell>
                      <div className="font-medium">{caseStudy.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{caseStudy.founders?.full_name}</div>
                        <div className="text-sm text-gray-500">{caseStudy.founders?.startup_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(caseStudy.status)}>
                        {caseStudy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(caseStudy.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {caseStudy.published_at ? 
                        new Date(caseStudy.published_at).toLocaleDateString() : 
                        'Not published'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {caseStudy.status === 'Ready' && (
                          <Button size="sm">
                            Publish
                          </Button>
                        )}
                      </div>
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

export default CaseStudyLibrary;