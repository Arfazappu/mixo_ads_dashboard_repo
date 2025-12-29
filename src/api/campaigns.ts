const BASE_URL = 'https://mixo-fe-backend-task.vercel.app';

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const error = new Error(errorData.message || 'Failed to fetch');
    Object.assign(error, errorData);
    throw error;
  }
  
  return res.json();
};

export const api = {
  getCampaigns: () => `${BASE_URL}/campaigns`,
  getCampaign: (id: string) => `${BASE_URL}/campaigns/${id}`,
  getOverviewInsights: () => `${BASE_URL}/campaigns/insights`,
  getCampaignInsights: (id: string) => `${BASE_URL}/campaigns/${id}/insights`,
};