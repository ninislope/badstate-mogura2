class GamePlayer {
    /** 絶頂判定までの間隔(ms) */
    static orgasmWait = 900;

    player: Player;
    moguraGame: MoguraGame;
    get currentBadStates() { return this.player.badStates; }

    private inactiveTimer?: number;
    private orgasmTimer?: number;
    private speakTimers: Array<number | undefined> = [];
    private triggerStopTimers: {[name: string]: number} = {};
    private removeTimers: {[name: string]: number} = {};
    private inactive = false;

    constructor(player: Player, moguraGame: MoguraGame) {
        this.player = player;
        this.moguraGame = moguraGame;
    }

    get addMode() { return this.player.addMode; }
    get effectiveBadStates() { return this.player.effectiveBadStates; }

    upBadState(setName: BadStateSetName, upProgress?: number): void;
    upBadState(setName: BadStateTriggerParam): void;
    upBadState(setName: BadStateTriggerParam, upProgress = 1) {
        if (typeof setName !== "string") {
            this.upBadState(setName.name, setName.progress);
            return;
        }
        const playerBadStates = this.player.upBadState(setName, upProgress);
        if (playerBadStates) this.setBadStateTimer(setName);
        this.moguraGame.scene.updateBadStates();
        this.moguraGame.scene.updateStatuses();
    }

    downBadState(setName: BadStateSetName, periodDown: number | boolean, endTrigger?: BadStateTriggerParam[]) {
        const playerBadStates = this.player.downBadState(setName, periodDown);
        if (endTrigger) { // 持続時間終了後バッドステートを誘発
            for (const triggerParam of endTrigger) {
                this.upBadState(triggerParam);
            }
        }
        if (playerBadStates) this.setBadStateTimer(setName);
        this.moguraGame.scene.updateBadStates();
        this.moguraGame.scene.updateStatuses();
    }

    downBadStatesOnBattleEnd() {
        this.player.downBadStatesOnBattleEnd();
    }

    start = () => {
        console.log("v start PlayerInMoguraGame", `stage level=${this.moguraGame.gameStageChallenge.stage.level}`);
        const playerBadStates = this.effectiveBadStates;
        let offset = 1;
        for (const setName of playerBadStates.setNames) {
            setTimeout(() => this.setBadStateTimer(setName), offset);
            offset += 37; // タイミングがかぶらないように
        }
        console.log("^ start PlayerInMoguraGame", `stage level=${this.moguraGame.gameStageChallenge.stage.level}`);
    }

    end = () => {
        console.log("v end PlayerInMoguraGame", `stage level=${this.moguraGame.gameStageChallenge.stage.level}`);
        this.moguraGame.scene.hideInactive();
        this.clearTimers();
        this.downBadStatesOnBattleEnd();
        console.log("^ end PlayerInMoguraGame", `stage level=${this.moguraGame.gameStageChallenge.stage.level}`);
    }

    private clearTimers() {
        if (this.inactiveTimer) clearTimeout(this.inactiveTimer);
        if (this.orgasmTimer) clearTimeout(this.orgasmTimer);
        for (const handle of this.speakTimers) {
            if (handle) clearTimeout(handle);
        }
        for (const name of Object.keys(this.triggerStopTimers)) {
            clearTimeout(this.triggerStopTimers[name]);
        }
        for (const name of Object.keys(this.removeTimers)) {
            clearTimeout(this.removeTimers[name]);
        }
    }

    private setBadStateTimer(setName: BadStateSetName) {
        if (this.moguraGame.ended) return;
        const badState = this.effectiveBadStates.find(setName);
        if (!badState) {
            this.clearBadStateTimer(setName);
            return;
        }
        console.log(`setBadStateTimer ${badState.setName} ${badState.progress}`);
        if (badState.needTrigger) {
            if (!this.triggerStopTimers[badState.setName]) this.timerTriggerImmediate(badState.setName); // 前にかかっていたのがあったらそれにまかせる
        }
        if (badState.period != null) {
            if (badState.period === 0) { // すぐ進行度ダウン
                this.downBadState(badState.setName, badState.periodDown, badState.endTrigger);
            } else {
                this.timerRemoveBadState(badState);
            }
        }
    }

    private clearBadStateTimer(setName: string) {
        if (this.triggerStopTimers[setName]) {
            clearTimeout(this.triggerStopTimers[setName]);
            delete this.triggerStopTimers[setName];
        }
        if (this.removeTimers[setName]) {
            clearTimeout(this.removeTimers[setName]);
            delete this.removeTimers[setName];
        }
    }

    private timerTriggerImmediate(setName: BadStateSetName) {
        if (this.moguraGame.ended) return;
        const badState = this.effectiveBadStates.find(setName);
        if (!badState) return; // 解消されている場合
        const triggerNow = badState.triggersNow();
        console.log(new Date().toISOString(), `inactive=${this.inactive} now=${triggerNow} ${badState.setName} ${badState.progress}`);
        if (!this.inactive && triggerNow) {
            if (badState.stop) {
                this.setInactive(badState.stop * this.player.effectiveRate, () => { // 停止させる
                    if (badState.trigger) { // 停止後バッドステートを誘発
                        for (const triggerParam of badState.trigger) {
                            this.upBadState(triggerParam);
                        }
                    }
                });
            } else if (badState.trigger) { // バッドステートを誘発
                for (const triggerParam of badState.trigger) {
                    this.upBadState(triggerParam);
                }
            }
            if (badState.sensation) {
                const parts = badState.sensitivity ? Object.keys(badState.sensitivity) as SensitivePart[] : PlayerSensitivity.parts;
                const info = this.player.upSensation(parts, badState.sensation);
                this.moguraGame.scene.upSensation(info);
                if (this.player.canOrgasm) this.setOrgasm();
            }
            if (badState.speak) { // しゃべる
                this.timerSpeaks(badState.randomSpeak(), badState.speakInterval || 1000);
            }
        }
        delete this.triggerStopTimers[badState.setName];
        if (badState.cycle) this.timerTrigger(badState.setName);
    }

    private timerTrigger(setName: BadStateSetName) {
        if (this.triggerStopTimers[setName]) return; // 前にかかっていたのがあったらそれにまかせる
        const badState = this.effectiveBadStates.find(setName);
        if (!badState) return; // 解消されている場合
        if (!badState.cycle) return; // 周期実行でない場合
        this.triggerStopTimers[setName] = setTimeout(() => this.timerTriggerImmediate(badState.setName), badState.cycle);
    }

    private timerRemoveBadState(badState: BadState) {
        const previousHandle = this.removeTimers[badState.setName];
        if (previousHandle) clearTimeout(previousHandle); // 前にかかっていたのがあったら期限を更新
        this.removeTimers[badState.setName] = setTimeout(() => {
            if (this.moguraGame.ended) return;
            delete this.removeTimers[name];
            this.downBadState(badState.setName, badState.periodDown, badState.endTrigger);
        }, (badState.period as number) * this.player.effectiveRate);
    }

    private timerSpeaks(speaks: string[], interval: number) {
        const lastIndex = speaks.length - 1;
        for (let index = 0; index <= lastIndex; ++index) {
            this.timerSpeak(speaks[index], index, interval, index === lastIndex);
        }
    }

    private timerSpeak(speak: string, index: number, interval: number, last = false) {
        this.speakTimers[index] = setTimeout(() => {
            if (this.moguraGame.ended) return;
            this.speakTimers[index] = undefined;
            if (last) this.speakTimers.length = 0;
            this.moguraGame.scene.setSpeak(speak);
        }, 1 + index * interval);
    }

    private setInactive(period: number, onEnd: () => any) {
        this.inactive = true;
        this.moguraGame.scene.showInactive();
        this.inactiveTimer = setTimeout(() => {
            delete this.inactiveTimer;
            this.inactive = false;
            this.moguraGame.scene.hideInactive();
            onEnd();
        }, period);
    }

    private setOrgasm() {
        if (this.orgasmTimer != null) return; // 既にセットされていたらそれに任せる
        this.orgasmTimer = setTimeout(() => {
            const beforeWS = this.player.sensation;
            const orgasmCount = this.player.toOrgasmCount();
            // if (orgasmCount <= 0) return;
            // 絶頂バッドステートを誘発
            this.upBadState("絶頂", orgasmCount); // これによって快感上昇するので絶頂処理はその後
            if (this.effectiveBadStates.find("子宮屈服")) {
                this.upBadState("屈服絶頂余韻", orgasmCount);
            }
            this.upBadState("絶頂余韻", orgasmCount);
            this.player.orgasm(orgasmCount);
            console.info("ORGA", orgasmCount, beforeWS, this.player.sensation);
            this.moguraGame.scene.orgasm(1 + orgasmCount / 2);
            delete this.orgasmTimer;
        }, GamePlayer.orgasmWait);
    }

    hitMogura = (index: number) => {
        if (this.inactive) return;
        this.speakHit();
        const delay = this.player.delay;
        if (delay) {
            setTimeout(() => this.moguraGame.hitMogura(index), delay);
        } else {
            this.moguraGame.hitMogura(index);
        }
    }

    speakReady() {
        this.moguraGame.scene.setSpeak(this.player.environment.speak.randomReadySpeak(this.player.sensitivity.all));
    }

    private speakHit() {
        this.moguraGame.scene.setSpeak(this.player.environment.speak.randomHitSpeak(this.player.sensitivity.all));
    }
}

