interface AdminBannerProps {
  variant?: 'info' | 'warning' | 'success' | 'error';
  children: React.ReactNode;
  className?: string;
}

export default function AdminBanner({ variant = 'info', children, className }: AdminBannerProps) {
  return (
    <div className={`admin-banner${className ? ` ${className}` : ''}`} data-variant={variant}>
      {children}
    </div>
  );
}
