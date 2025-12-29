import useSWR from "swr";
import { api, fetcher } from "../../api/campaigns";
import type { Campaign, OverviewInsights } from "../../types/campaign";
import MetricCard from "../common/MetricCard";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import CampaignRow from "./CampaignRow";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import { useNavigate } from "react-router-dom";


const Dashboard: React.FC = () => {
    const navigate = useNavigate();

  const { 
    data: campaignsData, 
    error: campaignsError,
    mutate: retryCampaigns 
  } = useSWR(api.getCampaigns(), fetcher, {
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  const { 
    data: insightsData, 
    error: insightsError,
    mutate: retryInsights 
  } = useSWR(api.getOverviewInsights(), fetcher, {
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  const campaigns = campaignsData?.campaigns as Campaign[] | undefined;
  const insights = insightsData?.insights as OverviewInsights | undefined;

  const handleRefresh = async () => {
    await Promise.all([
        retryCampaigns(),
        retryInsights(),
    ]);
    };

  if (campaignsError) {
    return <ErrorState error={campaignsError} onRetry={() => retryCampaigns()} />;
  }

  if (insightsError) {
    return <ErrorState error={insightsError} onRetry={() => retryInsights()} />;
  }

  // Loading state
  if (!campaigns || !insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-sm">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (campaigns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Campaign Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage your advertising campaigns</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
                Last updated: {new Date(insights.timestamp).toLocaleTimeString()}
            </span>

            <button
                onClick={handleRefresh}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg> 
                Refresh
            </button>
        </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard 
            title="Total Spend" 
            value={formatCurrency(insights.total_spend)}
            subtitle={`Avg CPC: ${formatCurrency(insights.avg_cpc)}`}
          />
          <MetricCard 
            title="Active Campaigns" 
            value={`${insights.active_campaigns}/${insights.total_campaigns}`}
            subtitle={`${insights.paused_campaigns} paused, ${insights.completed_campaigns} completed`}
          />
          <MetricCard 
            title="Total Clicks" 
            value={formatNumber(insights.total_clicks)}
            subtitle={`CTR ${insights.avg_ctr.toFixed(2)}%`}
          />
          <MetricCard 
            title="Conversions" 
            value={formatNumber(insights.total_conversions)}
            subtitle={`Rate ${insights.avg_conversion_rate.toFixed(2)}%`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard 
            title="Total Impressions" 
            value={formatNumber(insights.total_impressions)}
            subtitle="Total ad views"
          />
          <MetricCard 
            title="Average Performance" 
            value={`${insights.avg_conversion_rate.toFixed(2)}%`}
            subtitle={`Conv Rate · ${insights.avg_ctr.toFixed(2)}% CTR`}
          />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                All Campaigns <span className="text-sm text-gray-500 font-normal">({campaigns.length})</span>
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Usage</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {campaigns.map((campaign) => (
                  <CampaignRow 
                    key={campaign.id}
                    campaign={campaign}
                    onView={(id) => navigate(`/campaign/${id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;