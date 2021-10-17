import { Physics, Scene } from "phaser";

import Controller from "../Controller";
import Actor from "../../objects/actors/Actor";
import LevelScene from "../../scenes/level/LevelScene";

export default abstract class ArcadePhysicsController extends Controller {

    public attached: Actor; // Only actors can have a physics controller
    public body: Physics.Arcade.Body;
    public scene: LevelScene;
    public wallCollider: Physics.Arcade.Collider;

    public attach(actor: Actor, scene?: Scene, ignoreWalls?: boolean) {
        Controller.prototype.attach.call(this, actor, scene);

        if (!this.attached.body) {
            this.scene.physics.add.existing(this.attached);
        }

        this.body = this.attached.body as Physics.Arcade.Body;
        this.wallCollider = this.scene.physics.add.collider( this.attached, this.scene.getCurrentFloor().tilemap.getLayer().tilemapLayer );
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