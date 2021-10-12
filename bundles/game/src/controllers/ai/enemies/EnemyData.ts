import AiController from "../AiController";
import Actor from "../../../objects/actors/Actor";
import Enemy from "../../../objects/actors/Enemy";
import { DAMAGETYPES } from "../../damage/constants";

export default abstract class EnemyData {

    public texture: string;
    public immunities: DAMAGETYPES[] = [];
    public weaknesses: DAMAGETYPES[] = [];
    public minimumStateTime: number = 1000;
    public maximumStateTime: number = 3000;

    public life: number = 1;
    public damageOnTouch: boolean = true;
    public touchDamageAmount: number = 1;
    public touchDamageType: DAMAGETYPES = DAMAGETYPES.PHYSICAL;

    public createController( attached: Actor ): AiController<EnemyData>|null {
        return null;
    }

    // these callbacks get passed to the damage receiver
    // this allows me to do things like block all attacks in a given direction
    public alterDamage( amount: number, type: DAMAGETYPES, source: Actor, attacker?: Actor ): number {
        if ( this.weaknesses.includes( type ) ) return amount * 4;
        return amount;
    }

    public shouldTakeDamage( type: DAMAGETYPES, source: Actor, attacker?: Actor ): boolean {
        if ( attacker && attacker instanceof Enemy ) return false;
        if ( this.immunities.includes( type ) ) return false;
        return true;
    }
    
}