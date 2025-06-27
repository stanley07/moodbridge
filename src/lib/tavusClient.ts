import axios from 'axios';

const TAVUS_API_KEY = process.env.NEXT_PUBLIC_TAVUS_API_KEY || 'd2056f0608d54c26b885f32e38f03772';
const TAVUS_API_BASE = 'https://api.tavus.io/v1';

export const createTavusVideo = async (templateId: string, variables: Record<string, string>) => {
  const response = await axios.post('/api/tavus', {
    template_id: templateId,
    variables,
  });
  return response.data;
};
