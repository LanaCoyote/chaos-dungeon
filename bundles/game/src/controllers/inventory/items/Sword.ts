import ItemData from "./ItemData";
import { ITEMCLASS } from "../constants";
import Equipment from "../../../objects/actors/Equipment";

export default class Sword extends ItemData {

    public class = ITEMCLASS.SWORD;
    public texture = "item/sword";

    public onRelease(equip: Equipment) {
        // equip.setVisible(false);
    }

    public onShoot(equip: Equipment) {
        console.log(equip);
        console.log("sword shoot");
        equip.setVisible(true);
        console.log(equip.user.x, equip.user.y);
        equip.setPosition(equip.user.x, equip.user.y);
        equip.setDepth(equip.user.depth + 1);
        console.log(equip.x, equip.y, equip.depth, equip.active);
    }

}