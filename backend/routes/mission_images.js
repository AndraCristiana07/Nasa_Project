const fs = require('fs');
const path = require('path');

const getArchive = (req, res) => {
    try {
        const filePath = path.join(__dirname, '../data/artemis_gallery.json');
        const rawData = fs.readFileSync(filePath);
        const organizedData = JSON.parse(rawData);

        let allImages = [];
        Object.keys(organizedData).forEach(date => {
            const dayImages = organizedData[date].map(item => ({
                url: item.links[0].href,
                title: item.data[0].title,
                description: item.data[0].description,
                keywords: item.data[0].keywords || []
            }));
            allImages = [...allImages, ...dayImages];
        });

        res.json(allImages);
    } catch (error) {
        console.error("Archive Error:", error);
        res.status(500).json({ error: "Failed to fetch archive" });
    }
};

module.exports = { getArchive: getArchive };