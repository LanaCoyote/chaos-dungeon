import { Math as Vector, Geom } from "phaser";

import AiController from "./AiController";
import EnemyData from "./enemies/EnemyData";
import Hero from "../../objects/actors/Hero";
import LevelScene from "../../scenes/level/LevelScene";

import { DEPTH_FLOOR, DEPTH_FLYING, IMPORTANT_TILES } from "../../constants";
import MovementController, { EVENTS as MOVEMENT_EVENTS } from "../physics/MovementController";

export enum JumpingEnemyStates {
    STANDING,       // do nothing
    JUMPING,        // jump anywhere
    AGGRO_JUMPING,  // jump at the player
    SHORTHOP,       // a quick attack
    KNOCKBACK       // taking damage, knocked out of a jump
}

export interface JumpingEnemyDataType extends EnemyData {
    timeBeforeJump: number;     // how long to wait before jumping when deciding to jump
    jumpHeight: number;         // how high the enemy jumps, in pixels
    jumpDistance: number;       // how far the enemy jumps, in pixels
    jumpDuration: number;       // how long the enemy jumps for
    searchDistance: number;     // how far away the enemy will pursue the player from
    aggression: number;         // 0-1, how likely they are to jump at the player if they're within search distance
    shortHopDistance: number;   // how far the enemy will attempt to "short hop" at the player. set to 0 to disable
    sleepChance: number;        // 0-1, how likely they are to do nothing instead of jumping
    canLandOnWalls: boolean;    // whether or not this enemy will jump on solid tiles
    canJumpConstantly: boolean; // if false, the enemy will always transition to standing after a jump

    onSleep: (ai: JumpingAiController) => void;
    onDecideToJump: (ai: JumpingAiController) => void;
    onJump: (ai: JumpingAiController) => void;
    onShortHop: (ai: JumpingAiController) => void;
}

export default class JumpingAiController extends AiController<JumpingEnemyDataType> {

    public scene: LevelScene;
    public state: JumpingEnemyStates = JumpingEnemyStates.STANDING;

    public onChangeState(oldState: JumpingEnemyStates, newState: JumpingEnemyStates) {
        let jumpDestination: Geom.Point;
        switch (newState) {
            case JumpingEnemyStates.STANDING :
                this.data.onSleep(this);
                break;
            case JumpingEnemyStates.SHORTHOP :
            case JumpingEnemyStates.AGGRO_JUMPING :
                jumpDestination = new Geom.Point( Hero.activeHero.x, Hero.activeHero.getBottomCenter().y );
                // intentional fallthrough
            case JumpingEnemyStates.JUMPING :
                if (!jumpDestination) jumpDestination = this.determineWhereToJump( jumpDestination );
                this.scene.time.delayedCall( this.data.timeBeforeJump, () => {
                    if (!this.attached) return;
                    if (jumpDestination) {
                        this.jump( jumpDestination );
                        this.data.onJump(this);
                    } else {
                        console.log( "could not find a destination" );
                        this.data.onSleep(this);
                    }
                }, [], this);
                this.setStateTimer( this.data.timeBeforeJump + this.data.jumpDuration );
                this.data.onDecideToJump(this);
                break;
        }
    }

    protected getNextState(): JumpingEnemyStates {
        // try to sleep
        if (Math.random() < this.data.sleepChance) {
            return JumpingEnemyStates.STANDING;
        }

        if (this.state == JumpingEnemyStates.AGGRO_JUMPING) {
            return JumpingEnemyStates.JUMPING;
        } else if (this.state != JumpingEnemyStates.STANDING && !this.data.canJumpConstantly) {
            return JumpingEnemyStates.STANDING;
        } else {
            // see if the hero is nearby
            if (Hero.activeHero && Hero.activeHero.body) {
                const divider = Hero.activeHero.body.position.subtract( this.attached.body.position );
                if (this.data.shortHopDistance && divider.lengthSq() < this.data.shortHopDistance * this.data.shortHopDistance) {
                    return JumpingEnemyStates.SHORTHOP;
                
                // if they're not close enough for a short hop, do an aggro jump
                } else if (divider.lengthSq() < this.data.searchDistance * this.data.searchDistance && Math.random() < this.data.aggression) {
                    return JumpingEnemyStates.AGGRO_JUMPING;
                }
            }

            return JumpingEnemyStates.JUMPING;
        }
    }

    private determineWhereToJump( nextPoint: Geom.Point ): Geom.Point {
        let pointIsValid: boolean = false;
        const jumpableRadius = new Geom.Circle( this.attached.x, this.attached.y, this.data.jumpDistance );
        const currentFloor = this.scene.getCurrentFloor();
        for (let i = 0; i < 30 && !pointIsValid; ++i) {
            nextPoint = jumpableRadius.getRandomPoint( nextPoint );
            pointIsValid = currentFloor.getCurrentRoom().rect.contains( nextPoint.x, nextPoint.y );
            if (pointIsValid && !this.data.canLandOnWalls) {
                if (currentFloor.tilemap.getTileAtWorldXY( nextPoint.x, nextPoint.y ).collides) {
                    pointIsValid = false;
                } 
            }
        }

        return nextPoint || undefined;
    }

    private jump( destination: Geom.Point ) {
        if (!this.active) return;

        const xMovement = destination.x - this.attached.x;
        this.attached.setBaseDepth( DEPTH_FLYING );
        this.attached.emit( MOVEMENT_EVENTS.SHOVE, new Vector.Vector2( xMovement, this.data.jumpHeight * -1 ) );

        this.scene.tweens.add({
            targets: this.attached,
            x: destination.x,
            duration: this.data.jumpDuration,
            ease: 'Sine'
        });

        this.scene.tweens.timeline({
            tweens: [{
                y: destination.y - this.data.jumpHeight,
                ease: 'Sine',
                onComplete: () => {
                    if (!this.attached) return;
                    this.attached.emit( MOVEMENT_EVENTS.SHOVE, new Vector.Vector2( xMovement, this.data.jumpHeight ) );
                }
            }, {
                y: destination.y,
                ease: 'Bounce',
            }],
            totalDuration: this.data.jumpDuration,
            targets: this.attached,
            onComplete: () => {
                if (!this.attached) return;
                this.attached.setBaseDepth( DEPTH_FLOOR );
            }
        });
    }

}