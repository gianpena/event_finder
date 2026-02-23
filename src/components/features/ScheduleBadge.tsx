"use client";

import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { CompatibilityResult } from '@/lib/schedule-analyzer';

interface ScheduleBadgeProps {
    compatibility: CompatibilityResult;
    size?: 'sm' | 'default';
}

export function ScheduleBadge({ compatibility, size = 'default' }: ScheduleBadgeProps) {
    const getIcon = () => {
        switch (compatibility.status) {
            case 'perfect':
                return <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
            case 'good':
                return <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
            case 'warning':
                return <AlertCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
            case 'conflict':
                return <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
        }
    };

    const getVariant = () => {
        switch (compatibility.status) {
            case 'perfect':
                return 'default' as const;
            case 'good':
                return 'secondary' as const;
            case 'warning':
                return 'outline' as const;
            case 'conflict':
                return 'destructive' as const;
        }
    };

    const getClassName = () => {
        const baseClass = 'gap-1';
        switch (compatibility.status) {
            case 'perfect':
                return `${baseClass} bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20`;
            case 'good':
                return `${baseClass} bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20`;
            case 'warning':
                return `${baseClass} bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20`;
            case 'conflict':
                return `${baseClass} bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20`;
        }
    };

    return (
        <Badge
            variant={getVariant()}
            className={getClassName()}
        >
            {getIcon()}
            <span className={size === 'sm' ? 'text-[10px]' : 'text-xs'}>
                {compatibility.message}
            </span>
        </Badge>
    );
}
