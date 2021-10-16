import { GameObjects, Geom, Math as Vector, Scene } from "phaser";
import Equipment from "../../../objects/actors/Equipment";
import Liftable from "../../../objects/actors/Liftable";
import { ITEMCLASS } from "../constants";
import ItemData from "./ItemData";
import { EVENTS as LIFT_EVENTS } from "../../physics/LiftableController";
import { DAMAGETYPES, EVENTS as DAMAGE_EVENTS } from "../../damage/constants";
import PointerItemData from "./PointerItemData";
import SpawnCloud from "../../../effects/SpawnCloud";
import Blink from "../../../effects/Blinking";
import LevelScene from "../../../scenes/level/LevelScene";
import Enemy from "../../../objects/actors/Enemy";

export default class Dynamite extends ItemData {

    public displayName = "DYNAMITE";
    public shortHelp = "THIS STUFF IS REAL DANGEROUS!\nTAP TO PLACE A BOMB, HOLD\nTO LIFT OVER YOUR HEAD!\nSTAND CLEAR OF THE BLAST!";

    public class = ITEMCLASS.BOMB_BAG;
    public texture = "item/dynamite";

    private bomb: Liftable;

    public explosion( equip: Equipment, location: Vector.Vector2 ) {
        const circle = new Geom.Circle( location.x, location.y, 60 );
        
        equip.scene.getCurrentFloor().getCurrentRoom().getEnemyGroup().getChildren().forEach((enemy: Enemy) => {
            if (circle.contains(enemy.x, enemy.y)) {
                enemy.emit( DAMAGE_EVENTS.TAKE_DAMAGE, 4, DAMAGETYPES.EXPLODE, this.bomb );
            }
        });

        if (circle.contains(equip.user.x, equip.user.y)) {
            equip.user.emit( DAMAGE_EVENTS.TAKE_DAMAGE, 2, DAMAGETYPES.EXPLODE, this.bomb );
        }

        for (let i = 0; i < 20; ++i) {
            equip.scene.time.delayedCall( i * 20, () => {
                new SpawnCloud({
                    scene: equip.scene, getCenter: () => circle.getRandomPoint()
                } as unknown as GameObjects.Sprite)
            });
        }
    }

    public onEquip( eqiup: Equipment ) {
        eqiup.body.setEnable(false);
    }

    public onRelease( equip: Equipment ) {
        if (!this.bomb) return;

        const mousePos = PointerItemData.getMousePosition( equip.scene );
        const throwVector = mousePos.subtract( new Vector.Vector2( equip.user.x, equip.user.y ) );

        this.bomb.emit( LIFT_EVENTS.THROW, equip.user, throwVector );
    }

    public onShoot( equip: Equipment ) {
        if (!this.bomb) {
            this.bomb = new Liftable( equip.scene, new Vector.Vector2( equip.user.x, equip.user.y ), this.texture );
            this.bomb.addToDisplayList();
            this.bomb.emit( LIFT_EVENTS.LIFT, equip.user );

            equip.scene.time.delayedCall(3500, () => {
                if (!this || !this.bomb) return;

                this.explosion( equip, new Vector.Vector2( this.bomb.x, this.bomb.y ) );
                this.bomb.destroy();
                delete this.bomb;
            });

            equip.scene.time.delayedCall(1000, () => {
                new Blink(this.bomb, 1000, 150);
                this.bomb.setFrame(1);
            });

            equip.scene.time.delayedCall(2000, () => {
                new Blink(this.bomb, 1000, 100);
                this.bomb.setFrame(2);
            });

            equip.scene.time.delayedCall(3000, () => {
                new Blink(this.bomb, 450, 50);
                this.bomb.setFrame(3);
            })
        }
    }

}