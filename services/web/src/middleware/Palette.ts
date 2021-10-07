import fs from "fs";
import express, { response } from "express";
import jimp from "jimp";

export function Swap(req: express.Request, res: express.Response) {
    jimp.read('./dist/static/bear.png')
        .then(image => {
            return image
                .color([{ apply: 'hue', params: [0]}])
                .getBufferAsync(jimp.MIME_PNG);
        })
        .then(imageBuffer => {
            res.send(imageBuffer);
        })
        .catch(err => {
            res.send(err.message);
        });
}