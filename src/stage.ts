/** 挑戦データ */
interface ChallengeData {
}

interface SpeedSetting {
    /** 初期スピード */
    start: number;
    /** 終端スピード */
    end: number;
    /** スピード上昇 */
    step: number;
}

type SpeedSettingWithRelative = number | SpeedSetting;

/** ステージデータ */
interface StageData {
    /** ステージ名 */
    name: string;
    /** 敵数 */
    enemyCount: number;
    /** 出現スピード */
    appearSpeed: SpeedSetting;
    /** 隠れるスピード */
    hideSpeed?: SpeedSettingWithRelative;
    /** このステージで出現するバッドステート群 */
    badStates: StageBadStates;
}

/** バッドステート名と有効な最高進行度 */
interface StageBadState {
    /** 最大進行度 (1オリジン) */
    maxProgress?: number;
    /** デフォルト100 */
    weight?: number;
    /** 隠れるスピード */
    hideSpeed?: number;
}

type StageBadStates = {[P in BadStateSetName]?: StageBadState};

class Challenges {
    static fromData(challenges: ChallengeData[], stages: StageData[]) {
        return new Challenges( // stageのデータは同じものを使う
            challenges.map((challenge, index) => Challenge.fromData(index + 1, challenge, stages)),
        );
    }

    challenges: Challenge[];

    constructor(challenges: Challenge[]) {
        this.challenges = challenges;
    }

    challenge(count: number) {
        // 無限に遊べる
        return this.challenges[Math.min(count - 1, this.challenges.length - 1)];
    }
}

/** 挑戦 */
class Challenge implements ChallengeData {
    static fromData(count: number, challenge: ChallengeData, stages: StageData[]) {
        return new Challenge({
            count,
            ...challenge,
            stages: stages.map((stage, index) => new Stage({level: index + 1, ...stage})),
        });
    }

    count: number;
    stages: Stage[];

    constructor(param: ChallengeData & {count: number, stages: Stage[]}) {
        this.count = param.count;
        this.stages = param.stages;
    }

    /**
     * そのレベルのステージ
     * @param level level
     */
    stage(level: number) {
        return this.stages[level - 1];
    }

    /**
     * そのレベル以下のステージ群
     * @param level level
     */
    stagesUnder(level: number) {
        return this.stages.slice(0, level);
    }
}

/** ステージ */
class Stage implements StageData {
    level!: number;
    name!: string;
    enemyCount!: number;
    appearSpeed!: SpeedSetting;
    hideSpeed: SpeedSettingWithRelative = 1.5;
    badStates!: StageBadStates;

    constructor(param: StageData & {level: number}) {
        for (const name of Object.keys(param) as Array<keyof StageData | "level">) {
            const value = param[name];
            if (value != null) (this[name] as this[typeof name]) = value as this[typeof name];
        }
    }

    /**
     * 敵の出現数に応じた出現スピード
     * @param appearCount 敵の出現数
     */
    appearSpeedFor(appearCount: number) {
        return Math.max(this.appearSpeed.end, this.appearSpeed.start - this.appearSpeed.step * appearCount);
    }

    /**
     * 敵の出現数に応じた隠れるスピード
     * @param appearCount 敵の出現数
     */
    hideSpeedFor(appearCount: number) {
        if (typeof this.hideSpeed === "number") {
            return this.appearSpeedFor(appearCount) * 1.5;
        } else {
            return Math.max(this.hideSpeed.end, this.hideSpeed.start - this.hideSpeed.step * appearCount);
        }
    }
}

class GameChallenges {
    get currentGameChallenge() { return this.gameChallenges[this.gameChallenges.length - 1]; }
    gameChallenges: GameChallenge[] = [];
    challenges: Challenges;

    constructor(challenges: Challenges) {
        this.challenges = challenges;
    }

    newGameChallenge() {
        const gameChallenge = new GameChallenge(this, this.gameChallenges.length + 1);
        this.gameChallenges.push(gameChallenge);
        return gameChallenge;
    }
}

class GameChallenge {
    gameChallenges: GameChallenges;
    count: number;
    challenge: Challenge;
    get currentGameStage() { return this.gameStages[this.gameStages.length - 1]; }
    gameStages: GameStage[] = [];

    constructor(gameChallenges: GameChallenges, count: number) {
        this.gameChallenges = gameChallenges;
        this.count = count;
        this.challenge = this.gameChallenges.challenges.challenge(count);
    }

    newGameStage() {
        const gameStage = new GameStage(this, this.gameStages.length + 1);
        this.gameStages.push(gameStage);
        return gameStage;
    }
}

class GameStage {
    gameChallenge: GameChallenge;
    level: number;
    stage: Stage;
    get badStates() { return this.stage.badStates; }
    get currentGameStageChallenge() { return this.gameStageChallenges[this.gameStageChallenges.length - 1]; }
    gameStageChallenges: GameStageChallenge[] = [];

    constructor(gameChallenge: GameChallenge, level: number) {
        this.gameChallenge = gameChallenge;
        this.level = level;
        this.stage = this.gameChallenge.challenge.stage(this.level);
        // this.buildBadStates();
    }

    newGameStageChallenge() {
        const gameStageChallenge = new GameStageChallenge(this, this.gameStageChallenges.length + 1);
        this.gameStageChallenges.push(gameStageChallenge);
        return gameStageChallenge;
    }

    // データにも関数化とか使えるのでデフォルトはそんなに気を利かせない方が良い
    /*
    // これまでのレベルのステージのバッドステートレベルを累積
    private buildBadStates() {
        const stages = this.gameChallenge.challenge.stagesUnder(this.level);
        const badStates: StageBadStates = {};
        for (const stage of stages) {
            for (const name of Object.keys(stage.badStates)) {
                const stageBadState = stage.badStates[name];
                if (badStates[name] == null) {
                    badStates[name] = stageBadState;
                } else if (badStates[name].maxProgress < stageBadState.maxProgress) {
                    badStates[name] = stageBadState;
                }
            }
        }
        this.badStates = badStates;
    }
    */
}

class GameStageChallenge {
    gameStage: GameStage;
    repeatCount: number;

    get stage() { return this.gameStage.stage; }
    get badStates() { return this.gameStage.badStates; }
    get totalCount() { return this.stage.enemyCount; }
    successCount = 0;
    appearCount = 0;
    failCount = 0;

    constructor(gameStage: GameStage, repeatCount: number) {
        this.gameStage = gameStage;
        this.repeatCount = repeatCount;
    }

    success() { ++this.successCount; }
    appear() { ++this.appearCount; }
    fail() { ++this.failCount; }

    get passCount() { return this.successCount + this.failCount; }
    get restCount() { return this.totalCount - this.passCount; }
    get restAppearCount() { return this.totalCount - this.appearCount; }
    /** 成功率%(000.0) */
    get successRate() { return Math.round(this.successCount * 1000 / this.passCount) / 10 }

    get currentAppearSpeed() { return this.stage.appearSpeedFor(this.appearCount); }
    get currentHideSpeed() { return this.stage.hideSpeedFor(this.appearCount); }
}
