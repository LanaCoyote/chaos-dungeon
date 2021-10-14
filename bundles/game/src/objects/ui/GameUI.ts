import { GameObjects, Geom, Scene } from "phaser";

import Hero from "../../objects/actors/Hero";
import DamageablePlayerController from "../../controllers/damage/DamageablePlayerController";

import LifeMeter from "./LifeMeter"
import MagicMeter from "./MagicMeter";
import EquipmentSlot from "./EquipmentSlot";
import UICamera from "./UICamera";
import { TILE_WIDTH, TILE_HEIGHT, SCREEN_WIDTH_ABS } from "../../constants";

export default class GameUI extends GameObjects.Container {

    public lifeMeter: LifeMeter;

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

        const children = lifeMeter.getChildren()
            .concat( magicMeter.getChildren() )
            .concat( slot1.getChildren() )
            .concat( slot2.getChildren() );

        super( scene, camera.worldView.x, camera.worldView.y, children );

        this.lifeMeter = lifeMeter;

        // camera.addToRenderList( this );
        this.addToDisplayList();
    }

    public update(time: number, delta: number) {

        const heroLifeController = Hero.activeHero.getController(Symbol.for("[Controller DamageablePlayerController]")) as DamageablePlayerController;
        if (heroLifeController) {
            this.lifeMeter.setValue(heroLifeController.life);
        }

    }

}