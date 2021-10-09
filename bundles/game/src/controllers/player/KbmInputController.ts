import { Input, Math, Scene } from "phaser";

import Controller, { Attachable, UpdateController } from "../Controller";
import { EVENTS as MOVEMENT_EVENTS } from "../physics/MovementController";
import { EVENTS as INVENTORY_EVENTS } from "../inventory/constants";

export default class KbmInputController extends Controller implements UpdateController {

    private static moveControllerKey: Symbol = Symbol.for(`[Controller MovementController]`);

    private input: Input.InputPlugin;

    private binds: {
        up: Input.Keyboard.Key,
        down: Input.Keyboard.Key,
        left: Input.Keyboard.Key,
        right: Input.Keyboard.Key
    };

    private bindStates: {
        up?: boolean,
        down?: boolean,
        left?: boolean,
        right?: boolean,

        shoot1?: boolean,
        shoot2?: boolean,
    };

    private lastBindStates: {
        up?: boolean,
        down?: boolean,
        left?: boolean,
        right?: boolean,

        shoot1?: boolean,
        shoot2?: boolean,
    };

    public constructor( attached: Attachable, scene?: Scene ) {
        super(attached, scene);

        this.bindStates = {};
        this.lastBindStates = {};

        this.input.on( Input.Events.POINTER_DOWN, (pointer: Input.Pointer) => {
            if (pointer.button === 0) {
                this.bindStates.shoot1 = true;
            } else if (pointer.button === 2) {
                this.bindStates.shoot2 = true;
            }
        });

        this.input.on( Input.Events.POINTER_UP, (pointer: Input.Pointer) => {
            if (pointer.button === 0) {
                this.bindStates.shoot1 = false;
            } else if (pointer.button === 2) {
                this.bindStates.shoot2 = false;
            }
        });
    }

    public attach( attached: Attachable, scene?: Scene ) {
        Controller.prototype.attach.call(this, attached, scene);

        this.input = scene ? scene.input : attached.scene.input;

        const moveController = attached.getController(KbmInputController.moveControllerKey);
        if (moveController) {
            this.binds = {
                up:     this.input.keyboard.addKey( Input.Keyboard.KeyCodes.W ),
                down:   this.input.keyboard.addKey( Input.Keyboard.KeyCodes.S ),
                left:   this.input.keyboard.addKey( Input.Keyboard.KeyCodes.A ),
                right:  this.input.keyboard.addKey( Input.Keyboard.KeyCodes.D ),
            };
        } else {
            console.error("No movement controller found on %s; needed by %s", attached, this);
        }
    }

    public hasUpdateMethod(): true {
        return true;
    }

    public update(time: number, delta: number) {
        this.updateMovementControls();
        this.updateInventoryControls();

        Object.assign(this.lastBindStates, this.bindStates);
    }

    public updateInventoryControls() {
        if (this.bindStates.shoot1 && !this.lastBindStates.shoot1) {
            this.attached.emit( INVENTORY_EVENTS.SHOOT_EQUIP, 1 );
        } else if (!this.bindStates.shoot1 && this.lastBindStates.shoot1) {
            this.attached.emit( INVENTORY_EVENTS.RELEASE_EQUIP, 1 );
        }

        if (this.bindStates.shoot2 && !this.lastBindStates.shoot2) {
            this.attached.emit( INVENTORY_EVENTS.SHOOT_EQUIP, 2 );
        } else if (!this.bindStates.shoot2 && this.lastBindStates.shoot2) {
            this.attached.emit( INVENTORY_EVENTS.RELEASE_EQUIP, 2 );
        }
    }

    public updateMovementControls() {
        const intent = new Math.Vector2();

        if (this.binds.up.isDown) {
            intent.add( Math.Vector2.UP );
        }

        if (this.binds.down.isDown) {
            intent.add( Math.Vector2.DOWN );
        }

        if (this.binds.left.isDown) {
            intent.add( Math.Vector2.LEFT );
        }

        if (this.binds.right.isDown) {
            intent.add( Math.Vector2.RIGHT );
        }

        if (intent.x !== 0 || intent.y !== 0) {
            this.attached.emit( MOVEMENT_EVENTS.MOVE, intent );
        }
    }
}