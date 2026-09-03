import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
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
    sm: "px-3 py-1.5 text-xs rounded-[var(--radius-md)] gap-1.5",
    md: "px-4 py-2 text-sm rounded-[var(--radius-md)] gap-2",
    lg: "px-5 py-2.5 text-base rounded-[var(--radius-md)] gap-2.5",
  }[size];

  const variantStyles = {
    primary: "bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white shadow-sm focus:ring-[#2563EB]",
    secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm focus:ring-slate-400",
    accent: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm focus:ring-[#2563EB]",
    ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",
    destructive: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/40 focus:ring-red-500",
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
