import LifeController from "./LifeController";
import TouchDamageEnemyController from "./TouchDamageEnemyController";
import EnemyData from "../ai/enemies/EnemyData";
import Enemy from "../../objects/actors/Enemy";
import Actor from "../../objects/actors/Actor";
import Stunned from "../../effects/Stunned";

import {DAMAGETYPES} from "../damage/constants";

export default class DamageableEnemyController extends LifeController {

    public attached: Enemy<any>;
    public enemyData: EnemyData;
    public touchDamageDealer: TouchDamageEnemyController;

    constructor( attached: Enemy<any>, data: EnemyData ) {
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
        if (type === DAMAGETYPES.STUN && !this.enemyData.immunities.includes(DAMAGETYPES.STUN)) {
            this.attached.deactivateAllControllers();
            new Stunned( this.attached, 2000 );

            this.scene.time.delayedCall( 2000, () => {
                if (this && this.attached) {
                    this.attached.reactivateAllControllers();
                }
            });
        }
    }

}