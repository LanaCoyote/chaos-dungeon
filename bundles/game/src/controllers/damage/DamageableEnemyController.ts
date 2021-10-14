import LifeController from "./LifeController";
import TouchDamageEnemyController from "./TouchDamageEnemyController";
import EnemyData from "../ai/enemies/EnemyData";
import Enemy from "../../objects/actors/Enemy";
import Actor from "../../objects/actors/Actor";
import Stunned from "../../effects/Stunned";

import {DAMAGETYPES} from "../damage/constants";

export default class DamageableEnemyController extends LifeController {

    public attached: Enemy;
    public enemyData: EnemyData;
    public touchDamageDealer: TouchDamageEnemyController;

    private isStunned: boolean;

    constructor( attached: Enemy, data: EnemyData ) {
        super( attached, data.life );

        this.enemyData = data;
        if (this.enemyData.damageOnTouch) {
            this.touchDamageDealer = new TouchDamageEnemyController( attached, data, this );
        }
    }

    public shouldTakeDamage(amount: number, type: DAMAGETYPES, source: Actor, attacker?: Actor): boolean {
        if (type === DAMAGETYPES.STUN && !this.enemyData.weaknesses.includes(DAMAGETYPES.STUN)) {
            return false;
        }

        return true;
    }

    public onPreventDamage(amount: number, type: DAMAGETYPES, source: Actor) {
        if (type === DAMAGETYPES.STUN && !this.enemyData.immunities.includes(DAMAGETYPES.STUN) && !this.isStunned) {
            this.attached.deactivateAllControllers();
            this.activate();
            this.attached.body.setEnable(true);
            this.attached.body.reset( this.attached.x, this.attached.y );
            new Stunned( this.attached, 2000 );
            this.isStunned = true;

            this.scene.time.delayedCall( 2000, () => {
                if (this && this.attached) {
                    this.attached.reactivateAllControllers();
                    this.isStunned = false;
                }
            });
        }
    }

}