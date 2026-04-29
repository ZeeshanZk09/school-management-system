'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '@/lib/utils';

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

function PopoverTrigger({
  asChild,
  ...props
}: PopoverPrimitive.Trigger.Props & { asChild?: boolean }) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: Readonly<
  PopoverPrimitive.Popup.Props & { align?: 'start' | 'center' | 'end'; sideOffset?: number }
>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Popup
        data-slot='popover-content'
        // align={align}
        // sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
