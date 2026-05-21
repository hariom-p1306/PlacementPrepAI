export const Button = ({ children, ...props }: any) => {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded text-white"
      {...props}
    >
      {children}
    </button>
  );
};