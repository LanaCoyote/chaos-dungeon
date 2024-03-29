import { Math as PhaserMath, Scene } from "phaser";

import ArcadePhysicsController from "./ArcadePhysicsController";
import { UpdateController } from "../Controller";
import Actor from "../../objects/actors/Actor";
import { IMPORTANT_TILES, MOVESTATE, TILE_WIDTH } from "../../constants";

export const EVENTS = {
    MOVE: Symbol("[Event Move]"),
    SHOVE: Symbol("[Event Shove]"),
    FREEZE: Symbol("[Event Freeze]"),
    UNFREEZE: Symbol("[Event Unfreeze]"),
    SLOW: Symbol("[Event Slow]"),
    UNSLOW: Symbol("[Event Unslow]")
}

export default class MovementController extends ArcadePhysicsController implements UpdateController {

    public acceleration: number = 600;
    public decelRate: number = 10;
    public intentWeight: number = 10;
    public mass: number = 1;
    public maxSpeed: number = 120;
    public currentMaxSpeed: number;

    private intents: Array<PhaserMath.Vector2> = [];
    private impulse: PhaserMath.Vector2;
    private state: MOVESTATE;

    constructor(actor?: Actor, scene?: Scene) {
        super(actor, scene);

        this.currentMaxSpeed = this.maxSpeed;
        this.on(EVENTS.MOVE, (velocity: PhaserMath.Vector2) => this.move(velocity));
        this.on(EVENTS.SHOVE, (velocity: PhaserMath.Vector2) => this.shove(velocity));
        this.on(EVENTS.FREEZE, (duration: number) => this.freeze(duration));
        this.on(EVENTS.UNFREEZE, () => this.unfreeze());
        this.on(EVENTS.SLOW, (speed: number) => this.slow(speed));
        this.on(EVENTS.UNSLOW, () => this.unslow());
    }

    public attach(actor: Actor, scene?: Scene) {
        ArcadePhysicsController.prototype.attach.call(this, actor, scene);
        this.state = MOVESTATE.STOPPING;
    }

    public activate() {
        this.active = true;
        this.body.setEnable(true);
        this.unfreeze();

        if (this.attached.baseDepth) {
            this.attached.setDepth( this.attached.baseDepth + this.attached.getBottomCenter().y );
        }
    }

    public deactivate() {
        this.active = false;
        this.unslow();
        if (this.body) {
            this.body.setVelocity(0, 0);
            this.body.setEnable(false);
        }
    }

    public hasUpdateMethod(): true {
        return true;
    }

    public freeze(duration?: number) {
        this.state = MOVESTATE.FROZEN;

        if (duration) {
            this.scene.time.delayedCall(duration, () => this.unfreeze());
        }
    }

    public move(velocity: PhaserMath.Vector2) {
        if (this.pushingIntoWall(velocity)) return;

        this.intents.push(velocity);
    }

    public shove(velocity: PhaserMath.Vector2) {
        if (this.pushingIntoWall(velocity, true)) return;

        if (!this.impulse) {
            this.impulse = velocity;
        } else {
            this.impulse = this.impulse.add(velocity);
        }
    }

    public slow(newSpeed: number) {
        this.currentMaxSpeed = newSpeed;
    }

    public unfreeze() {
        if (this.state === MOVESTATE.FROZEN) {
            this.state = MOVESTATE.STOPPING;
        }
    }

    public unslow() {
        this.currentMaxSpeed = this.maxSpeed;
    }

    public update(time: number, delta: number) {
        if (!this.active) {
            // throw out any movement commands while deactivated
            delete this.impulse;
            this.intents.length = 0;
            return;
        }

        // set our depth from our position
        if (this.attached.baseDepth) {
            this.attached.setDepth( this.attached.baseDepth + this.attached.getBottomCenter().y );
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
                this.attached.z = 0;
            } else {
                this.attached.z = 1;
                this.body.setAcceleration(-this.body.velocity.x * this.decelRate, -this.body.velocity.y * this.decelRate);
            }
        } else if (this.state === MOVESTATE.FROZEN) {
            if (this.body.velocity.lengthSq() < 8) {
                this.body.setVelocity( 0, 0 );
                this.body.setAcceleration( 0, 0 );
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
                // let newAcceleration = composite.subtract(this.body.acceleration);//this.body.acceleration.add(composite);
                // if (newAcceleration.lengthSq() > this.acceleration * this.acceleration) {
                //     newAcceleration.setLength(this.acceleration);
                // }

                let lastVelocity = this.body.velocity;
                // snap to cardinals
                if (Math.abs(lastVelocity.x) < 1) {
                    lastVelocity.x = 0;
                }
                if (Math.abs(lastVelocity.y) < 1) {
                    lastVelocity.y = 0;
                }

                this.body.setAcceleration(composite.x, composite.y);
                this.body.setVelocity(
                    lastVelocity.x + composite.x * delta,
                    lastVelocity.y + composite.y * delta
                );

                // cap movement speed
                if (this.body.velocity.lengthSq() > this.currentMaxSpeed * this.currentMaxSpeed) {
                    if (this.currentMaxSpeed >= this.maxSpeed) this.state = MOVESTATE.RUNNING;
                    this.body.velocity.setLength(this.currentMaxSpeed);
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

    private pushingIntoWall(velocity: PhaserMath.Vector2, deepCheck?: boolean): boolean {
        if (velocity.y < 0 && this.body.onCeiling()) return true;
        if (velocity.y > 0 && this.body.onFloor()) return true;
        if (velocity.x !== 0 && this.body.onWall()) return true;

        if (deepCheck) {
            const extraDist = velocity.clone().setLength(TILE_WIDTH);
            const checkPos = new PhaserMath.Vector2(this.body.x + extraDist.x, this.body.y + extraDist.y);
            const tile = this.scene.getCurrentFloor().tilemap.getTileAtWorldXY(checkPos.x, checkPos.y);

            if (tile) {
                return IMPORTANT_TILES.WALL.includes(tile.index)
                    || IMPORTANT_TILES.OBSTACLE.includes(tile.index)
                    || this.attached.z < 0 && IMPORTANT_TILES.LOWER_WALL.includes(tile.index);
            }
        }

        return false;
    }

}
