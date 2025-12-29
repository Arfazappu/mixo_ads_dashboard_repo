import { useEffect, useState } from "react";
import type { CampaignInsights } from "../types/campaign";

export function useCampaignInsightsStream(campaignId: string) {
  const [data, setData] = useState<CampaignInsights | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!campaignId) return;

    const source = new EventSource(
      `https://mixo-fe-backend-task.vercel.app/campaigns/${campaignId}/insights/stream`
    );

    source.onopen = () => setConnected(true);

    source.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    source.onerror = () => {
      setConnected(false);
      source.close();
    };

    return () => source.close();
  }, [campaignId]);

  return { data, connected };
}
