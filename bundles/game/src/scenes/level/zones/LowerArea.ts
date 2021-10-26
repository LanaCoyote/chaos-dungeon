import { GameObjects, Geom, Math, Physics, Scene, Tilemaps, Types } from "phaser";
import { IMPORTANT_TILES, LAYER_LOWER, LAYER_WATER, TILE_HEIGHT, TILE_WIDTH } from "../../../constants";
import TileZone from "./TileZone";
import { EVENTS as MOVEMENT_EVENTS } from "../../../controllers/physics/MovementController";
import { DAMAGETYPES, EVENTS as DAMAGE_EVENTS } from "../../../controllers/damage/constants";
import Actor from "../../../objects/actors/Actor";
import Hero from "../../../objects/actors/Hero";
import LevelScene from "../LevelScene";

export default class LowerArea extends TileZone {

    private static zoneGroup: Physics.Arcade.StaticGroup;

    public body: Physics.Arcade.StaticBody;
    public flooded: boolean;
    public scene: LevelScene;
    public tilemap: Tilemaps.Tilemap;

    private lowerAreaTiles: Tilemaps.Tile[];
    private waterTiles: Tilemaps.Tile[];
    private stairs: Tilemaps.Tile[];

    public static addOverlap( scene: LevelScene, object: GameObjects.GameObject ): Physics.Arcade.Collider {
        // this.zoneGroup.children.each((zone: LowerArea) => {
        //     scene.physics.add.overlap( zone, object, (obj1: Types.Physics.Arcade.GameObjectWithBody, obj2: Types.Physics.Arcade.GameObjectWithBody) => {
        //         console.log(obj1, obj2);
        //     });
        // })

        return scene.physics.add.overlap( LowerArea.zoneGroup, object, (obj1: Types.Physics.Arcade.GameObjectWithBody, obj2: Types.Physics.Arcade.GameObjectWithBody) => {
            if (obj1 instanceof LowerArea && obj2 instanceof Actor) {
                const bounds = new Geom.Rectangle(obj1.x, obj1.y, obj1.width, obj1.height);
                if (!bounds.contains( obj2.x, obj2.getBottomCenter().y - 4 ) || obj2.body.velocity.lengthSq() === 0) return;

                obj1.onFallInto( obj2 );
            } else if (obj2 instanceof LowerArea && obj1 instanceof Actor) {
                const bounds = new Geom.Rectangle(obj2.x, obj2.y, obj2.width, obj2.height);
                if (!bounds.contains( obj1.x, obj1.getBottomCenter().y - 4 ) || obj1.body.velocity.lengthSq() === 0) return;

                obj2.onFallInto( obj1 );
            }
        }, (obj1: Types.Physics.Arcade.GameObjectWithBody, obj2: Types.Physics.Arcade.GameObjectWithBody) => {
            if (obj1 instanceof Actor && obj1.z === 0) {
                return true;
            } else if (obj2 instanceof Actor && obj2.z === 0) {
                return true;
            }

            return false;
        });
    }

    constructor( bounds: Geom.Rectangle, tilemap: Tilemaps.Tilemap, flooded?: boolean ) {
        super( tilemap.scene, bounds.x, bounds.y, bounds.width, bounds.height );

        this.tilemap = tilemap;
        this.flooded = flooded || false;

        // this.body.onOverlap = true;
        if (!LowerArea.zoneGroup) {
            LowerArea.zoneGroup = this.scene.physics.add.staticGroup([this]);
        } else {
            LowerArea.zoneGroup.add(this);
        }

        if (!this.body) {
            this.scene.physics.add.existing(this);
        }

        this.body.debugBodyColor = 0x0000ff;
        this.body.setOffset( this.width / 2, this.height / 2 );
        this.stairs = [];

        this.addLowerAreaTiles();
        if (this.flooded) this.addWaterTiles();
    }

