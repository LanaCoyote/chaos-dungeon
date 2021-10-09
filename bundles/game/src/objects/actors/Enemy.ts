import { Math as Vector, Physics, Scene } from "phaser"

import Actor from "./Actor";
import AiController from "../../controllers/ai/AiController";
import EnemyData from "../../controllers/ai/enemies/EnemyData";
import MovementController from "../../controllers/physics/MovementController";

export default class Enemy<AiControllerType> extends Actor {

    public ai: AiControllerType;
    public body: Physics.Arcade.Body;
    public enemyData: EnemyData;

    constructor( scene: Scene, origin: Vector.Vector2, enemyData: EnemyData, texture?: string ) {
        super( scene, origin, texture || enemyData.texture );

        this.enemyData = enemyData;

        const movementController = new MovementController(this);
        movementController.activate();

        const ai = enemyData.createController( this );
        if (ai) ai.activate();
    }

}