import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrength: number;
}

const PasswordStrengthIndicator = ({ 
  password, 
  passwordStrength 
}: PasswordStrengthIndicatorProps): React.JSX.Element => {
  
  const getPasswordStrengthLabel = () => {
    if (password.length === 0) return '';
    if (passwordStrength < 3) return 'Weak';
    if (passwordStrength < 5) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (password.length === 0) return 'bg-gray-200';
    if (passwordStrength < 3) return 'bg-red-500';
    if (passwordStrength < 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password strength:</span>
        <span className={
          passwordStrength < 3 ? 'text-red-500' : 
          passwordStrength < 5 ? 'text-yellow-600' : 
          'text-green-600'
        }>
          {getPasswordStrengthLabel()}
        </span>
      </div>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getPasswordStrengthColor()}`} 
          style={{ width: `${(passwordStrength / 5) * 100}%` }}
        ></div>
      </div>
      <ul className="text-xs text-gray-500 list-disc pl-5 pt-1">
        <li className={password.length >= 8 ? 'text-green-600' : ''}>At least 8 characters</li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>Uppercase letter</li>
        <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>Lowercase letter</li>
        <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>Number</li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>Special character</li>
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
