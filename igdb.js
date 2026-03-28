// api/igdb.js - v1.1.0 (Fixed)
const axios = require('axios');

// Constants
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_API_BASE_URL = 'https://api.igdb.com/v4';

// Token cache
let token = {
  access_token: null,
  expires_at: 0,
};

// Get access token from Twitch
async function getAccessToken() {
  const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

  if (!TWITCH_CLIENT_ID) {
    throw new Error("Missing environment variable: TWITCH_CLIENT_ID");
  }
  if (!TWITCH_CLIENT_SECRET) {
    throw new Error("Missing environment variable: TWITCH_CLIENT_SECRET");
  }

  const response = await axios.post(
    `${TWITCH_TOKEN_URL}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
  );

  const now = Date.now();
  token = {
    access_token: response.data.access_token,
    expires_at: now + (response.data.expires_in * 1000) - 60000, // Refresh 1 min early
  };
}

// Main serverless function
module.exports = async (request, response) => {
  // Input validation
  if (!request.body) {
    return response.status(400).json({ error: 'Request body is required.' });
  }
  
  const { endpoint, queryBody } = request.body;
  
  if (!endpoint || typeof endpoint !== 'string') {
    return response.status(400).json({ error: 'Invalid or missing "endpoint" parameter.' });
  }
  
  if (!queryBody) {
    return response.status(400).json({ error: 'Invalid or missing "queryBody" parameter.' });
  }

  // Check if we need a new token
  if (!token.access_token || Date.now() > token.expires_at) {
    try {
      await getAccessToken();
    } catch (error) {
      console.error('Twitch Auth Error:', error.message);
      return response.status(500).json({ 
        error: 'Failed to authenticate with Twitch API.', 
        details: error.message 
      });
    }
  }

  try {
    const apiResponse = await axios({
      url: `${IGDB_API_BASE_URL}/${endpoint}`,
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token.access_token}`,
        'Accept': 'application/json',
      },
      data: queryBody,
    });

    return response.status(200).json(apiResponse.data);

  } catch (error) {
    console.error('IGDB API Error:', error.response ? error.response.data : error.message);
    
    const statusCode = error.response ? error.response.status : 500;
    const errorDetails = error.response?.data || error.message;
    
    return response.status(statusCode).json({ 
      error: 'Failed to fetch data from IGDB API.',
      details: errorDetails
    });
  }
};