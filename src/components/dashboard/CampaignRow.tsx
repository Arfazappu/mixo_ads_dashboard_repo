import useSWR from "swr";
import { api, fetcher } from "../../api/campaigns";
import type { Campaign, CampaignInsights } from "../../types/campaign";
import { formatCurrency, formatNumber, getStatusColor } from "../../utils/formatters";
import ProgressBar from "../common/ProgressBar";

interface CampaignRowProps {
  campaign: Campaign;
  onView: (id: string) => void;
}

const CampaignRow: React.FC<CampaignRowProps> = ({ campaign, onView }) => {
  const { 
    data: insightsData, 
    error,
    isLoading 
  } = useSWR(
    api.getCampaignInsights(campaign.id), 
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      revalidateOnFocus: false,
    }
  );

  const insights = insightsData?.insights as CampaignInsights | undefined;
  const budgetUsed = insights ? (insights.spend / campaign.budget) * 100 : 0;

  // for error
  if (error) {
    return (
      <tr className="hover:bg-red-50 bg-red-50/30">
        <td className="px-5 py-4">
          <div className="font-medium text-gray-900">{campaign.name}</div>
          <div className="text-xs text-gray-500">{campaign.platforms.join(', ')}</div>
        </td>
        <td className="px-5 py-4">
          <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(campaign.status)}`}>
             {campaign.status}
          </span>
        </td>
        <td colSpan={4} className="px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Failed to load metrics</span>
            {error.status === 429 && (
              <span className="text-xs text-gray-500">(Rate limited)</span>
            )}
          </div>
        </td>
        <td className="px-5 py-4">
          <button
            onClick={() => onView(campaign.id)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            View
          </button>
        </td>
      </tr>
    );
  }

  // for loading
  if (isLoading || !insights) {
    return (
      <tr className="hover:bg-gray-50 animate-pulse">
        <td className="px-5 py-4">
          <div className="font-medium text-gray-900">{campaign.name}</div>
          <div className="text-xs text-gray-500">{campaign.platforms.join(', ')}</div>
        </td>
        <td className="px-5 py-4">
          <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(campaign.status)}`}>
             {campaign.status}
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="w-24">
            <div className="h-2.5 bg-gray-200 rounded-full"></div>
            <div className="text-xs text-gray-400 mt-1">Loading...</div>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-5 py-4">
          <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="px-5 py-4">
          <div className="h-4 bg-gray-200 rounded w-10 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </td>
        <td className="px-5 py-4">
          <button
            onClick={() => onView(campaign.id)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            View
          </button>
        </td>
      </tr>
    );
  }

  // for success
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-4">
        <div className="font-medium text-gray-900">{campaign.name}</div>
        <div className="text-xs text-gray-500">{campaign.platforms.join(', ')}</div>
      </td>
      <td className="px-5 py-4">
        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(campaign.status)}`}>
           {campaign.status}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="w-24">
          <ProgressBar percentage={budgetUsed} />
          <div className="text-xs text-gray-600 mt-1">{budgetUsed.toFixed(0)}%</div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(insights.spend)}
        </div>
        <div className="text-xs text-gray-500">of {formatCurrency(campaign.budget)}</div>
      </td>
      <td className="px-5 py-4">
        <div className="text-sm text-gray-900">
          {formatNumber(insights.clicks)}
        </div>
        <div className="text-xs text-gray-500">CTR {insights.ctr.toFixed(2)}%</div>
      </td>
      <td className="px-5 py-4">
        <div className="text-sm text-gray-900">
          {formatNumber(insights.conversions)}
        </div>
        <div className="text-xs text-gray-500">{insights.conversion_rate.toFixed(2)}%</div>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onView(campaign.id)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
        >
          View
        </button>
      </td>
    </tr>
  );
};

export default CampaignRow;