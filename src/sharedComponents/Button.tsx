import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  fullWidth = false,
  type = 'button',
  disabled = false
}) => {
  const baseStyles = 'font-semibold rounded-2xl transition-all duration-200 inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 shadow-lg hover:shadow-xl disabled:bg-teal-400 disabled:cursor-not-allowed',
    secondary: 'bg-white text-teal-700 border-2 border-teal-700 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border-3 border-orange-500 text-orange-500 hover:bg-orange-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed'
  };
  
  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg'
  };
  
  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
