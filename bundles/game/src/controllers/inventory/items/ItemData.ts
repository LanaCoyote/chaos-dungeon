

import { ITEMCLASS } from "../constants";
import Equipment from "../../../objects/actors/Equipment";

export default abstract class ItemData {

    public readonly class: ITEMCLASS;
    public readonly texture: string;

    public onHold(equipActor: Equipment) {}
    public onRelease(equipActor: Equipment) {}
    public onShoot(equipActor: Equipment) {}

}