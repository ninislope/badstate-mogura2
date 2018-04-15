class StartScene extends Scene {
    start() {
        this.setScene("startScene");
    }
}
class HomeScene extends MainScene {
    constructor(player, newChallenge, canRepair) {
        super(player, document.querySelector(`#homeScene .badStates`), document.querySelector(`#homeScene .statuses`), "previousChallengeBadStates", "previousChallengeSensitivity");
        this.newChallenge = newChallenge;
        this.canRepair = canRepair;
    }
    start() {
        this.setScene("homeScene");
        this.setAddMode(this.player.addMode);
        if (this.newChallenge)
            this.player.environment.gameChallenges.newGameChallenge();
        this.setStartStageButton();
        this.setRepairButtonState();
        this.updateBadStates();
        this.updateStatuses();
        const gameChallenge = this.player.environment.gameChallenges.currentGameChallenge;
    }
    setStartStageButton() {
        const elem = document.querySelector("#startStageButton");
        const challengeCount = this.player.environment.gameChallenges.currentGameChallenge.count;
        if (challengeCount === 1) {
            elem.textContent = "挑戦";
        }
        else {
            elem.textContent = `再挑戦（${challengeCount - 1}回目）`;
        }
    }
    setRepairButtonState() {
        const elem = document.querySelector("#repairButton");
        const repair = this.player.environment.repairs.byCount(this.player.repairCount);
        if (repair) {
            elem.textContent = `治療（${this.player.repairCount + 1}回目）`;
        }
        else {
            elem.textContent = `治療不可`;
        }
        if (this.canRepair && repair) {
            elem.disabled = false;
        }
        else {
            elem.disabled = true;
        }
    }
}
class RepairScene extends MainScene {
    constructor(player) {
        super(player, document.querySelector(`#repairScene .badStates`), document.querySelector(`#repairScene .statuses`), "previousChallengeBadStates", "previousChallengeSensitivity");
        this.repaired = false;
    }
    get cautionElem() { return document.querySelector(`#repairScene .caution`); }
    get doRepairButton() { return document.querySelector(`#repairScene #doRepairButton`); }
    get resultElem() { return document.querySelector(`#repairScene .result`); }
    start() {
        this.setScene("repairScene");
        const repair = this.player.environment.repairs.byCount(this.player.repairCount);
        if (!repair)
            throw new Error("no repair");
        this.cautionElem.textContent = repair.description;
        this.doRepairButton.disabled = false;
        this.resultElem.textContent = "";
        this.updateBadStates();
        this.updateStatuses();
    }
    doRepair() {
        const repair = this.player.environment.repairs.byCount(this.player.repairCount);
        if (!repair)
            throw new Error("no repair");
        repair.apply(this.player);
        this.doRepairButton.disabled = true;
        this.resultElem.textContent = repair.effectDescription;
        this.updateBadStates();
        this.updateStatuses();
        this.repaired = true;
    }
    back() {
        sceneState.repairBackHome(!this.repaired);
    }
}
class StageScene extends MainScene {
    get levelElem() { return this._levelElem ? this._levelElem : (this._levelElem = document.querySelector("#stageScene .level")); }
    get stageNameElem() { return this._stageNameElem ? this._stageNameElem : (this._stageNameElem = document.querySelector("#stageScene .stageName")); }
    get repeatCountElem() { return this._repeatCountElem ? this._repeatCountElem : (this._repeatCountElem = document.querySelector("#stageScene .repeatCount")); }
    get restCountElem() { return this._restCountElem ? this._restCountElem : (this._restCountElem = document.querySelector("#stageScene .restCount")); }
    get successCountElem() { return this._successCountElem ? this._successCountElem : (this._successCountElem = document.querySelector("#stageScene .successCount")); }
    get failCountElem() { return this._failCountElem ? this._failCountElem : (this._failCountElem = document.querySelector("#stageScene .failCount")); }
    get moguraElems() { return this._moguraElems ? this._moguraElems : (this._moguraElems = document.querySelectorAll("#stageScene .mogura")); }
    get speakElem() { return this._speakElem ? this._speakElem : (this._speakElem = document.querySelector("#stageScene .speak")); }
    get startElem() { return this._startElem ? this._startElem : (this._startElem = document.querySelector("#stageScene .start")); }
    get inactiveElem() { return this._inactiveElem ? this._inactiveElem : (this._inactiveElem = document.querySelector("#stageScene .inactive")); }
    get orgasmElem() { return this._orgasmElem ? this._orgasmElem : (this._orgasmElem = document.querySelector("#stageScene .orgasm")); }
    constructor(player, next, firstStage = false) {
        super(player, document.querySelector(`#stageScene .badStates`), document.querySelector(`#stageScene .statuses`), "previousStageBadStates", "previousStageSensitivity", false);
        this.next = next;
        this.firstStage = firstStage;
    }
    start() {
        // FIXME: 未実装故
        if (this.next && this.player.environment.gameChallenges.currentGameChallenge.currentGameStage && this.player.environment.gameChallenges.currentGameChallenge.currentGameStage.level + 1 > this.player.environment.gameChallenges.challenges.challenge(1).stages.length) {
            alert("この先のステージは未実装です");
            return;
        }
        if (this.next)
            this.player.environment.gameChallenges.currentGameChallenge.newGameStage();
        if (this.firstStage) {
            this.player.addMode = this.getAddMode();
            this.player.newChallenge();
        }
        else {
            this.player.passStage();
        }
        this.player.newStageChallenge();
        const gameStage = this.player.environment.gameChallenges.currentGameChallenge.currentGameStage;
        this.moguraGame = new MoguraGame(this.player, this, gameStage.newGameStageChallenge(), () => sceneState.showResult(this.moguraGame));
        this.hideAllMoguras();
        this.setTitle();
        this.updateInfo();
        this.updateBadStates();
        this.updateStatuses();
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
    setSpeak(speak) {
        this.speakElem.textContent = speak;
    }
    showInactive() {
        this.inactiveElem.classList.add("show");
    }
    hideInactive() {
        this.inactiveElem.classList.remove("show");
    }
    appearMogura(index, value) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("hidden", "destroyed");
        mogura.classList.add("appear");
        mogura.textContent = value;
        this.updateInfo();
    }
    destroyMogura(index) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("hidden", "appear");
        mogura.classList.add("destroyed");
        this.updateInfo();
    }
    hideMogura(index) {
        const mogura = this.moguraElems[index];
        mogura.classList.remove("appear", "destroyed");
        mogura.classList.add("hidden");
        this.updateInfo();
    }
    upSensation(info) {
    }
    orgasm(second) {
        this.orgasmElem.style.opacity = "0";
        this.orgasmElem.style.animation = "";
        setTimeout(() => {
            this.orgasmElem.style.animation = `orgasmDisplay ${second}s ease-in 0s 1`;
        }, 1);
    }
    setTitle() {
        this.levelElem.textContent = `${this.moguraGame.gameStageChallenge.gameStage.level}`;
        this.stageNameElem.textContent = `${this.moguraGame.gameStageChallenge.gameStage.stage.name}`;
        this.repeatCountElem.textContent = `${this.moguraGame.gameStageChallenge.repeatCount}`;
    }
    updateInfo() {
        this.restCountElem.textContent = `${this.moguraGame.gameStageChallenge.restCount}`;
        this.successCountElem.textContent = `${this.moguraGame.gameStageChallenge.successCount}`;
        this.failCountElem.textContent = `${this.moguraGame.gameStageChallenge.failCount}`;
    }
    hideAllMoguras() {
        for (const moguraElem of this.moguraElems) {
            moguraElem.classList.remove("appear", "destroyed");
            moguraElem.classList.add("hidden");
        }
    }
    showStart() {
        this.startElem.classList.add("show");
    }
    hideStart() {
        this.startElem.classList.remove("show");
    }
    setStart(value) {
        this.startElem.textContent = value;
    }
}
class ResultScene extends MainScene {
    constructor(player, moguraGame) {
        super(player, document.querySelector(`#resultScene .badStates`), document.querySelector(`#resultScene .statuses`), "previousStageBadStates", "previousStageSensitivity");
        this.moguraGame = moguraGame;
    }
    start() {
        this.updateBadStates();
        this.updateStatuses();
        this.updateInfo();
        this.setScene("resultScene");
    }
    updateInfo() {
        document.querySelector("#resultScene .level").textContent = `${this.moguraGame.gameStageChallenge.gameStage.level}`;
        document.querySelector("#resultScene .stageName").textContent = `${this.moguraGame.gameStageChallenge.stage.name}`;
        document.querySelector("#resultScene .repeatCount").textContent = `${this.moguraGame.gameStageChallenge.repeatCount}`;
        document.querySelector("#resultScene .totalCount").textContent = `${this.moguraGame.gameStageChallenge.totalCount}`;
        document.querySelector("#resultScene .successCount").textContent = `${this.moguraGame.gameStageChallenge.successCount}`;
        document.querySelector("#resultScene .failCount").textContent = `${this.moguraGame.gameStageChallenge.failCount}`;
        document.querySelector("#resultScene .successRate").textContent = `${this.moguraGame.gameStageChallenge.successRate}`;
        document.querySelector("#resultScene .currentStageOrgasmCount").textContent = `${this.player.currentStageOrgasmCount}`;
        document.querySelector("#resultScene .nextStage").textContent = this.player.currentStageCanClear ? "成功" : "失敗";
        document.querySelector("#resultScene #nextStageButton").style.display = this.player.currentStageCanClear ? "block" : "none";
    }
}
