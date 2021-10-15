import express from "express";

import { generateRoom } from "./generator.js";

const leveldefs = [
    {p:{x:2,y:3,w:1,h:1},e:[]},
    {p:{x:2,y:1,w:2,h:2},e:[{i:0,c:100}]},
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

    const nullRoom = generateRoom(1, 1, []);
    const room1 = generateRoom(1, 1, [[9,0],[10,0],[9,1],[10,1],[9,11],[10,11]]);
    const room2 = generateRoom(2, 2, [[0,6],[1,6],[38,6],[39,6],[9,24],[10,24],[29,24],[30,24],[9,25],[10,25],[29,25],[30,25]]);
    const room3 = generateRoom(2, 1, [[9,0],[10,0],[9,1],[10,1]]);
    const room4 = generateRoom(2, 1, [[38,6],[39,6]]);
    const room5 = generateRoom(1, 2, [[9,0],[10,0],[9,1],[10,1],[0,6],[1,6]]);
    const room6 = generateRoom(1, 1, [[9,11],[10,11],[9,12],[10,12]]);

    let strbuffer = nullRoom.map((l,i) => {
        return `${l},${l},${l},${l},${room6[i]}`
    }).join('\n');
    strbuffer += '\n' + room2.map((_,i) => {
        return `${room4[i]||room2[i]},${room2[i]},${room5[i]}`
    }).join('\n');
    strbuffer += '\n' + room1.map((_,i) => {
        return `${room4[i]},${room1[i]},${room3[i]}`
    }).join('\n');
    
    res.send(strbuffer);
}