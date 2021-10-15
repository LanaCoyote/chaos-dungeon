import { GameObjects, Geom, Scene } from "phaser";

import InventoryController from "../../controllers/inventory/InventoryController";

export default class EquipmentSlot extends GameObjects.Group {

    private icon: GameObjects.Sprite;
    private slot: number;

    constructor( scene: Scene, pos: Geom.Point, slot: number ) {
        const itemData = InventoryController.EquippedItems[slot].item;

        const frame = new GameObjects.Sprite( scene, pos.x, pos.y, "ui/itemframe" );
        const icon = new GameObjects.Sprite( scene, pos.x, pos.y, `actors/${itemData.texture}` );
        const hotkey = new GameObjects.Text( scene, pos.x, pos.y + 24, slot ? "RMB" : "LMB", { fontFamily: "monospace", stroke: "black", strokeThickness: 3 } );
        hotkey.setOrigin( 0.5, 0.66 );

        super( scene, [frame, icon, hotkey] );

        this.icon = icon;
        this.slot = slot;
    }

    public updateEquipmentIcon() {
        const itemData = InventoryController.EquippedItems[this.slot].item;
        this.icon.setTexture( `actors/${itemData.texture}` );
        // this.icon.setAngle( itemData.useAngledIcon ? 45 : 0 );
    }

}