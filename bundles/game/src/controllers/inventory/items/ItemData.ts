

import { ITEMCLASS } from "../constants";
import Equipment from "../../../objects/actors/Equipment";

export default abstract class ItemData {

    public readonly class: ITEMCLASS;
    public readonly texture: string;

    public canUseAnotherItem(equipActor: Equipment, other: ItemData): boolean { return true }
    public onEquip(equipActor: Equipment) {}
    public onHold(equipActor: Equipment, delta: number) {}
    public onRelease(equipActor: Equipment) {}
    public onShoot(equipActor: Equipment) {}
    public onTouch(equipActor: Equipment) {}
    public onUpdate(equipActor: Equipment, delta: number) {}
    public onUnequip(equipActor: Equipment) {}

}