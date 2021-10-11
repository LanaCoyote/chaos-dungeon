import { Math as Vector } from "phaser";

import DamageableController from "./DamageableController";
import Actor from "../../objects/actors/Actor";
import Flicker from "../../effects/Flicker";
import SpawnCloud from "../../effects/SpawnCloud";

import { DAMAGETYPES } from "./constants";
import { EVENTS as MOVEMENT_EVENTS } from "../physics/MovementController";

export default class TestDamageReceiver extends DamageableController {

    public onTakeDamage( amount: number, type: DAMAGETYPES, source: Actor, attacker?: Actor) {
        const hitPos = new Vector.Vector2( source.x, source.y );
        const repulsion = new Vector.Vector2( this.attached.x, this.attached.y ).subtract( hitPos );
        repulsion.setLength( 250 );

        new Flicker( this.attached, 500 );
        this.attached.emit( MOVEMENT_EVENTS.SHOVE, repulsion );
    }

}