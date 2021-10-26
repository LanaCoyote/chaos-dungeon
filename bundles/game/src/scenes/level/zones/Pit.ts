import { GameObjects, Geom, Math, Physics, Scene, Tilemaps, Types } from "phaser";
import { IMPORTANT_TILES, LAYER_LOWER, LAYER_OBSTACLE, LAYER_WATER, TILE_HEIGHT, TILE_WIDTH } from "../../../constants";
import TileZone from "./TileZone";
import { EVENTS as MOVEMENT_EVENTS } from "../../../controllers/physics/MovementController";
import { DAMAGETYPES, EVENTS as DAMAGE_EVENTS } from "../../../controllers/damage/constants";
import Actor from "../../../objects/actors/Actor";
import Hero from "../../../objects/actors/Hero";

export default class Pit extends TileZone {

    private static zoneGroup: Physics.Arcade.StaticGroup;

    public body: Physics.Arcade.StaticBody;
    public tilemap: Tilemaps.Tilemap;

    private lowerAreaTiles: Tilemaps.Tile[];
    private tiles: Tilemaps.Tile[];

    public static addOverlap( scene: Scene, object: GameObjects.GameObject ): Physics.Arcade.Collider {
        return scene.physics.add.overlap( Pit.zoneGroup, object, (obj1: Types.Physics.Arcade.GameObjectWithBody, obj2: Types.Physics.Arcade.GameObjectWithBody) => {
            if (obj1 instanceof Pit && obj2 instanceof Actor) {
                const bounds = new Geom.Rectangle(obj1.x, obj1.y, obj1.width, obj1.height);
                if (!bounds.contains( obj2.x, obj2.getBottomCenter().y - 4 ) || obj2.body.velocity.lengthSq() === 0) return;

                obj1.onFallInto( obj2 );
            } else if (obj2 instanceof Pit && obj1 instanceof Actor) {
                const bounds = new Geom.Rectangle(obj2.x, obj2.y, obj2.width, obj2.height);
                if (!bounds.contains( obj1.x, obj1.getBottomCenter().y - 4 ) || obj1.body.velocity.lengthSq() === 0) return;

                obj2.onFallInto( obj1 );
            }
        }, (obj1: Types.Physics.Arcade.GameObjectWithBody, obj2: Types.Physics.Arcade.GameObjectWithBody) => {
            if (obj1 instanceof Actor && obj1.z <= 0) {
                return true;
            } else if (obj2 instanceof Actor && obj2.z <= 0) {
                return true;
            }

            return false;
        });
    }

    constructor( bounds: Geom.Rectangle, tilemap: Tilemaps.Tilemap ) {
        super( tilemap.scene, bounds.x, bounds.y, bounds.width, bounds.height );

        this.tilemap = tilemap;

        // this.body.onOverlap = true;
        if (!Pit.zoneGroup) {
            Pit.zoneGroup = this.scene.physics.add.staticGroup([this]);
        } else {
            Pit.zoneGroup.add(this);
        }

        if (!this.body) {
            this.scene.physics.add.existing(this);
        }

        this.body.debugBodyColor = 0x0000ff;
        this.body.setOffset( this.width / 2, this.height / 2 );

        this.firstTileId = 92;
        this.tiles = this.addTiles( this.tilemap, LAYER_OBSTACLE );
    }

    public getPatch(index: number) {
        if (this.firstTileId > 0) {
            if (index === 4) return 4;
            if (index > 4) return this.firstTileId + index - 1;
            else return this.firstTileId + index;
        }

        return this.firstTileId + index;
    }

    public onFallInto(object: GameObjects.Sprite) {
        // set z position to prevent further collisions
        object.z = 1;

        // do a little jumping animation
        let distance = new Math.Vector2( 0, 0 );
        let pos = object.getBottomCenter();
        if (pos.x < this.x + TILE_WIDTH) {
            distance.x = TILE_WIDTH * 1.5;
        } else if (pos.x > this.x + this.width - TILE_WIDTH) {
            distance.x = TILE_WIDTH * -1.5;
        }

        if (pos.y < this.y + TILE_HEIGHT) {
            distance.y = TILE_HEIGHT * 1.5;
        } else if (pos.y > this.y + this.height - TILE_HEIGHT) {
            distance.y = TILE_HEIGHT * -1.5;
        }

        if (distance.x !== 0) {
            object.emit( MOVEMENT_EVENTS.FREEZE );
            this.scene.tweens.timeline({
                targets: object,
                ease: 'Sine',
                tweens: [{
                    y: object.y - 24,
                    duration: 300,
                    ease: 'Sine'
                }, {
                    y: object.y + distance.y + 12,
                    duration: 450,
                    ease: 'Quad'
                }]
            });
        
            this.scene.tweens.add({
                targets: object,
                x: object.x + distance.x,
                ease: 'Sine',
                duration: 750,
                onComplete: () => this.onLandedIn( object, true )
            });
        } else if (distance.y !== 0) {
            object.emit( MOVEMENT_EVENTS.FREEZE );
            this.scene.tweens.add({
                targets: object,
                y: object.y + distance.y,
                ease: 'Sine',
                duration: 750,
                onComplete: () => this.onLandedIn( object, true )
            });
        } else {
            // we're already in the middle of the zone, so we probably fell in here somehow
            this.onLandedIn( object, false );
        }
    }

    public onExiting(object: GameObjects.Sprite) {
        object.emit(MOVEMENT_EVENTS.UNFREEZE);
        object.z = 0;
    }

    public onLandedIn(object: GameObjects.Sprite, jumpedIn: boolean) {
        if (!jumpedIn) object.emit(MOVEMENT_EVENTS.FREEZE);

        this.scene.tweens.add({
            targets: object,
            alpha: 0,
            scale: 0,
            duration: 1000,
            ease: 'Quad',
            onComplete: () => {
                if (object && object.active) {
                    object.alpha = 1;
                    object.scale = 1;

                    object.emit(MOVEMENT_EVENTS.UNFREEZE);
                    object.z = 0;
                    object.emit( DAMAGE_EVENTS.KILL, DAMAGETYPES.FALL, this );
                }
            }
        });  
    }

}