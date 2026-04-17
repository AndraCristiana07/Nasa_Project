const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');


// memory cache
const cache = {};

// mapping
const objs = {
    'sun': '@sun',
    'earth': '399',
    'moon': '301',
    'artemis': '-1024'
}

const parseNasaVectors = (planet, data) => {
    const startMarker = "$$SOE";
    const endMarker = "$$EOE";

    const startIndex = data.indexOf(startMarker);
    const endIndex = data.indexOf(endMarker);

    try {
        fs.writeFileSync(`${planet}.txt`, data, 'utf8');
        console.log(`File ${planet}.txt saved!`);
    } catch (err) {
        console.error("Failed to write file:", err);
    }

    if (startIndex === -1 || endIndex === -1) {
        console.error("Markers $$SOE or $$EOE not found in NASA response");
        return null;
    }

    // extract only the text between the markers
    const dataSection = data.substring(startIndex + startMarker.length, endIndex);

    /**
    * X\s*=\s* -> Look for 'X =' with any amount of whitespace
    * ([-+]?[\d.E+]+) -> Capture group 1: numbers, decimals, signs, and scientific notation (E)
    * Repeat for Y and Z
    * 'g' flag -> Global search to find all coordinate sets
    */
    const regex = /X\s*=\s*([-+]?[\d.E+]+)\s*Y\s*=\s*([-+]?[\d.E+]+)\s*Z\s*=\s*([-+]?[\d.E+]+)/g;

    const coords = [];
    let match;


    while ((match = regex.exec(dataSection)) !== null) {
        coords.push({
            x: match[1],
            y: match[2],
            z: match[3]
        });
    }

    return coords;
};

// common parameters for the NASA API
const getBaseParams = (command, center) => ({
  format: 'text',
  COMMAND: `'${command}'`,
  OBJ_DATA: "'NO'",
  MAKE_EPHEM: "'YES'",
  EPHEM_TYPE: "'VECTORS'",
  CENTER: `'${center}'`,
  START_TIME: "'2026-04-02 01:58:32.5'",
  STOP_TIME: "'2026-04-10 23:54:22.8576'", // extended range for smoother orbits
  STEP_SIZE: "'1h'",
  VEC_TABLE: "'1'",
  OUT_UNITS: "'KM-S'"
});

router.get('/api/trajectory/:obj/:center', async (req, res) => {
  const cache_key = `${req.params.obj}-${req.params.center}`
  if (cache[cache_key]) {
    console.log(`${cache_key} using cache`)
    return res.json(cache[cache_key]); // check cache
  }
  try {

    console.log(req.params)

    const params = getBaseParams(objs[req.params.obj], objs[req.params.center]);
    params.STEP_SIZE = "'1h'";
    const response = await axios.get('https://ssd.jpl.nasa.gov/api/horizons.api', { params });
    const coords = parseNasaVectors(req.params.obj, response.data);
    cache[cache_key] = coords; // save to cache
    res.json(coords);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = { router: router, data: cache }