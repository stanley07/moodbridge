// tavus-fetch.mjs
import axios from 'axios';

const apiKey = 'YOUR_TAVUS_API_KEY'; // Replace with actual key

const fetchTemplates = async () => {
  try {
    const response = await axios.get('https://api.tavus.io/v1/templates', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    console.log('Templates:', response.data);
  } catch (err) {
    console.error('Error fetching templates:', err);
  }
};

fetchTemplates();
