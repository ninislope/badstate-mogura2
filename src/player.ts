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
    /** ドーピング回数 */
    dopeCount = 0;
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
    /** 行動ログ */
    logs: PlayerLogs;

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
    orgasmLimit = 1;
    /** 挑戦回数 */
    challengeCount = 0;
    /** 敗北回数 */
    failedCount = 0;

    /** 抵抗値(この%分だけ効果を削る) */
    resist = 0;
    /** 抵抗値(%)減少ステップ */
    resistStep = 0;
    /** 抵抗値最小値 */
    resistMin = 0;
    /** 感度上昇速度バイアス(%) */
    sensitiveSpeedBias = 100;
    /** 精神加速(%) */
    speedBoost = 100;
    /** 精神加速鈍化ステップ(%) */
    speedBoostStep = 0;
    /** 精神加速最小値(%) */
    speedBoostMin = 100;
    /** 我慢値(%) */
    patience = 100;
    /** 我慢値減少ステップ(%) */
    patienceStep = 0;
    /** 我慢最小値(%) */
    patienceMin = 100;

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
        this.logs = new PlayerLogs();
    }

    get effectiveBadStates() { return this.addMode === "immediate" ? this.badStates : this.previousStageBadStates; }
    /** 遅延時間・停止時間・持続時間・快感上昇速度にきく */
    get effectiveRate() { return (100 - this.resist) / 100; }
    get sensitivity() { return this.badStates.sensitivityBias.sensitivity(this.baseSensitivity, this.patience); }
    get sensationLimit() { return this.baseSensationLimit + Math.exp(1 - this.sensitivity.all / 10000) / Math.exp(1); }
    get canOrgasm() { return this.sensation >= this.sensationLimit; }
    get currentStageCanClear() { return this.currentStageOrgasmCount < this.orgasmLimit; }
    get canRepair() { return this.repairCount < this.challengeCount; }
    get canDope() { return this.dopeCount < this.failedCount; }

    get delay() { return (this.sensitivity.delay + this.badStates.delay) * this.effectiveRate; }

    /*
    sensitiveSpeed(part: SensitivePart) {
        return this.sensitivity.sensitiveSpeed(part) * this.sensitiveSpeedBias / 100;
    }

    sensationSpeed(part: SensitivePart) {
        return this.sensitivity.sensationSpeed(part) * this.effectiveRate;
    }
    */

    newChallenge(count: number) {
        this.previousChallengeSensitivity = this.sensitivity.copy();
        this.previousChallengeBadStates = this.badStates;
        ++this.challengeCount;
        this.logs.newChallenge(count);
    }

    newStageChallenge(level: number, repeatCount: number) {
        this.previousStageSensitivity = this.sensitivity.copy();
        this.previousStageBadStates = this.badStates;
        this.currentStageOrgasmCount = 0;
        this.logs.newStageChallenge(level, repeatCount);
    }

    upSensation(parts: SensitivePart[], value: number, badState: BadState) {
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

        this.logs.upSensation(parts, value, upSensation, badState);

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
        this.logs.orgasm(count, 連続絶頂体質 ? 連続絶頂体質.progress * 20 : 0);
    }

    /**
     *
     * @param setName
     * @param upProgress
     * @param triggeredBy 誘発由来なら原因のバッドステートか、原因を明示しない場合はtrue
     */
    upBadState(setName: BadStateSetName, triggeredBy?: BadState | boolean, upProgress = 1) {
        const previousBadState = this.badStates.find(setName);
        const badStates = this.badStates.up(setName, upProgress);
        this.logs.upBadState(setName, Boolean(badStates), previousBadState, badStates ? badStates.find(setName) : undefined, triggeredBy);
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    downBadState(setName: BadStateSetName, downProgress: number | boolean = 1) {
        const previousBadState = this.badStates.find(setName);
        const badStates = this.badStates.down(setName, downProgress);
        this.logs.downBadState(setName, Boolean(badStates), previousBadState, badStates ? badStates.find(setName) : undefined);
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    downBadStatesOnBattleEnd() {
        const badStates = this.badStates.downBattleEnd();
        this.logs.downBadStatesOnBattleEnd(this.badStates, badStates);
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    repair(repair: Repair) {
        ++this.repairCount;
        this.resist = repair.resist;
        this.resistStep = repair.resistStep;
        this.resistMin = repair.resistMin;
        this.sensitiveSpeedBias = repair.sensitiveSpeedBias;
        this.logs.repair(this.repairCount, this.resist, this.sensitiveSpeedBias);
    }

    dope(dope: Dope) {
        ++this.dopeCount;
        this.speedBoost = dope.speedBoost;
        this.speedBoostStep = dope.speedBoostStep;
        this.speedBoostMin = dope.speedBoostMin;
        this.patience = dope.patience;
        this.patienceStep = dope.patienceStep;
        this.patienceMin = dope.patienceMin;
        this.logs.dope(this.dopeCount, this.speedBoost, this.patience);
    }

    downBadStatesOnRetry() {
        const badStates = this.badStates.downRetry();
        this.logs.downBadStatesOnRetry(this.badStates, badStates);
        if (badStates) this.badStates = badStates;
        return badStates;
    }

    endStage(successRate: number) {
        if (!this.currentStageCanClear) ++this.failedCount;
        this.logs.endStage(this.currentStageCanClear, this.currentStageOrgasmCount, successRate);
    }

    /** ステージ経過効果 */
    passStage() {
        const previousResist = this.resist;
        this.resist -= this.resistStep;
        if (this.resist < this.resistMin) this.resist = this.resistMin;
        const previousSpeedBoost = this.speedBoost;
        this.speedBoost -= this.speedBoostStep;
        if (this.speedBoost < this.speedBoostMin) this.speedBoost = this.speedBoostMin;
        const previousAnestethia = this.patience;
        this.patience -= this.patienceStep;
        if (this.patience < this.patienceMin) this.patience = this.patienceMin;
        this.logs.passStage(
            previousResist, this.resist, this.resistStep, this.resistMin,
            previousSpeedBoost, this.speedBoost, this.speedBoostStep, this.speedBoostMin,
            previousAnestethia, this.patience, this.patienceStep, this.patienceMin,
        );
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

    sensitivity(playerSensitivity: PlayerSensitivity, patience: number) {
        return new PlayerSensitivity(
            PlayerSensitivity.parts.reduce((params, part) => {
                params[part] = playerSensitivity[part] * this[part] / 100 / patience * 100;
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

function br() {
    return document.createElement("br");
}

function strong(text: string) {
    const node = document.createElement("strong");
    node.textContent = text;
    return node;
}

function 付与() {
    const node = strong("付与");
    node.classList.add("add");
    return node;
}

function 悪化() {
    const node = strong("悪化");
    node.classList.add("progress");
    return node;
}

function text(text: string) {
    return document.createTextNode(text);
}

class PlayerLogs extends Array<HTMLLIElement> {
    newChallenge(count: number) {
        this.unshift(this.createElement("newChallenge", [strong(`${count}回目`), text(`の挑戦開始`)]));
    }

    newStageChallenge(level: number, repeatCount: number) {
        this.unshift(this.createElement("newStageChallenge", [
            strong(`ステージ${level}`), text(`: `),
            ...(repeatCount === 1 ? [] : [strong(`${repeatCount}`), text(`回目の`)]),
            text(`挑戦開始`),
        ]));
    }

    upSensation(parts: SensitivePart[], value: number, upSensation: number, badState: BadState) {
        const partsJa =
            parts.length === PlayerSensitivity.parts.length ?
            PlayerSensitivity.ja("all", true) :
            parts.map(part => PlayerSensitivity.ja(part)).join(",");
        this.unshift(this.createElement("upSensation", [
            strong(`[${badState.displayName}]`), text(" "),
            strong(partsJa), text("に"),
            ...(value === 1 ? [] : [value >= 1 ? strong(`${value}倍`) : text(`${value}倍`), text("の")]),
            text("快感! "), strong(`+${float2(upSensation)}`),
        ]));
    }

    orgasm(count: number, restPercent: number) {
        const base = [strong(`${count === 1 ? "" : `${count}回`}絶頂`), text(`してしまった!`)];
        const rest = restPercent === 0 ? [] : [br(), strong("連続絶頂体質"), text(`により`), strong(`快感が${restPercent}%残ってしまう!`)];
        this.unshift(this.createElement("orgasmLog", base.concat(rest)));
    }

    upBadState(setName: BadStateSetName, changed: boolean, previousBadState?: BadState, nextBadState?: BadState, triggeredBy?: BadState | boolean) {
        if (changed && nextBadState) { // count変わったとかでもnextBadStateは返ってくる
            const reason =
                triggeredBy === true ?
                [] :
                triggeredBy ?
                [strong(`[${triggeredBy.displayName}]`), text(`により`)] :
                [strong(`[${setName}]`), text(`攻撃で`)];
            if (nextBadState.onceLog) {
                this.unshift(this.createElement("upBadState", [
                    ...reason,
                    strong(`[${nextBadState.displayName}]${nextBadState.onceLog}しまった!`),
                ]));
            } else {
                if (previousBadState) {
                    if (previousBadState.progress === nextBadState.progress) return;
                    this.unshift(this.createElement("upBadState", [
                        ...reason,
                        strong(`[${previousBadState.displayName}]`), text(`が`),
                        strong(`[${nextBadState.displayName}]に`), 悪化(), text(`してしまった!`),
                    ]));
                } else {
                    this.unshift(this.createElement("upBadState", [
                        ...reason,
                        strong(`[${nextBadState.displayName}]が`), 付与(), text(`されてしまった!`),
                    ]));
                }
            }
        } else if (!triggeredBy) {
            this.unshift(this.createElement("upBadState", [
                strong(`[${setName}]`), text(`攻撃をうけてしまった!`),
            ]));
        }
    }

    downBadState(setName: BadStateSetName, changed: boolean, previousBadState?: BadState, nextBadState?: BadState) {
        if (!changed || previousBadState!.onceLog) return;
        if (nextBadState) {
            const progressDiff = previousBadState!.progress - nextBadState.progress;
            if (!progressDiff) return;
            this.unshift(this.createElement("downBadState", [
                strong(`[${previousBadState!.displayName}]`), text("→"), strong(`[${nextBadState.displayName}]`),
                text(` ${progressDiff}段階軽減`),
            ]));
        } else {
            this.unshift(this.createElement("downBadState", [
                strong(`[${previousBadState!.displayName}]が解消`), text(`した`),
            ]));
        }
    }

    downBadStatesOnBattleEnd(previousBadStates: PlayerBadStates, currentBadStates?: PlayerBadStates) {
        if (!currentBadStates) return;
        const summary = this.badStateDiffSummary(previousBadStates, currentBadStates);
        if (!summary) return;
        this.unshift(this.createElement("downBadStatesOnBattleEnd", [
            text("ステージ終了による軽減・解消:"), br(),
            ...summary,
        ]));
    }

    repair(repairCount: number, resist: number, sensitiveSpeedBias: number) {
        this.unshift(this.createElement("repair", [
            text(`${repairCount}回目の治療をうけたことで`),
            text(`抵抗値が`), strong(`${resist}%`),
            ...(sensitiveSpeedBias === 100 ? [] : [text(` 感度上昇速度が`), strong(`${float2(sensitiveSpeedBias / 100)}倍`)]),
            text(`に`),
        ]));
    }

    dope(dopeCount: number, speedBoost: number, patience: number) {
        this.unshift(this.createElement("dope", [
            text(`${dopeCount}回目のドーピングで`),
            text(`精神加速が`), strong(`${speedBoost}%`),
            text(` 我慢値が`), strong(`${patience}%`),
            text(`に`),
        ]));
    }

    downBadStatesOnRetry(previousBadStates: PlayerBadStates, currentBadStates?: PlayerBadStates) {
        if (!currentBadStates) return;
        const summary = this.badStateDiffSummary(previousBadStates, currentBadStates);
        if (!summary) return;
        this.unshift(this.createElement("downBadStatesOnRetry", [
            text("治療による軽減・解消:"), br(),
            ...summary,
        ]));
    }

    private badStateDiffSummary(previousBadStates: PlayerBadStates, currentBadStates?: PlayerBadStates) {
        if (!currentBadStates) return [];
        const str: Array<HTMLElement | Text> = [];
        const diff = new PlayerBadStateDiff(previousBadStates, currentBadStates);
        for (const entry of diff.sortedBadStateDiffEntries) {
            if (entry.type === "down") {
                const progressDiff = entry.before!.progress - entry.after!.progress;
                str.push(strong(`・[${entry.before!.displayName}]`), text("→"), strong(`[${entry.after!.displayName}]`), text(` ${progressDiff}段階軽減`), br());
            } else if (entry.type === "remove") {
                str.push(strong(`・[${entry.before!.displayName}]が解消`), br());
            }
        }
        return str;
    }

    passStage(
        previousResist: number, resist: number, resistStep: number, resistMin: number,
        previousSpeedBoost: number, speedBoost: number, speedBoostStep: number, speedBoostMin: number,
        previousPatience: number, patience: number, patienceStep: number, patienceMin: number,
    ) {
        if (!resistStep && !speedBoostStep && !patienceStep) return;
        const str: Array<HTMLElement | Text> = [text(`ステージ経過で`)];
        const resistDiff = previousResist - resist;
        if (resistDiff) {
            const isMin = resist === resistMin;
            str.push(
                br(),
                text(`抵抗値が${float2(resistDiff)}%減り`),
                strong(`${float2(resist)}%`), text(`に`),
                isMin ? strong("(下限)") : text(""),
            );
        } else {
            str.push(
                br(),
                strong(`抵抗値減少は下限に達しています`),
            );
        }
        const speedBoostDiff = previousSpeedBoost - speedBoost;
        if (speedBoostDiff) {
            const isMin = speedBoost === speedBoostMin;
            str.push(
                br(),
                text(`精神加速が${float2(speedBoostDiff)}%鈍化し`),
                strong(`${float2(speedBoost)}%`), text(`に`),
                isMin ? strong("(下限)") : text(""),
            );
        } else {
            str.push(
                br(),
                strong(`精神加速鈍化は下限に達しています`),
            );
        }
        const patienceDiff = previousPatience - patience;
        if (patienceDiff) {
            const isMin = patience === patienceMin;
            str.push(
                br(),
                text(`我慢値が${float2(patienceDiff)}%減少し`),
                strong(`${float2(patience)}%`), text(`に`),
                isMin ? strong("(下限)") : text(""),
            );
        } else {
            str.push(
                br(),
                strong(`我慢値は下限に達しています`),
            );
        }
        this.unshift(this.createElement("passStage", str));
    }

    endStage(cleared: boolean, orgasmCount: number, successRate: number) {
        this.unshift(this.createElement(cleared ? "endStageSuccess" : "endStageFailed", [
            ...(orgasmCount ? [strong(`${orgasmCount}回絶頂`), cleared ? text("してしまいましたが") : text("してしまい")] : [text("絶頂せずに")]),
            cleared ? strong("攻略成功") : strong("攻略失敗"),
            cleared ? text("しました") : text("してしまいました"), br(),
            text("成功率"), strong(`${float2(successRate)}%`),
        ]));
    }

    private createElement(type, text: Array<HTMLElement | Text>) {
        const li = document.createElement("li");
        li.classList.add(type);
        for (const elem of text) li.appendChild(elem);
        return li;
    }
}
