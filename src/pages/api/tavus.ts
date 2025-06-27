// src/pages/api/tavus.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { template_id, variables } = req.body;
  console.log(template_id, variables)
  console.log('Requesting Tavus with:', {
    template_id,
    variables,
    apiKey: process.env.NEXT_PUBLIC_TAVUS_API_KEY ? 'present' : 'missing',
  });
  

  try {
    const response = await axios.post(
      'https://api.tavus.io/v1/videos',
      { template_id, variables },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAVUS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Tavus API error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
}
}
