import { Math as Vector, Physics } from "phaser";

import Actor from "../../objects/actors/Actor";
import { EVENTS as DAMAGE_EVENTS } from "../damage/constants";
import ArcadePhysicsController from "./ArcadePhysicsController";

export default class ProjectileController extends ArcadePhysicsController {

    public maxRange: number;
    public shooter: Actor;
    public velocity: Vector.Vector2;

    constructor( attached: Actor, shooter?: Actor, velocity?: Vector.Vector2 ) {
        super( attached, attached.scene );

        this.shooter = shooter;
        this.velocity = velocity;
        this.body.onOverlap = true;
    }

    public activate() {
        this.active = true;
        this.body.setEnable(true);
        this.body.setCircle(this.attached.width / 2);

        if (this.velocity) this.shoot(this.velocity);

        if (this.attached.baseDepth) {
            this.attached.setDepth( this.attached.baseDepth + this.attached.getBottomCenter().y );
        }
    }

    public deactivate() {
        this.active = false;
        if (this.body) {
            this.body.setVelocity(0, 0);
            this.body.setEnable(false);
        }
    }

    public shoot( velocity?: Vector.Vector2 ) {
        if (!velocity) velocity = this.velocity;
        this.attached.setAngle( velocity.angle() * (180/Math.PI) + 90 );
        this.body.setVelocity( velocity.x, velocity.y );
    }

}