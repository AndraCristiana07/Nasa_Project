const express = require('express');
const router = express.Router();
const axios = require('axios');
const NASA_KEY = process.env.NASA_API_KEY;

const calculateRisk = (flares) => {
    let risk = 'LOW';
    let details = 'No significant solar activity detected';
    let source = 'N/A';
    let region = 'N/A';

    if (flares && flares.length > 0) {
        // M =  Medium-sized flares that can cause brief radio blackouts at the poles and minor radiation storms, often impacting astronauts
        // X = The most powerful, "juggernaut" flares. They can cause planet-wide radio blackouts, long-lasting radiation storms, and damage satellites
        const hasXClass = flares.some(f => f.classType.startsWith('X'));
        const hasMClass = flares.some(f => f.classType.startsWith('M'));

        if (hasXClass) {
            risk = 'HIGH';
            details = 'X-CLASS SOLAR FLARE DETECTED. Radiation hazard at maximum levels, severe communication blackouts expected';
        } else if (hasMClass) {
            risk = 'MEDIUM';
            details = 'M-CLASS SOLAR FLARE. Increased radiation levels, minor communication disruptions possible';
        }

        source = flares[0].sourceLocation || 'N/A';
        region = flares[0].activeRegionNum || 'N/A';

    }

    return { risk, details, source, region, flareCount: flares.length };
}

router.get('/api/space-weather/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const flareUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${date}&endDate=${date}&api_key=${NASA_KEY}`;

        const response = await axios.get(flareUrl);
        const flares = response.data;

        const riskData = calculateRisk(flares);

        res.json({
            date,
            ...riskData
        });

    } catch (error) {
        console.error("DONKI Error:", error);
        res.status(500).json({ error: "Failed to fetch space weather" });
    }
});


module.exports = { router: router, calculateRisk: calculateRisk}