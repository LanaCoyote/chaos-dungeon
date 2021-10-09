import { Time } from "phaser";

import Controller from "../Controller";
import Actor from "../../objects/actors/Actor";

export default abstract class AiController<EnemyDataType> extends Controller {

    public attached: Actor;
    public data: EnemyDataType;
    public state?: number;
    public minimumStateTime: number = 1000;
    public maximumStateTime: number = 3000;

    private nextStateTimer: Time.TimerEvent;

    constructor(data: EnemyDataType, attached?: Actor) {
        super(attached);

        if ((data as any).minimumStateTime) this.minimumStateTime = (data as any).minimumStateTime;
        if ((data as any).maximumStateTime) this.maximumStateTime = (data as any).maximumStateTime;

        this.setEnemyData(data);
    }

    public activate() {
        this.active = true;
        this.onActivated();
        this.resetStateTimer();
    }

    public deactivate() {
        if (this.nextStateTimer) this.nextStateTimer.remove();
        this.active = false;
        this.onDeactivated();
    }

    public onActivated() {

    }

    public onDeactivated() {

    }

    public onChangeState(oldState: number, newState: number) {

    }

    public setEnemyData(data: EnemyDataType) {
        this.data = data;
    }

    protected canExitCurrentState(): boolean {
        return true;
    }

    protected resetStateTimer() {
        const delay = (this.maximumStateTime - this.minimumStateTime) * Math.random();
        this.setStateTimer(this.minimumStateTime + delay);
    }

    protected setStateTimer(delay: number) {
        if (this.nextStateTimer) this.nextStateTimer.remove();
        this.nextStateTimer = this.scene.time.delayedCall( delay, this.stateTimerExpired, [], this);
    }

    protected getNextState() : number|null {
        return null;
    }

    private stateTimerExpired() {
        this.nextStateTimer = undefined;

        if (this.canExitCurrentState()) {
            const oldState = this.state;
            const nextState = this.getNextState();
            if (nextState !== null) {
                this.state = nextState;
                this.onChangeState(oldState, nextState);
            }
        }

        if (!this.nextStateTimer) this.resetStateTimer();
    }

}