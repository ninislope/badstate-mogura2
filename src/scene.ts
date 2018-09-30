class StartScene extends Scene {
    start() {
        this.setScene("startScene");
    }
}

class HomeScene extends MainScene {
    newChallenge: boolean;

    constructor(player: Player, newChallenge: boolean) {
        super(
            player,
            document.querySelector(`#homeScene .badStates`) as HTMLOListElement,
            document.querySelector(`#homeScene .statuses`) as HTMLDivElement,
            document.querySelector(`#homeScene .logs`) as HTMLOListElement,
            "previousChallengeBadStates",
            "previousChallengeSensitivity",
        );
        this.newChallenge = newChallenge;
    }

    start() {
        this.setScene("homeScene");
        this.setAddMode(this.player.addMode);
        if (this.newChallenge) this.player.environment.gameChallenges.newGameChallenge();

        this.setStartStageButton();
        this.setRepairButtonState();
        this.setDopeButtonState();
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
        const gameChallenge = this.player.environment.gameChallenges.currentGameChallenge;
    }

    private setStartStageButton() {
        const elem = document.querySelector("#startStageButton") as HTMLButtonElement;
        const challengeCount = this.player.environment.gameChallenges.currentGameChallenge.count;
        if (challengeCount === 1) {
            elem.textContent = "挑戦";
        } else {
            elem.textContent = `再挑戦（${challengeCount - 1}回目）`;
        }
    }

    private setRepairButtonState() {
        const elem = document.querySelector("#repairButton") as HTMLButtonElement;
        const repair = this.player.environment.repairs.byCount(this.player.repairCount);
        if (repair) {
            elem.textContent = `治療（${this.player.repairCount + 1}回目）`;
        } else {
            elem.textContent = `治療不可`;
        }
        if (this.player.canRepair && repair) {
            elem.disabled = false;
        } else {
            elem.disabled = true;
        }
    }

    private setDopeButtonState() {
        const elem = document.querySelector("#dopeButton") as HTMLButtonElement;
        const dope = this.player.environment.dopes.byCount(this.player.dopeCount);
        if (dope) {
            elem.textContent = `ドーピング（${this.player.dopeCount + 1}回目）`;
        } else {
            elem.textContent = `ドーピング不可`;
        }
        if (this.player.canDope && dope) {
            elem.disabled = false;
        } else {
            elem.disabled = true;
        }
    }
}

class RepairScene extends MainScene {
    repaired = false;

    private get cautionElem() { return document.querySelector(`#repairScene .caution`) as HTMLParagraphElement; }
    private get doRepairButton() { return document.querySelector(`#repairScene #doRepairButton`) as HTMLButtonElement; }
    private get reloadRepairButton() { return document.querySelector(`#repairScene #reloadRepairButton`) as HTMLButtonElement; }
    private get resultElem() { return document.querySelector(`#repairScene .result`) as HTMLParagraphElement; }

    constructor(player: Player) {
        super(
            player,
            document.querySelector(`#repairScene .badStates`) as HTMLOListElement,
            document.querySelector(`#repairScene .statuses`) as HTMLDivElement,
            document.querySelector(`#repairScene .logs`) as HTMLOListElement,
            "previousChallengeBadStates",
            "previousChallengeSensitivity",
        );
    }

    start() {
        this.setScene("repairScene");
        const repair = this.player.environment.repairs.byCount(this.player.repairCount);
        if (!repair) throw new Error("no repair");
        this.cautionElem.textContent = repair.description;
        this.doRepairButton.disabled = false;
        this.reloadRepairButton.classList.add("hidden");
        this.resultElem.textContent = "";
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
    }

    doRepair() {
        const repair = this.player.environment.repairs.byCount(this.player.repairCount);
        if (!repair) throw new Error("no repair");
        repair.apply(this.player);
        this.doRepairButton.disabled = true;
        if (this.player.canRepair && this.player.environment.repairs.byCount(this.player.repairCount)) this.reloadRepairButton.classList.remove("hidden");
        this.resultElem.textContent = repair.effectDescription;
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
        this.repaired = true;
    }

    back() {
        sceneState.repairBackHome();
    }
}

class DopeScene extends MainScene {
    private get cautionElem() { return document.querySelector(`#dopeScene .caution`) as HTMLParagraphElement; }
    private get doDopeButton() { return document.querySelector(`#dopeScene #doDopeButton`) as HTMLButtonElement; }
    private get reloadDopeButton() { return document.querySelector(`#dopeScene #reloadDopeButton`) as HTMLButtonElement; }
    private get resultElem() { return document.querySelector(`#dopeScene .result`) as HTMLParagraphElement; }

    constructor(player: Player) {
        super(
            player,
            document.querySelector(`#dopeScene .badStates`) as HTMLOListElement,
            document.querySelector(`#dopeScene .statuses`) as HTMLDivElement,
            document.querySelector(`#dopeScene .logs`) as HTMLOListElement,
            "previousChallengeBadStates",
            "previousChallengeSensitivity",
        );
    }

