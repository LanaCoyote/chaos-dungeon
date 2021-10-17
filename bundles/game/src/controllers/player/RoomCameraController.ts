import { Cameras, Math as Vec } from "phaser";

import Controller, { UpdateController } from "../Controller";
import { SCREEN_HEIGHT, SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS, TILE_HEIGHT, TILE_WIDTH } from "../../constants";
import Actor from "../../objects/actors/Actor";
import LevelScene from "../../scenes/level/LevelScene";
import Floor from "../../scenes/level/Floor";
import Room from "../../scenes/level/Room";

export enum STATES {
    UNKNOWN_AND_PANICKING,
    FOLLOWING,
    TRANSITIONING_TO_ROOM,
    TRANSITIONING_TO_FLOOR,
}

export default class RoomCameraController extends Controller implements UpdateController {

    public attached: Actor;
    public camera: Cameras.Scene2D.Camera;
    public floor: Floor;
    public room: Room;
    public nextRoom: Room;
    public scene: LevelScene;
    public state: STATES;

    constructor(attached: Actor, camera?: Cameras.Scene2D.Camera) {
        super(attached, attached.scene);

        if (camera) {
            this.camera = camera;
        } else {
            this.camera = new Cameras.Scene2D.Camera(0, 0, SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS);
        }

        this.camera.setDeadzone( SCREEN_WIDTH_ABS / 4, SCREEN_HEIGHT_ABS / 4 );

        if (attached.scene instanceof LevelScene) {
            this.floor = attached.scene.getCurrentFloor();
            this.room = this.floor.getCurrentRoom();

            this.setBoundsFromRoom();
            this.camera.startFollow(this.attached);
        } else {
            console.error("%s is not a LevelScene! Manually set the floor/room or you'll have issues!", attached.scene);
        }

        this.state = STATES.TRANSITIONING_TO_ROOM;
        this.scene.time.delayedCall(1000, () => {
            this.scene.tweens.add({
                targets: this.attached,
                y: this.attached.y - TILE_HEIGHT * 3,
                duration: 750,
                ease: 'linear',
                onComplete: this.endTransitionToNewRoom.bind(this)
            });
        });
    }

    public endTransitionToNewRoom() {
        // start following again
        this.camera.startFollow(this.attached);

        this.scene.getCurrentFloor().setCurrentRoom(this.room);
        this.room.activate();
        this.state = STATES.FOLLOWING;

        this.attached.reactivateAllControllers();
    }

    public hasUpdateMethod(): true {
        return true;
    }

    public setBoundsFromRoom() {
        this.camera.setBounds(this.room.rect.left, this.room.rect.top, this.room.rect.width, this.room.rect.height);
    }

    public startTransitionToNewRoom(room: Room, vector: Vec.Vector2) {
        this.state = STATES.TRANSITIONING_TO_ROOM;
        this.room.deactivate(); // stop everything in the room
        this.nextRoom = room;

        // stop the player's logic
        this.attached.deactivateAllControllers();

        // unlock the camera so we can start tweening
        this.camera.stopFollow();
        this.camera.useBounds = false;

        // increase the distance we move the camera and player
        const cameraMovement = new Vec.Vector2(vector.x * SCREEN_WIDTH_ABS, vector.y * SCREEN_HEIGHT_ABS);
        const playerMovement = new Vec.Vector2(
            vector.x * (TILE_WIDTH * 2),
            vector.y * (TILE_HEIGHT * 2)
        );

        this.scrollToNewRoom(cameraMovement, playerMovement);
    }

    public roundOffCameraScroll(horizontal: boolean) {
        if (horizontal && (this.camera.worldView.left < this.nextRoom.rect.left || this.camera.worldView.right > this.nextRoom.rect.right)) {
            const roundedX = Math.round(this.camera.worldView.left / SCREEN_WIDTH_ABS) * SCREEN_WIDTH_ABS;
            this.camera.pan(roundedX + this.camera.centerX, this.camera.worldView.top + this.camera.centerY, 750, 'Linear');
        } else if (this.camera.worldView.top < this.nextRoom.rect.top || this.camera.worldView.bottom > this.nextRoom.rect.bottom) {
            const roundedY = Math.round(this.camera.worldView.top / SCREEN_HEIGHT_ABS) * SCREEN_HEIGHT_ABS;
            this.camera.pan(this.camera.worldView.left + this.camera.centerX, roundedY + this.camera.centerY, 750, 'Linear');
        }
    }

    public deroundCameraScroll(horizontal: boolean) {
        const center = this.attached.getCenter();
        if (horizontal) {
            const newX = center.x;
            this.camera.pan(newX, this.camera.worldView.top + this.camera.centerY, 750, 'Linear');
        } else {
            const newY = center.y;
            this.camera.pan(this.camera.worldView.left + this.camera.centerX, newY, 750, 'Linear');
        }
    }

    public scrollToNewRoom(cameraMovement: Vec.Vector2, playerMovement: Vec.Vector2) {
        this.roundOffCameraScroll(playerMovement.x === 0);
        this.scene.tweens.add({
            targets: this.attached,
            x: this.attached.x + playerMovement.x,
            y: this.attached.y + playerMovement.y,
            duration: 750,
            ease: 'linear',
            onComplete: () => {
                this.scene.time.delayedCall(100, () => {
                    this.attached.setVisible(false);
                    this.attached.setPosition(this.attached.x - playerMovement.x, this.attached.y - playerMovement.y); 
                    this.nextRoom.preload();

                    this.camera.once( Cameras.Scene2D.Events.PAN_COMPLETE, () => {
                        this.attached.setVisible(true);

                        this.room.unload();
                        this.room = this.nextRoom;
                        this.setBoundsFromRoom();
                        this.deroundCameraScroll(playerMovement.x === 0);

                        this.scene.tweens.add({
                            targets: this.attached,
                            x: this.attached.x + playerMovement.x,
                            y: this.attached.y + playerMovement.y,
                            duration: 750,
                            ease: 'linear',
                            onComplete: this.endTransitionToNewRoom.bind(this)
                        });
                    });

                    this.camera.pan(
                        this.camera.worldView.x + this.camera.centerX + cameraMovement.x,
                        this.camera.worldView.y + this.camera.centerY + cameraMovement.y,
                        1000, 'Linear', true
                    );
                });
            }
        })
    }

    public update( time: number, delta: number ) {
        if (!this.active) return;

        if (this.state === STATES.FOLLOWING && !this.room.isInsideRoom(this.attached.getBounds())) {
            const exitVector = this.room.getExitVector(this.attached.getBounds());
            const newRoomSearchPoint = new Vec.Vector2(
                this.attached.x + (exitVector.x * TILE_WIDTH),
                this.attached.y + (exitVector.y * TILE_HEIGHT)
            );
            const nextRoom = this.floor.getRoomAt(newRoomSearchPoint.x, newRoomSearchPoint.y);

            if (nextRoom === null) {
                console.error("Player is out of bounds");
                this.state = STATES.UNKNOWN_AND_PANICKING;
            } else {
                this.startTransitionToNewRoom(nextRoom, exitVector);
            }
        }
    }

}