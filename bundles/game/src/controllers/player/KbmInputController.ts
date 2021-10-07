import { Input, Math, Scene } from "phaser";

import Controller, { Attachable, UpdateController } from "../Controller";
import MovementController from "../physics/MovementController";

export default class KbmInputController extends Controller implements UpdateController {

    private static moveControllerKey: Symbol = Symbol.for(`[Controller MovementController]`);

    private input: Input.InputPlugin;
    private movement: MovementController;

    private binds: {
        up: Input.Keyboard.Key,
        down: Input.Keyboard.Key,
        left: Input.Keyboard.Key,
        right: Input.Keyboard.Key
    };

    public attach( attached: Attachable, scene?: Scene ) {
        Controller.prototype.attach.call(this, attached, scene);

        this.input = scene ? scene.input : attached.scene.input;

        const moveController = attached.getController(KbmInputController.moveControllerKey);
        if (moveController) {
            this.movement = moveController as MovementController;

            this.binds = {
                up:     this.input.keyboard.addKey( Input.Keyboard.KeyCodes.W ),
                down:   this.input.keyboard.addKey( Input.Keyboard.KeyCodes.S ),
                left:   this.input.keyboard.addKey( Input.Keyboard.KeyCodes.A ),
                right:  this.input.keyboard.addKey( Input.Keyboard.KeyCodes.D )
            };
        } else {
            console.error("No movement controller found on %s; needed by %s", attached, this);
        }
    }

    public hasUpdateMethod(): true {
        return true;
    }

    public update(time: number, delta: number) {
        if (this.binds.up.isDown) {
            this.movement.move( new Math.Vector2( 0, -1 ) );
        }

        if (this.binds.down.isDown) {
            this.movement.move( new Math.Vector2( 0, 1 ) );
        }

        if (this.binds.left.isDown) {
            this.movement.move( new Math.Vector2( -1, 0 ) );
        }

        if (this.binds.right.isDown) {
            this.movement.move( new Math.Vector2( 1, 0 ) );
        }
    }
}