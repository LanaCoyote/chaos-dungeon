import fs from 'fs';
import express from 'express';

import { SwapBear, SwapTiles, SwapWater } from './middleware/Palette.js';
import { GetLevelData, GenerateLevel } from "./data/LevelData.js"; 

const app = express();

app.use('/static', express.static("./dist/static"));
app.use('/bear', SwapBear);
app.use('/tiles', SwapTiles);
app.use('/water', SwapWater);
app.use('/level/data.json', GetLevelData);
app.use('/level/f1.csv', GenerateLevel);

app.get('/', (req, res) => {
    fs.readFile('./dist/static/index.html', 'utf8', (err, data) => {
        if (err) res.send(err.message);
        else res.send(data);
    })
});

const server = app.listen(3010, () => {
    console.log("Server listening on port 3010");
});