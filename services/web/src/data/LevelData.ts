import express from "express";

import { addDoors, generateRoom } from "./generator.js";

const leveldefs = [
    {p:{x:2,y:3,w:1,h:1},e:[]},
    {p:{x:2,y:1,w:2,h:2},e:[{i:0,c:64}]},
    {p:{x:3,y:3,w:2,h:1},e:[{i:0,c:8},{i:1,c:2}]},
    {p:{x:0,y:1,w:2,h:1},e:[{i:0,c:16}]},
    {p:{x:4,y:1,w:1,h:2},e:[{i:0,c:8},{i:1,c:2}]},
    {p:{x:4,y:0,w:1,h:1},e:[{i:1,c:4}]}
];

export function GetLevelData(req: express.Request, res: express.Response ) {
    return res.json(leveldefs);
}

export function GenerateLevel(req: express.Request, res: express.Response ) {
    const mapLines = [];

    const nullRoom = generateRoom(1, 1);
    const room1 = generateRoom(1, 1);
    const room2 = generateRoom(2, 2);
    const room3 = generateRoom(2, 1);
    const room4 = generateRoom(2, 1);
    const room5 = generateRoom(1, 2);
    const room6 = generateRoom(1, 1);
    
    let strbuffer = nullRoom.map((l,i) => {
        return `${l},${l},${l},${l},${room6[i]}`
    }).join('\n');
    strbuffer += '\n' + room2.map((_,i) => {
        return `${room4[i]||room2[i]},${room2[i]},${room5[i]}`
    }).join('\n');
    strbuffer += '\n' + room1.map((_,i) => {
        return `${room4[i]},${room1[i]},${room3[i]}`
    }).join('\n');

    strbuffer = addDoors(strbuffer, [
        { x: 51, y: 43, type: 0 },
        { x: 51, y: 58, type: 0 },
        { x: 40, y: 23, type: 1 },
        { x: 82, y: 23, type: 1 },
        { x: 69, y: 43, type: 0 },
        { x: 93, y: 13, type: 0 }
    ]);

    
    res.send(strbuffer);
}