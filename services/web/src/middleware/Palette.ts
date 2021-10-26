import fs from "fs";
import express, { response } from "express";
import jimp from "jimp";

export function SwapBear(req: express.Request, res: express.Response) {
    jimp.read('./dist/static/bear.png')
        .then(image => {
            return image
            .color([{ apply: 'hue', params: [Math.random() * 360]}])
                .getBufferAsync(jimp.MIME_PNG);
        })
        .then(imageBuffer => {
            res.send(imageBuffer);
        })
        .catch(err => {
            res.send(err.message);
        });
}

export function SwapTiles(req: express.Request, res: express.Response) {
    jimp.read('./dist/static/placeholder_tiles.png')
        .then(image => {
            return image
                .color([{ apply: 'hue', params: [Math.random() * 360]}])
                .getBufferAsync(jimp.MIME_PNG);
        })
        .then(imageBuffer => {
            res.send(imageBuffer);
        })
        .catch(err => {
            res.send(err.message);
        });
}

export function SwapWater(req: express.Request, res: express.Response) {
    jimp.read('./dist/static/placeholder_water.png')
        .then(image => {
            return image
                .color([{ apply: 'hue', params: [Math.random() * 360]}])
                .getBufferAsync(jimp.MIME_PNG);
        })
        .then(imageBuffer => {
            res.send(imageBuffer);
        })
        .catch(err => {
            res.send(err.message);
        });
}