    start() {
        this.setScene("dopeScene");
        const dope = this.player.environment.dopes.byCount(this.player.dopeCount);
        if (!dope) throw new Error("no repair");
        this.cautionElem.textContent = dope.description;
        this.doDopeButton.disabled = false;
        this.reloadDopeButton.classList.add("hidden");
        this.resultElem.textContent = "";
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
    }

    doRepair() {
        const dope = this.player.environment.dopes.byCount(this.player.dopeCount);
        if (!dope) throw new Error("no repair");
        dope.apply(this.player);
        this.doDopeButton.disabled = true;
        if (this.player.canDope && this.player.environment.dopes.byCount(this.player.dopeCount)) this.reloadDopeButton.classList.remove("hidden");
        this.resultElem.textContent = dope.effectDescription;
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
    }

    back() {
        sceneState.dopeBackHome();
    }
}

class StageScene extends MainScene {
    /** 次のステージへ移行する */
    next: boolean;
    /** 挑戦中初回 */
    firstStage: boolean;

    private moguraGame!: MoguraGame;

    private _levelElem?: HTMLSpanElement;
    private _stageNameElem?: HTMLSpanElement;
    private _repeatCountElem?: HTMLSpanElement;
    private _restCountElem?: HTMLSpanElement;
    private _successCountElem?: HTMLSpanElement;
    private _failCountElem?: HTMLSpanElement;
    private _moguraElems?: NodeListOf<HTMLButtonElement>;
    private _speakElem?: HTMLDivElement;
    private _startElem?: HTMLDivElement;
    private _inactiveElem?: HTMLDivElement;
    private _orgasmElem?: HTMLDivElement;
    private get levelElem() { return this._levelElem ? this._levelElem : (this._levelElem = document.querySelector("#stageScene .level") as HTMLSpanElement); }
    private get stageNameElem() { return this._stageNameElem ? this._stageNameElem : (this._stageNameElem = document.querySelector("#stageScene .stageName") as HTMLSpanElement); }
    private get repeatCountElem() { return this._repeatCountElem ? this._repeatCountElem : (this._repeatCountElem = document.querySelector("#stageScene .repeatCount") as HTMLSpanElement); }
    private get restCountElem() { return this._restCountElem ? this._restCountElem : (this._restCountElem = document.querySelector("#stageScene .restCount") as HTMLSpanElement); }
    private get successCountElem() { return this._successCountElem ? this._successCountElem : (this._successCountElem = document.querySelector("#stageScene .successCount") as HTMLSpanElement); }
    private get failCountElem() { return this._failCountElem ? this._failCountElem : (this._failCountElem = document.querySelector("#stageScene .failCount") as HTMLSpanElement); }
    private get moguraElems() { return this._moguraElems ? this._moguraElems : (this._moguraElems = document.querySelectorAll<HTMLButtonElement>("#stageScene .mogura")); }
    private get speakElem() { return this._speakElem ? this._speakElem : (this._speakElem = document.querySelector("#stageScene .speak") as HTMLDivElement); }
    private get startElem() { return this._startElem ? this._startElem : (this._startElem = document.querySelector("#stageScene .start") as HTMLDivElement); }
    private get inactiveElem() { return this._inactiveElem ? this._inactiveElem : (this._inactiveElem = document.querySelector("#stageScene .inactive") as HTMLDivElement); }
    private get orgasmElem() { return this._orgasmElem ? this._orgasmElem : (this._orgasmElem = document.querySelector("#stageScene .orgasm") as HTMLDivElement); }

    constructor(player: Player, next: boolean, firstStage = false) {
        super(
            player,
            document.querySelector(`#stageScene .badStates`) as HTMLOListElement,
            document.querySelector(`#stageScene .statuses`) as HTMLDivElement,
            document.querySelector(`#stageScene .logs`) as HTMLOListElement,
            "previousStageBadStates",
            "previousStageSensitivity",
            false,
        );
        this.next = next;
        this.firstStage = firstStage;
    }

    start() {
        // FIXME: 未実装故
        if (this.next && this.player.environment.gameChallenges.currentGameChallenge.currentGameStage && this.player.environment.gameChallenges.currentGameChallenge.currentGameStage.level + 1> this.player.environment.gameChallenges.challenges.challenge(1).stages.length) {
            alert("この先のステージは未実装です");
            return;
        }
        if (this.next) this.player.environment.gameChallenges.currentGameChallenge.newGameStage();
        if (this.firstStage) {
            this.player.addMode = this.getAddMode();
            this.player.newChallenge(this.player.environment.gameChallenges.currentGameChallenge.count);
        } else {
            this.player.passStage();
        }

        const gameStage = this.player.environment.gameChallenges.currentGameChallenge.currentGameStage;
        this.moguraGame = new MoguraGame(this.player, this, gameStage.newGameStageChallenge(), () => {
            this.player.endStage(this.moguraGame.gameStageChallenge.successRate);
            sceneState.showResult(this.moguraGame);
        });

        this.player.newStageChallenge(gameStage.level, gameStage.currentGameStageChallenge.repeatCount);

        this.hideAllMoguras();
        this.setTitle();
        this.updateInfo();
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
        this.moguraGame.gamePlayer.speakReady();
        // 描画準備してからシーン切り替え
        this.setScene("stageScene");
        this.showStart();
        setTimeout(() => this.setStart("3"), 1);
        setTimeout(() => this.setStart("2"), 500);
        setTimeout(() => this.setStart("1"), 1000);
        setTimeout(() => this.setStart("START!"), 1500);
        setTimeout(() => {
            this.hideStart();
            setTimeout(this.moguraGame.gamePlayer.start, 400);
            setTimeout(this.moguraGame.start, 400);
        }, 2000);
    }

