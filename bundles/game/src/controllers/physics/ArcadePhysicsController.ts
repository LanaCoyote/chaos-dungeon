import { Physics, Scene, Types } from "phaser";

import Controller from "../Controller";
import Actor from "../../objects/actors/Actor";
import LevelScene from "../../scenes/level/LevelScene";
import { LAYER_LOWER, LAYER_OBSTACLE, LAYER_WATER } from "../../constants";
import LowerArea from "../../scenes/level/zones/LowerArea";
import Pit from "../../scenes/level/zones/Pit";

export default abstract class ArcadePhysicsController extends Controller {

    public attached: Actor; // Only actors can have a physics controller
    public body: Physics.Arcade.Body;
    public scene: LevelScene;
    public obstacleCollider: Physics.Arcade.Collider;
    public wallCollider: Physics.Arcade.Collider;
    public lowerWallCollider: Physics.Arcade.Collider;
    public lowerWallOverlapper: Physics.Arcade.Collider;
    public pitCollider: Physics.Arcade.Collider;

    constructor(actor: Actor, scene?: Scene, ignoreObstacles?: boolean, ignoreWalls?: boolean) {
        super( actor, scene );

        if (!ignoreWalls) {
            this.wallCollider = this.scene.physics.add.collider( this.attached, this.scene.getCurrentFloor().tilemap.getLayer().tilemapLayer );
            this.lowerWallCollider = this.scene.physics.add.collider( this.attached, this.scene.getCurrentFloor().tilemap.getLayer(LAYER_LOWER).tilemapLayer,
                undefined, (object1: Types.Physics.Arcade.GameObjectWithBody, object2: Types.Physics.Arcade.GameObjectWithBody) => {
                    if (object1 instanceof Actor && object1 === this.attached && object1.z < 0) {
                        return true;
                    } else if (object2 instanceof Actor && object2 === this.attached && object2.z < 0) {
                        return true;
                    }

                    return false;
                });
        }

        if (!ignoreObstacles) {
            this.lowerWallOverlapper = LowerArea.addOverlap( this.scene, this.attached );
            this.pitCollider = Pit.addOverlap( this.scene, this.attached );
            this.obstacleCollider = this.scene.physics.add.collider( this.attached, this.scene.getCurrentFloor().tilemap.getLayer(LAYER_OBSTACLE).tilemapLayer );
            // this.scene.physics.add.collider( this.attached, this.scene.getCurrentFloor().tilemap.getLayer(LAYER_WATER).tilemapLayer );
        }
    }

    public attach(actor: Actor, scene?: Scene, ignoreObstacles?: boolean, ignoreWalls?: boolean) {
        Controller.prototype.attach.call(this, actor, scene);

        if (!this.attached.body) {
            this.scene.physics.add.existing(this.attached);
        }

        this.body = this.attached.body as Physics.Arcade.Body;
    }

    public destroy() {
        if (this.body && this.body.enable) {
            this.body.destroy();
            delete this.body;
        }

        Controller.prototype.destroy.call(this);
    }

    public detach() {
        Controller.prototype.detach.call(this);

        if (this.body) {
            delete this.body;
        }
    }

}