class GameBadStateSelector {
    badStates: BadStates;
    gamePlayer: GamePlayer;
    stageBadStates: StageBadStates;
    setNames: BadStateSetName[];

    previousSetName?: string;

    constructor(badStates: BadStates, gamePlayer: GamePlayer, stageBadStates: StageBadStates) {
        this.badStates = badStates;
        this.gamePlayer = gamePlayer;
        this.stageBadStates = stageBadStates;
        this.setNames = Object.keys(this.stageBadStates) as BadStateSetName[];
    }

    nextBadState() {
        let nextBadStates = this.setNames.map((setName) => {
            const currentBadState = this.gamePlayer.currentBadStates.find(setName);
            const nextProgress = currentBadState ? currentBadState.progress + 1 : 1;
            const maxProgress = this.stageBadStates[setName]!.maxProgress;
            if (maxProgress && nextProgress > maxProgress) return;
            return this.badStates.findSet(setName).byProgress(nextProgress);
        }).filter((badState) => !!badState) as BadState[];
        if (!nextBadStates.length) return;
        if (nextBadStates.length !== 1) {
            // 要素が一つでないなら前回分は除く
            nextBadStates = nextBadStates.filter((badState) => badState.setName !== this.previousSetName);
        }
        const weightSum = nextBadStates.reduce((sum, badState) => sum + (this.stageBadStates[badState.setName]!.weight || 100), 0);
        const target = Math.random() * weightSum;
        let currentWeight = 0;
        const nextBadState = nextBadStates.find((badState) => {
            currentWeight += this.stageBadStates[badState.setName]!.weight || 100;
            return target < currentWeight;
        }) as BadState;
        this.previousSetName = nextBadState.setName;
        return nextBadState;
    }
}

