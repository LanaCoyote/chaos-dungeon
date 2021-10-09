import { Geom } from "phaser";

import AiController from "./AiController";
import EnemyData from "./enemies/EnemyData";
import Hero from "../../objects/actors/Hero";
import LevelScene from "../../scenes/level/LevelScene";

import { DEPTH_FLOOR, DEPTH_FLYING } from "../../constants";

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

    onSleep: (ai: JumpingAiController) => void;
    onDecideToJump: (ai: JumpingAiController) => void;
    onJump: (ai: JumpingAiController) => void;
    onShortHop: (ai: JumpingAiController) => void;
}

export default class JumpingAiController extends AiController<JumpingEnemyDataType> {

    public scene: LevelScene;
    public state: JumpingEnemyStates = JumpingEnemyStates.STANDING;

    public onChangeState(oldState: JumpingEnemyStates, newState: JumpingEnemyStates) {
        switch (newState) {
            case JumpingEnemyStates.STANDING :
                this.data.onSleep(this);
                break;
            case JumpingEnemyStates.JUMPING :
                this.scene.time.delayedCall( this.data.timeBeforeJump, () => {
                    const destination = this.determineWhereToJump();
                    if (destination) {
                        this.jump( destination );
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
        } else if (this.state != JumpingEnemyStates.STANDING) {
            return JumpingEnemyStates.STANDING;
        } else {
            // if (Hero.activeHero) {
            //     const divider = Hero.activeHero.body.position.subtract( this.attached.body.position );
            //     if (this.data.shortHopDistance && divider.lengthSq() < this.data.shortHopDistance * this.data.shortHopDistance) {
            //         return JumpingEnemyStates.SHORTHOP;
            //     } else if (divider.lengthSq() < this.data.searchDistance * this.data.searchDistance) {
            //         return JumpingEnemyStates.AGGRO_JUMPING;
            //     }
            // }

            return JumpingEnemyStates.JUMPING;
        }
    }

    private determineWhereToJump(): Geom.Point {
        let nextPoint: Geom.Point = undefined;
        let pointIsValid: boolean = false;
        const jumpableRadius = new Geom.Circle( this.attached.x, this.attached.y, this.data.jumpDistance );
        const currentFloor = this.scene.getCurrentFloor();
        for (let i = 0; i < 30 && !pointIsValid; ++i) {
            nextPoint = jumpableRadius.getRandomPoint();
            pointIsValid = currentFloor.getCurrentRoom().rect.contains( nextPoint.x, nextPoint.y );
            if (pointIsValid && !this.data.canLandOnWalls) {
                if (currentFloor.tilemap.getTileAtWorldXY( nextPoint.x, nextPoint.y ).index === 1) {
                    pointIsValid = false;
                } 
            }
        }

        return nextPoint || undefined;
    }

    private jump( destination: Geom.Point ) {
        this.attached.setBaseDepth( DEPTH_FLYING );

        this.scene.tweens.add({
            targets: this.attached,
            x: destination.x,
            duration: this.data.jumpDuration,
            ease: 'Sine'
        });

        this.scene.tweens.add({
            targets: this.attached,
            y: destination.y - this.data.jumpHeight,
            duration: this.data.jumpDuration / 2,
            ease: 'Sine',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.attached,
                    y: destination.y,
                    duration: this.data.jumpDuration / 2,
                    ease: 'Bounce',
                    onComplete: () => {
                        this.attached.setBaseDepth( DEPTH_FLOOR );
                    }
                });
            }
        });
    }

}