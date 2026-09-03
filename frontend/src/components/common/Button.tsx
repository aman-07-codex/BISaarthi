import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'pill' | 'dark-outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
    md: "px-4.5 py-2.5 text-sm rounded-full gap-2",
    lg: "px-6 py-3 text-base rounded-full gap-2.5",
  }[size];

  const variantStyles = {
    primary: "bg-[#0D3328] hover:bg-[#164B3A] text-white shadow-xs focus:ring-[#5B8272]",
    secondary: "bg-[#FFFFFF] dark:bg-[#1B2B26] text-[#18211D] dark:text-[#F7F5EF] border border-[#D9DDD8] dark:border-[#253831] hover:bg-[#F2EFE9] dark:hover:bg-[#20312B] shadow-2xs focus:ring-[#8FA89B]",
    accent: "bg-[#5B8272] hover:bg-[#47675A] text-white shadow-xs focus:ring-[#5B8272]",
    ghost: "text-[#606E66] dark:text-[#BAC5BF] hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26] hover:text-[#18211D] dark:hover:text-white focus:ring-[#8FA89B]",
    destructive: "bg-[#FDF2EE] dark:bg-[#3E1A14] text-[#C86D51] dark:text-[#FECACA] border border-[#FBE0D6] dark:border-[#52251D] hover:bg-[#FBE0D6] focus:ring-[#C86D51]",
    pill: "bg-[#0D3328] hover:bg-[#164B3A] text-white rounded-full shadow-xs focus:ring-[#5B8272]",
    'dark-outline': "bg-transparent text-white border border-white/25 hover:bg-white/10 rounded-full focus:ring-white",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
