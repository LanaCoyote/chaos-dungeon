import { Math as Vector, Physics, Scene } from "phaser"

import Actor from "./Actor";
import AiController from "../../controllers/ai/AiController";
import DamageableController from "../../controllers/damage/DamageableController";
import TouchDamageEnemyController from "../../controllers/damage/TouchDamageDealerController";
import DamageableEnemyController from "../../controllers/damage/DamageableEnemyController";
import LifeController from "../../controllers/damage/LifeController";
import EnemyData from "../../controllers/ai/enemies/EnemyData";
import MovementController from "../../controllers/physics/MovementController";

import SpawnCloud from "../../effects/SpawnCloud";

export default class Enemy<AiControllerType> extends Actor {

    public ai: AiControllerType;
    public body: Physics.Arcade.Body;
    public damage: LifeController;
    public enemyData: EnemyData;

    constructor( scene: Scene, origin: Vector.Vector2, enemyData: EnemyData, texture?: string ) {   // TODO: rewrite using a new ()=>type expression instead of the createController method
        super( scene, origin, texture || enemyData.texture );

        this.enemyData = enemyData;

        const movementController = new MovementController(this);
        

        const ai = enemyData.createController( this );

        this.damage = new DamageableEnemyController(this, enemyData);
        this.setVisible( false );
        

        scene.time.delayedCall(2000, () => {
            new SpawnCloud(this, () => {
                movementController.activate();
                if (ai) ai.activate();
                this.damage.activate();
                this.setVisible(true);
            });
        })
    }

}