/**
 * Service layer for talking to the ML model servers (Python side, presumably FastAPI/Flask).
 * Replace the axios calls below with your actual model server endpoints once ready.
 * Kept isolated here so controllers never talk to the model directly - easier to swap/mock/test.
 */

// Using global fetch (Node 18+). If on an older Node version, install axios instead.

const POLLUTION_MODEL_URL = process.env.POLLUTION_MODEL_URL;
const NOISE_COMPLAINT_MODEL_URL = process.env.NOISE_COMPLAINT_MODEL_URL;

/**
 * Fetches current + forecasted AQI and noise data for a given lat/lng from the ML model service.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} model response (AQI current/forecast, noise estimate, etc.)
 */
const getPollutionPrediction = async (latitude, longitude) => {
  const response = await fetch(POLLUTION_MODEL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pollution model request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

export default { getPollutionPrediction };