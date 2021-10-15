import { GameObjects, Physics } from "phaser";

import TouchDamageDealerController from "./TouchDamageDealerController";
import Actor from "../../objects/actors/Actor";
import Projectile from "../../objects/actors/Projectile";
import { DAMAGETYPES } from "./constants";

export default class TouchDamageProjectileController extends TouchDamageDealerController {

    public attached: Projectile;
    public damage: number;
    public damageType: DAMAGETYPES;
    public owner: Actor;
    public piercing: boolean;

    constructor( attached: Projectile, owner: Actor, damage: number, type: DAMAGETYPES, piercing?: boolean ) {
        super( attached );

        this.damage = damage;
        this.damageType = type;
        this.owner = owner;
        this.piercing = piercing || false;
    }

    public canDealDamage() {
        return this.active && this.attached.visible;
    }

    public checkCollision( ob1: GameObjects.GameObject, ob2: GameObjects.GameObject, body1: Physics.Arcade.Body, body2: Physics.Arcade.Body ) {
        if (!this.canDealDamage()) return;
        
        if (ob1 === this.attached && ob2 instanceof Actor && ob2 !== this.owner) {
            this.dealDamage( ob2, this.damage, this.damageType, this.attached );
            if (!this.piercing) ob1.destroy();
        } else if (ob2 === this.attached && ob1 instanceof Actor && ob1 !== this.owner) {
            this.dealDamage( ob1, this.damage, this.damageType, this.attached );
            if (!this.piercing) ob2.destroy();
        }
    }

}