interface Props {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: Props) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full bg-gray-700 h-2 rounded mb-4">
      <div
        className="bg-blue-500 h-2 rounded transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};