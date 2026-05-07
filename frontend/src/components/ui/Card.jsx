import React from 'react';
import { cn } from './Button';

export function Card({ className, children, hoverable = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden',
        hoverable && 'hover-card cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-xl font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
