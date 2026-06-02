type StatCardProps = {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  color?: "blue" | "green" | "purple" | "yellow";
};

const colorClasses = {
  blue: "border-blue-500 bg-blue-600/10",
  green: "border-green-500 bg-green-600/10",
  purple: "border-purple-500 bg-purple-600/10",
  yellow: "border-yellow-500 bg-yellow-600/10",
};

export function StatCard({
  icon,
  title,
  value,
  subtitle,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20">
      <div className="flex items-center gap-4 md:gap-5">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border flex items-center justify-center text-2xl ${colorClasses[color]}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-gray-400 text-sm md:text-base">{title}</p>

          <p className="text-2xl md:text-4xl font-bold mt-1">{value}</p>

          <p className="text-green-400 text-sm md:text-base mt-2">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}