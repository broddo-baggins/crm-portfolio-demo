import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  forgotPasswordLink?: string;
  onForgotPasswordClick?: (e: React.MouseEvent) => void;
  showStrengthBar?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}

const PasswordField = ({ 
  password, 
  setPassword, 
  forgotPasswordLink,
  onForgotPasswordClick,
  showStrengthBar = false,
  autoComplete = "current-password",
  disabled,
  required
}: PasswordFieldProps): React.JSX.Element => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const { t } = useTranslation('common');
  const { isRTL, textStart } = useLang();

  // Calculate password strength when password changes
  React.useEffect(() => {
    if (!showStrengthBar || !password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password, showStrengthBar]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label htmlFor="password" className={`text-sm font-medium ${textStart()}`}>
          {t('auth.password')}
        </label>
        {forgotPasswordLink && !onForgotPasswordClick && (
          <Link to={forgotPasswordLink} className="text-xs text-muted-foreground hover:text-primary">
            {t('auth.forgotPassword')}
          </Link>
        )}
        {onForgotPasswordClick && (
          <Button 
            onClick={onForgotPasswordClick} 
            variant="link" 
            className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
          >
            {t('auth.forgotPassword')}
          </Button>
        )}
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
          required={required}
          placeholder={isRTL ? 'הזן את הסיסמה שלך' : 'Enter your password'}
          className={`${isRTL ? 'pl-10 text-right' : 'pr-10 text-left'}`}
          autoComplete={autoComplete}
          dir={isRTL ? 'rtl' : 'ltr'}
          data-testid="password-input"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full px-3 py-2 text-gray-400`}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">{showPassword ? (isRTL ? 'הסתר סיסמה' : 'Hide password') : (isRTL ? 'הצג סיסמה' : 'Show password')}</span>
        </Button>
      </div>

      {showStrengthBar && password && (
        <PasswordStrengthIndicator password={password} passwordStrength={passwordStrength} />
      )}
    </div>
  );
};

export default PasswordField;
