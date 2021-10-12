export const EVENTS = {
    TAKE_DAMAGE: Symbol("[Event TakeDamage]"),  // take x damage of the given type (damage, type, source, attacker)
    HEAL_DAMAGE: Symbol("[Event HealDamage]"),  // recover x damage (damage)
    KILL: Symbol("[Event Kill]"),               // immediately take lethal damage, resets the player (type, source, attacker)

    DIED: Symbol("[Event Died]"),               // fires when an actor runs out of life (damageTaken, type, attacker)

    START_VOIDOUT: Symbol("[Event Start VoidOut]"), // fires at the beginning of a void out (damageTaken, type, attacker)
    VOIDOUT: Symbol("[Event VoidOut]"),         // fires after the fade out effect of a void out but before the fade in (damageTaken, type, attacker)
    END_VOIDOUT: Symbol("[Event End VoidOut]"), // fires after the fade in effect of a void out (damageTaken, type, attacker)
}

export enum DAMAGETYPES {
    NONE,           // doesn't do damage
    STUN,           // stun damage dealt by the hookshot/boomerang, usually ignored unless weak
    PHYSICAL,       // damage done by most weapons, such as the bow and sword
    EXPLODE,        // bomb damage
    CRUSH,          // hammer and charge damage
    FIRE,           // fire damage from fire arrows, fire rod, and lantern
    ICE,            // ice damage from ice arrows and ice rod
    ELECTRIC,       // elec damage from elec arrows and elec rod
    DEATH,          // potentially instant death. prevents the kill event from instantly killing
    UNMITIGATABLE,  // nothing can stop it
}