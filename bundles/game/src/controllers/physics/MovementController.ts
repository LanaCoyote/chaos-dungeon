import { Math, Scene } from "phaser";

import ArcadePhysicsController from "./ArcadePhysicsController";
import { UpdateController } from "../Controller";
import Actor from "../../objects/actors/Actor";
import { MOVESTATE } from "../../constants";

export const EVENTS = {
    MOVE: Symbol("[Event Move]"),
    SHOVE: Symbol("[Event Shove]")
}

export default class MovementController extends ArcadePhysicsController implements UpdateController {

    public acceleration: number = 600;
    public decelRate: number = 10;
    public intentWeight: number = 10;
    public mass: number = 1;
    public maxSpeed: number = 120;

    private intents: Array<Math.Vector2> = [];
    private impulse: Math.Vector2;
    private state: MOVESTATE;

    constructor(actor?: Actor, scene?: Scene) {
        super(actor, scene);

        this.on(EVENTS.MOVE, (velocity: Math.Vector2) => this.move(velocity));
        this.on(EVENTS.SHOVE, (velocity: Math.Vector2) => this.shove(velocity));
    }

    public attach(actor: Actor, scene?: Scene) {
        ArcadePhysicsController.prototype.attach.call(this, actor, scene);
        this.state = MOVESTATE.STOPPING;
    }

    public activate() {
        this.active = true;
        this.body.setEnable(true);
    }

    public deactivate() {
        this.active = false;
        this.body.setVelocity(0, 0);
        this.body.setEnable(false);
    }

    public hasUpdateMethod(): true {
        return true;
    }

    public move(velocity: Math.Vector2) {
        this.intents.push(velocity);
    }

    public shove(velocity: Math.Vector2) {
        if (!this.impulse) {
            this.impulse = velocity;
        } else {
            this.impulse = this.impulse.add(velocity);
        }
    }

    public update(time: number, delta: number) {
        if (!this.active) {
            // throw out any movement commands while deactivated
            delete this.impulse;
            this.intents.length = 0;
            return;
        }

        // always apply impulses as-is
        if (this.impulse) {
            this.state = MOVESTATE.IMPULSE;
            this.body.setVelocity(this.impulse.x / this.mass, this.impulse.y / this.mass);
            delete this.impulse;
        }

        if (this.state === MOVESTATE.IMPULSE) {
            if (this.body.velocity.lengthSq() < this.maxSpeed * this.maxSpeed) {
                this.state = MOVESTATE.STOPPING;
            } else {
                this.body.setAcceleration(-this.body.velocity.x * this.decelRate, -this.body.velocity.y * this.decelRate);
            }
        } else {
            if (this.intents.length) {
                this.state = MOVESTATE.WALKING;

                // generate a composite from all intents
                let composite = this.intents.reduce((prev, cur) => {
                    if (!prev) return cur;
                    return prev.add(cur);
                });

                if (composite.lengthSq() > 1) {
                    composite = composite.normalize();
                }

                this.intents.length = 0;

                // increase the speed of the composite to match with our acceleration value
                composite.x = composite.x * this.acceleration * this.intentWeight;
                composite.y = composite.y * this.acceleration * this.intentWeight;

                // apply the acceleration to the physics body
                let newAcceleration = composite.subtract(this.body.acceleration);//this.body.acceleration.add(composite);
                if (newAcceleration.lengthSq() > this.acceleration * this.acceleration) {
                    newAcceleration.setLength(this.acceleration);
                }
                this.body.setAcceleration(newAcceleration.x, newAcceleration.y);

                // cap movement speed
                if (this.body.velocity.lengthSq() > this.maxSpeed * this.maxSpeed) {
                    this.state = MOVESTATE.RUNNING;
                    this.body.velocity.setLength(this.maxSpeed);
                }
            } else {
                this.state = MOVESTATE.STOPPING;

                // if we have no movement intent, apply deceleration
                if (this.body.velocity.lengthSq() < 10) {
                    this.body.setVelocity(0, 0);
                }

                this.body.setAcceleration(-this.body.velocity.x * this.decelRate, -this.body.velocity.y * this.decelRate);
            }
        }
    }

}
