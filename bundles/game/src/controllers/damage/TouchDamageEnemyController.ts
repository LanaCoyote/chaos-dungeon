import { GameObjects, Physics } from "phaser";

import DamageableController from "./DamageableController";
import TestDamageReceiver from "./TestDamageReceiver";
import TouchDamageDealerController from "./TouchDamageDealerController";
import EnemyData from "../ai/enemies/EnemyData";
import Actor from "../../objects/actors/Actor";

const symbolForEnemyDamageReceiver = Symbol.for(`[Controller ${TestDamageReceiver.constructor.name}]`);

export default class TouchDamageEnemyController extends TouchDamageDealerController {

    public damageReceiver: DamageableController;
    public enemyData: EnemyData;

    constructor(attached?: Actor, data?: EnemyData, receiver?: DamageableController) {
        super(attached);

        this.damageReceiver = receiver;
        this.enemyData = data;
    }

    public canDealDamage(): boolean {
        return this.active && this.damageReceiver && !this.damageReceiver.isInvulnerable();
    }

    public checkCollision( ob1: GameObjects.GameObject, ob2: GameObjects.GameObject, body1: Physics.Arcade.Body, body2: Physics.Arcade.Body ) {
        if (!this.canDealDamage()) return;

        const damageAmount = this.enemyData ? this.enemyData.touchDamageAmount : 1;
        const damageType = this.enemyData ? this.enemyData.touchDamageType : 0;

        if (ob1 === this.attached && ob2 instanceof Actor) {
            this.dealDamage( ob2, damageAmount, damageType, this.attached );
        } else if (ob2 === this.attached && ob1 instanceof Actor) {
            this.dealDamage( ob1, damageAmount, damageType, this.attached );
        }
    }

}