

import Controller from "../Controller";
import Actor from "../../objects/actors/Actor";

import { EVENTS, DAMAGETYPES } from "./constants";

export default abstract class DamageableController extends Controller {
    
    public attached: Actor;
    public invulnPeriod: number = 500;  // how long (in ms) until the target can take damage again

    private invulnFrames: number = 0;

    constructor (attached: Actor) {
        super(attached, attached.scene);

        this.on( EVENTS.TAKE_DAMAGE, this.takeDamage.bind(this) );
        this.on( EVENTS.HEAL_DAMAGE, this.healDamage.bind(this) );
        this.on( EVENTS.KILL, this.slay.bind(this));
    }

    public isInvulnerable(): boolean {
        return this.invulnFrames > this.scene.time.now;
    }

    public healDamage(amount: number): number {
        this.onHealDamage(amount);
        return amount;
    }

    public takeDamage(amount: number, type: DAMAGETYPES, source: Actor, attacker?: Actor): number {
        if (!this || !this.active || this.isInvulnerable() || type === DAMAGETYPES.NONE) return 0;

        if (this.shouldTakeDamage(amount, type, source, attacker)) {
            amount = this.adjustDamage(amount, type, source, attacker);
            this.onTakeDamage(amount, type, source);
            this.invulnFrames = this.scene.time.now + this.invulnPeriod;
            return amount;
        } else {
            this.onPreventDamage(amount, type, source);
            return 0;
        }
    }

    public slay(type: DAMAGETYPES, source: Actor, attacker?: Actor): boolean {
        if (this.shouldTakeDamage(0, DAMAGETYPES.DEATH, source, attacker)) {
            this.die(0, type, source, attacker);
            return true;
        } else {
            return false;
        }
    }

    public shouldTakeDamage(amount: number, type: DAMAGETYPES, source: Actor, attacker?: Actor): boolean {
        return true;
    }

    public adjustDamage(amount: number, type: DAMAGETYPES, source: Actor, attacker?: Actor): number {
        return amount;
    }

    public die(damage: number, type: DAMAGETYPES, source: Actor, attacker?: Actor) {
        this.onDie(damage, type, attacker);
    }

    public onPreventDamage(amount: number, type: DAMAGETYPES, source: Actor) {}
    public onHealDamage(amount: number) {}
    public onTakeDamage(amount: number, type: DAMAGETYPES, source: Actor) {}
    public onDie(damage: number, type: DAMAGETYPES, attacker?: Actor) {}
}