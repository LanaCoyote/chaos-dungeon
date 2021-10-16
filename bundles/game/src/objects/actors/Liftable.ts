import { Math as Vector, Scene } from "phaser";
import LiftableController from "../../controllers/physics/LiftableController";
import Actor from "./Actor";




export default class Liftable extends Actor {

    public lift: LiftableController;

    constructor( scene: Scene, origin: Vector.Vector2, texture: string, frame?: number|string ) {
        super( scene, origin, texture, frame );

        this.lift = new LiftableController(this);
        this.lift.activate();
    }

}