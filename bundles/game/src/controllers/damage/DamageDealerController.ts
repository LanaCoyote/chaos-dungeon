

import Controller from "../Controller";
import Actor from "../../objects/actors/Actor";

import { EVENTS, DAMAGETYPES } from "./constants";

export default abstract class DamageDealerController extends Controller {

    public attached: Actor;

    constructor (attached: Actor) {
        super(attached, attached.scene);
    }

    public dealDamage(target: Actor, amount: number, type: DAMAGETYPES, source?: Actor) {
        target.emit( EVENTS.TAKE_DAMAGE, amount, type, this.attached, source );
    }

}