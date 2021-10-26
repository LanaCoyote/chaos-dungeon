import { Geom, Tilemaps } from "phaser";
import TileZone from "./TileZone";
import { TILE_HEIGHT, TILE_WIDTH } from "../../../constants";


export default class Wall extends TileZone {

    constructor( bounds: Geom.Rectangle, tilemap: Tilemaps.Tilemap ) {
        super( tilemap.scene, bounds.x, bounds.y, bounds.width, bounds.height );

        this.addTiles( tilemap, 0 );
    }

    public addTiles( tilemap: Tilemaps.Tilemap, layer?: number|string ): Tilemaps.Tile[] {
        const tiles: Tilemaps.Tile[] = [];
        
        for (let y = this.y; y < this.y + this.height; y = y + TILE_HEIGHT) {
            let col: number;
            if (y < this.y + TILE_HEIGHT * 2) col = Math.floor((y - this.y) / TILE_HEIGHT);
            else if (y >= this.y + this.height - TILE_HEIGHT * 2) col = Math.floor((y - (this.y + this.height - TILE_HEIGHT * 2)) / TILE_HEIGHT) + 3;
            else col = 2;

            for (let x = this.x; x < this.x + this.width; x = x + TILE_WIDTH) {
                let row: number;
                if (x < this.x + TILE_WIDTH * 2) row = Math.floor((x - this.x) / TILE_WIDTH);
                else if (x >= this.x + this.width - TILE_WIDTH * 2) row = Math.floor((x - (this.x + this.width - TILE_WIDTH * 2)) / TILE_WIDTH) + 3;
                else row = 2;

                const existingTile = tilemap.getTileAtWorldXY( x, y, true, undefined, layer );
                const newTile = tilemap.putTileAtWorldXY( this.getPatchOverlap( row + (col * 5), existingTile.index ), x, y, false, undefined, layer );
                tiles.push(newTile);
                existingTile.destroy();
            }
        }

        return tiles;
    }

    public getPatchOverlap(index: number, existingTile: number) {
        if (existingTile === -1) return -1;
        else if (existingTile >= 19) {
            const row = (index % 5);
            const col = (index - row) / 5;
            switch (existingTile) {
                case 54:    // south wall outer
                    return [56, 58, -1, 44, 46][row];
                case 55:    // south wall inner
                    return [57, 59, -1, 45, 47][row];
                case 24:    // north wall inner
                    return [32, 34, -1, 20, 22][row];
                case 25:    // north wall outer
                    return [33, 35, -1, 21, 23][row];
                case 42:    // west wall inner
                    return [44, 45, -1, 20, 21][col];
                case 43:    // west wall outer
                    return [46, 47, -1, 22, 23][col];
                case 66:    // east wall outer
                    return [56, 57, -1, 32, 33][col];
                case 67:    // east wall inner
                    return [58, 59, -1, 34, 35][col];
                default:
                    return -1;
            }  
        }

        return [
            76, 78, 54, 72, 73,
            77, 79, 55, 74, 75,
            66, 67, -1, 42, 43,
            80, 81, 24, 68, 70,
            82, 83, 25, 69, 71
        ][index];
    }
}