    updateBadStates() {
        super.updateBadStates();
    }

    updateStatuses() {
        super.updateStatuses();
    }

    updateLogs() {
        super.updateLogs();
    }

    setSpeak(speak: string) {
        this.speakElem.textContent = speak;
    }

    showInactive() {
        this.inactiveElem.classList.add("show");
    }

    hideInactive() {
        this.inactiveElem.classList.remove("show");
    }

    appearMogura(index: number, value: string) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("hidden", "destroyed", "failed");
        mogura.classList.add("appear");
        mogura.textContent = value;
        this.updateInfo();
    }

    destroyMogura(index: number) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("hidden", "appear", "failed");
        mogura.classList.add("destroyed");
        this.updateInfo();
    }

    hideMogura(index: number) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("appear", "destroyed", "failed");
        mogura.classList.add("hidden");
        this.updateInfo();
    }

    failMogura(index: number) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("appear", "destroyed", "hidden");
        mogura.classList.add("failed");
        this.updateInfo();
    }

    upSensation(info: UpSensationInfo) {
    }

    orgasm(second: number) {
        this.orgasmElem.style.opacity = "0";
        this.orgasmElem.style.animation = "";
        setTimeout(() => {
            this.orgasmElem.style.animation = `orgasmDisplay ${second}s ease-in 0s 1`;
        }, 1);
    }

    private setTitle() {
        this.levelElem.textContent = `${this.moguraGame.gameStageChallenge.gameStage.level}`;
        this.stageNameElem.textContent = `${this.moguraGame.gameStageChallenge.gameStage.stage.name}`;
        this.repeatCountElem.textContent = `${this.moguraGame.gameStageChallenge.repeatCount}`;
    }

    private updateInfo() {
        this.restCountElem.textContent = `${this.moguraGame.gameStageChallenge.restCount}`;
        this.successCountElem.textContent = `${this.moguraGame.gameStageChallenge.successCount}`;
        this.failCountElem.textContent = `${this.moguraGame.gameStageChallenge.failCount}`;
    }

    private hideAllMoguras() {
        for (const moguraElem of this.moguraElems) {
            moguraElem.classList.remove("appear", "destroyed");
            moguraElem.classList.add("hidden");
        }
    }

    private showStart() {
        this.startElem.classList.add("show");
    }

    private hideStart() {
        this.startElem.classList.remove("show");
    }

    private setStart(value: string) {
        this.startElem.textContent = value;
    }
}

class ResultScene extends MainScene {
    moguraGame: MoguraGame;

    constructor(player: Player, moguraGame: MoguraGame) {
        super(
            player,
            document.querySelector(`#resultScene .badStates`) as HTMLOListElement,
            document.querySelector(`#resultScene .statuses`) as HTMLDivElement,
            document.querySelector(`#resultScene .logs`) as HTMLOListElement,
            "previousStageBadStates",
            "previousStageSensitivity",
        );
        this.moguraGame = moguraGame;
    }

    start() {
        this.updateBadStates();
        this.updateStatuses();
        this.updateLogs();
        this.updateInfo();
        this.setScene("resultScene");
    }

    updateInfo() {
        document.querySelector<HTMLSpanElement>("#resultScene .level")!.textContent = `${this.moguraGame.gameStageChallenge.gameStage.level}`;
        document.querySelector<HTMLSpanElement>("#resultScene .stageName")!.textContent = `${this.moguraGame.gameStageChallenge.stage.name}`;
        document.querySelector<HTMLSpanElement>("#resultScene .repeatCount")!.textContent = `${this.moguraGame.gameStageChallenge.repeatCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .totalCount")!.textContent = `${this.moguraGame.gameStageChallenge.totalCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successCount")!.textContent = `${this.moguraGame.gameStageChallenge.successCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .failCount")!.textContent = `${this.moguraGame.gameStageChallenge.failCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successRate")!.textContent = `${this.moguraGame.gameStageChallenge.successRate}`;
        document.querySelector<HTMLSpanElement>("#resultScene .currentStageOrgasmCount")!.textContent = `${this.player.currentStageOrgasmCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .nextStage")!.textContent = this.player.currentStageCanClear ? "成功" : "失敗";
        document.querySelector<HTMLSpanElement>("#resultScene .clearCondition")!.textContent = this.player.orgasmLimit === 1 ? "（1回も絶頂しなければクリア）" : `（絶頂${this.player.orgasmLimit}回以内ならクリア）`;
        document.querySelector<HTMLParagraphElement>("#resultScene #nextStageButton")!.style.display = this.player.currentStageCanClear ? "block" : "none";
    }
}
