"use strict";
class Challenges {
    constructor(challenges) {
        this.challenges = challenges;
    }
    static fromData(challenges, stages) {
        return new Challenges(// stageのデータは同じものを使う
        challenges.map((challenge, index) => Challenge.fromData(index + 1, challenge, stages)));
    }
    challenge(count) {
        // 無限に遊べる
        return this.challenges[Math.min(count - 1, this.challenges.length - 1)];
    }
}
/** 挑戦 */
class Challenge {
    constructor(param) {
        this.count = param.count;
        this.stages = param.stages;
    }
    static fromData(count, challenge, stages) {
        return new Challenge(Object.assign(Object.assign({ count }, challenge), { stages: stages.map((stage, index) => new Stage(Object.assign({ level: index + 1 }, stage))) }));
    }
    /**
     * そのレベルのステージ
     * @param level level
     */
    stage(level) {
        return this.stages[level - 1];
    }
    /**
     * そのレベル以下のステージ群
     * @param level level
     */
    stagesUnder(level) {
        return this.stages.slice(0, level);
    }
}
/** ステージ */
class Stage {
    constructor(param) {
        this.hideSpeed = 1.5;
        for (const name of Object.keys(param)) {
            const value = param[name];
            if (value != null)
                this[name] = value;
        }
    }
    /**
     * 敵の出現数に応じた出現スピード
     * @param appearCount 敵の出現数
     */
    appearSpeedFor(appearCount) {
        return Math.max(this.appearSpeed.end, this.appearSpeed.start - this.appearSpeed.step * appearCount);
    }
    /**
     * 敵の出現数に応じた隠れるスピード
     * @param appearCount 敵の出現数
     */
    hideSpeedFor(appearCount) {
        if (typeof this.hideSpeed === "number") {
            return this.appearSpeedFor(appearCount) * 1.5;
        }
        else {
            return Math.max(this.hideSpeed.end, this.hideSpeed.start - this.hideSpeed.step * appearCount);
        }
    }
}
class GameChallenges {
    constructor(challenges) {
        this.gameChallenges = [];
        this.challenges = challenges;
    }
    get currentGameChallenge() { return this.gameChallenges[this.gameChallenges.length - 1]; }
    newGameChallenge() {
        const gameChallenge = new GameChallenge(this, this.gameChallenges.length + 1);
        this.gameChallenges.push(gameChallenge);
        return gameChallenge;
    }
}
class GameChallenge {
    constructor(gameChallenges, count) {
        this.gameStages = [];
        this.gameChallenges = gameChallenges;
        this.count = count;
        this.challenge = this.gameChallenges.challenges.challenge(count);
    }
    get currentGameStage() { return this.gameStages[this.gameStages.length - 1]; }
    newGameStage() {
        const gameStage = new GameStage(this, this.gameStages.length + 1);
        this.gameStages.push(gameStage);
        return gameStage;
    }
}
class GameStage {
    constructor(gameChallenge, level) {
        this.gameStageChallenges = [];
        this.gameChallenge = gameChallenge;
        this.level = level;
        this.stage = this.gameChallenge.challenge.stage(this.level);
        // this.buildBadStates();
    }
    get badStates() { return this.stage.badStates; }
    get currentGameStageChallenge() { return this.gameStageChallenges[this.gameStageChallenges.length - 1]; }
    newGameStageChallenge() {
        const gameStageChallenge = new GameStageChallenge(this, this.gameStageChallenges.length + 1);
        this.gameStageChallenges.push(gameStageChallenge);
        return gameStageChallenge;
    }
}
class GameStageChallenge {
    constructor(gameStage, repeatCount) {
        this.successCount = 0;
        this.appearCount = 0;
        this.failCount = 0;
        this.gameStage = gameStage;
        this.repeatCount = repeatCount;
    }
    get stage() { return this.gameStage.stage; }
    get badStates() { return this.gameStage.badStates; }
    get totalCount() { return this.stage.enemyCount; }
    success() { ++this.successCount; }
    appear() { ++this.appearCount; }
    fail() { ++this.failCount; }
    get passCount() { return this.successCount + this.failCount; }
    get restCount() { return this.totalCount - this.passCount; }
    get restAppearCount() { return this.totalCount - this.appearCount; }
    /** 成功率%(000.0) */
    get successRate() { return Math.round(this.successCount * 1000 / this.passCount) / 10; }
    get currentAppearSpeed() { return this.stage.appearSpeedFor(this.appearCount); }
    get currentHideSpeed() { return this.stage.hideSpeedFor(this.appearCount); }
}
