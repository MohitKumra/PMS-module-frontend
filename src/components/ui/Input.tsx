interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/** Styled input with optional label and error message. */
export function Input({
  label, error, leftIcon, rightIcon,
  id, className = '', ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={[
            'w-full bg-surface border rounded-md text-text-primary',
            'placeholder-text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            error
              ? 'border-danger'
              : 'border-border hover:border-text-muted',
            'min-h-[44px] px-4 py-2.5 text-sm',
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            className,
          ].join(' ')}
        />
        {rightIcon && (
          <span className="absolute right-3 text-text-muted">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={[
          'w-full bg-surface border rounded-md text-text-primary',
          'placeholder-text-muted resize-none',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
          error
            ? 'border-danger'
            : 'border-border hover:border-text-muted',
          'px-4 py-3 text-sm',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}