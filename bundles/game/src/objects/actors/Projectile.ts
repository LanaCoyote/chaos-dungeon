import { Math as Vector, Scene } from "phaser";
import Actor from "./Actor";
import ProjectileController from "../../controllers/physics/ProjectileController";
import { DAMAGETYPES } from "../../controllers/damage/constants";
import TouchDamageProjectileController from "../../controllers/damage/TouchDamageProjectileController";


export default class Projectile extends Actor {

    public damage: TouchDamageProjectileController;
    public shooter: Actor;
    public projControl: ProjectileController;

    constructor( scene: Scene, origin: Vector.Vector2, shooter: Actor, velocity: Vector.Vector2, texture: string, frame?: number|string ) {
        super( scene, origin, texture, frame );

        this.projControl = new ProjectileController(this, shooter, velocity);
        this.projControl.activate();

        this.shooter = shooter;
    }

    setDamageInformation( amount: number, type: DAMAGETYPES, pierces?: boolean ) {
        if (this.damage) this.damage.destroy();

        this.damage = new TouchDamageProjectileController(this, this.shooter, amount, type, pierces);
        this.damage.activate();
    }

}