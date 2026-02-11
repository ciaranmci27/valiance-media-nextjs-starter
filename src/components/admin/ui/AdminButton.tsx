interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'default';
}

export default function AdminButton({
  variant = 'primary',
  size = 'default',
  className,
  children,
  ...props
}: AdminButtonProps) {
  const classes = [
    'admin-btn',
    `admin-btn-${variant}`,
    size === 'sm' ? 'admin-btn-sm' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
