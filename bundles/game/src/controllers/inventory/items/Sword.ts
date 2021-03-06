import { Math as Vector } from "phaser";

import PointerItemData from "./PointerItemData";
import { WeaponData } from "./ItemData";
import { ITEMCLASS } from "../constants";
import Equipment from "../../../objects/actors/Equipment";
import { EVENTS as MOVEMENT_EVENTS } from "../../physics/MovementController";
import Flash from "../../../effects/Flash";
import Blinking from "../../../effects/Blinking";
import { DAMAGETYPES } from "../../damage/constants";
import Actor from "../../../objects/actors/Actor";

export default class Sword extends PointerItemData implements WeaponData {

    public displayName = "WOODEN SWORD";
    public shortHelp = "FOR WHEN ITS DANGEROUS TO\nGO ALONE! TAP THE BUTTON TO\nSLASH, HOLD DOWN TO CHARGE\nUP A SPIN ATTACK!";
    public useAngledIcon = true;

    public class = ITEMCLASS.SWORD;
    public texture = "item/sword";
    public slashDistance = 1;
    public maxSlashDistance = 24;
    public slashTime = 0;
    public chargeTime = 0;
    public slashing: Boolean;
    public powerAttacking: Boolean;
    public aborted: Boolean;
    public target: Vector.Vector2;

    private blinkEffect: Blinking;
    private userBlinkEffect: Blinking;
    private quickspinAxisVertical: Boolean;
    private quickspinFrames = [0,0,0,0];
    private quickspinThreshold: number = 2;
 
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

    public getDamage( equip: Equipment ): number {
        if (this.powerAttacking) return 2;
        return 1;
    }

    public getDamageType( equip: Equipment ): DAMAGETYPES {
        return DAMAGETYPES.PHYSICAL;
    }

    public putAway(equip: Equipment) {
        equip.setVisible(false);
        this.slashDistance = 1;
        this.quickspinFrames = [0,0,0,0];
        equip.body.reset(equip.user.x, equip.user.y);
        equip.body.setEnable(false);
        equip.body.debugBodyColor = 0x0;
        equip.user.emit( MOVEMENT_EVENTS.UNSLOW );

        if (this.blinkEffect) this.blinkEffect.stop();
        if (this.userBlinkEffect) this.userBlinkEffect.stop();
    }

    public startPowerAttack(equip: Equipment) {
        this.powerAttacking = true;
        if (this.blinkEffect) this.blinkEffect.stop();

        equip.user.emit( MOVEMENT_EVENTS.FREEZE, 500 );
        equip.scene.tweens.add({
            targets: equip,
            angle: equip.angle - 540,
            duration: 500,
            ease: 'Sine',
            onComplete: () => this.donePowerAttak(equip)
        });

        equip.scene.sound.play("sfx/slash_big");
    }

    public onEquip(equip: Equipment) {
        equip.setOrigin( 0.5, 0.5 );
    }

    public onHold(equip: Equipment, delta: number) {
        if (!this.slashing && !this.powerAttacking && !this.aborted && equip.visible) {
            if (this.chargeTime < 1000) {
                const playerPosition = new Vector.Vector2( equip.user.x, equip.user.y );
                const quickspinComparison = PointerItemData.getMousePosition( equip.scene ).subtract( playerPosition ).normalize();
                if ( Math.abs( quickspinComparison.y ) > Math.abs( quickspinComparison.x ) ) {
                    if ( quickspinComparison.y < 0 ) {
                        this.quickspinFrames[0]++;
                    } else {
                        this.quickspinFrames[2]++;
                    }
                } else {
                    if ( quickspinComparison.x < 0 ) {
                        this.quickspinFrames[1]++;
                    } else {
                        this.quickspinFrames[3]++;
                    }
                }

                const qspinProgress = this.quickspinFrames.filter( frames => frames > this.quickspinThreshold ).length
                if ( qspinProgress >= 2 && !(this.blinkEffect && this.blinkEffect.active)) {
                    this.blinkEffect = new Blinking(equip, 700, 100);
                    this.userBlinkEffect = new Blinking(equip.user, 700, 100);
                } else if ( qspinProgress === 4 ) {
                    delta = 1000;
                }
            }

            if (this.chargeTime < 300 && this.chargeTime + delta > 300 && !(this.blinkEffect && this.blinkEffect.active)) {
                this.blinkEffect = new Blinking(equip, 700, 100);
                this.userBlinkEffect = new Blinking(equip.user, 700, 100);
            } else if (this.chargeTime < 1000 && this.chargeTime + delta > 1000) {
                if (this.blinkEffect) this.blinkEffect.stop();
                if (this.userBlinkEffect) this.userBlinkEffect.stop();

                new Flash(equip, 100);
                new Flash(equip.user, 100);

                setTimeout(() => this.blinkEffect = new Blinking(equip, 0, 250), 100);
            }

            this.chargeTime += delta;

            
        }
    }

    public onRelease(equip: Equipment) {
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
        if (!this.slashing && !this.powerAttacking) {
            equip.user.emit( MOVEMENT_EVENTS.SLOW, 48 );
            this.slashTime = 200;
            this.chargeTime = 0;
            this.slashing = true;
            this.aborted = false;

            equip.body.setEnable(true);
            equip.body.debugBodyColor = 0x00ff00;
            equip.setVisible(true);
            equip.scene.tweens.add({
                targets: this,
                slashDistance: this.maxSlashDistance,
                duration: 50,
                ease: "Sine"
            });

            equip.scene.sound.play("sfx/slash");

            const qspinTarget = PointerItemData.getMousePosition( equip.scene );
            this.quickspinAxisVertical = Math.abs( qspinTarget.y ) > Math.abs( qspinTarget.x );
        }
    }

    // public onTouch(equip: Equipment) {
    //     if (!this.slashing && equip.holding) {
    //         const shoveVector = this.aimVector.clone().setLength(-150);
    //         equip.user.emit( MOVEMENT_EVENTS.SHOVE, shoveVector );
    //         this.putAway(equip);
    //         this.aborted = true;
    //     }
    // }

    public onDamage( equip: Equipment, other: Actor ) {
        if (!this.slashing && !this.powerAttacking && equip.holding) {
            const shoveVector = this.aimVector.clone().setLength(-150);
            equip.user.emit( MOVEMENT_EVENTS.SHOVE, shoveVector );
            this.putAway(equip);
            this.aborted = true;
        }
    }

    public onUpdate(equip: Equipment, delta: number) {
        if (this.powerAttacking) {
            this.setToAngle( equip, (equip.angle - 90) * ( Math.PI / 180 ), this.slashDistance );
            equip.body.setVelocity( this.aimVector.x, this.aimVector.y );
        } else if (this.slashing || (!this.aborted && equip.holding)) {
            this.faceTo( equip, PointerItemData.getMousePosition( equip.scene ), this.slashDistance, 90 );
            equip.body.setVelocity( this.aimVector.x, this.aimVector.y );
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