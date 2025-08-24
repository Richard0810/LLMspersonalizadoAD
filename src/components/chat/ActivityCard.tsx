
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity as ActivityIcon, ArrowRight, BookOpen } from 'lucide-react';
import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <Card className="w-full max-w-sm bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <ActivityIcon className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg font-headline text-primary truncate">{activity.activityName}</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem] whitespace-pre-line">
          <strong>Objetivo:</strong> {activity.learningObjective}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground space-y-1">
            <p className="line-clamp-2 whitespace-pre-line"><strong>Materiales:</strong> {activity.materials}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/activity/${activity.id}`} passHref legacyBehavior>
          <Button variant="default" className="w-full">
            Ver Actividad Completa <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ActivityCard;
