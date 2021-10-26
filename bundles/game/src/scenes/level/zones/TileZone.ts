import { GameObjects, Tilemaps } from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../../../constants";


export default class TileZone extends GameObjects.Zone {

    protected firstTileId: number = 0;

    public addTiles( tilemap: Tilemaps.Tilemap, layer?: number|string ): Tilemaps.Tile[] {
        const tiles: Tilemaps.Tile[] = [];
        
        for (let y = this.y; y < this.y + this.height; y = y + TILE_HEIGHT) {
            const col = (y === this.y ? 0 : y < this.y + this.height - TILE_HEIGHT ? 1 : 2) * 3;
            for (let x = this.x; x < this.x + this.width; x = x + TILE_WIDTH) {
                const row = x === this.x ? 0 : x < this.x + this.width - TILE_WIDTH ? 1 : 2;

                const newTile = tilemap.putTileAtWorldXY( this.getPatch( row + col ), x, y, false, undefined, layer );
                tiles.push(newTile);
            }
        }

        return tiles;
    }

    public getPatch(index: number) {
        return this.firstTileId + index;
    }


}