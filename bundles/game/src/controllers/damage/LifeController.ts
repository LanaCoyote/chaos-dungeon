import { Data, Math as Vector, Physics } from "phaser";

import DamageableController from "./DamageableController";
import Actor from "../../objects/actors/Actor";
import Flicker from "../../effects/Flicker";
import SpawnCloud from "../../effects/SpawnCloud";

import { EVENTS as DAMAGE_EVENTS, DAMAGETYPES } from "./constants";
import { EVENTS as MOVEMENT_EVENTS } from "../physics/MovementController";

export const LIFE_DATA_KEY = "LIFE";

export default class LifeController extends DamageableController {

    public maxLife: number;     // maximum life of this controller
    public life: number;        // current life of this controller

    constructor( attached: Actor, life: number ) {
        super( attached );

        this.maxLife = life;
        this.life = this.maxLife;
        this.attached.setData(LIFE_DATA_KEY, this.life);
    }

    public onPreventDamage(amount: number, type: DAMAGETYPES, source: Actor) {

    }

    public onHealDamage(amount: number) {
        this.life = Math.min( this.life + amount, this.maxLife );
        this.attached.setData(LIFE_DATA_KEY, this.life);
    }

    public onTakeDamage(amount: number, type: DAMAGETYPES, source: Actor) {
        // take health
        this.life = this.life - amount;
        this.attached.setData(LIFE_DATA_KEY, this.life);
        
        // knock back from source
        const sourceBody: {x: number, y: number} = (source.body as Physics.Arcade.Body) || source; 
        const thisBody: {x: number, y: number} = (this.attached.body as Physics.Arcade.Body) || this.attached;
        const hitPos = new Vector.Vector2( sourceBody.x, sourceBody.y );
        const repulsion = new Vector.Vector2( thisBody.x, thisBody.y ).subtract( hitPos );
        repulsion.setLength( this.repulsionLength );

        // flicker effect
        new Flicker( this.attached, this.invulnPeriod );
        this.attached.emit( MOVEMENT_EVENTS.SHOVE, repulsion );
        this.scene.sound.play("sfx/hit_enemy");

        // did we die?
        if (this.life <= 0) {
            this.scene.time.delayedCall(250, () => {
                if (this && this.isAttached()) {
                    this.scene.sound.play("sfx/hit_kill");
                    this.die(amount, type, source);
                }
            });
        }
    }

    public onDie(damage: number, type: DAMAGETYPES, attacker?: Actor) {
        this.attached.deactivateAllControllers();
        this.attached.setVisible(false);
        new SpawnCloud( this.attached, undefined, true );
        
        const destroyee = this.attached;
        destroyee.destroyAllControllers();
        destroyee.destroy();
    }

}