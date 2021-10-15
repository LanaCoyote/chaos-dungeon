import { GameObjects, Math, Scene } from "phaser";

import { Referenced } from "../types";
import Controller, { UpdateController } from "../../controllers/Controller";

// Actors are a Referenced GameObject based on Sprites that can be equipped with a controller.
// If it doesn't have one, the actor works as a Sprite.
// Actors are intended to represent any non-background special objects.
// TODO: implement controllers
export default abstract class Actor extends GameObjects.Sprite implements Referenced {

    private static livingActors: Map<Symbol, Map<Symbol, Actor>> = new Map();
    
    public readonly key: Symbol;
    public readonly id: Symbol;

    public baseDepth: number = 0;

    private controllers: Map<Symbol, Controller>;
    private updateControllers: Map<Symbol, UpdateController>;

    public static destroyAllActors() {
        Actor.livingActors.forEach((classMap) => {
            classMap.forEach((actor) => {
                actor.destroy();
            });
        });
    }

    public static updateActors(time: number, delta: number) {
        Actor.livingActors.forEach(classMap => {
            classMap.forEach(actor => actor.update(time, delta));
        });
    }

    private static registerActor(newActor: Actor) {
        if (!Actor.livingActors.has(newActor.key)) {
            const classMap = new Map();
            classMap.set(newActor.id, newActor);
            Actor.livingActors.set(newActor.key, classMap);
        } else {
            Actor.livingActors.get(newActor.key).set(newActor.id, newActor);
        }
    }

    constructor(scene: Scene, origin: Math.Vector2, texture: string, frame?: string|number, id?: Symbol) {
        super(scene, origin.x, origin.y, `actors/${texture}`, frame);

        this.key = Symbol.for(this.toString());
        this.id = Symbol(this.toString());
        this.controllers = new Map();
        this.updateControllers = new Map();

        Actor.registerActor(this);
    }

    public attachController(ctrl: Controller): boolean {
        if (this.controllers.has(ctrl.key)) {
            console.error("%s tried to attach %s but already has a controller of this type", this, ctrl);
            return false;
        }

        this.controllers.set(ctrl.key, ctrl);

        if (ctrl.hasUpdateMethod()) {
            this.updateControllers.set(ctrl.key, (ctrl as unknown as UpdateController));
        }

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
        if (this.controllers && this.controllers.size) {
            this.controllers.forEach(ctrl => {
                ctrl.destroy();
            });
            this.controllers.clear();
            this.updateControllers.clear();
            delete this.controllers;
            delete this.updateControllers;
        }

        Actor.livingActors.get(this.key).delete(this.id);
        GameObjects.Sprite.prototype.destroy.call(this);
    }

    public detachController(ctrl: Controller): boolean {
        if (!ctrl.isAttached() || ctrl.attached.id !== this.id) {
            return false;
        } else if (this.controllers.has(ctrl.key)) {
            this.controllers.delete(ctrl.key);

            if (this.updateControllers.has(ctrl.key)) {
                this.updateControllers.delete(ctrl.key);
            }

            return true;
        } else {
            return false;
        }
    }

    public getController(key: Symbol|Controller): Controller {
        if (key instanceof Controller) key = key.key;

        return this.controllers.get(key);
    }

    public hasController(key: Symbol): boolean {
        return this.controllers.has(key);
    }

    public setBaseDepth(newDepth: number) {
        this.baseDepth = newDepth;
    }

    public toString(): string {
        return `[Actor ${this.constructor.name}]`;
    }

    public update(time: number, delta: number) {
        this.updateControllers.forEach(ctrl => ctrl.update(time, delta));
    }

}