const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(morgan('dev'));

const {router: weatherRouter} = require('./routes/weather');
const {router: missionDayRouter} = require('./routes/mission_day');
const {router: flaresRouter} = require('./routes/flares');
const {data: data} = require('./routes/mission_data');
const {router: trajectoryRouter} = require('./routes/trajectory');

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


app.use(missionDayRouter);

app.get('/api/mission/trajectory', (req, res) => {
    res.json(data);
});

app.use(weatherRouter);

app.use(flaresRouter);

app.get('/', async (req, res) => {
    res.status(200).json({body: 'The backend is running'});
});

app.use(trajectoryRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));

