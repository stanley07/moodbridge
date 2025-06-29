import axios from 'axios';

const API_KEY = 'd2056f0608d54c26b885f32e38f03772';

const fetchTemplates = async () => {
  try {
    const response = await axios.get('https://api.tavus.io/v1/templates', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(response.data);
  } catch (error) {
    console.error('Error fetching templates:', error.message);
    console.error(error.response?.data || error);
  }
};

fetchTemplates();
