const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const NASA_KEY = process.env.NASA_API_KEY;

// Artemis II images
app.get('/api/artemis/photos', async (req, res) => {
    try {
        // get 2026 flyby shots
        const response = await axios.get(`https://images-api.nasa.gov/search`, {
            params: {
                q: 'Artemis II Orion',
                media_type: 'image',
                year_start: '2026'
            }
        });

        const photos = response.data.collection.items.slice(0, 15).map(item => ({
            nasa_id: item.data[0].nasa_id,
            title: item.data[0].title,
            description: item.data[0].description,
            // image URL
            image_url: item.links[0].href,
            date: item.data[0].date_created
        }));

        res.json(photos);
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: "Image feed lost" });
    }
});


// map mission Day to actual date
const getDayDate = (day) => {
    const missionStart = new Date('2026-04-01');
    const targetDate = new Date(missionStart);
    targetDate.setDate(missionStart.getDate() + (parseInt(day) - 1));
    return targetDate.toISOString().split('T')[0]; // "2026-04-06" for day 6
};

app.get('/api/mission/day/:day', (req, res) => {
    const day = req.params.day;
    const dateKey = getDayDate(day);

    try {
        // read JSON file 
        const filePath = path.join(__dirname, 'artemis_gallery.json');

        if (!fs.existsSync(filePath)) {
            return res.status(500).json({ error: "Mission data file missing" });
        }

        const rawData = fs.readFileSync(filePath);
        const organizedData = JSON.parse(rawData);

        const dayPhotos = organizedData[dateKey];

        if (!dayPhotos || dayPhotos.length === 0) {
            return res.status(404).json({ error: `No photos found for day ${day} (${dateKey})` });
        }

        const gallery = dayPhotos.map(item => ({
            url: item.links[0].href,
            title: item.data[0].title,
            description: item.data[0].description,
            date: item.data[0].date_created
        }));

        res.json({
            day: day,
            date: dateKey,
            label: `Mission Day ${day}`,
            gallery: gallery
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to read mission log" });
    }
});


app.get('/api/mission/trajectory', (req, res) => {
    res.json({

        // TODO: THE PINS - add day 10
        milestones: [
            { day: 1, lat: 28.5, lng: -80.6, label: "Liftoff", color: "#fbbf24", info: "Orion launches from Kennedy Space Center." },
            { day: 2, lat: 45.0, lng: -120.0, label: "Trans-Lunar Injection", color: "#60a5fa", info: "Testing Life Support systems 46,000 miles above Earth." },
            { day: 3, lat: 25.0, lng: -60.0, label: "Deep Space Interior", color: "#60a5fa", info: "Crew demonstrates radiation shelter construction." },
            { day: 4, lat: 15.0, lng: -40.0, label: "Optical Comms Demo", color: "#60a5fa", info: "Orion beamed 100GB of data via laser back to Earth—a new deep-space record."},
            { day: 5, lat: 12.0, lng: 10.0, label: "Lunar Sphere of Influence", color: "#60a5fa", info: "Orion entered the Moon's gravity. The crew performed suit leak checks for the flyby." },
            { day: 6, lat: 18.4, lng: 155.0, label: "The Big Day (Furthest Point)", color: "#f87171", info: "Flyby at 4,067 miles above Ohm Crater." },
            { day: 7, lat: 0.0, lng: 100.0, label: "Earthrise", color: "#60a5fa", info: "Crew captures the first Earthrise of the mission." },
            { day: 8, lat: -15.0, lng: 20.0, label: "Media & Stowage:", color: "#60a5fa", info: "Conducted a live press conference from deep space." },
            { day: 9, lat: -25.0, lng: -115.0, label: "Return Preparation", color: "#fbbf24", info: "Orion prepares for 25,000 mph re-entry." }
        ]
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));