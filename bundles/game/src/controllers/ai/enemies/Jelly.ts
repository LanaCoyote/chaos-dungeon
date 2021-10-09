

import Actor from "../../../objects/actors/Actor";
import EnemyData from "./EnemyData";
import JumpingAiController, {JumpingEnemyDataType} from "../JumpingAiController";

import { DEPTH_FLOOR } from "../../../constants";

export default class Jelly extends EnemyData implements JumpingEnemyDataType {

    public texture = "enemy/jelly";

    timeBeforeJump: number = 500;     // how long to wait before jumping when deciding to jump
    jumpHeight: number = 64;         // how high the enemy jumps, in pixels
    jumpDistance: number = 120;       // how far the enemy jumps, in pixels
    jumpDuration: number = 1500;       // how long the enemy jumps for
    searchDistance: number = 120;     // how far away the enemy will pursue the player from
    aggression: number = 0.25;         // 0-1, how likely they are to jump at the player if they're within search distance
    shortHopDistance: number = 0;   // how far the enemy will attempt to "short hop" at the player. set to 0 to disable
    sleepChance: number = 0.33;        // 0-1, how likely they are to do nothing instead of jumping
    canLandOnWalls: boolean = false;

    squishHeight = 20;
    stretchHeight = 36;

    public createController( attached: Actor ): JumpingAiController {
        attached.setOrigin( 0.5, 1 );
        attached.setBaseDepth( DEPTH_FLOOR );
        return new JumpingAiController( this, attached );
    }

    public onSleep( ai: JumpingAiController ) {
        ai.scene.tweens.add({
            targets: ai.attached,
            displayHeight: this.squishHeight,
            duration: 50,
            yoyo: true,
            repeat: 2,
            ease: 'bounce'
        });
    }

    public onDecideToJump( ai: JumpingAiController ) {
        ai.scene.tweens.add({
            targets: ai.attached,
            displayHeight: this.squishHeight,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'bounce'
        });
    }

    public onJump( ai: JumpingAiController ) {
        ai.scene.tweens.add({
            targets: ai.attached,
            displayHeight: this.stretchHeight,
            duration: this.jumpDuration / 2,
            yoyo: true,
            ease: 'Sine'
        });
    }

    public onShortHop( ai: JumpingAiController ) {

    }
}