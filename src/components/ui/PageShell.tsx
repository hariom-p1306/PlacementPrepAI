type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main
      className={`min-h-screen bg-gray-950 text-white px-4 py-6 sm:px-6 md:px-8 md:py-10 ${className}`}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
}