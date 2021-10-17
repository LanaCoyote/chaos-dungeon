import { Scene } from "phaser";

import { Referenced, EventEmitter } from "../objects/types";

export type ControllerEventName = string|symbol;
export type ControllerEventCb = (...args: any) => any;

export interface Attachable extends Referenced, EventEmitter {
    scene: Scene;

    attachController: (ctrl: Controller) => boolean;
    detachController: (ctrl: Controller) => boolean;

    // getController: (key: Symbol|Controller) => Controller;   // anti-pattern, don't implement this actually
    hasController: (key: Symbol) => boolean;
};

export interface UpdateController {
    hasUpdateMethod: () => true;
    update: (time: number, delta: number) => void;
}

// Controllers are an abstract way to manage high level game input.
// The idea is that two controllers of the same type could be swapped out on the fly.
// e.g. control the player with direct input or give them AI for attract mode.
// An actor can have one of each kind of listener, and each listener can attach one callback to each event.
export default abstract class Controller {

    private listeners: Map<ControllerEventName, ControllerEventCb>;

    public readonly key: Symbol;
    public active: boolean;
    public attached: Attachable;
    public scene: Scene;

    constructor(attached?: Attachable, scene?: Scene) {
        this.listeners = new Map();
        this.key = Symbol.for(`[Controller ${this.constructor.name}]`);
        this.active = false;

        if (attached) {
            this.attach(attached, scene);
        }
    }

    // Activates the controller
    // An active controller will execute all its listeners
    // Derivative controllers may have other behavior that's disabled while deactivated
    // A controller is activated by its actor automatically if it's attached when the actor spawns
    // Otherwise the controller must be activated manually.
    public activate() {
        this.active = true;
    }

    public attach(attached: Attachable, scene?: Scene) {
        this.attached = attached;
        this.scene = scene || attached.scene;

        this.attached.attachController(this);

        if (this.listeners.size) {
            this.listeners.forEach((cb, ev) => {
                this.attached.on(ev, cb, this);
            });
        }
    }

    // Deactivates the controller
    // An inactive controller only executes listeners marked as "always"
    // Derivative controllers may have other behavior that's disabled while deactivated
    public deactivate() {
        this.active = false;
    }

    // Detaches the controller from its actor (if attached) and cleans up the listener map
    // Once a controller is destroyed it can be removed from memory by the garbage collector
    public destroy() {
        this.detach();
        this.listeners.clear();
        delete this.listeners;
    }

    public detach() {
        if (!this.isAttached()) {
            return console.error("%s tried to detach while not attached", this);
        }

        this.deactivate();
        this.removeListeners(undefined, true);  // remove events but preserve their callbacks
        this.attached.detachController(this);

        delete this.attached;
        delete this.scene;
    }

    public hasUpdateMethod(): boolean {
        return false;
    }

    public isAttached(): boolean {
        return !!this.attached;
    }

    // Adds a new event listener to the controller.
    // If the controller is attached, this will add the event listener to the actor.
    // If always is true, the event listener will run even when the controller is deactivated.
    public on(event: ControllerEventName, cb: ControllerEventCb, always?: boolean) {
        if (this.listeners.has(event)) {
            return console.error("%s requested more than one listener for %s", this, event);
        }

        cb = this.wrapCb(cb, event, always);

        if (this.isAttached()) {
            this.attached.on(event, cb, this);
        }

        this.listeners.set(event, cb);
    }

    // Removes event listeners that this controller created on its attached actor.
    // If event is passed, it only removes the listener associated with that event.
    // If keepRefs is true, the listener won't be removed from the listener map.
    //      This is used to attach the events to a new actor if detached without destroying.
    public removeListeners(event?: ControllerEventName, keepRefs?: boolean) {
        if (event) {
            if (!this.listeners.has(event)) return;

            if (this.isAttached()) this.attached.removeListener(event, this.listeners.get(event));
            if (!keepRefs) this.listeners.delete(event);
        } else {
            if (!this.listeners.size) return;

            if (this.isAttached()) {
                this.listeners.forEach((cb, ev) => {
                    this.attached.removeListener(ev, cb);
                });
            }

            if (!keepRefs) this.listeners.clear();
        }
    }

    public toString(): string {
        let attachmentString = this.isAttached() ? this.attached.toString() : '[unattached]';
        return `[Controller ${this.constructor.name} ${attachmentString}]`;
    }

    private wrapCb(cb: ControllerEventCb, eventName: ControllerEventName, always: boolean): ControllerEventCb {
        return (...args) => {
            if (!this) {
                console.error(`Intercepted Controller Event (${eventName.toString()}) bound for undefined!`);
            } else if (!this.attached) {
                console.error(`Intercepted Controller Event (${eventName.toString()}) from dead attachment!`);
            }

            try {
                if (always || this.active) {
                    cb(...args);
                }
            } catch (err) {
                console.error(`Error when resolving Controller Event (${eventName.toString()}):\n\t`, err);
            }
        }
    }

}