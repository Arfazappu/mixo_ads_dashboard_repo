const ErrorState: React.FC<{ 
  error: any; 
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  const isRateLimit = error?.status === 429 || error?.error === "Too Many Requests";
  const retryAfter = error?.retry_after;

  console.log(error)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isRateLimit ? "Rate Limit Exceeded" : "Something went wrong"}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {error?.message || "An unexpected error occurred while loading the dashboard"}
            </p>
            
            {isRateLimit && retryAfter && (
              <p className="text-xs text-gray-500 mb-3">
                Please wait {retryAfter} seconds before trying again
              </p>
            )}
            
            {error?.status && (
              <p className="text-xs text-gray-400 mb-3">
                Error code: {error.status}
              </p>
            )}
            
            {onRetry && !isRateLimit && (
              <button
                onClick={onRetry}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
            
            {isRateLimit && (
              <div className="text-xs text-gray-500">
                The dashboard will automatically retry when the limit resets
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState