interface UpSensationInfo {
    sensation: number;
    sensitivity: SensitivityDetail;
}

class Player {
    static sensitiveSpeed(sensitivity: number, allSensitivity: number, sensitiveSpeedBias: number) {
        return PlayerSensitivity.sensitiveSpeed(sensitivity, allSensitivity) * sensitiveSpeedBias / 100;
    }

    static sensationSpeed(sensitivity: number, allSensitivity: number, effectiveRate: number) {
        return PlayerSensitivity.sensationSpeed(sensitivity, allSensitivity) * effectiveRate;
    }

    environment: Environment;
    addMode: "immediate" | "lazy";

    /** 治療回数 */
    repairCount = 0;
    // 比較用
    /** 初期感度 */
    initialSensitivity: PlayerSensitivity;
    /** 前ステージ終了時感度 */
    previousStageSensitivity: PlayerSensitivity;
    /** 前挑戦開始時感度 */
    previousChallengeSensitivity: PlayerSensitivity;
    /** 初期バッドステート */
    initialBadStates: PlayerBadStates;
    /** 前ステージ終了時バッドステート */
    previousStageBadStates: PlayerBadStates;
    /** 前挑戦開始時バッドステート */
    previousChallengeBadStates: PlayerBadStates;

    /** 通常ステータス */
    normalStatus = new PlayerNormalStatus();
    /** ベース感度 */
    baseSensitivity = new PlayerSensitivity();
    /** ベース性的快感上限 */
    baseSensationLimit = 1000;
    /** 性的快感 */
    sensation = 0;
    /** バッドステートの状況 */
    badStates: PlayerBadStates;
    /** 絶頂回数 */
    orgasmCount = 0;
    /** このステージでの絶頂回数 */
    currentStageOrgasmCount = 0;
    /** 失敗となる絶頂回数 */
    orgasmLimit = 10;

    /** 抵抗値(この%分だけ効果を削る) */
    resist = 0;
    /** 抵抗値(%)減少ステップ */
    resistStep = 0;
    /** 抵抗値最小値 */
    resistMin = 0;
    /** 感度上昇速度バイアス(%) */
    sensitiveSpeedBias = 100;

    constructor(
        environment: Environment,
        addMode: "immediate" | "lazy" = "immediate",
        badStates: PlayerBadStateMap = {},
        badStateCounts: PlayerBadStateCountMap = {},
        activeBadStateCounts: PlayerBadStateCountMap = {},
    ) {
        this.environment = environment;
        this.addMode = addMode;
        this.badStates = new PlayerBadStates(this, badStates, badStateCounts, activeBadStateCounts);
        this.previousChallengeSensitivity = this.previousStageSensitivity = this.baseSensitivity;
        this.initialSensitivity = this.baseSensitivity.copy();
        this.initialBadStates = this.previousChallengeBadStates = this.previousStageBadStates = this.badStates;
    }

    get effectiveBadStates() { return this.addMode === "immediate" ? this.badStates : this.previousStageBadStates; }
    /** 遅延時間・停止時間・持続時間・快感上昇速度にきく */
    get effectiveRate() { return (100 - this.resist) / 100; }
    get sensitivity() { return this.badStates.sensitivityBias.sensitivity(this.baseSensitivity); }
    get sensationLimit() { return this.baseSensationLimit + Math.exp(1 - this.sensitivity.all / 10000) / Math.exp(1); }
    get canOrgasm() { return this.sensation >= this.sensationLimit; }
    get currentStageCanClear() { return this.currentStageOrgasmCount < this.orgasmLimit; }

    get delay() { return (this.sensitivity.delay + this.badStates.delay) * this.effectiveRate; }

    /*
    sensitiveSpeed(part: SensitivePart) {
        return this.sensitivity.sensitiveSpeed(part) * this.sensitiveSpeedBias / 100;
    }

    sensationSpeed(part: SensitivePart) {
        return this.sensitivity.sensationSpeed(part) * this.effectiveRate;
    }
    */

    newChallenge() {
        this.previousChallengeSensitivity = this.sensitivity.copy();
        this.previousChallengeBadStates = this.badStates;
    }

    newStageChallenge() {
        this.previousStageSensitivity = this.sensitivity.copy();
        this.previousStageBadStates = this.badStates;
        this.currentStageOrgasmCount = 0;
    }

    upSensation(parts: SensitivePart[], value: number) {
        const all = this.sensitivity.all;
        const partUpSensitivity: SensitivityDetail = {};
        let upSensation = 0;
        for (const part of parts) { // allの計算をキャッシュして同じ時点で計算
            const sensitivity = this.sensitivity[part];
            partUpSensitivity[part] = Player.sensitiveSpeed(sensitivity, all, this.sensitiveSpeedBias) * value;
            this.baseSensitivity[part] += partUpSensitivity[part];
            upSensation += Player.sensationSpeed(sensitivity, all, this.effectiveRate) * value;
        }
        this.sensation += upSensation;

        return { sensitivity: partUpSensitivity, sensation: upSensation } as UpSensationInfo;
    }

    toOrgasmCount() {
        const count = Math.floor(this.sensation / this.sensationLimit);
        return count;
    }

    orgasm(count: number) {
        this.orgasmCount += count;
        this.currentStageOrgasmCount += count;
        // 連続絶頂体質なら快感を残す
        const 連続絶頂体質 = this.effectiveBadStates.find("連続絶頂体質");
        this.sensation = 連続絶頂体質 ? 連続絶頂体質.progress * 20 / 100 * this.sensationLimit: 0;
    }

    upBadState(setName: BadStateSetName, upProgress = 1) {
        const badStates = this.badStates.up(setName, upProgress);
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    downBadState(setName: BadStateSetName, downProgress: number | boolean = 1) {
        const badStates = this.badStates.down(setName, downProgress);
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    downBadStatesOnBattleEnd() {
        const badStates = this.badStates.downBattleEnd();
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    downBadStatesOnRetry() {
        const badStates = this.badStates.downRetry();
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    /** ステージ経過効果 */
    passStage() {
        this.resist -= this.resistStep;
        if (this.resist < this.resistMin) this.resist = this.resistMin;
    }
}

type SensitivePart = keyof SensitivityDetail;
type SensitivePartWithAll = SensitivePart | "all";

/** 感度 */
class PlayerSensitivity implements SensitivityDetail {
    static parts: SensitivePart[] = [
        "skin", "rightNipple", "leftNipple", "bust", "urethra", "clitoris", "vagina", "womb", "anal", "hip",
    ];

    static partsJa = [
        "肌", "右乳首", "左乳首", "乳房", "尿道", "陰核", "膣", "子宮", "尻穴", "尻肉",
    ];

    static allPartJa = "全部";
    static allPartJaAlt = "全部位";

    static ja(part: SensitivePartWithAll, alt = false) {
        if (part === "all") return alt ? this.allPartJaAlt : this.allPartJa;
        return this.partsJa[this.parts.indexOf(part)];
    }

    static sensitiveSpeed(sensitivity: number, allSensitivity: number) {
        return 1 + sensitivity ** 0.7 / 60 * Math.log10(allSensitivity); // TODO: 調整
    }

    static sensationSpeed(sensitivity: number, allSensitivity: number) {
        return sensitivity ** 0.7 / 8 * Math.log10(allSensitivity); // TODO: 調整
    }

    skin = 15;
    rightNipple = 70;
    leftNipple = 70;
    bust = 40;
    urethra = 10;
    clitoris = 100;
    vagina = 40;
    womb = 8;
    anal = 20;
    hip = 20;

    constructor(params = {} as SensitivityDetail) {
        for (const name of Object.keys(params) as SensitivePart[]) {
            const value = params[name];
            if (value != null) this[name] = value;
        }
    }

    get all(): number {
        return PlayerSensitivity.parts.reduce((sum, part) => this[part] + sum, 0);
    }

    static initialAll = new PlayerSensitivity().all;

    get delay() {
        return ((this.all - PlayerSensitivity.initialAll) / 3) ** 0.65 / 1.2; // TODO:
    }

    copy() {
        const params: SensitivityDetail = {};
        for (const name of PlayerSensitivity.parts) {
            params[name] = this[name];
        }
        return new PlayerSensitivity(params);
    }

    /*
    sensitiveSpeed(part: SensitivePart) {
        return PlayerSensitivity.sensitiveSpeed(this[part], this.all);
    }

    sensationSpeed(part: SensitivePart) {
        return PlayerSensitivity.sensationSpeed(this[part], this.all);
    }
    */
}

/** 感度バイアス */
class PlayerSensitivityBias implements SensitivityDetail {
    skin = 100;
    rightNipple = 100;
    leftNipple = 100;
    bust = 100;
    urethra = 100;
    clitoris = 100;
    vagina = 100;
    portio = 100;
    womb = 100;
    anal = 100;
    hip = 100;

    sensitivity(playerSensitivity: PlayerSensitivity) {
        return new PlayerSensitivity(
            PlayerSensitivity.parts.reduce((params, part) => {
                params[part] = playerSensitivity[part] * this[part] / 100;
                return params;
            }, {} as SensitivityDetail),
        )
    }
}

type PlayerBadStateMap = {
    [setName in BadStateSetName]?: BadState;
}

type PlayerBadStateCountMap = {
    [setName in BadStateSetName]?: number;
}

/** 現在有効なバッドステート immutable */
class PlayerBadStates {
    player: Player;
    badStates: PlayerBadStateMap;
    /** 累計起動回数 */
    badStateCounts: PlayerBadStateCountMap;
    /** 付与以降起動回数 */
    activeBadStateCounts: PlayerBadStateCountMap;
    /** 感度バイアス */
    sensitivityBias: PlayerSensitivityBias;
    /** バッドステートセット名 */
    setNames: BadStateSetName[];
    /** 順序通りのバッドステート */
    sortedBadStates: BadState[];
    /** バッドステート由来の追加遅延 */
    delay: number;
    /** 危険表示 */
    dangers: string[];

    constructor(player: Player, badStates: PlayerBadStateMap, badStateCounts: PlayerBadStateCountMap, activeBadStateCounts: PlayerBadStateCountMap) {
        this.player = player;
        this.badStates = badStates;
        this.badStateCounts = badStateCounts;
        this.activeBadStateCounts = activeBadStateCounts;
        this.sensitivityBias = this.makeSensitivityBias();
        this.setNames = (Object.keys(this.badStates) as BadStateSetName[]).sort((a, b) => this.badStates[a]!.setIndex - this.badStates[b]!.setIndex);
        this.sortedBadStates = this.setNames.map((setName) => this.badStates[setName] as BadState);
        this.delay = this.sortedBadStates.reduce((delay, badState) => delay + (badState.delay || 0), 0);
        this.dangers = Array.from(new Set(this.sortedBadStates.reduce((dangers, badState) => dangers.concat(badState.danger || []), [] as string[])));
    }

    find(setName: BadStateSetName) {
        return this.badStates[setName];
    }

    /**
     * バッドステート起動
     *
     * 付与など状態が変わったら値を返す
     * @param setName バッドステートセット名
     * @param upProgress 起動する段階
     */
    up(setName: BadStateSetName, upProgress = 1) {
        const currentBadState = this.badStates[setName];
        const currentProgress = currentBadState ? currentBadState.progress : 0;
        const badStateSet = this.player.environment.badStates.findSet(setName);
        let nextProgress = currentProgress;
        let nextBadState: BadState | undefined = undefined;
        const org = upProgress;
        let finishSearch = false;
        while (upProgress) {
            ++nextProgress;
            const nextBadStateCandidate = badStateSet.byProgress(nextProgress);
            if (!nextBadStateCandidate) break;
            if (nextBadStateCandidate.countActivate) { // 累計起動回数判定
                for (const condition of nextBadStateCandidate.countActivate) {
                    if (condition.count > (this.badStateCounts[condition.name] || 0)) {
                        finishSearch = true;
                        break;
                    }
                }
            }
            if (nextBadStateCandidate.activeCountActivate) { // 付与以降起動回数判定
                for (const condition of nextBadStateCandidate.activeCountActivate) {
                    if (condition.count > (this.activeBadStateCounts[condition.name] || 0)) {
                        finishSearch = true;
                        break;
                    }
                }
            }
            if (finishSearch) break;
            nextBadState = nextBadStateCandidate;
            --upProgress;
        }
        if (nextBadState && nextBadState.countActivate) console.warn(nextBadState, this.badStateCounts);
        if (!nextBadState && (!currentBadState || !currentBadState.count)) return; // 次レベルがなくカウントもなければ変化なし
        const nextBadStates = nextBadState ? {...this.badStates, [setName]: nextBadState} : this.badStates;
        const addCount = nextBadState ? nextBadState.count || 0 : currentBadState ? currentBadState.count || 0 : 0;
        const nextBadStateCounts = addCount ? {...this.badStateCounts, [setName]: (this.badStateCounts[setName] || 0) + addCount} : this.badStateCounts;
        const nextActiveBadStateCounts = addCount ? {...this.activeBadStateCounts, [setName]: (this.activeBadStateCounts[setName] || 0) + addCount} : this.activeBadStateCounts;
        return new PlayerBadStates(this.player, nextBadStates, nextBadStateCounts, nextActiveBadStateCounts);
    }

    /**
     * バッドステート解消
     *
     * 状態が変わったら値を返す
     * @param setName バッドステートセット名
     * @param downProgress 解消する段階 trueなら全部
     */
    down(setName: BadStateSetName, downProgress: number | boolean = 1) {
        const currentBadState = this.find(setName);
        if (!currentBadState) return;
        const nextProgress = downProgress === true ? 0 : currentBadState.progress - (downProgress || 0);
        if (nextProgress === currentBadState.progress) return;
        if (nextProgress > 0) {
            const nextBadState = this.player.environment.badStates.findSet(setName).byProgress(nextProgress) as BadState;
            return new PlayerBadStates(this.player, {...this.badStates, [setName]: nextBadState}, this.badStateCounts, this.activeBadStateCounts);
        } else {
            const nextBadStates = {...this.badStates};
            delete nextBadStates[setName];
            const nextActiveBadStateCounts = {...this.activeBadStateCounts};
            delete nextActiveBadStateCounts[setName];
            return new PlayerBadStates(this.player, nextBadStates, this.badStateCounts, nextActiveBadStateCounts);
        }
    }

    /** バトル終了時進行度回復 */
    downBattleEnd() {
        const nextBadStates = {...this.badStates};
        const nextActiveBadStateCounts = {...this.activeBadStateCounts};
        let modified = false;
        for (const setName of Object.keys(this.badStates) as BadStateSetName[]) {
            const badState = this.badStates[setName] as BadState;
            if (badState.stageDown) {
                const nextProgress = badState.stageDown === true ? 0 : badState.progress - badState.stageDown;
                if (nextProgress > 0) {
                    nextBadStates[setName] = this.player.environment.badStates.findSet(setName).byProgress(nextProgress) as BadState;
                } else {
                    delete nextBadStates[setName];
                    delete nextActiveBadStateCounts[setName];
                }
                modified = true;
            }
        }
        if (modified) return new PlayerBadStates(this.player, nextBadStates, this.badStateCounts, nextActiveBadStateCounts);
    }

    /** 撤退時進行度回復 */
    downRetry() {
        const nextBadStates = {...this.badStates};
        const nextActiveBadStateCounts = {...this.activeBadStateCounts};
        let modified = false;
        for (const setName of Object.keys(this.badStates) as BadStateSetName[]) {
            const badState = this.badStates[setName] as BadState;
            if (badState.retryDown) {
                const nextProgress = badState.retryDown === true ? 0 : badState.progress - badState.retryDown;
                if (nextProgress > 0) {
                    nextBadStates[setName] = this.player.environment.badStates.findSet(setName).byProgress(nextProgress) as BadState;
                } else {
                    delete nextBadStates[setName];
                    delete nextActiveBadStateCounts[setName];
                }
                modified = true;
            }
        }
        if (modified) return new PlayerBadStates(this.player, nextBadStates, this.badStateCounts, nextActiveBadStateCounts);
    }

    private makeSensitivityBias() {
        const playerSensitivityBias = new PlayerSensitivityBias();
        for (const name of Object.keys(this.badStates)) {
            const sensitivity = this.badStates[name].sensitivity;
            if (typeof sensitivity === "number") {
                if (sensitivity !== 0) {
                    for (const part of PlayerSensitivity.parts) {
                        playerSensitivityBias[part] += sensitivity;
                    }
                }
            } else {
                for (const part of Object.keys(sensitivity) as SensitivePart[]) {
                    const value = sensitivity[part];
                    if (value) playerSensitivityBias[part] += value;
                }
            }
        }
        return playerSensitivityBias;
    }
}

class PlayerBadStateDiff {
    before: PlayerBadStates;
    after: PlayerBadStates;
    /** バッドステートセット名 */
    setNames: string[];
    /** 順序通りのバッドステート差分 */
    sortedBadStateDiffEntries: PlayerBadStateDiffEntry[];

    constructor(before: PlayerBadStates, after: PlayerBadStates) {
        this.before = before;
        this.after = after;

        const uniqueSetNames = {};
        for (const setName of this.before.setNames.concat(this.after.setNames)) {
            uniqueSetNames[setName] = true;
        }
        this.setNames = Object.keys(uniqueSetNames).sort((a: BadStateSetName, b: BadStateSetName) =>
            (this.before.badStates[a] || this.after.badStates[a])!.setIndex - (this.before.badStates[b] || this.after.badStates[b])!.setIndex,
        );
        this.sortedBadStateDiffEntries = this.setNames.map((setName) => new PlayerBadStateDiffEntry(this.before.badStates[setName], this.after.badStates[setName]));
    }
}

class PlayerBadStateDiffEntry {
    before?: BadState;
    after?: BadState;

    constructor(before: BadState | undefined, after: BadState | undefined) {
        this.before = before;
        this.after = after;
    }

    get type() {
        if (!this.before) {
            return "add";
        } else if (!this.after) {
            return "remove";
        } else if (this.before.progress < this.after.progress) {
            return "up";
        } else if (this.before.progress > this.after.progress) {
            return "down";
        } else {
            return "same";
        }
    }

    get first() {
        return (this.before || this.after) as BadState;
    }
}

class PlayerNormalStatus {
    static names = ["lv", "maxHp", "maxMp", "atk", "def", "mag", "spd"];
    static namesJa = ["Lv.", "最大HP", "最大MP", "攻撃力", "防御力", "魔法力", "素早さ"];
    lv = 120;
    maxHp = 30000;
    maxMp = 2500;
    atk = 800;
    def = 400;
    mag = 1200;
    spd = 500;
}
