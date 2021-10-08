import { Math as Vector } from "phaser";

import ItemData from "./ItemData";
import { ITEMCLASS } from "../constants";
import Equipment from "../../../objects/actors/Equipment";
import { EVENTS as MOVEMENT_EVENTS } from "../../physics/MovementController";
import Flicker from "../../../effects/Flicker";

export default class Sword extends ItemData {

    public class = ITEMCLASS.SWORD;
    public texture = "item/sword";
    public slashDistance = 1;
    public slashTime = 0;
    public chargeTime = 0;
    public slashing: Boolean;
    public powerAttacking: Boolean;
    public aborted: Boolean;
    public aimVector: Vector.Vector2;
 
    public canUseAnotherItem(equip: Equipment) {
        if (this.slashing || this.powerAttacking || (!this.aborted && equip.holding)) {
            return false;
        } else {
            return true;
        }
    }

    public doneSlashing(equip: Equipment) {
        this.slashing = false;

        if (!equip.holding) {
            this.putAway(equip);
        }
    }

    public donePowerAttak(equip: Equipment) {
        this.powerAttacking = false;
        this.putAway(equip);
    }

    public putAway(equip: Equipment) {
        equip.setVisible(false);
        this.slashDistance = 1;
        this.aborted = false;
        equip.body.reset(equip.user.x, equip.user.y);
    }

    public startPowerAttack(equip: Equipment) {
        this.powerAttacking = true;

        equip.scene.tweens.add({
            targets: equip,
            angle: equip.angle - 450,
            duration: 750,
            ease: 'Linear',
            onComplete: () => this.donePowerAttak(equip)
        });
    }

    public onEquip(equip: Equipment) {
        equip.setOrigin( 0.5, 0.5 );
    }

    public onHold(equip: Equipment, delta: number) {
        if (!this.slashing && !this.powerAttacking && !this.aborted) {
            if (this.chargeTime < 1000 && this.chargeTime + delta > 1000) {
                new Flicker(equip, 100);
                new Flicker(equip.user, 100);
            }

            this.chargeTime += delta;
        }
    }

    public onRelease(equip: Equipment) {
        console.log(this.slashing, this.powerAttacking);
        if (!this.slashing && !this.powerAttacking) {
            if (this.chargeTime < 1000) {
                this.putAway(equip);
            } else if (this.slashDistance > 12) {
                this.startPowerAttack(equip);
            }
        } else {
            this.aborted = true;
        }
    }

    public onShoot(equip: Equipment) {
        console.log(this.slashing, this.powerAttacking);
        if (!this.slashing && !this.powerAttacking) {
            this.slashTime = 200;
            this.chargeTime = 0;
            this.slashing = true;

            equip.setVisible(true);
            equip.scene.tweens.add({
                targets: this,
                slashDistance: 24,
                duration: 50,
                ease: "Sine"
            });
        }
    }

    public onTouch(equip: Equipment) {
        if (!this.slashing && equip.holding) {
            const shoveVector = this.aimVector.clone().setLength(-150);
            equip.user.emit( MOVEMENT_EVENTS.SHOVE, shoveVector );
            this.putAway(equip);
            this.aborted = true;
        }
    }

    public onUpdate(equip: Equipment, delta: number) {
        if (this.powerAttacking) {
            const sine = Math.sin( equip.angle * ( Math.PI / 180 ) );
            const cosine = Math.cos( equip.angle * ( Math.PI / 180 ) );
            const targetPos = new Vector.Vector2(
                equip.user.x + sine * 24,
                equip.user.y + cosine * -24
            );

            equip.setPosition( targetPos.x, targetPos.y );
            equip.body.setVelocity( cosine * -24, sine * -24 );

            if ( sine < 0 ) {
                equip.setDepth( equip.user.depth + 1 );
            } else {
                equip.setDepth( equip.user.depth - 1 );
            }
        } else if (this.slashing || (!this.aborted && equip.holding)) {
            const mousePos = new Vector.Vector2( equip.scene.input.activePointer.x, equip.scene.input.activePointer.y );
            const screenPos = new Vector.Vector2( equip.scene.cameras.main.worldView.x, equip.scene.cameras.main.worldView.y );
            const playerPos = new Vector.Vector2( equip.user.x, equip.user.y );
            this.aimVector = screenPos.add( mousePos ).subtract( playerPos );
            const targetPos = playerPos.add( this.aimVector.setLength(this.slashDistance) );
            
            equip.setPosition( targetPos.x, targetPos.y );
            equip.setAngle( this.aimVector.angle() * ( 180 / Math.PI ) + 90 );
            equip.body.setVelocity( this.aimVector.x, this.aimVector.y );

            if (this.aimVector.y > 0 && this.slashDistance > 12) {
                equip.setDepth( equip.user.depth + 1 );
            } else {
                equip.setDepth( equip.user.depth - 1 );
            }
        } else if (this.aborted) {
            equip.body.setVelocity(0);
            this.putAway(equip);
        }

        if (this.slashTime > 0) {
            this.slashTime -= delta;
        } else if (this.slashing) {
            this.doneSlashing(equip);
        }
    }

}