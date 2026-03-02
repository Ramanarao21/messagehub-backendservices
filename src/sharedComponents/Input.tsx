import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  label,
  disabled = false
}) => {
  return (
    <div className="w-full mb-6">
      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl text-base transition-all duration-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 placeholder:text-slate-300 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
};

export default Input;
