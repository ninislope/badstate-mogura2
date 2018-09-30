class Player {
    constructor(environment, addMode = "immediate", badStates = {}, badStateCounts = {}, activeBadStateCounts = {}) {
        /** 治療回数 */
        this.repairCount = 0;
        /** 通常ステータス */
        this.normalStatus = new PlayerNormalStatus();
        /** ベース感度 */
        this.baseSensitivity = new PlayerSensitivity();
        /** ベース性的快感上限 */
        this.baseSensationLimit = 1000;
        /** 性的快感 */
        this.sensation = 0;
        /** 絶頂回数 */
        this.orgasmCount = 0;
        /** このステージでの絶頂回数 */
        this.currentStageOrgasmCount = 0;
        /** 失敗となる絶頂回数 */
        this.orgasmLimit = 10;
        /** 抵抗値(この%分だけ効果を削る) */
        this.resist = 0;
        /** 抵抗値(%)減少ステップ */
        this.resistStep = 0;
        /** 抵抗値最小値 */
        this.resistMin = 0;
        /** 感度上昇速度バイアス(%) */
        this.sensitiveSpeedBias = 100;
        this.environment = environment;
        this.addMode = addMode;
        this.badStates = new PlayerBadStates(this, badStates, badStateCounts, activeBadStateCounts);
        this.previousChallengeSensitivity = this.previousStageSensitivity = this.baseSensitivity;
        this.initialSensitivity = this.baseSensitivity.copy();
        this.initialBadStates = this.previousChallengeBadStates = this.previousStageBadStates = this.badStates;
        this.logs = new PlayerLogs();
    }
    static sensitiveSpeed(sensitivity, allSensitivity, sensitiveSpeedBias) {
        return PlayerSensitivity.sensitiveSpeed(sensitivity, allSensitivity) * sensitiveSpeedBias / 100;
    }
    static sensationSpeed(sensitivity, allSensitivity, effectiveRate) {
        return PlayerSensitivity.sensationSpeed(sensitivity, allSensitivity) * effectiveRate;
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
    newChallenge(count) {
        this.previousChallengeSensitivity = this.sensitivity.copy();
        this.previousChallengeBadStates = this.badStates;
        this.logs.newChallenge(count);
    }
    newStageChallenge(level, repeatCount) {
        this.previousStageSensitivity = this.sensitivity.copy();
        this.previousStageBadStates = this.badStates;
        this.currentStageOrgasmCount = 0;
        this.logs.newStageChallenge(level, repeatCount);
    }
    upSensation(parts, value, badState) {
        const all = this.sensitivity.all;
        const partUpSensitivity = {};
        let upSensation = 0;
        for (const part of parts) { // allの計算をキャッシュして同じ時点で計算
            const sensitivity = this.sensitivity[part];
            partUpSensitivity[part] = Player.sensitiveSpeed(sensitivity, all, this.sensitiveSpeedBias) * value;
            this.baseSensitivity[part] += partUpSensitivity[part];
            upSensation += Player.sensationSpeed(sensitivity, all, this.effectiveRate) * value;
        }
        this.sensation += upSensation;
        this.logs.upSensation(parts, value, upSensation, badState);
        return { sensitivity: partUpSensitivity, sensation: upSensation };
    }
    toOrgasmCount() {
        const count = Math.floor(this.sensation / this.sensationLimit);
        return count;
    }
    orgasm(count) {
        this.orgasmCount += count;
        this.currentStageOrgasmCount += count;
        // 連続絶頂体質なら快感を残す
        const 連続絶頂体質 = this.effectiveBadStates.find("連続絶頂体質");
        this.sensation = 連続絶頂体質 ? 連続絶頂体質.progress * 20 / 100 * this.sensationLimit : 0;
        this.logs.orgasm(count, 連続絶頂体質 ? 連続絶頂体質.progress * 20 : 0);
    }
    /**
     *
     * @param setName
     * @param upProgress
     * @param triggeredBy 誘発由来なら原因のバッドステートか、原因を明示しない場合はtrue
     */
    upBadState(setName, triggeredBy, upProgress = 1) {
        const previousBadState = this.badStates.find(setName);
        const badStates = this.badStates.up(setName, upProgress);
        this.logs.upBadState(setName, Boolean(badStates), previousBadState, badStates ? badStates.find(setName) : undefined, triggeredBy);
        if (badStates)
            this.badStates = badStates;
        return badStates;
    }
    downBadState(setName, downProgress = 1) {
        const previousBadState = this.badStates.find(setName);
        const badStates = this.badStates.down(setName, downProgress);
        this.logs.downBadState(setName, Boolean(badStates), previousBadState, badStates ? badStates.find(setName) : undefined);
        if (badStates)
            this.badStates = badStates;
        return badStates;
    }
    downBadStatesOnBattleEnd() {
        const badStates = this.badStates.downBattleEnd();
        this.logs.downBadStatesOnBattleEnd(this.badStates, badStates);
        if (badStates)
            this.badStates = badStates;
        return badStates;
    }
    downBadStatesOnRetry() {
        const badStates = this.badStates.downRetry();
        this.logs.downBadStatesOnRetry(this.badStates, badStates);
        if (badStates)
            this.badStates = badStates;
        return badStates;
    }
    /** ステージ経過効果 */
    passStage() {
        const previousResist = this.resist;
        this.resist -= this.resistStep;
        if (this.resist < this.resistMin)
            this.resist = this.resistMin;
        this.logs.passStage(previousResist, this.resist, this.resistStep, this.resistMin);
    }
}
/** 感度 */
class PlayerSensitivity {
    constructor(params = {}) {
        this.skin = 15;
        this.rightNipple = 70;
        this.leftNipple = 70;
        this.bust = 40;
        this.urethra = 10;
        this.clitoris = 100;
        this.vagina = 40;
        this.womb = 8;
        this.anal = 20;
        this.hip = 20;
        for (const name of Object.keys(params)) {
            const value = params[name];
            if (value != null)
                this[name] = value;
        }
    }
    static ja(part, alt = false) {
        if (part === "all")
            return alt ? this.allPartJaAlt : this.allPartJa;
        return this.partsJa[this.parts.indexOf(part)];
    }
    static sensitiveSpeed(sensitivity, allSensitivity) {
        return 1 + Math.pow(sensitivity, 0.7) / 60 * Math.log10(allSensitivity); // TODO: 調整
    }
    static sensationSpeed(sensitivity, allSensitivity) {
        return Math.pow(sensitivity, 0.7) / 8 * Math.log10(allSensitivity); // TODO: 調整
    }
    get all() {
        return PlayerSensitivity.parts.reduce((sum, part) => this[part] + sum, 0);
    }
    get delay() {
        return Math.pow(((this.all - PlayerSensitivity.initialAll) / 3), 0.65) / 1.2; // TODO:
    }
    copy() {
        const params = {};
        for (const name of PlayerSensitivity.parts) {
            params[name] = this[name];
        }
        return new PlayerSensitivity(params);
    }
}
PlayerSensitivity.parts = [
    "skin", "rightNipple", "leftNipple", "bust", "urethra", "clitoris", "vagina", "womb", "anal", "hip",
];
PlayerSensitivity.partsJa = [
    "肌", "右乳首", "左乳首", "乳房", "尿道", "陰核", "膣", "子宮", "尻穴", "尻肉",
];
PlayerSensitivity.allPartJa = "全部";
PlayerSensitivity.allPartJaAlt = "全部位";
PlayerSensitivity.initialAll = new PlayerSensitivity().all;
/** 感度バイアス */
class PlayerSensitivityBias {
    constructor() {
        this.skin = 100;
        this.rightNipple = 100;
        this.leftNipple = 100;
        this.bust = 100;
        this.urethra = 100;
        this.clitoris = 100;
        this.vagina = 100;
        this.portio = 100;
        this.womb = 100;
        this.anal = 100;
        this.hip = 100;
    }
    sensitivity(playerSensitivity) {
        return new PlayerSensitivity(PlayerSensitivity.parts.reduce((params, part) => {
            params[part] = playerSensitivity[part] * this[part] / 100;
            return params;
        }, {}));
    }
}
/** 現在有効なバッドステート immutable */
class PlayerBadStates {
    constructor(player, badStates, badStateCounts, activeBadStateCounts) {
        this.player = player;
        this.badStates = badStates;
        this.badStateCounts = badStateCounts;
        this.activeBadStateCounts = activeBadStateCounts;
        this.sensitivityBias = this.makeSensitivityBias();
        this.setNames = Object.keys(this.badStates).sort((a, b) => this.badStates[a].setIndex - this.badStates[b].setIndex);
        this.sortedBadStates = this.setNames.map((setName) => this.badStates[setName]);
        this.delay = this.sortedBadStates.reduce((delay, badState) => delay + (badState.delay || 0), 0);
        this.dangers = Array.from(new Set(this.sortedBadStates.reduce((dangers, badState) => dangers.concat(badState.danger || []), [])));
    }
    find(setName) {
        return this.badStates[setName];
    }
    /**
     * バッドステート起動
     *
     * 付与など状態が変わったら値を返す
     * @param setName バッドステートセット名
     * @param upProgress 起動する段階
     */
    up(setName, upProgress = 1) {
        const currentBadState = this.badStates[setName];
        const currentProgress = currentBadState ? currentBadState.progress : 0;
        const badStateSet = this.player.environment.badStates.findSet(setName);
        let nextProgress = currentProgress;
        let nextBadState = undefined;
        const org = upProgress;
        let finishSearch = false;
        while (upProgress) {
            ++nextProgress;
            const nextBadStateCandidate = badStateSet.byProgress(nextProgress);
            if (!nextBadStateCandidate)
                break;
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
            if (finishSearch)
                break;
            nextBadState = nextBadStateCandidate;
            --upProgress;
        }
        if (nextBadState && nextBadState.countActivate)
            console.warn(nextBadState, this.badStateCounts);
        if (!nextBadState && (!currentBadState || !currentBadState.count))
            return; // 次レベルがなくカウントもなければ変化なし
        const nextBadStates = nextBadState ? Object.assign({}, this.badStates, { [setName]: nextBadState }) : this.badStates;
        const addCount = nextBadState ? nextBadState.count || 0 : currentBadState ? currentBadState.count || 0 : 0;
        const nextBadStateCounts = addCount ? Object.assign({}, this.badStateCounts, { [setName]: (this.badStateCounts[setName] || 0) + addCount }) : this.badStateCounts;
        const nextActiveBadStateCounts = addCount ? Object.assign({}, this.activeBadStateCounts, { [setName]: (this.activeBadStateCounts[setName] || 0) + addCount }) : this.activeBadStateCounts;
        return new PlayerBadStates(this.player, nextBadStates, nextBadStateCounts, nextActiveBadStateCounts);
    }
    /**
     * バッドステート解消
     *
     * 状態が変わったら値を返す
     * @param setName バッドステートセット名
     * @param downProgress 解消する段階 trueなら全部
     */
    down(setName, downProgress = 1) {
        const currentBadState = this.find(setName);
        if (!currentBadState)
            return;
        const nextProgress = downProgress === true ? 0 : currentBadState.progress - (downProgress || 0);
        if (nextProgress === currentBadState.progress)
            return;
        if (nextProgress > 0) {
            const nextBadState = this.player.environment.badStates.findSet(setName).byProgress(nextProgress);
            return new PlayerBadStates(this.player, Object.assign({}, this.badStates, { [setName]: nextBadState }), this.badStateCounts, this.activeBadStateCounts);
        }
        else {
            const nextBadStates = Object.assign({}, this.badStates);
            delete nextBadStates[setName];
            const nextActiveBadStateCounts = Object.assign({}, this.activeBadStateCounts);
            delete nextActiveBadStateCounts[setName];
            return new PlayerBadStates(this.player, nextBadStates, this.badStateCounts, nextActiveBadStateCounts);
        }
    }
    /** バトル終了時進行度回復 */
    downBattleEnd() {
        const nextBadStates = Object.assign({}, this.badStates);
        const nextActiveBadStateCounts = Object.assign({}, this.activeBadStateCounts);
        let modified = false;
        for (const setName of Object.keys(this.badStates)) {
            const badState = this.badStates[setName];
            if (badState.stageDown) {
                const nextProgress = badState.stageDown === true ? 0 : badState.progress - badState.stageDown;
                if (nextProgress > 0) {
                    nextBadStates[setName] = this.player.environment.badStates.findSet(setName).byProgress(nextProgress);
                }
                else {
                    delete nextBadStates[setName];
                    delete nextActiveBadStateCounts[setName];
                }
                modified = true;
            }
        }
        if (modified)
            return new PlayerBadStates(this.player, nextBadStates, this.badStateCounts, nextActiveBadStateCounts);
    }
    /** 撤退時進行度回復 */
    downRetry() {
        const nextBadStates = Object.assign({}, this.badStates);
        const nextActiveBadStateCounts = Object.assign({}, this.activeBadStateCounts);
        let modified = false;
        for (const setName of Object.keys(this.badStates)) {
            const badState = this.badStates[setName];
            if (badState.retryDown) {
                const nextProgress = badState.retryDown === true ? 0 : badState.progress - badState.retryDown;
                if (nextProgress > 0) {
                    nextBadStates[setName] = this.player.environment.badStates.findSet(setName).byProgress(nextProgress);
                }
                else {
                    delete nextBadStates[setName];
                    delete nextActiveBadStateCounts[setName];
                }
                modified = true;
            }
        }
        if (modified)
            return new PlayerBadStates(this.player, nextBadStates, this.badStateCounts, nextActiveBadStateCounts);
    }
    makeSensitivityBias() {
        const playerSensitivityBias = new PlayerSensitivityBias();
        for (const name of Object.keys(this.badStates)) {
            const sensitivity = this.badStates[name].sensitivity;
            if (typeof sensitivity === "number") {
                if (sensitivity !== 0) {
                    for (const part of PlayerSensitivity.parts) {
                        playerSensitivityBias[part] += sensitivity;
                    }
                }
            }
            else {
                for (const part of Object.keys(sensitivity)) {
                    const value = sensitivity[part];
                    if (value)
                        playerSensitivityBias[part] += value;
                }
            }
        }
        return playerSensitivityBias;
    }
}
class PlayerBadStateDiff {
    constructor(before, after) {
        this.before = before;
        this.after = after;
        const uniqueSetNames = {};
        for (const setName of this.before.setNames.concat(this.after.setNames)) {
            uniqueSetNames[setName] = true;
        }
        this.setNames = Object.keys(uniqueSetNames).sort((a, b) => (this.before.badStates[a] || this.after.badStates[a]).setIndex - (this.before.badStates[b] || this.after.badStates[b]).setIndex);
        this.sortedBadStateDiffEntries = this.setNames.map((setName) => new PlayerBadStateDiffEntry(this.before.badStates[setName], this.after.badStates[setName]));
    }
}
class PlayerBadStateDiffEntry {
    constructor(before, after) {
        this.before = before;
        this.after = after;
    }
    get type() {
        if (!this.before) {
            return "add";
        }
        else if (!this.after) {
            return "remove";
        }
        else if (this.before.progress < this.after.progress) {
            return "up";
        }
        else if (this.before.progress > this.after.progress) {
            return "down";
        }
        else {
            return "same";
        }
    }
    get first() {
        return (this.before || this.after);
    }
}
class PlayerNormalStatus {
    constructor() {
        this.lv = 120;
        this.maxHp = 30000;
        this.maxMp = 2500;
        this.atk = 800;
        this.def = 400;
        this.mag = 1200;
        this.spd = 500;
    }
}
PlayerNormalStatus.names = ["lv", "maxHp", "maxMp", "atk", "def", "mag", "spd"];
PlayerNormalStatus.namesJa = ["Lv.", "最大HP", "最大MP", "攻撃力", "防御力", "魔法力", "素早さ"];
function br() {
    return document.createElement("br");
}
function strong(text) {
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
function text(text) {
    return document.createTextNode(text);
}
class PlayerLogs extends Array {
    newChallenge(count) {
        this.unshift(this.createElement("newChallenge", [strong(`${count}回目`), text(`の挑戦開始`)]));
    }
    newStageChallenge(level, repeatCount) {
        this.unshift(this.createElement("newStageChallenge", [
            strong(`ステージ${level}`), text(`: `),
            ...(repeatCount === 1 ? [] : [strong(`${repeatCount}`), text(`回目の`)]),
            text(`挑戦開始`),
        ]));
    }
    upSensation(parts, value, upSensation, badState) {
        const partsJa = parts.length === PlayerSensitivity.parts.length ?
            PlayerSensitivity.ja("all", true) :
            parts.map(part => PlayerSensitivity.ja(part)).join(",");
        this.unshift(this.createElement("upSensation", [
            strong(`[${badState.displayName}]`), text(" "),
            strong(partsJa), text("に"),
            ...(value === 1 ? [] : [value >= 1 ? strong(`${value}倍`) : text(`${value}倍`), text("の")]),
            text("快感! "), strong(`+${float2(upSensation)}`),
        ]));
    }
    orgasm(count, restPercent) {
        const base = [strong(`${count === 1 ? "" : `${count}回`}絶頂`), text(`してしまった!`)];
        const rest = restPercent === 0 ? [] : [br(), strong("連続絶頂体質"), text(`により`), strong(`快感が${restPercent}%残ってしまう!`)];
        this.unshift(this.createElement("orgasmLog", base.concat(rest)));
    }
    upBadState(setName, changed, previousBadState, nextBadState, triggeredBy) {
        if (changed && nextBadState) { // count変わったとかでもnextBadStateは返ってくる
            const reason = triggeredBy === true ?
                [] :
                triggeredBy ?
                    [strong(`[${triggeredBy.displayName}]`), text(`により`)] :
                    [strong(`[${setName}]`), text(`攻撃で`)];
            if (nextBadState.onceLog) {
                this.unshift(this.createElement("upBadState", [
                    ...reason,
                    strong(`[${nextBadState.displayName}]${nextBadState.onceLog}しまった!`),
                ]));
            }
            else {
                if (previousBadState) {
                    if (previousBadState.progress === nextBadState.progress)
                        return;
                    this.unshift(this.createElement("upBadState", [
                        ...reason,
                        strong(`[${previousBadState.displayName}]`), text(`が`),
                        strong(`[${nextBadState.displayName}]に`), 悪化(), text(`してしまった!`),
                    ]));
                }
                else {
                    this.unshift(this.createElement("upBadState", [
                        ...reason,
                        strong(`[${nextBadState.displayName}]が`), 付与(), text(`されてしまった!`),
                    ]));
                }
            }
        }
        else if (!triggeredBy) {
            this.unshift(this.createElement("upBadState", [
                strong(`[${setName}]`), text(`攻撃をうけてしまった!`),
            ]));
        }
    }
    downBadState(setName, changed, previousBadState, nextBadState) {
        if (!changed || previousBadState.onceLog)
            return;
        if (nextBadState) {
            const progressDiff = previousBadState.progress - nextBadState.progress;
            if (!progressDiff)
                return;
            this.unshift(this.createElement("downBadState", [
                strong(`[${previousBadState.displayName}]`), text("→"), strong(`[${nextBadState.displayName}]`),
                text(` 進行度 -${progressDiff}`),
            ]));
        }
        else {
            this.unshift(this.createElement("downBadState", [
                strong(`[${previousBadState.displayName}]が解消`), text(`した`),
            ]));
        }
    }
    downBadStatesOnBattleEnd(previousBadStates, currentBadStates) {
    }
    downBadStatesOnRetry(previousBadStates, currentBadStates) {
    }
    passStage(previousResist, currentResist, resistStep, resistMin) {
        if (!resistStep)
            return;
        const resistDiff = previousResist - currentResist;
        if (resistDiff) {
            const isMin = currentResist === resistMin;
            this.unshift(this.createElement("passStage", [
                text(`ステージ経過で抵抗値が${float2(resistDiff)}減り`),
                strong(`${float2(currentResist)}%`), text(`に`),
                isMin ? strong("(下限)") : text(""),
            ]));
        }
        else {
            this.unshift(this.createElement("passStage", [
                text(`ステージ経過での`),
                strong(`抵抗値減少は下限に達しています`),
            ]));
        }
    }
    createElement(type, text) {
        const li = document.createElement("li");
        li.classList.add(type);
        for (const elem of text)
            li.appendChild(elem);
        return li;
    }
}
