class GamePlayer {
    /** 絶頂判定までの間隔(ms) */
    static orgasmWait = 900;

    player: Player;
    moguraGame: MoguraGame;
    get currentBadStates() { return this.player.badStates; }

    private inactiveTimers: Array<number | undefined> = [];
    private orgasmTimer?: number;
    private speakTimers: Array<number | undefined> = [];
    private triggerStopTimers: {[name: string]: number} = {};
    private removeTimers: {[name: string]: number} = {};
    private inactive = 0;

    constructor(player: Player, moguraGame: MoguraGame) {
        this.player = player;
        this.moguraGame = moguraGame;
    }

    get addMode() { return this.player.addMode; }
    get effectiveBadStates() { return this.player.effectiveBadStates; }

    upBadState(setName: BadStateSetName, triggeredBy?: BadState | boolean, upProgress?: number): void;
    upBadState(setName: BadStateTriggerParam, triggeredBy?: BadState | boolean): void;
    upBadState(setName: BadStateTriggerParam, triggeredBy?: BadState | boolean, upProgress?: number) {
        if (typeof setName !== "string") {
            this.upBadState(setName.name, triggeredBy, setName.progress);
            return;
        }
        const playerBadStates = this.player.upBadState(setName, triggeredBy, upProgress);
        if (playerBadStates) console.info("▼発動", setName, "進行=", upProgress as number, "誘発=", triggeredBy);
        if (playerBadStates) this.setBadStateTimer(setName);
        this.moguraGame.scene.updateBadStates();
        this.moguraGame.scene.updateStatuses();
        this.moguraGame.scene.updateLogs();
    }

