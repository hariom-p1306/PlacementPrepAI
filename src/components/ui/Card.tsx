export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-6 rounded-xl shadow-md bg-white">
      {children}
    </div>
  );
};