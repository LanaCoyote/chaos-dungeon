import LifeController from "./LifeController";
import Actor from "../../objects/actors/Actor";
import Hero from "../../objects/actors/Hero";

import {DAMAGETYPES} from "../damage/constants";
import Curtain from "../../effects/Curtain";

export default class DamageablePlayerController extends LifeController {

    public attached: Hero;

    constructor( attached: Hero ) {
        super( attached, 16 );
        this.repulsionLength = 1750;
    }

    public slay(type: DAMAGETYPES, source: Actor, attacker?: Actor): boolean {
        if (this.shouldTakeDamage(0, DAMAGETYPES.DEATH, source, attacker)) {
            this.attached.deactivateAllControllers();
            this.attached.setVisible(false);
            const curtain = new Curtain( this.scene, this.attached, this.scene.cameras.main, 1500, true );
            this.scene.time.delayedCall(1500, () => {
                this.attached.respawn();
                this.attached.setVisible(true);
                curtain.fadeIn();
                this.scene.time.delayedCall(1000, () => {
                    this.attached.reactivateAllControllers();
                });
            });
        }

        return false;
    }

}