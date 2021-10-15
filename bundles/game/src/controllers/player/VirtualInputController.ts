import { Input, Math, Scene } from "phaser";

import Controller, { Attachable, UpdateController } from "../Controller";
import { EVENTS as MOVEMENT_EVENTS } from "../physics/MovementController";
import { EVENTS as INVENTORY_EVENTS } from "../inventory/constants";

interface VirtualControlInput {
    joystick: {
        x: number,
        y: number
    }
}

export default class VirtualInputController extends Controller implements UpdateController {

    private input: Input.InputPlugin;

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

        this.input = this.scene.input;

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

        // this.input = scene ? scene.input : attached.scene.input;
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
        const vcontrols = (window as any).virtualControls as VirtualControlInput;
        if (!vcontrols) return;

        const intent = new Math.Vector2( vcontrols.joystick.x, vcontrols.joystick.y );

        if (intent.x !== 0 || intent.y !== 0) {
            this.attached.emit( MOVEMENT_EVENTS.MOVE, intent );
        }
    }
}