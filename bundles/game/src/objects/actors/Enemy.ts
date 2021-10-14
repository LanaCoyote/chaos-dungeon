import { Math as Vector, Physics, Scene } from "phaser"

import Actor from "./Actor";
import Equipment from "./Equipment";
import Hero from "./Hero";
import Pickup from "./Pickup";
import AiController from "../../controllers/ai/AiController";
import DamageableEnemyController from "../../controllers/damage/DamageableEnemyController";
import EnemyData from "../../controllers/ai/enemies/EnemyData";
import MovementController from "../../controllers/physics/MovementController";
import { EVENTS as DAMAGE_EVENTS } from "../../controllers/damage/constants";

import SpawnCloud from "../../effects/SpawnCloud";

export default class Enemy extends Actor {

    public ai: AiController<any>;
    public body: Physics.Arcade.Body;
    public damage: DamageableEnemyController;
    public enemyData: EnemyData;
    public move: MovementController;

    constructor( scene: Scene, origin: Vector.Vector2, enemyData: EnemyData, texture?: string ) {   // TODO: rewrite using a new ()=>type expression instead of the createController method
        super( scene, origin, texture || enemyData.texture );
        this.enemyData = enemyData;
        this.move = new MovementController(this);
        this.ai = enemyData.createController( this );
        this.damage = new DamageableEnemyController(this, enemyData);

        this.setVisible( false );
        this.scene.physics.add.overlap( this, Equipment.living );
        this.scene.physics.add.overlap( this, Hero.activeHero );

        this.on( DAMAGE_EVENTS.DIED, () => {
            if (Math.random() > 0.25) return;

            const heart = new Pickup(this.scene, new Vector.Vector2( this.x, this.y - 12 ));
            heart.addToDisplayList();
            this.scene.tweens.add({
                targets: heart,
                y: heart.y - 36,
                duration: 750,
                yoyo: true,
                ease: "Quad"
            });
        });
    }

    public spawn(newPos?: Vector.Vector2) {
        if (newPos) {
            this.setPosition( newPos.x, newPos.y );
        }

        new SpawnCloud(this, () => {
            this.move.activate();
            this.ai.activate();
            this.damage.activate();
            this.damage.touchDamageDealer.activate();
            this.setVisible(true);
        });
    }

}