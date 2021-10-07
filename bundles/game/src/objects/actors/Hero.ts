import { Math as Vectors, Scene, GameObjects, Physics } from "phaser";

import { DEPTH_FLOOR } from "../../constants";
import Actor from "./Actor";
import MovementController from "../../controllers/physics/MovementController";
import KbmInputController from "../../controllers/player/KbmInputController";

export default class Hero extends Actor {

    public body: Physics.Arcade.Body;

    constructor(scene: Scene, origin: Vectors.Vector2) {
        super(scene, origin, "hero");

        const movementController = new MovementController(this);
        movementController.activate();

        const keyboardController = new KbmInputController(this);
        keyboardController.activate();

        // players use 24x36 sprites but occupy a 18x18 area
        this.body.setSize( 18, 18 );
        this.body.setOffset( (this.width - 18) / 2, (this.height - 18) );

        this.on( GameObjects.Events.ADDED_TO_SCENE, () => {
            this.setDepth( DEPTH_FLOOR + 2 );

            setInterval(() => this.setFlipX(!this.flipX), 250);
        });
    }

}