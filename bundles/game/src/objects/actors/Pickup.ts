import { Math, Physics, Scene } from "phaser";

import Actor from "./Actor"
import Hero from "./Hero"
import { EVENTS, RESCLASS } from "../../controllers/inventory/constants";
import { DEPTH_ALWAYSFRONT } from "../../constants";

export default class Pickup extends Actor {

    public body: Physics.Arcade.Body;
    public lifetime: number;

    constructor( scene: Scene, origin: Math.Vector2 ) {
        super( scene, origin, "item/pickups" );

        this.scene.time.delayedCall(30000, () => {
            if (this) this.destroy();
        });

        scene.physics.add.existing( this );
        scene.physics.add.collider( this, Hero.activeHero, (ob1,ob2) => {
            if (ob1 === this) {
                ob2.emit( EVENTS.ADD_RESOURCE, RESCLASS.HEALTH, 2 );
            } else {
                ob1.emit( EVENTS.ADD_RESOURCE, RESCLASS.HEALTH, 2 );
            }

            this.setPosition( Hero.activeHero.x, Hero.activeHero.y - 24 );
            this.setDepth( DEPTH_ALWAYSFRONT + this.y );
            this.body.setEnable( false );
            this.scene.tweens.add({
                targets: this,
                y: this.y - 24,
                duration: 500,
                ease: "Bounce",
                onComplete: () => this.destroy()
            });
        });

    }

}