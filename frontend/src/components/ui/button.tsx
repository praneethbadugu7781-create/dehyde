import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs uppercase tracking-editorial transition-all duration-500 ease-luxury disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-royal text-offwhite hover:bg-neutral-800 px-8 py-4",
        outline: "border border-royal bg-transparent text-royal hover:bg-royal hover:text-offwhite px-8 py-4",
        ghost: "text-charcoal hover:opacity-60 px-4 py-2",
        link: "text-charcoal underline-offset-4 hover:underline p-0",
      },
      size: {
        default: "h-auto",
        sm: "px-6 py-3 text-[10px]",
        lg: "px-10 py-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
