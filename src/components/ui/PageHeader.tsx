type PageHeaderProps = {
  icon?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
};

export function PageHeader({
  icon,
  title,
  subtitle,
  badge,
  action,
}: PageHeaderProps) {
  return (
    <section className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {icon && (
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-600/20 border border-blue-500 flex items-center justify-center text-2xl">
            {icon}
          </div>
        )}

        <div>
          {badge && (
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500 text-blue-300 px-3 py-1.5 rounded-full text-xs md:text-sm mb-3">
              {badge}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-gray-400 mt-2 text-sm sm:text-base md:text-lg leading-6 md:leading-7 max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && <div className="w-full sm:w-auto">{action}</div>}
    </section>
  );
}