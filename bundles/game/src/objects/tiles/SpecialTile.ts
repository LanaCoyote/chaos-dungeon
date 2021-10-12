import { Math as Vector, Scene, Tilemaps } from "phaser";

import { EventEmitter, Referenced } from "../types";
import Controller from "../../controllers/Controller";

import { TILE_WIDTH, TILE_HEIGHT } from "../../constants";

export default abstract class SpecialTile extends Tilemaps.Tile implements Referenced, EventEmitter {

    public readonly key: Symbol;
    public readonly id: Symbol;

    public scene: Scene;

    private controllers: Map<Symbol, Controller>;
    private eventListeners: Map<string|Symbol, Array<(...params: any)=>any>>

    constructor(scene: Scene, layer: Tilemaps.LayerData, index: number, origin: Vector.Vector2) {
        super(layer, index, origin.x, origin.y, TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);

        this.scene = scene;
        this.key = Symbol.for(this.toString());
        this.id = Symbol(this.toString());
        this.controllers = new Map();
    }

    public attachController(ctrl: Controller): boolean {
        if (this.controllers.has(ctrl.key)) {
            console.error("%s tried to attach %s but already has a controller of this type", this, ctrl);
            return false;
        }

        this.controllers.set(ctrl.key, ctrl);

        if (!ctrl.isAttached()) {
            ctrl.attach(this);
        }

        return true;
    }

    public deactivateAllControllers() {
        this.controllers.forEach(ctrl => ctrl.deactivate());
    }

    public destroyAllControllers() {
        this.controllers.forEach(ctrl => ctrl.destroy());
        this.controllers.clear();
        this.removeAllListeners();
    }

    public reactivateAllControllers() {
        this.controllers.forEach(ctrl => ctrl.activate());
    }

    public destroy() {
        if (this.controllers.size) {
            this.controllers.forEach(ctrl => {
                ctrl.destroy();
            });
            this.controllers.clear();
            delete this.controllers;
        }
    }

    public detachController(ctrl: Controller): boolean {
        if (!ctrl.isAttached() || ctrl.attached.id !== this.id) {
            return false;
        } else if (this.controllers.has(ctrl.key)) {
            this.controllers.delete(ctrl.key);

            return true;
        } else {
            return false;
        }
    }

    public emit(eventName: Symbol|string, ...params: any) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(cb => cb(...params));
        }
    }

    public on(eventName: Symbol|string, callback: (...args:any)=>any) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).push(callback);
        } else {
            this.eventListeners.set(eventName, [callback]);
        }
    }

    public removeListener(eventName: Symbol|string, callback: (...args:any)=>any) {
        if (this.eventListeners.has(eventName)) {
            const storedCallbacks = this.eventListeners.get(eventName);
            for (let i = 0; i < storedCallbacks.length; ++i) {
                if (storedCallbacks[i] === callback) {
                    storedCallbacks.splice(i, 1);
                    this.eventListeners.set(eventName, storedCallbacks);
                    return;
                }
            }
        }
    }

    public removeAllListeners(eventName?: Symbol|string) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.delete(eventName);
        }
    }

    public getController(key: Symbol|Controller): Controller {
        if (key instanceof Controller) key = key.key;

        return this.controllers.get(key);
    }

    public hasController(key: Symbol): boolean {
        return this.controllers.has(key);
    }

    public toString(): string {
        return `[SpecialTile ${this.id.toString()}]`;
    }

}