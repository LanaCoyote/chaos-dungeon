import { Math as Vector } from "phaser";
import { WeaponData } from "./ItemData";
import PointerItemData from "./PointerItemData";
import { ITEMCLASS } from "../constants";
import { DAMAGETYPES } from "../../damage/constants";
import { EVENTS as MOVEMENT_EVENTS } from "../../physics/MovementController";
import Actor from "../../../objects/actors/Actor";
import Equipment from "../../../objects/actors/Equipment";
import Projectile from "../../../objects/actors/Projectile";

export default class Bow extends PointerItemData implements WeaponData {

    public displayName = "SHORT BOW";
    public shortHelp = "PEW PEW PEW! SHOOTS ARROWS\nAT LONG RANGE! HOLD THE\nBUTTON TO AIM YOUR SHOT!";
    public useAngledIcon = true;

    public class = ITEMCLASS.BOW;
    public texture = "item/bow";
    public chargeTime = 0;

    private shootTime = 0;
    private shooting = false;
    private backswing = false;

    public canUseAnotherItem(equip: Equipment) {
        if (this.shooting || this.backswing) {
            return false;
        } else {
            return true;
        }
    }

    public getDamage( equip: Equipment|Projectile ): number {
        if ( equip instanceof Projectile ) {
            return 2;
        }

        return 0;
    }

    public getDamageType( equip: Equipment|Projectile ): DAMAGETYPES {
        if ( equip instanceof Projectile ) {
            return DAMAGETYPES.PHYSICAL;
        }

        return DAMAGETYPES.NONE;
    }

    public putAway( equip: Equipment ) {
        equip.setVisible(false);
        equip.user.emit( MOVEMENT_EVENTS.UNSLOW );

        this.shooting = false;
        this.backswing = false;
    }

    public onDamage( equip: Equipment|Projectile, other: Actor ) {

    }

    public onShoot(equip: Equipment) {
        if (!this.shooting && !this.backswing) {
            equip.user.emit( MOVEMENT_EVENTS.SLOW, 48 );
            this.shootTime = 200;
            this.chargeTime = 0;
            this.shooting = true;

            equip.setFrame(0);
            equip.setVisible(true);
        }
    }

    public onUpdate(equip: Equipment, delta: number) {
        if (this.backswing) {
            this.setToAngle( equip, (equip.angle - 90) * ( Math.PI / 180 ), 16 );
        } else if (this.shooting && equip.holding) {
            this.faceTo( equip, PointerItemData.getMousePosition( equip.scene ), 16, 90 );
        }

        if (this.shootTime > 0) {
            this.shootTime -= delta;
        } else if (this.shooting && !equip.holding) {
            // this.doneSlashing(equip);
            this.shootArrow(equip);
        } else if (this.backswing) {
            this.putAway(equip);
        }
    }

    public shootArrow(equip: Equipment) {
        this.shooting = false;
        this.backswing = true;
        this.shootTime = 300;

        equip.setFrame(1);

        const eqPos = new Vector.Vector2( equip.x, equip.y );
        const velocity = PointerItemData.getMousePosition( equip.scene ).subtract( eqPos ).setLength( 250 );
        const arrow = new Projectile( equip.scene, eqPos, equip.user, velocity, this.texture, 2 );
        arrow.setDamageInformation( 2, DAMAGETYPES.PHYSICAL );
        arrow.addToDisplayList();

        const currentRoom = equip.scene.getCurrentFloor().getCurrentRoom();
        currentRoom.addEnemyCollider( arrow );

        equip.scene.time.delayedCall(2500, () => {
            if (arrow) {
                arrow.destroy();
            }
        });
    }

}