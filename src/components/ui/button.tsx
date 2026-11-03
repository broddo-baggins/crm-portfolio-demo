import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { designTokens } from "@/config/design-system"

const buttonVariants = cva(
  // Thermal: radius 6, ui type (14/500), 120 ms colour change, 1 px press, ember focus ring.
  // Disabled is drawn on the tokens (muted text, and the secondary fill on filled variants), not
  // at 50% opacity: a faded button read 2.2:1, and some carry live text ("Retrying in 58s").
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md [&>svg]:!m-0 text-sm font-medium leading-5 ring-offset-background transition-[color,background-color,border-color,transform] duration-[120ms] ease-out active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:flex-shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-action-hover disabled:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-brick-700 dark:hover:bg-brick-300 disabled:bg-secondary",
        success: "bg-moss-600 text-white hover:bg-moss-700 disabled:bg-secondary",
        warning: "bg-amber-500 text-white hover:bg-amber-600 disabled:bg-secondary",
        outline: "border border-input bg-surface text-foreground hover:bg-accent hover:border-ink-400 dark:hover:border-ink-500",
        secondary: "bg-secondary text-secondary-foreground hover:bg-ink-200 dark:hover:bg-ink-700 disabled:bg-secondary",
        ghost: "text-subtle hover:bg-accent hover:text-foreground",
        link: "h-auto px-0 text-primary underline underline-offset-4 decoration-ember-200 hover:decoration-current",
      },
      size: {
        default: "h-10 px-4 min-h-[40px]",
        sm: "h-8 px-3 text-[13px] min-h-[32px]",
        lg: "h-11 px-5 text-[15px] min-h-[44px]",
        xl: "h-12 px-6 text-base min-h-[48px]",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  iconOnly?: boolean
  mobileOptimized?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      asChild = false, 
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      iconOnly = false,
      mobileOptimized = false,
      children,
      disabled,
      ...props 
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading
    
    // Enhanced mobile optimization classes
    const mobileClasses = mobileOptimized ? [
      "touch-action-manipulation", // Prevents double-tap zoom
      "select-none", // Prevents text selection
      "tap-highlight-transparent", // Removes tap highlights
      "min-h-[44px]", // Ensures minimum touch target
      "min-w-[44px]", // Ensures minimum touch target for icon buttons
    ].join(" ") : ""
    
    // When using asChild, we need to ensure only one child is passed to Slot
    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size, className }),
            fullWidth && "w-full",
            loading && "cursor-wait",
            mobileClasses
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }
    
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          loading && "cursor-wait",
          mobileClasses,
          // Enhanced icon alignment for different scenarios
          iconOnly && size === "icon" && "p-0 flex items-center justify-center",
          !iconOnly && (leftIcon || rightIcon) && "gap-2"
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="inline-flex items-center justify-center flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {!iconOnly && (
          <span className={cn(
            // One 8px gap between icon and label; legacy mr-2/ml-2 on icons is neutralised
            "flex items-center justify-center gap-2 [&>svg]:!m-0",
            loading && "opacity-70",
            // Ensure text doesn't break on mobile
            "whitespace-nowrap overflow-hidden text-ellipsis"
          )}>
            {children}
          </span>
        )}
        
        {iconOnly && !loading && !leftIcon && !rightIcon && (
          <span className="flex items-center justify-center" aria-hidden="true">
            {children}
          </span>
        )}
        
        {!loading && rightIcon && (
          <span className="inline-flex items-center justify-center flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// Button Group Component for related actions with enhanced mobile support
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: VariantProps<typeof buttonVariants>['size'];
  variant?: VariantProps<typeof buttonVariants>['variant'];
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  mobileStack?: boolean; // Stack buttons on mobile
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ 
    children, 
    orientation = 'horizontal', 
    size, 
    variant, 
    spacing = 'sm',
    mobileStack = true,
    className,
    ...props 
  }, ref) => {
    const spacingClasses = {
      none: '',
      sm: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
      md: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
      lg: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === 'horizontal' ? "flex-row" : "flex-col",
          spacingClasses[spacing],
          // Mobile responsive stacking
          mobileStack && "sm:flex-row flex-col",
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<ButtonProps>(child) && child.type === Button) {
            return React.cloneElement(child, {
              ...child.props,
              size: child.props.size || size,
              variant: child.props.variant || variant,
              mobileOptimized: true,
            } as ButtonProps);
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
