import Controller, { Attachable } from "../Controller";

import { EVENTS, ITEMCLASS, RESCLASS } from "./constants";
import ItemData from "./items/ItemData";

export default class InventoryController extends Controller {

    private static InventoryState: Map<ITEMCLASS, ItemData> = new Map();

    constructor( attached?: Attachable ) {
        super(attached);

        this.on(EVENTS.ADD_ITEM, this.addItem);
        this.on(EVENTS.DROP_ITEM, this.dropItem);

        this.on(EVENTS.RESET_INVENTORY, this.resetInventory);
        this.on(EVENTS.CHANGE_INVENTORY, this.changeInventory);
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