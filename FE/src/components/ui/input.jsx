import * as React from 'react';

import { cn } from '@/lib/utils.js';

const Input = React.forwardRef(function Input({ className, type, ...props }, ref) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Input };
