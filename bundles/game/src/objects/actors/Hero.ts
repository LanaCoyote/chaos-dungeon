import { Math as Vectors, Scene, GameObjects, Physics, BlendModes } from "phaser";

import { DEPTH_FLOOR } from "../../constants";
import Actor from "./Actor";
import DamageablePlayerController from "../../controllers/damage/DamageablePlayerController";
import InventoryController from "../../controllers/inventory/InventoryController";
import MovementController from "../../controllers/physics/MovementController";
import KbmInputController from "../../controllers/player/KbmInputController";
import VirtualInputController from "../../controllers/player/VirtualInputController";
import RoomCameraController from "../../controllers/player/RoomCameraController";

export default class Hero extends Actor {

    public static activeHero: Hero;

    public body: Physics.Arcade.Body;
    public damage: DamageablePlayerController;

    constructor(scene: Scene, origin: Vectors.Vector2) {
        super(scene, origin, "hero");

        const movementController = new MovementController(this);
        movementController.acceleration = 800;
        movementController.maxSpeed = 180;
        movementController.intentWeight = 35;
        movementController.decelRate = 15;
        movementController.activate();

        const damageController = new DamageablePlayerController(this);
        damageController.invulnPeriod = 1000;
        damageController.activate();

        const inventoryController = new InventoryController(this);
        inventoryController.activate();

        const keyboardController = new KbmInputController(this);
        keyboardController.activate();

        const virtualController = new VirtualInputController(this);
        virtualController.activate();

        const roomCamController = new RoomCameraController(this, this.scene.cameras.main);
        roomCamController.activate();

        Hero.activeHero = this;

        // players use 24x36 sprites but occupy a 9u ellipse
        this.body.setCircle(6, (this.width - 12) / 2, this.height - 13);
        this.body.onOverlap = true;

        this.on( GameObjects.Events.ADDED_TO_SCENE, () => {
            this.setBaseDepth( DEPTH_FLOOR + 2 );

            setInterval(() => this.setFlipX(!this.flipX), 250);
        });
    }

}