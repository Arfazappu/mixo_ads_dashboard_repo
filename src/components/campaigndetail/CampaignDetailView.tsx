import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { api, fetcher } from "../../api/campaigns";
import type { Campaign, CampaignInsights } from "../../types/campaign";
import { formatCurrency, formatNumber, getStatusColor } from "../../utils/formatters";
import ProgressBar from "../common/ProgressBar";
import ErrorState from "../common/ErrorState";
import { useCampaignInsightsStream } from "../../utils/useCampaignInsightStream";
import MetricCard from "../common/MetricCard";

const CampaignDetailPage = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, error, mutate } = useSWR(
    campaignId ? api.getCampaign(campaignId) : null,
    fetcher
  );

  const { data: initialInsights } = useSWR(
    campaignId ? api.getCampaignInsights(campaignId) : null,
    fetcher
  );

  const { data: liveInsights, connected } =
    useCampaignInsightsStream(campaignId!);

  if (error) {
    return <ErrorState error={error} onRetry={() => mutate()} />;
  }

  if (!data || !initialInsights) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-sm">Loading campaign details...</div>
        </div>
      </div>
    );
  }

  const campaign = data.campaign as Campaign;
  const insights = (liveInsights ?? initialInsights.insights) as CampaignInsights;

  const budgetUsed = (insights.spend / campaign.budget) * 100;
  const dailyBudgetUsed = Math.min((insights.spend / campaign.daily_budget) * 100, 100);
  const costPerConversion = insights.conversions > 0 ? insights.spend / insights.conversions : 0;
  const remainingBudget = campaign.budget - insights.spend;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-3 flex items-center gap-1 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
             Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{campaign.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                <span className="text-sm text-gray-500">
                  Platform: <span className="font-medium text-gray-700">{campaign.platforms.join(", ")}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-sm text-gray-600">{connected ? "Live Updates" : "Disconnected"}</span>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date(insights.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Spend" 
            value={formatCurrency(insights.spend)}
            subtitle={`CPC: ${formatCurrency(insights.cpc)}`}
          />
          <MetricCard 
            title="Clicks" 
            value={formatNumber(insights.clicks)}
            subtitle={`CTR ${insights.ctr.toFixed(2)}%`}
          />
          <MetricCard 
            title="Conversions" 
            value={formatNumber(insights.conversions)}
            subtitle={`Rate ${insights.conversion_rate.toFixed(2)}%`}
          />
          <MetricCard 
            title="Impressions" 
            value={formatNumber(insights.impressions)}
            subtitle="Total ad views"
          />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Tracker</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Total Budget: <span className="font-medium text-gray-900">{formatCurrency(campaign.budget)}</span>
                </span>
                <span className="font-medium text-gray-900">{budgetUsed.toFixed(1)}% spent</span>
              </div>
              <ProgressBar percentage={budgetUsed} />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Spent: {formatCurrency(insights.spend)}</span>
                <span>Remaining: {formatCurrency(remainingBudget)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Daily Budget: <span className="font-medium text-gray-900">{formatCurrency(campaign.daily_budget)}</span>
                </span>
                <span className="font-medium text-gray-900">{dailyBudgetUsed.toFixed(1)}% spent</span>
              </div>
              <ProgressBar percentage={dailyBudgetUsed} warning />
              {dailyBudgetUsed > 85 && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  ⚠️ Approaching daily budget limit
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Cost per Click (CPC)</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(insights.cpc)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Cost per Conversion</span>
              <span className="text-sm font-medium text-gray-900">
                {insights.conversions > 0 ? formatCurrency(costPerConversion) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Click-Through Rate (CTR)</span>
              <span className="text-sm font-medium text-gray-900">{insights.ctr.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium text-gray-900">{insights.conversion_rate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Impressions</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(insights.impressions)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Clicks</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(insights.clicks)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage