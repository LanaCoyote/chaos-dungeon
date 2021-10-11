import { Physics, GameObjects } from "phaser";

import Actor from "../../objects/actors/Actor";
import DamageDealerController from "./DamageDealerController";

export default class TouchDamageDealerController extends DamageDealerController {

    public attached: Actor;

    constructor (attached: Actor) {
        super(attached);

        attached.scene.physics.world.on( Physics.Arcade.Events.OVERLAP, this.checkCollision, this);
    }

    public canDealDamage(): boolean {
        return this.active;
    }

    public checkCollision( ob1: GameObjects.GameObject, ob2: GameObjects.GameObject, body1: Physics.Arcade.Body, body2: Physics.Arcade.Body ) {
        if (!this.canDealDamage()) return;

        if (ob1 === this.attached && ob2 instanceof Actor) {
            this.dealDamage( ob2, 1, 0, this.attached );
        } else if (ob2 === this.attached && ob1 instanceof Actor) {
            this.dealDamage( ob1, 1, 0, this.attached );
        }
    }

}