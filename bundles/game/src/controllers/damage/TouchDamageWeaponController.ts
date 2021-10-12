import { GameObjects, Physics } from "phaser";

import TouchDamageDealerController from "./TouchDamageDealerController";
import { WeaponData } from "../inventory/items/ItemData";
import Actor from "../../objects/actors/Actor";
import Equipment from "../../objects/actors/Equipment";

export default class TouchDamageWeaponController extends TouchDamageDealerController {

    public attached: Equipment;
    public data: WeaponData;

    constructor( attached: Equipment, data: WeaponData ) {
        super( attached );

        this.data = data;
    }

    public canDealDamage() {
        return this.active && this.attached.visible;
    }

    public checkCollision( ob1: GameObjects.GameObject, ob2: GameObjects.GameObject, body1: Physics.Arcade.Body, body2: Physics.Arcade.Body ) {
        if (!this.canDealDamage()) return;

        const damageAmount = this.data.getDamage( this.attached );
        const damageType = this.data.getDamageType( this.attached );

        if (ob1 === this.attached && ob2 instanceof Actor) {
            this.dealDamage( ob2, damageAmount, damageType, this.attached );
            this.data.onDamage( this.attached, ob2 );
        } else if (ob2 === this.attached && ob1 instanceof Actor) {
            this.dealDamage( ob1, damageAmount, damageType, this.attached );
            this.data.onDamage( this.attached, ob1 );
        }
    }

}