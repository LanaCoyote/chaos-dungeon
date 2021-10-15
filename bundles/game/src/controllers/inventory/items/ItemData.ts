

import { ITEMCLASS } from "../constants";
import Actor from "../../../objects/actors/Actor";
import Equipment from "../../../objects/actors/Equipment";
import { DAMAGETYPES } from "../../damage/constants";

export interface WeaponData {
    getDamage: (equipActor: Equipment) => number;
    getDamageType: (equipActor: Equipment) => DAMAGETYPES;
    onDamage: (equipActor: Equipment, other: Actor) => void;
}

export default abstract class ItemData {

    public readonly class: ITEMCLASS;
    public readonly texture: string;

    public readonly displayName: string;
    public readonly shortHelp: string;
    public readonly useAngledIcon: boolean;

    public canUseAnotherItem(equipActor: Equipment, other: ItemData): boolean { return true }
    public onEquip(equipActor: Equipment) {}
    public onHold(equipActor: Equipment, delta: number) {}
    public onRelease(equipActor: Equipment) {}
    public onShoot(equipActor: Equipment) {}
    public onTouch(equipActor: Equipment) {}
    public onUpdate(equipActor: Equipment, delta: number) {}
    public onUnequip(equipActor: Equipment) {}

}