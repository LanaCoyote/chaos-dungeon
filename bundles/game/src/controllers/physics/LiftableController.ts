import { Math as Vector, Physics, Scene } from "phaser";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import Actor from "../../objects/actors/Actor";
import Liftable from "../../objects/actors/Liftable";
import { UpdateController } from "../Controller";
import ArcadePhysicsController from "./ArcadePhysicsController";

export const EVENTS = {
    LIFT: Symbol.for("[Event LiftLiftable]"),
    THROW: Symbol.for("[Event ThrowLiftable]")
}

export enum STATES {
    SITTING,
    LIFTED,
    THROWN,
    FROZEN
}

export default class LiftableController extends ArcadePhysicsController implements UpdateController {

    public lifter: Actor;
    public state: STATES;
    public liftHeight: number = 20;
    public throwForce: number = 250;
    public throwHeight: number = 48;

    private virtualHeight: number = 0;

    constructor( attached: Liftable, scene?: Scene, lifter?: Actor ) {
        super( attached, scene );

        this.on( EVENTS.LIFT, this.lift.bind(this) );
        this.on( EVENTS.THROW, this.throw.bind(this) );

        this.state = STATES.SITTING;
    }

    public hasUpdateMethod(): true {
        return true;
    }

    public canLift( lifter: Actor ) {
        if (this.state !== STATES.SITTING) return false;
        return true;
    }

    public canThrow( thrower: Actor ) {
        if (this.state !== STATES.LIFTED || this.lifter !== thrower) return false;
        return true;
    }

    public landed() {
        if (!this || !this.body || !this.attached) return;

        this.state = STATES.SITTING;
        this.body.setOffset(0,0);
        this.attached.setAngle(0);
    }

    public lift( lifter: Actor ) {
        if (!this.canLift(lifter)) return;
        this.lifter = lifter;
        this.state = STATES.LIFTED;

        this.attached.setPosition( lifter.x, lifter.y - this.liftHeight );
    }

    public throw( thrower: Actor, direction: Vector.Vector2 ) {
        if (!this.canThrow(thrower)) return;
        delete this.lifter;
        this.state = STATES.THROWN;

        this.attached.setPosition( thrower.x, thrower.y - this.liftHeight );
        this.virtualHeight = this.liftHeight;
        const throwVector = direction.setLength( this.throwForce );

        this.body.setOffset( 0, this.liftHeight );
        this.body.setVelocity( throwVector.x, throwVector.y * (SCREEN_HEIGHT/SCREEN_WIDTH) );
        this.body.setDrag( this.throwForce, this.throwForce );

        this.scene.tweens.timeline({
            tweens: [{
                virtualHeight: this.throwHeight,
                duration: 250,
                ease: "Quad"
            }, {
                virtualHeight: 0,
                duration: 750,
                ease: "Bounce"
            }],
            targets: this,
            onComplete: this.landed,
            onCompleteScope: this
        });
    }

    public update(time: number, delta: number) {
        if (this.state === STATES.LIFTED) {
            this.attached.setPosition( this.lifter.x, this.lifter.y - this.liftHeight );
            this.attached.setDepth( this.lifter.depth + 1 );
        } else if (this.state === STATES.THROWN) {
            const ySpeed = this.body.velocity.y;
            this.body.setOffset(0, this.virtualHeight);
            this.attached.setY( this.body.center.y - this.virtualHeight );
            this.attached.setAngle( this.attached.angle + 720 * (delta/1000) );
            this.body.setVelocityY( ySpeed );
        }
    }


}