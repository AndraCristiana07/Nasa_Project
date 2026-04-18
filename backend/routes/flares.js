const express = require('express');
const router = express.Router();
const axios = require('axios');

const cache = {};

const calculateFlareData = (flare) => {
    const loc = flare.sourceLocation;
    if (!loc) return null;

    const classType = flare.classType || 'C1.0';

    // regex to parse N20W23 into matches
    const match = loc.match(/([NS])(\d+)([EW])(\d+)/);
    if (!match) return null;

    const lat = match[1] === 'N' ? parseInt(match[2]) : -parseInt(match[2]);
    const lng = match[3] === 'E' ? parseInt(match[4]) : -parseInt(match[4]);

    // map to magnitudes too (M1.0 => 1.0, X2.5 => 2.5)
    const classMagnitude = parseFloat(classType.substring(1)) || 1.0;
    let baseMultiplier = 0.5;
    if (classType.startsWith('M')) baseMultiplier = 1.0;
    else if (classType.startsWith('X')) baseMultiplier = 2.0;

    const size = baseMultiplier * (1 + classMagnitude / 10); // size increases slightly with magnitude
    return {
        lat,
        lng,
        id: flare.flrID,
        class: classType, // X-high, M-medium
        peakTime: flare.peakTime,
        // based on intensity change color and size 
        // X size 2.0 and red, M size 1.0 and orange, C size 0.5 and yellow
        size: size,
        color: classType.startsWith('X') ? '#f11515' : classType.startsWith('M') ? '#f98029' : '#efdf67'
    };


};

router.get('/api/solar-flares', async (req, res) => {
    const cache_key = 'flares-apr-2026';
    if (cache[cache_key]) {
        console.log(`${cache_key} using cache`)
        return res.json(cache[cache_key]); // check cache
    }

    try {
        const response = await axios.get('https://api.nasa.gov/DONKI/FLR', {
            params: {
                startDate: '2026-04-01',
                endDate: '2026-04-11',
                api_key: process.env.NASA_API_KEY
            }
        });

        const flares = response.data
            .map(calculateFlareData)
            .filter(f => f !== null);

        cache[cache_key] = flares; // save to cache
        res.json(flares);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch solar data: ${error}` });
    }
});

module.exports = { router: router, calculateFlareData: calculateFlareData, cache: cache }