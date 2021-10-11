import TestDamageReceiver from "./TestDamageReceiver";
import TouchDamageDealerController from "./TouchDamageDealerController";
import Actor from "../../objects/actors/Actor";

const symbolForEnemyDamageReceiver = Symbol.for(`[Controller ${TestDamageReceiver.constructor.name}]`);

export default class TouchDamageEnemyController extends TouchDamageDealerController {

    public damageReceiver: TestDamageReceiver;

    constructor(attached?: Actor) {
        super(attached);

        this.damageReceiver = attached.getController(symbolForEnemyDamageReceiver) as TestDamageReceiver;
    }

    public canDealDamage(): boolean {
        return this.active && !this.damageReceiver.isInvulnerable();
    }


}