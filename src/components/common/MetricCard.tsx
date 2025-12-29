const MetricCard: React.FC<{ title: string; value: string; subtitle?: string; trend?: string }> = ({ 
  title, 
  value, 
  subtitle, 
  trend 
}) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
    <div className="text-sm text-gray-600 mb-1">{title}</div>
    <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
    {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    {trend && <div className="text-xs text-green-600 mt-1">{trend}</div>}
  </div>
);

export default MetricCard