const express = require('express');
const router = express.Router();

const data = {
    milestones: [
            { day: 1, lat: 28.5, lng: -80.6, label: "Liftoff", color: "#fbbf24", info: "Orion launches from Kennedy Space Center." },
            { day: 2, lat: 45.0, lng: -120.0, label: "Trans-Lunar Injection", color: "#60a5fa", info: "Testing Life Support systems 46,000 miles above Earth." },
            { day: 3, lat: 25.0, lng: -60.0, label: "Deep Space Interior", color: "#60a5fa", info: "Crew demonstrates radiation shelter construction." },
            { day: 4, lat: 15.0, lng: -40.0, label: "Optical Comms Demo", color: "#60a5fa", info: "Orion beamed 100GB of data via laser back to Earth—a new deep-space record." },
            { day: 5, lat: 12.0, lng: 10.0, label: "Lunar Sphere of Influence", color: "#60a5fa", info: "Orion entered the Moon's gravity. The crew performed suit leak checks for the flyby." },
            { day: 6, lat: 18.4, lng: 155.0, label: "The Big Day (Furthest Point)", color: "#f87171", info: "Flyby at 4,067 miles above Ohm Crater." },
            { day: 7, lat: 0.0, lng: 100.0, label: "Earthrise", color: "#60a5fa", info: "Crew captures the first Earthrise of the mission." },
            { day: 8, lat: -15.0, lng: 20.0, label: "Media & Stowage:", color: "#60a5fa", info: "Conducted a live press conference from deep space." },
            { day: 9, lat: -25.0, lng: -115.0, label: "Return Preparation", color: "#60a5fa", info: "Orion prepares for 25,000 mph re-entry." },
            { day: 10, lat: 18.5, lng: -50.6, label: "Splashdown", color: "#fbbf24", info: "Orion safely splashes down in the Pacific Ocean." }
        ]
}

module.exports = { data: data }