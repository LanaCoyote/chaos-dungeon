import Controller, { Attachable } from "../Controller";

import { EVENTS, ITEMCLASS, RESCLASS } from "./constants";
import ItemData from "./items/ItemData";
import Sword from "./items/Sword";
import Actor from "../../objects/actors/Actor";
import Equipment from "../../objects/actors/Equipment";

export default class InventoryController extends Controller {

    private static InventoryState: Map<ITEMCLASS, ItemData> = new Map();
    private static EquippedItems: Array<Equipment> = [];

    constructor( attached?: Actor ) {
        super(attached);

        this.on(EVENTS.ADD_ITEM, this.addItem.bind(this));
        this.on(EVENTS.DROP_ITEM, this.dropItem.bind(this));

        this.on(EVENTS.RESET_INVENTORY, this.resetInventory.bind(this));
        this.on(EVENTS.CHANGE_INVENTORY, this.changeInventory.bind(this));

        this.on(EVENTS.RELEASE_EQUIP, this.releaseEquipment.bind(this));
        this.on(EVENTS.SHOOT_EQUIP, this.shootEquipment.bind(this));

        InventoryController.EquippedItems[0] = new Equipment(this.scene, attached, new Sword());
        // InventoryController.EquippedItems[0]
    }

    public addItem(itemClass: ITEMCLASS, item: ItemData) {
        if (InventoryController.InventoryState.has(itemClass)) {
            this.dropItem(itemClass);
        }

        InventoryController.InventoryState.set(itemClass, item);

        // play an animation?
    }

    public addResource(resClass: RESCLASS, amount: number) {
        
    }

    public dropItem(itemClass: ITEMCLASS) {
        if (InventoryController.InventoryState.has(itemClass)) {
            const item = InventoryController.InventoryState.get(itemClass);
            InventoryController.InventoryState.delete(itemClass);

            // Spawn an actor to hold the item we just removed
        }
    }

    public releaseEquipment(slot: number) {
        if (InventoryController.EquippedItems[slot - 1] === undefined) return;

        InventoryController.EquippedItems[slot - 1].onRelease();
    }

    public shootEquipment(slot: number) {
        console.log("shooting", InventoryController.EquippedItems[slot - 1]);

        if (InventoryController.EquippedItems[slot - 1] === undefined) return;

        InventoryController.EquippedItems[slot - 1].onShoot();
    }

    public changeInventory(items: Array<ItemData>) {
        InventoryController.InventoryState.clear();

        items.forEach(item => {
            InventoryController.InventoryState.set(item.class, item);
        });
    }

    public resetInventory() {
        InventoryController.InventoryState.clear();
    }

}