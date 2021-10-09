import { Math as Vectors, Scene, GameObjects, Physics, BlendModes } from "phaser";

import { DEPTH_FLOOR } from "../../constants";
import Actor from "./Actor";
import InventoryController from "../../controllers/inventory/InventoryController";
import MovementController from "../../controllers/physics/MovementController";
import KbmInputController from "../../controllers/player/KbmInputController";
import RoomCameraController from "../../controllers/player/RoomCameraController";

export default class Hero extends Actor {

    public static activeHero: Hero;

    public body: Physics.Arcade.Body;

    constructor(scene: Scene, origin: Vectors.Vector2) {
        super(scene, origin, "hero");

        const movementController = new MovementController(this);
        movementController.acceleration = 800;
        movementController.maxSpeed = 180;
        movementController.intentWeight = 25;
        movementController.activate();

        const inventoryController = new InventoryController(this);
        inventoryController.activate();

        const keyboardController = new KbmInputController(this);
        keyboardController.activate();

        const roomCamController = new RoomCameraController(this, this.scene.cameras.main);
        roomCamController.activate();

        Hero.activeHero = this;

        // players use 24x36 sprites but occupy a 9u ellipse
        this.body.setCircle(6, (this.width - 12) / 2, this.height - 13);

        this.on( GameObjects.Events.ADDED_TO_SCENE, () => {
            this.setBaseDepth( DEPTH_FLOOR + 2 );

            setInterval(() => this.setFlipX(!this.flipX), 250);
        });
    }

}