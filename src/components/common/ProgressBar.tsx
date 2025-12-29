const ProgressBar: React.FC<{ percentage: number; warning?: boolean }> = ({ percentage, warning }) => {
  const getColor = () => {
    if (warning && percentage > 85) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${getColor()} transition-all duration-300`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar