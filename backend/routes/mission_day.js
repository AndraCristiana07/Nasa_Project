const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const getDayDate = (day) => {
    const missionStart = new Date('2026-04-01');
    const targetDate = new Date(missionStart);
    targetDate.setDate(missionStart.getDate() + (parseInt(day) - 1));
    return targetDate.toISOString().split('T')[0]; // "2026-04-06" for day 6
};

router.get('/api/mission/day/:day', (req, res) => {
    const day = req.params.day;
    const dateKey = getDayDate(day);

    try {
        // read JSON file 
        const filePath = path.join(__dirname, '../data/artemis_gallery.json');
        console.log("Looking for file at:", filePath);
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
            date: item.data[0].date_created,
            type: item.data[0].media_type || 'image'
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

module.exports = { router: router, getDayDate: getDayDate }