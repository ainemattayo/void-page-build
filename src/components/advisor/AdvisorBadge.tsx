
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { advisorHelpers } from '@/lib/supabase-advisor';

interface AdvisorBadgeProps {
  badgeLevel: string;
  overallScore: number;
  className?: string;
}

const AdvisorBadge: React.FC<AdvisorBadgeProps> = ({ 
  badgeLevel, 
  overallScore, 
  className = "" 
}) => {
  const badgeConfig = advisorHelpers.getBadgeConfig(badgeLevel);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge className={`${badgeConfig.color} border px-3 py-1`}>
        <span className="mr-2">{badgeConfig.icon}</span>
        {badgeConfig.title}
      </Badge>
      <span className="text-sm text-gray-600">
        {overallScore.toFixed(1)}% Overall Score
      </span>
    </div>
  );
};

export default AdvisorBadge;
