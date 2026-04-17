const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(morgan('dev'));

const {router: weatherRouter} = require('./routes/weather');
const {router: missionDayRouter} = require('./routes/mission_day');
const {router: flaresRouter} = require('./routes/flares');
const {data: data} = require('./routes/mission_data');
const {router: trajectoryRouter} = require('./routes/trajectory');
const {getArchive:getArchive} = require('./routes/mission_images')

app.use(missionDayRouter);

app.get('/api/mission/archive', getArchive);

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