class MoguraGame {
    scene: StageScene;
    gameStageChallenge: GameStageChallenge;
    gamePlayer: GamePlayer;
    gameBadStateSelector: GameBadStateSelector;
    onEnd: () => any;

    ended = false;

    private currentMoguras: {[index: string]: BadState} = {};
    private currentMoguraHits: {[index: string]: boolean} = {};

    constructor(player: Player, scene: StageScene, gameStageChallenge: GameStageChallenge, onEnd: () => any) {
        this.scene = scene;
        this.gameStageChallenge = gameStageChallenge;
        this.gamePlayer = new GamePlayer(player, this);
        this.gameBadStateSelector = new GameBadStateSelector(player.environment.badStates, this.gamePlayer, this.gameStageChallenge.badStates);
        this.onEnd = onEnd;
    }

    start = () => {
        console.log("v start MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
        this.appearMogura();
        console.log("^ start MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
    }

    private end = () => {
        console.log("v end MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
        this.ended = true;
        this.gamePlayer.end();
        console.log("^ end MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
        this.onEnd();
        console.log("- end complete MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
    }

    private get currentMoguraCount() { return Object.keys(this.currentMoguras).length; }

    private newMoguraIndex() {
        let index = Math.floor(Math.random() * (10 - this.currentMoguraCount));
        while (this.currentMoguras[index]) index = (index + 1) % 10;
        return index;
    }

    private appearMogura = () => {
        if (this.gameStageChallenge.restAppearCount <= 0) return;
        const index = this.newMoguraIndex();
        const badState = this.gameBadStateSelector.nextBadState();
        if (badState) { // バッドステートが一時的に選出不可の場合がある
            this.currentMoguras[index] = badState;
            this.gameStageChallenge.appear();
            this.scene.appearMogura(index, badState.displayName);
            const hideSpeed = this.gameStageChallenge.currentHideSpeed * badState.hideSpeed / 100;
            setTimeout(() => this.hideMogura(index), hideSpeed);
        }
        setTimeout(this.appearMogura, this.gameStageChallenge.currentAppearSpeed);
    }

    private hideMogura = (index: number) => {
        if (this.currentMoguraHits[index]) {
            delete this.currentMoguraHits[index];
        } else {
            const badState = this.currentMoguras[index];
            this.gameStageChallenge.fail();
            this.gamePlayer.upBadState(badState.setName);
        }
        delete this.currentMoguras[index];
        this.scene.hideMogura(index);
        if (this.gameStageChallenge.restCount <= 0 && !this.ended) this.end();
    }

    hitMogura = (index: number) => {
        if (this.currentMoguras[index]) {
            this.currentMoguraHits[index] = true;
            this.gameStageChallenge.success();
            this.scene.destroyMogura(index);
        }
    }
}
