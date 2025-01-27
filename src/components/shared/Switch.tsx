import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

const sizeClasses = {
  default: "h-6 w-11",
  sm: "h-5 w-9", 
  xs: "h-3.5 w-6"
};

const thumbSizeClasses = {
  default: "h-5 w-5",
  sm: "h-4 w-4",
  xs: "h-2.5 w-2.5" 
};

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: keyof typeof sizeClasses;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = "default", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex items-center shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200",
      "dark:data-[state=checked]:bg-blue-600 dark:data-[state=unchecked]:bg-gray-700",
      sizeClasses[size],
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
        "data-[state=unchecked]:translate-x-0",
        {
          'data-[state=checked]:translate-x-[22px]': size === 'default',
          'data-[state=checked]:translate-x-[18px]': size === 'sm',
          'data-[state=checked]:translate-x-[12px]': size === 'xs'
        },
        thumbSizeClasses[size],
        "absolute -left-0.5 top-1/2 -translate-y-1/2"
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };