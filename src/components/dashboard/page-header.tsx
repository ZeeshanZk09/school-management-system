'use client';
import type { ReactNode } from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  breadcrumbLabels?: Record<string, string>;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className,
  showBreadcrumbs = true,
  breadcrumbLabels,
}: Readonly<PageHeaderProps>) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 group',
        className
      )}
    >
      <div className='space-y-1'>
        {showBreadcrumbs && <Breadcrumbs labels={breadcrumbLabels} />}
        <h1 className='text-3xl font-black font-outfit tracking-tight text-slate-900 dark:text-white flex items-center gap-3'>
          <span className='relative'>
            {title}
            <span className='absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500' />
          </span>
        </h1>
        {description && (
          <p className='text-slate-500 dark:text-slate-400 font-medium text-sm'>{description}</p>
        )}
      </div>
      <div className='flex items-center gap-3 flex-wrap'>
        {action}
        {children}
      </div>
    </div>
  );
}
