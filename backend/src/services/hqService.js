const axios = require('axios');

const HQ_HEADERS = {
  'Authorization': process.env.HQ_API_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const hqUrls = {
  locations:    process.env.HQ_API_LOCATIONS_URL,
  classes:      process.env.HQ_API_CLASSES_URL,
  rates:        process.env.HQ_API_RATES_URL,
  seasons:      process.env.HQ_API_SEASONS_URL,
  charges:      process.env.HQ_API_CHARGES_URL || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/additional-charges',
  vehicles:     process.env.HQ_API_URL,
  // FIX: faltaba la URL de reservations — causaba que hqUrls.reservations fuera undefined
  // y el fetch explotaba inmediatamente al intentar sincronizar
  reservations: process.env.HQ_API_Resrvations_URL || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/reservations'
};

exports.fetchHQ = async (url) => {
  const response = await axios.get(url, { headers: HQ_HEADERS });
  return response.data;
};

exports.HQ_HEADERS = HQ_HEADERS;
exports.hqUrls = hqUrls;