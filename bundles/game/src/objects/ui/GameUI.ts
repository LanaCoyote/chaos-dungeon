import { GameObjects, Geom, Scene } from "phaser";

import Hero from "../../objects/actors/Hero";

import LifeMeter from "./LifeMeter"
import MagicMeter from "./MagicMeter";
import EquipmentSlot from "./EquipmentSlot";
import UICamera from "./UICamera";
import { TILE_WIDTH, TILE_HEIGHT, SCREEN_WIDTH_ABS, SCREEN_WIDTH } from "../../constants";
import SubscreenWindow from "./SubscreenWindow";
import EquipmentArray from "./EquipmentArray";
import { ITEMCLASS } from "../../controllers/inventory/constants";
import ItemSelection from "./ItemSelection";
import { LIFE_DATA_KEY } from "../../controllers/damage/LifeController";

export default class GameUI extends GameObjects.Container {

    public lifeMeter: LifeMeter;
    public equipSlots: EquipmentSlot[];

    constructor( scene: Scene, camera: UICamera ) {

        const lifeMeter = new LifeMeter( scene, new Geom.Rectangle( TILE_WIDTH, TILE_HEIGHT, 18 * 8, 18 ) );
        const magicMeter = new MagicMeter( scene, new Geom.Rectangle( TILE_WIDTH, TILE_HEIGHT + 18, 18 * 8 + 1, 18) );

        const extras = [
            scene.add.sprite( TILE_WIDTH, TILE_HEIGHT * 3, "ui/icons", 3).setOrigin(0,0),
            scene.add.sprite( TILE_WIDTH + 18, TILE_HEIGHT * 3, "ui/icons", 2).setOrigin(0,0),

            scene.add.sprite( TILE_WIDTH, TILE_HEIGHT * 3 + 18, "ui/icons", 4).setOrigin(0,0),
            scene.add.sprite( TILE_WIDTH + 18, TILE_HEIGHT * 3 + 18, "ui/icons", 2).setOrigin(0,0),

            scene.add.sprite( TILE_WIDTH * 4, TILE_HEIGHT * 3, "ui/icons", 7).setOrigin(0,0),
            scene.add.sprite( TILE_WIDTH * 4 + 18, TILE_HEIGHT * 3, "ui/icons", 2).setOrigin(0,0),
            
            scene.add.sprite( TILE_WIDTH * 4, TILE_HEIGHT * 3 + 18, "ui/icons", 8).setOrigin(0,0),
            scene.add.sprite( TILE_WIDTH * 4 + 18, TILE_HEIGHT * 3 + 18, "ui/icons", 2).setOrigin(0,0),
        ];

        const slot1 = new EquipmentSlot( scene, new Geom.Point( SCREEN_WIDTH_ABS - TILE_WIDTH * 4, TILE_HEIGHT * 2 ), 0 );
        const slot2 = new EquipmentSlot( scene, new Geom.Point( SCREEN_WIDTH_ABS - TILE_WIDTH * 2, TILE_HEIGHT * 2 ), 1 );

        const itemFrame = new GameObjects.Rectangle( scene, SCREEN_WIDTH_ABS - TILE_WIDTH * 6.5, TILE_HEIGHT * 2, TILE_WIDTH * 11, TILE_HEIGHT * 3, 0, 1 );
        itemFrame.setStrokeStyle( 4, 0xffffff );

        const item1Text = new GameObjects.Text( scene, itemFrame.getTopLeft().x + 6, itemFrame.getTopLeft().y + 4, "SWORD", { fontFamily: "monospace", color: "red", fontSize: "10pt", stroke: "red", strokeThickness: 1 });
        const item1Help = new GameObjects.Text( scene, itemFrame.getTopLeft().x + 6, itemFrame.getTopLeft().y + 20, "FOR WHEN ITS DANGEROUS TO\nGO ALONE! TAP THE BUTTON TO\nSLASH, HOLD DOWN TO CHARGE\nUP A SPIN ATTACK!", { fontFamily: "monospace", color: "white", fontSize: "8pt" });

        const subscreenWindow = new SubscreenWindow( scene, camera, "ITEMS", 0xffffff );
        const itemSelection = new ItemSelection( scene );

        const equipmentFrame = new GameObjects.Rectangle( scene, subscreenWindow.getTopLeft().x + TILE_WIDTH * 6.5, subscreenWindow.getTopLeft().y + subscreenWindow.height/2, TILE_WIDTH * 12, subscreenWindow.height - TILE_HEIGHT, 0, 0 );
        equipmentFrame.setStrokeStyle( 2, 0xff0000 );

        const equipmentText = new GameObjects.Text( scene, equipmentFrame.getTopLeft().x + 12, equipmentFrame.getTopLeft().y - 8, "EQUIPMENT", { fontFamily: "monospace", color: "white", fontSize: "8pt", backgroundColor: "black", stroke: "black", strokeThickness: 8});

        // const fakesword = new GameObjects.Sprite( scene, equipmentFrame.getTopLeft().x + TILE_WIDTH, equipmentFrame.getTopLeft().y + TILE_HEIGHT, "actors/item/sword");
        // const fakeshield = new GameObjects.Sprite( scene, equipmentFrame.getTopLeft().x + TILE_WIDTH * 3, equipmentFrame.getTopLeft().y + TILE_HEIGHT, "actors/item/shield");

        const equipmentArray = new EquipmentArray( scene, new Geom.Point( equipmentFrame.getTopLeft().x + TILE_WIDTH, equipmentFrame.getTopLeft().y + TILE_HEIGHT ), ITEMCLASS.NULL, ITEMCLASS.MAX_EQUIPPABLE, 6, itemSelection );

        const gearFrame = new GameObjects.Rectangle( scene, subscreenWindow.getTopRight().x - TILE_WIDTH * 2.75, subscreenWindow.getTopLeft().y + subscreenWindow.height/2, TILE_WIDTH * 4.5, subscreenWindow.height - TILE_HEIGHT, 0, 0 );
        gearFrame.setStrokeStyle( 2, 0x0000ff );

        const gearArray = new EquipmentArray( scene, new Geom.Point( gearFrame.getTopLeft().x + TILE_WIDTH, gearFrame.getTopLeft().y + TILE_WIDTH ), ITEMCLASS.MAX_EQUIPPABLE, ITEMCLASS.MAX_CHARACTER, 2, itemSelection );
        itemSelection.setPosition(gearArray.x, gearArray.y);

        const gearText = new GameObjects.Text( scene, gearFrame.getTopLeft().x + 12, gearFrame.getTopLeft().y - 8, "GEAR", { fontFamily: "monospace", color: "white", fontSize: "8pt", backgroundColor: "black", stroke: "black", strokeThickness: 8});

        const subscreen = new GameObjects.Container(scene, 0, 0, [itemFrame, item1Text, item1Help, subscreenWindow, equipmentFrame, equipmentText, equipmentArray, gearFrame, gearText, gearArray, itemSelection]);

        const children = lifeMeter.getChildren()
            .concat( subscreen )
            .concat( magicMeter.getChildren() )
            .concat( slot1.getChildren() )
            .concat( slot2.getChildren() );

        super( scene, camera.worldView.x, camera.worldView.y, children );

        this.lifeMeter = lifeMeter;
        this.equipSlots = [slot1, slot2];

        // camera.addToRenderList( this );
        this.addToDisplayList();

        subscreen.setVisible(false);
        scene.input.keyboard.on("keydown-SPACE", () => {
            subscreen.setVisible(!subscreen.visible);
            scene.time.paused = !scene.time.paused;
            if (scene.time.paused) scene.tweens.pauseAll();
            console.log("paused:", scene.time.paused);
        });
    }

    public update(time: number, delta: number) {
        this.lifeMeter.setValue(Hero.activeHero.getData(LIFE_DATA_KEY) || 0);
        this.equipSlots.forEach(slot => slot.updateEquipmentIcon());
    }

}