const express = require('express');
const router = express.Router();

const data = {
    milestones: [
            { day: 1, label: "Liftoff" },
            { day: 2, label: "Trans-Lunar Injection" },
            { day: 3, label: "Deep Space Interior" },
            { day: 4, label: "Optical Comms Demo" },
            { day: 5, label: "Lunar Sphere of Influence", },
            { day: 6, label: "The Big Day (Furthest Point)" },
            { day: 7, label: "Earthrise" },
            { day: 8, label: "Media & Stowage:" },
            { day: 9, label: "Return Preparation" },
            { day: 10, label: "Splashdown" }
        ]
}

module.exports = { data: data }