const axios = require('axios');

const HQ_HEADERS = {
  'Authorization': process.env.HQ_API_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const hqUrls = {
  locations: process.env.HQ_API_LOCATIONS_URL,
  classes: process.env.HQ_API_CLASSES_URL,
  rates: process.env.HQ_API_RATES_URL,
  seasons: process.env.HQ_API_SEASONS_URL,
  charges: process.env.HQ_API_CHARGES_URL || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/additional-charges'
};

exports.fetchHQ = async (url) => {
  const response = await axios.get(url, { headers: HQ_HEADERS });
  return response.data;
};

exports.HQ_HEADERS = HQ_HEADERS;
exports.hqUrls = hqUrls;