import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, disabled, children, className, ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-gold-500 hover:bg-gold-400 text-black focus:ring-gold-500',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white focus:ring-gray-600',
    ghost:     'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-gray-600',
    danger:    'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    outline:   'border border-gray-700 hover:border-gold-500 text-gray-300 hover:text-gold-400 focus:ring-gold-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm gap-1.5', md: 'px-5 py-2.5 text-sm gap-2', lg: 'px-7 py-3.5 text-base gap-2.5' };

  return (
    <button ref={ref} disabled={disabled || loading} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  icon?:   React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm',
          'focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors',
          icon && 'pl-10',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm',
        'focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors',
        error && 'border-red-500',
        className,
      )}
      {...props}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden', className)}>
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'green' | 'red' | 'gray' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    gold:  'bg-gold-500/20 text-gold-400 border border-gold-500/30',
    green: 'bg-green-500/20 text-green-400 border border-green-500/30',
    red:   'bg-red-500/20 text-red-400 border border-red-500/30',
    gray:  'bg-gray-800 text-gray-400 border border-gray-700',
    blue:  'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-700 border-t-gold-500', sizes[size])} />
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-5xl mb-4 opacity-40">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
