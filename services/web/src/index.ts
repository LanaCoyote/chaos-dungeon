import fs from 'fs';
import express from 'express';

import { Swap } from './middleware/Palette.js';

const app = express();

app.use('/static', express.static("./dist/static"));
app.use('/bear', Swap);

app.get('/', (req, res) => {
    fs.readFile('./dist/static/index.html', 'utf8', (err, data) => {
        if (err) res.send(err.message);
        else res.send(data);
    })
});

const server = app.listen(3000, () => {
    console.log("Server listening on port 3000");
});