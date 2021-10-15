import { GameObjects, Geom, Input, Scene } from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../../constants";
import { ITEMCLASS } from "../../controllers/inventory/constants";

import InventoryController from "../../controllers/inventory/InventoryController";
import ItemData from "../../controllers/inventory/items/ItemData";
import ItemSelection from "./ItemSelection";

export default class EquipmentArray extends GameObjects.Container {

    private cols: number;
    private items: ItemData[];
    private range: number[];
    private selection: ItemSelection;

    private static getCoords( index: number, cols: number ): Geom.Point {
        const x = index % cols * (TILE_WIDTH * 2);
        const y = Math.floor(index / cols) * TILE_HEIGHT;

        return new Geom.Point( x, y );
    }

    private static makeSprite(scene: Scene, cols: number, item: ItemData, index: number): GameObjects.Sprite {
        const coords = EquipmentArray.getCoords(index, cols);
        const sprite = new GameObjects.Sprite( scene, coords.x, coords.y, `actors/${item.texture}` );
        sprite.setInteractive();
        if (item.useAngledIcon) sprite.setAngle(45);

        return sprite;
    }

    constructor( scene: Scene, topLeft: Geom.Point, minimum: ITEMCLASS, maximum: ITEMCLASS, cols: number, selection: ItemSelection ) {
        const initialItemState = InventoryController.getAllItems(minimum, maximum);
        const sprites = initialItemState.map((item, index) => {
            return EquipmentArray.makeSprite( scene, cols, item, index );
        });

        super( scene, topLeft.x, topLeft.y, sprites );

        this.items = initialItemState;
        this.range = [minimum, maximum];
        this.cols = cols;
        this.selection = selection;

        this.scene.input.on( Input.Events.GAMEOBJECT_OVER, (pointer: Input.Pointer, object: GameObjects.Sprite) => {
            if (this.exists(object)) {
                this.moveSelectionToSprite(object);
            }
        });

        if (minimum === ITEMCLASS.NULL) {
            this.scene.input.on( Input.Events.GAMEOBJECT_DOWN, (pointer: Input.Pointer, object: GameObjects.Sprite) => {
                if (this.exists(object) && (pointer.button === 0 || pointer.button === 2)) {
                    const item = this.items[this.getIndex(object)];
                    const slot = InventoryController.EquippedItems[pointer.button === 2 ? 1 : 0];
                    const otherSlot = InventoryController.EquippedItems[pointer.button === 2 ? 0 : 1];
                    if (item.class === otherSlot.item.class) {
                        otherSlot.setItem(slot.item);
                    }
                    slot.setItem(item);
                }
            });
        }
    }

    public moveSelectionToSprite( sprite: GameObjects.Sprite ) {
        this.selection.setPosition( this.x + sprite.x, this.y + sprite.y );
    }

    public updateEquipmentList() {
        const newItems = InventoryController.getAllItems(this.range[0], this.range[1]);
        newItems.forEach((item, index) => {
            if (this.length > index) {
                (this.getAt(index) as GameObjects.Sprite).setTexture(`actors/${item.texture}`)
                    .setVisible(true)
                    .setAngle(item.useAngledIcon ? 45 : 0);
            } else {
                const sprite = EquipmentArray.makeSprite(this.scene, this.cols, item, index);
                this.add(sprite);
            }
        });

        for (let i = newItems.length; i < this.length; ++i) {
            (this.getAt(i) as GameObjects.Sprite).setVisible(false);
        }

        this.items = newItems;
    }

}