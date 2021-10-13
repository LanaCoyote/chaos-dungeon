import { GameObjects, Geom, Scene } from "phaser";

import InventoryController from "../../controllers/inventory/InventoryController";

export default class EquipmentSlot extends GameObjects.Group {

    constructor( scene: Scene, pos: Geom.Point, slot: number ) {
        const itemData = InventoryController.EquippedItems[slot];

        const frame = new GameObjects.Sprite( scene, pos.x, pos.y, "ui/itemframe" );
        const icon = new GameObjects.Sprite( scene, pos.x, pos.y, itemData.texture );
        const hotkey = new GameObjects.Text( scene, pos.x, pos.y + 24, slot ? "RMB" : "LMB", { fontFamily: "monospace", stroke: "black", strokeThickness: 3 } );
        hotkey.setOrigin( 0.5, 0.66 );

        frame.addToDisplayList();
        icon.addToDisplayList();
        hotkey.addToDisplayList();

        super( scene, [frame, icon, hotkey] );
    }

}