    downBadState(setName: BadStateSetName, periodDown: number | boolean, endTrigger?: BadStateTriggerParam[]) {
        const badState = this.player.badStates.find(setName);
        const playerBadStates = this.player.downBadState(setName, periodDown);
        if (endTrigger) { // 持続時間終了後バッドステートを誘発
            for (const triggerParam of endTrigger) {
                console.info("●終了誘発", ...(typeof triggerParam === "string" ? ["→", triggerParam, "進行=", 1] : ["→", triggerParam.name, "進行=", triggerParam.progress]));
                this.upBadState(triggerParam, badState);
            }
        }
        if (playerBadStates) this.setBadStateTimer(setName);
        this.moguraGame.scene.updateBadStates();
        this.moguraGame.scene.updateStatuses();
        this.moguraGame.scene.updateLogs();
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
        for (const handle of this.inactiveTimers) {
            if (handle) clearTimeout(handle);
        }
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
        if (triggerNow) {
            const logname = `[${badState.displayName}]`;
            if (badState.stop) {
                this.setInactive(badState.stop * this.player.effectiveRate, () => { // 停止させる
                    if (badState.trigger) { // 停止後バッドステートを誘発
                        for (const triggerParam of badState.trigger) {
                            console.info("●誘発", logname, ...(typeof triggerParam === "string" ? ["→", triggerParam, "進行=", 1] : ["→", triggerParam.name, "進行=", triggerParam.progress]));
                            this.upBadState(triggerParam, badState);
                        }
                    }
                });
            } else if (badState.trigger) { // バッドステートを誘発
                for (const triggerParam of badState.trigger) {
                    console.info("●誘発", logname, ...(typeof triggerParam === "string" ? ["→", triggerParam, "進行=", 1] : ["→", triggerParam.name, "進行=", triggerParam.progress]));
                    this.upBadState(triggerParam, badState);
                }
            }
            if (badState.sensation) {
                const parts = typeof badState.sensitivity === "number" ? PlayerSensitivity.parts : Object.keys(badState.sensitivity) as SensitivePart[];
                const info = this.player.upSensation(parts, badState.sensation, badState);
                this.moguraGame.scene.upSensation(info);
                for (const part of Object.keys(info.sensitivity) as SensitivePart[]) {
                    console.info("★快感", logname, "強度=", badState.sensation, "快感=", float2(info.sensation), "感度=",
                        PlayerSensitivity.ja(part, true),
                        "+",
                        float2(info.sensitivity[part] || 0),
                        "base=",
                        float2(this.player.baseSensitivity[part]),
                        "bias=",
                        float2(this.player.badStates.sensitivityBias[part]),
                        "%",
                    );
                }
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
        this.triggerStopTimers[setName] = setTimeout(() => this.timerTriggerImmediate(badState.setName), badState.cycle * this.player.speedBoost / 100);
    }

    private timerRemoveBadState(badState: BadState) {
        const previousHandle = this.removeTimers[badState.setName];
        if (previousHandle) clearTimeout(previousHandle); // 前にかかっていたのがあったら期限を更新
        this.removeTimers[badState.setName] = setTimeout(() => {
            if (this.moguraGame.ended) return;
            delete this.removeTimers[name];
            this.downBadState(badState.setName, badState.periodDown, badState.endTrigger);
        }, (badState.period as number) * this.player.effectiveRate * this.player.speedBoost / 100);
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
        ++this.inactive;
        this.moguraGame.scene.showInactive();
        const length = this.inactiveTimers.push(setTimeout(() => {
            this.inactiveTimers[length - 1] = undefined;
            --this.inactive;
            if (!this.inactive) this.moguraGame.scene.hideInactive();
            onEnd();
        }, period * this.player.speedBoost / 100));
    }

    private setOrgasm() {
        if (this.orgasmTimer != null) return; // 既にセットされていたらそれに任せる
        this.orgasmTimer = setTimeout(() => {
            const beforeWS = this.player.sensation;
            const orgasmCount = this.player.toOrgasmCount();
            // if (orgasmCount <= 0) return;
            // 絶頂バッドステートを誘発
            this.upBadState("絶頂", true, orgasmCount); // これによって快感上昇するので絶頂処理はその後
            if (this.effectiveBadStates.find("子宮屈服")) {
                this.upBadState("屈服絶頂余韻", true, orgasmCount);
            }
            this.upBadState("絶頂余韻", true, orgasmCount);
            this.player.orgasm(orgasmCount);
            console.info("★★★絶頂", "回数=", orgasmCount, "絶頂時快感=", beforeWS, "絶頂後快感=", this.player.sensation);
            this.moguraGame.scene.orgasm(orgasmCount <= 9 ? 0.2 + orgasmCount / 5 : 1.1 + orgasmCount / 10);
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
        console.log("---------- start MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
        this.appearMogura();
        console.log("^ start MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
    }

    private end = () => {
        console.log("v end MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
        this.ended = true;
        this.gamePlayer.end();
        console.log("- end MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
        this.onEnd();
        console.log("---------- end complete MoguraGame", `stage level=${this.gameStageChallenge.stage.level}`);
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
            const stageHideSpeed = (this.gameStageChallenge.badStates[badState.setName]!.hideSpeed || 100);
            const hideSpeed = this.gameStageChallenge.currentHideSpeed * badState.hideSpeed * stageHideSpeed / 10000;
            setTimeout(() => this.hideMogura(index), hideSpeed * this.gamePlayer.player.speedBoost / 100);
        }
        setTimeout(this.appearMogura, this.gameStageChallenge.currentAppearSpeed * this.gamePlayer.player.speedBoost / 100);
    }

    private hideMogura = (index: number) => {
        let failed = false;
        if (this.currentMoguraHits[index]) {
            delete this.currentMoguraHits[index];
        } else {
            const badState = this.currentMoguras[index];
            this.gameStageChallenge.fail();
            this.gamePlayer.upBadState(badState.setName);
            failed = true;
        }
        delete this.currentMoguras[index];
        if (failed) {
            this.scene.failMogura(index);
        } else {
            this.scene.hideMogura(index);
        }
        if (this.gameStageChallenge.restCount <= 0 && !this.ended) this.end();
    }

    hitMogura = (index: number) => {
        if (this.currentMoguras[index] && !this.currentMoguraHits[index]) {
            this.currentMoguraHits[index] = true;
            this.gameStageChallenge.success();
            this.scene.destroyMogura(index);
        }
    }
}
