

import Actor from "../../../objects/actors/Actor";
import EnemyData from "./EnemyData";
import JumpingAiController, {JumpingEnemyDataType} from "../JumpingAiController";

import { DEPTH_FLOOR } from "../../../constants";

export default class Jelly extends EnemyData implements JumpingEnemyDataType {

    public texture = "enemy/jelly";

    life: number = 2;
    
    damageOnTouch: boolean = true;
    touchDamageAmount: number = 1;

    timeBeforeJump: number = 500;     // how long to wait before jumping when deciding to jump
    jumpHeight: number = 64;         // how high the enemy jumps, in pixels
    jumpDistance: number = 120;       // how far the enemy jumps, in pixels
    jumpDuration: number = 1500;       // how long the enemy jumps for
    searchDistance: number = 96;     // how far away the enemy will pursue the player from
    aggression: number = 0.25;         // 0-1, how likely they are to jump at the player if they're within search distance
    shortHopDistance: number = 0;   // how far the enemy will attempt to "short hop" at the player. set to 0 to disable
    sleepChance: number = 0.33;        // 0-1, how likely they are to do nothing instead of jumping
    canLandOnWalls: boolean = false;
    canJumpConstantly: boolean = false;

    squishHeight = 20;
    stretchHeight = 36;
    initialHeight = 24;

    public createController( attached: Actor ): JumpingAiController {
        attached.setOrigin( 0.5, 1 );
        attached.setBaseDepth( DEPTH_FLOOR );
        this.initialHeight = attached.displayHeight;
        return new JumpingAiController( this, attached );
    }

    public onSleep( ai: JumpingAiController ) {
        if (!ai.active) return;

        ai.scene.tweens.add({
            targets: ai.attached,
            displayHeight: this.squishHeight,
            duration: 50,
            yoyo: true,
            repeat: 2,
            ease: 'bounce',
            onComplete: () => {
                if (!ai.attached) return;
                ai.attached.displayHeight = this.initialHeight;
            }
        });
    }

    public onDecideToJump( ai: JumpingAiController ) {
        if (!ai.active) return;

        ai.scene.tweens.add({
            targets: ai.attached,
            displayHeight: this.squishHeight,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'bounce',
            onComplete: () => {
                if (!ai.attached) return;
                ai.attached.displayHeight = this.initialHeight;
            }
        });
    }

    public onJump( ai: JumpingAiController ) {
        if (!ai.active) return;

        ai.scene.tweens.add({
            targets: ai.attached,
            displayHeight: this.stretchHeight,
            duration: this.jumpDuration / 2,
            yoyo: true,
            ease: 'Sine',
            onComplete: () => {
                if (!ai.attached) return;
                ai.attached.displayHeight = this.initialHeight;
            }
        });
    }

    public onShortHop( ai: JumpingAiController ) {

    }
}