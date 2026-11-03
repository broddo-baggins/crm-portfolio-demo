import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Info } from "lucide-react"

const inputVariants = cva(
  // Base styles for all inputs
  "flex w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-[120ms]",
  {
    variants: {
      variant: {
        default: "border-input hover:border-ink-400 focus-visible:ring-ring/30 focus-visible:border-primary",
        error: "border-error-500 focus-visible:ring-error-500 focus-visible:border-error-500 bg-error-50",
        success: "border-success-500 focus-visible:ring-success-500 focus-visible:border-success-500 bg-success-50",
        warning: "border-warning-500 focus-visible:ring-warning-500 focus-visible:border-warning-500 bg-warning-50",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant,
      size,
      label,
      error,
      success,
      warning,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = true,
      required = false,
      id,
      disabled,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    
    // Determine the current variant based on validation state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Generate IDs for helper elements
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;
    const warningId = `${inputId}-warning`;
    const helperId = `${inputId}-helper`;
    
    // Build aria-describedby
    const describedByIds = [
      error && errorId,
      success && successId,
      warning && warningId,
      helperText && helperId,
      ariaDescribedBy,
    ].filter(Boolean).join(' ');

    React.useEffect(() => {
      if (showPasswordToggle && type === 'password') {
        setInputType(showPassword ? 'text' : 'password');
      } else {
        setInputType(type);
      }
    }, [showPassword, type, showPasswordToggle]);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const StatusIcon = error 
      ? AlertCircle 
      : success 
      ? CheckCircle2 
      : warning 
      ? Info 
      : null;

    return (
      <div className={cn("space-y-2", fullWidth ? "w-full" : "w-auto")}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-error-700",
              success && "text-success-700",
              warning && "text-warning-700"
            )}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || StatusIcon) && "pr-10"
            )}
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedByIds || undefined}
            autoComplete={props.autoComplete || (type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off')}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {StatusIcon && (
              <StatusIcon 
                className={cn(
                  "h-4 w-4",
                  error && "text-error-500",
                  success && "text-success-500",
                  warning && "text-warning-500"
                )}
                aria-hidden="true"
              />
            )}
            
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {rightIcon && !StatusIcon && !showPasswordToggle && (
              <div className="text-gray-400 pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {/* Helper/Error Messages */}
        <div className="space-y-1">
          {error && (
            <p 
              id={errorId} 
              className="text-sm text-error-600 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          
          {success && !error && (
            <p 
              id={successId} 
              className="text-sm text-success-600 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {success}
            </p>
          )}
          
          {warning && !error && !success && (
            <p 
              id={warningId} 
              className="text-sm text-warning-600 flex items-center gap-1"
            >
              <Info className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {warning}
            </p>
          )}
          
          {helperText && !error && !success && !warning && (
            <p 
              id={helperId} 
              className="text-sm text-gray-500"
            >
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input"

// Textarea Component
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      label,
      error,
      success,
      warning,
      helperText,
      fullWidth = true,
      required = false,
      resize = 'vertical',
      id,
      disabled,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedTextareaId = React.useId();
    const textareaId = id || generatedTextareaId;
    
    // Determine the current variant based on validation state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Generate IDs for helper elements
    const errorId = `${textareaId}-error`;
    const successId = `${textareaId}-success`;
    const warningId = `${textareaId}-warning`;
    const helperId = `${textareaId}-helper`;
    
    // Build aria-describedby
    const describedByIds = [
      error && errorId,
      success && successId,
      warning && warningId,
      helperText && helperId,
      ariaDescribedBy,
    ].filter(Boolean).join(' ');

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const StatusIcon = error 
      ? AlertCircle 
      : success 
      ? CheckCircle2 
      : warning 
      ? Info 
      : null;

    return (
      <div className={cn("space-y-2", fullWidth ? "w-full" : "w-auto")}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-error-700",
              success && "text-success-700",
              warning && "text-warning-700"
            )}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              resizeClasses[resize],
              currentVariant === 'default' && "border-gray-300 focus-visible:ring-primary-500 focus-visible:border-primary-500",
              currentVariant === 'error' && "border-error-500 focus-visible:ring-error-500 focus-visible:border-error-500 bg-error-50",
              currentVariant === 'success' && "border-success-500 focus-visible:ring-success-500 focus-visible:border-success-500 bg-success-50",
              currentVariant === 'warning' && "border-warning-500 focus-visible:ring-warning-500 focus-visible:border-warning-500 bg-warning-50",
              StatusIcon && "pr-10",
              className
            )}
            ref={ref}
            id={textareaId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedByIds || undefined}
            {...props}
          />
          
          {StatusIcon && (
            <div className="absolute right-3 top-3">
              <StatusIcon 
                className={cn(
                  "h-4 w-4",
                  error && "text-error-500",
                  success && "text-success-500",
                  warning && "text-warning-500"
                )}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        
        {/* Helper/Error Messages */}
        <div className="space-y-1">
          {error && (
            <p 
              id={errorId} 
              className="text-sm text-error-600 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          
          {success && !error && (
            <p 
              id={successId} 
              className="text-sm text-success-600 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {success}
            </p>
          )}
          
          {warning && !error && !success && (
            <p 
              id={warningId} 
              className="text-sm text-warning-600 flex items-center gap-1"
            >
              <Info className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {warning}
            </p>
          )}
          
          {helperText && !error && !success && !warning && (
            <p 
              id={helperId} 
              className="text-sm text-gray-500"
            >
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea"

export { Input, Textarea, inputVariants }
