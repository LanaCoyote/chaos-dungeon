import TouchDamageDealerController from "./TouchDamageDealerController";

export default class TouchDamageWeaponController extends TouchDamageDealerController {

    public canDealDamage() {
        return this.active && this.attached.visible;
    }

}