export const Textarea = ({ value, onChange }: any) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className="w-full border rounded p-3 focus:outline-none focus:ring-2"
      rows={5}
    />
  );
};