    public addStaircase( stairs: Tilemaps.Tile ) {
        stairs.setCollisionCallback((object: Actor) => this.onStaircaseUp( object, stairs ), this);
        this.stairs.push( stairs );
    }

    public addLowerAreaTiles() {
        this.firstTileId = 84;
        this.lowerAreaTiles = this.addTiles( this.tilemap, LAYER_LOWER );
    }

    public addWaterTiles() {
        this.firstTileId = 0;
        this.waterTiles = this.addTiles( this.tilemap, LAYER_WATER );
    }

    public getPatch(index: number) {
        if (this.firstTileId > 0) {
            if (index === 4) return 1;
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
            distance.x = TILE_WIDTH * 0.5;
        } else if (pos.x > this.x + this.width - TILE_WIDTH) {
            distance.x = TILE_WIDTH * -0.5;
        }

        if (pos.y < this.y + TILE_HEIGHT) {
            distance.y = TILE_HEIGHT * 0.5;
        } else if (pos.y > this.y + this.height - TILE_HEIGHT) {
            distance.y = TILE_HEIGHT * -0.5;
        }

        if ( IMPORTANT_TILES.STAIRCASE.includes( this.tilemap.getTileAtWorldXY( pos.x + distance.x, pos.y + distance.y, true, undefined, LAYER_LOWER ).index )) {
            return this.onStaircaseDown( object, distance.setLength( TILE_WIDTH * 2 ) );
        }

        distance.x = distance.x * 3;
        distance.y = distance.y * 3;
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
                    y: object.y + distance.y + (this.flooded ? 12 : 0),
                    duration: 450,
                    ease: this.flooded ? 'Quad' : 'Bounce'
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
                ease: this.flooded ? 'Sine' : 'Bounce',
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
        if (jumpedIn) {
            object.emit(MOVEMENT_EVENTS.UNFREEZE);
        }

        object.z = -1;

        if (object.body instanceof Physics.Arcade.Body) {
            const bounds = this.getBounds();
            bounds.x = bounds.x + bounds.width / 2;
            bounds.y = bounds.y + bounds.height / 2;
            object.body.setBoundsRectangle( bounds );
        }

        if (this.flooded) {
            object.emit( DAMAGE_EVENTS.KILL, DAMAGETYPES.DROWN, this );
        }
    }

    public onStaircaseDown(object: GameObjects.Sprite, distance: Math.Vector2) {
        object.emit( MOVEMENT_EVENTS.FREEZE );
        this.scene.tweens.add({
            targets: object,
            x: object.x + distance.x,
            y: object.y + distance.y,
            ease: 'Linear',
            duration: 750,
            onComplete: () => this.onLandedIn( object, true )
        });
    }

    public onStaircaseUp(object: GameObjects.Sprite, stairs: Tilemaps.Tile) {
        if (!(object instanceof Hero)) return;

        object.z = 1;
        if (object.body instanceof Physics.Arcade.Body) {
            object.body.setBoundsRectangle( this.scene.getCurrentFloor().getCurrentRoom().rect );
        }

        let distance = new Math.Vector2( 0, 0 );
        let pos = object.getBottomCenter();
        if (pos.x < stairs.pixelX) {
            distance.x = TILE_WIDTH * 2;
        } else if (pos.x > stairs.pixelX + TILE_WIDTH) {
            distance.x = TILE_WIDTH * -2;
        }

        if (pos.y < stairs.pixelY + TILE_HEIGHT) {
            distance.y = TILE_HEIGHT * 2;
        } else if (pos.y > stairs.pixelY + TILE_HEIGHT) {
            distance.y = TILE_HEIGHT * -2;
        }

        object.emit( MOVEMENT_EVENTS.FREEZE );
        this.scene.tweens.add({
            targets: object,
            x: object.x + distance.x,
            y: object.y + distance.y,
            ease: 'Linear',
            duration: 750,
            onComplete: () => this.onExiting( object )
        });
    }


}