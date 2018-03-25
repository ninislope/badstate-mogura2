const seriousSpeaks = [
    {serious: 0, speak: [""]},
    {serious: 1, speak: ["", "", "", "", "", "", "ん……"]},
    {serious: 3, speak: ["", "", "", "", "んっ……"]},
    {serious: 5, speak: ["", "", "", "", "んっ……", "ぁ……", "んぅっ……"]},
    {serious: 7, speak: ["", "", "んぁっ……", "ゃん……", "はぁっ……", "ふぁっ……"]},
];

const allBadStates: AllBadStates = [
    { // difficulty=0 これは出現しないが行動依存でつく レベルは1のみ
        おもらし: [{serious: 4, delay: 500, period: 4000}],
        発情: [{serious: 3, delay: 300, period: 8000}],
        ハメられ: [{serious: 4, stop: 100, cycle: 500, prod: 100, period: 3500, endTrigger: ["膣内射精"], danger: ["膣内射精"], speak: ["膣内だめっ♡", ""], speakInterval: 350}],
        膣内射精: [{serious: 4, delay: 1000, stop: 3000, prod: 100, period: 4000, danger: ["膣内射精"], speak: ["いやぁぁぁぁぁっ♡"]}],
    },
    { // difficulty=1
        乳首敏感: [
            {serious: 1, delay: 50},
            {serious: 1, delay: 80},
            {serious: 1, delay: 120},
            {serious: 2, delay: 160},
            {serious: 2, delay: 200},
        ],
        クリ敏感: [
            {serious: 1, delay: 40},
            {serious: 1, delay: 80},
            {serious: 1, delay: 120},
            {serious: 2, delay: 160},
            {serious: 2, delay: 200},
        ],
        膨乳: [
            {serious: 1, delay: 80},
            {serious: 2, delay: 160},
            {serious: 2, delay: 240},
            {serious: 3, delay: 320},
            {serious: 3, delay: 360},
        ],
        乳首肥大化: [
            {serious: 1, delay: 50},
            {serious: 1, delay: 100},
            {serious: 1, delay: 150},
            {serious: 2, delay: 200, stop: 80, cycle: 7000, prod: 20},
            {serious: 2, delay: 250, stop: 80, cycle: 7000, prod: 50},
        ],
        クリ肥大化: [
            {serious: 1, delay: 60},
            {serious: 1, delay: 120},
            {serious: 1, delay: 180},
            {serious: 2, delay: 240, stop: 80, cycle: 9000, prod: 20},
            {serious: 3, delay: 300, stop: 80, cycle: 9000, prod: 50},
        ],
        媚薬: [
            {serious: 1, stop: 80, cycle: 5000, prod: 40, period: 6000, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"]},
            {serious: 2, stop: 160, cycle: 4000, prod: 60, period: 8000, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"]},
            {serious: 2, stop: 240, cycle: 3000, prod: 80, period: 16000, trigger: ["発情"], danger: ["発情"], speak: ["ふわぁっ♡"]},
        ],
    },
    { // difficulty=2
        母乳体質: [
            {stop: 400, cycle: 10000, prod: 30, danger: ["母乳分泌"], speak: ["んっ……おっぱい張って……っ"]},
            {stop: 800, cycle: 10000, prod: 30, danger: ["母乳分泌"], speak: ["やっ……母乳がっ……!?"]},
            {stop: 1500, cycle: 8000, prod: 30, danger: ["母乳分泌"], speak: ["だめ……母乳感じて……"]},
        ],
        おもらし癖: [
            {serious: 2, stop: 4000, cycle: 10000, prod: 10, trigger: ["おもらし"], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"]},
            {serious: 3, stop: 4000, cycle: 9000, prod: 20, trigger: ["おもらし"], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"]},
            {serious: 3, stop: 4000, cycle: 8000, prod: 30, trigger: ["おもらし"], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"]},
        ],
    },
    { // difficulty=3
        挿入: [
            {serious: 3, stop: 1000, prod: 80, period: 7500, trigger: ["ハメられ"], danger: ["膣内射精"], speak: ["ふあぁんっ♡"]},
        ],
    },
];

interface BadStateLevelParam {
    /** 深刻度(デフォルト1) */
    serious?: number;
    /** 快楽蓄積 */

    /** 遅延 */
    delay?: number;
    /** 停止時間 */
    stop?: number;
    /** 停止時間サイクル */
    cycle?: number;
    /** 停止確率(%) 指定なしは100% */
    prod?: number;
    /** 停止時台詞 speakIntervaごとに追加 */
    speak?: string[];
    /** 停止時台詞の発話間隔 デフォルト1秒 */
    speakInterval?: number;
    /** 停止時に誘発するバッドステート名 */
    trigger?: string[];
    /** バッドステート持続時間 */
    period?: number;
    /** 持続時間終了停止時に誘発するバッドステート名 */
    endTrigger?: string[];
    /** 説明用危険可能性 */
    danger?: string[];
}

class BadStates {
    static all = allBadStates;

    static allBadStateMaxLevels: {[name: string]: number};

    static maxLevel(name: string) {
        if (!this.allBadStateMaxLevels) this.buildMaxLevels();
        return this.allBadStateMaxLevels[name];
    }

    private static buildMaxLevels() {
        const allBadStateMaxLevels: {[name: string]: number} = {};
        for (const badStatesInDifficulty of allBadStates) {
            for (const name of Object.keys(badStatesInDifficulty)) {
                allBadStateMaxLevels[name] = badStatesInDifficulty[name].length - 1;
            }
        }
        this.allBadStateMaxLevels = allBadStateMaxLevels;
    }

    static removeOnBattleEndNames = Object.keys(allBadStates[0]);
}

class Speak {
    static seriousSpeaks = seriousSpeaks;

    static randomReadySpeak(seriousSpeakIndex: number) {
        return this.randomHitSpeak(seriousSpeakIndex);
    }

    static randomHitSpeak(seriousSpeakIndex: number) {
        // TODO: 直前に出したindex出さないようにしたい
        const speaks = this.seriousSpeaks[seriousSpeakIndex].speak;
        return speaks[Math.floor(Math.random() * speaks.length)];
    }
}

class View {
    static setScene(name: string) {
        for (const elem of document.querySelectorAll(".scene")) {
            elem.classList.add("hidden");
        }
        document.getElementById(name)!.classList.remove("hidden");
    }

    static getAddMode() {
        return (document.querySelector('[name="addMode"]:checked') as HTMLInputElement).value as "immediate" | "lazy";
    }

    static setAddMode(baseScene: string, value: "immediate" | "lazy") {
        for (const elem of document.querySelectorAll(`[name="addMode"]`) as NodeListOf<HTMLInputElement>) {
            elem.checked = false;
        }
        (document.querySelector(`${baseScene} [name="addMode"][value="${value}"]`) as HTMLInputElement).checked = true;
    }

    static updateBadStates(baseScene: string, previous: PlayerBadStates, current: PlayerBadStates, summary: PlayerBadStates) {
        const summaryContainer = document.querySelector<HTMLOListElement>(`${baseScene} .badStatesSummary`) as HTMLOListElement;
        summaryContainer.innerHTML = summary.summary;
        const container = document.querySelector<HTMLOListElement>(`${baseScene} .badStates`) as HTMLOListElement;
        container.innerHTML = "";
        for (const badState of previous.badStates) {
            container.appendChild(View.createBadStateListElement(badState, "old"));
        }
        for (const badState of current.badStates) {
            const previousBadState = previous.find(badState.name);
            if (previousBadState && previousBadState.level === badState.level) continue;
            container.appendChild(View.createBadStateListElement(badState, "new"));
        }
    }

    private static createBadStateListElement(badState: PlayerBadState, type: "old" | "new") {
        const li = document.createElement("li");
        li.className = type;
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = badState.displayName;
        const effect = document.createElement("span");
        effect.className = "effect";
        effect.textContent = badState.description;
        li.appendChild(name);
        li.appendChild(effect);
        return li;
    }
}

class MoguraView {
    static setup() {
        document.querySelector<HTMLSpanElement>("#moguraScene .level")!.textContent = `${moguraGame.stage.level}`;
        for (const mogura of this.moguras()) {
            // hide mogura
            mogura.classList.remove("appear", "destroyed");
            mogura.classList.add("hidden");
        }
        MoguraView.updateInfo();
        MoguraView.updateBadStates(moguraGame.playerInGame.startBadStates, moguraGame.playerInGame.currentBadStates, moguraGame.playerInGame.currentBadStates);
        moguraGame.playerInGame.speakReady();
    }

    static updateInfo() {
        document.querySelector<HTMLSpanElement>("#moguraScene .restCount")!.textContent = `${moguraGame.stage.restCount}`;
        document.querySelector<HTMLSpanElement>("#moguraScene .successCount")!.textContent = `${moguraGame.stage.successCount}`;
        document.querySelector<HTMLSpanElement>("#moguraScene .failCount")!.textContent = `${moguraGame.stage.failCount}`;
    }

    static updateBadStates(previous: PlayerBadStates, current: PlayerBadStates, effective: PlayerBadStates) {
        View.updateBadStates("#moguraScene", previous, current, effective);
    }

    static _moguras: NodeListOf<HTMLButtonElement>;

    static moguras() {
        if (!MoguraView._moguras) {
            MoguraView._moguras = document.querySelectorAll<HTMLButtonElement>("#moguraScene .mogura");
        }
        return MoguraView._moguras;
    }

    static appearMogura(index: number, value: string) {
        const mogura = this.moguras()[index];
        mogura.classList.remove("hidden", "destroyed");
        mogura.classList.add("appear");
        mogura.textContent = value;
    }

    static destroyMogura(index: number) {
        const mogura = this.moguras()[index];
        mogura.classList.remove("hidden", "appear");
        mogura.classList.add("destroyed");
    }

    static hideMogura(index: number) {
        const mogura = this.moguras()[index];
        mogura.classList.remove("appear", "destroyed");
        mogura.classList.add("hidden");
    }

    static setSpeak(speak: string) {
        document.querySelector<HTMLDivElement>("#moguraScene .speak")!.textContent = speak;
    }

    static showStart() {
        document.querySelector<HTMLDivElement>("#moguraScene .start")!.classList.add("show");
    }

    static hideStart() {
        document.querySelector<HTMLDivElement>("#moguraScene .start")!.classList.remove("show");
    }

    static setStart(value: string) {
        document.querySelector<HTMLDivElement>("#moguraScene .start")!.textContent = value;
    }

    static showInactive() {
        document.querySelector<HTMLDivElement>("#moguraScene .inactive")!.classList.add("show");
    }

    static hideInactive() {
        document.querySelector<HTMLDivElement>("#moguraScene .inactive")!.classList.remove("show");
    }
}

class ResultView {
    static updateInfo() {
        document.querySelector<HTMLSpanElement>("#resultScene .level")!.textContent = `${moguraGame.stage.level}`;
        document.querySelector<HTMLSpanElement>("#resultScene .totalCount")!.textContent = `${moguraGame.stage.totalCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successCount")!.textContent = `${moguraGame.stage.successCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .failCount")!.textContent = `${moguraGame.stage.failCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successRate")!.textContent = `${moguraGame.stage.successRate}`;
    }

    static updateBadStates(previous: PlayerBadStates, current: PlayerBadStates) {
        View.updateBadStates("#resultScene", previous, current, current);
    }

    static setAddMode(value: "immediate" | "lazy") {
        View.setAddMode("#resultScene", value);
    }
}

class Stages {
    stages: Stage[] = [];
    get currentStage() { return this.stages[this.stages.length - 1]; }
    newStage() {
        const stage = new Stage(this.currentStage ? this.currentStage.level + 1 : 1);
        this.stages.push(stage);
        return stage;
    }

}

class Stage {
    level: number;
    badStateDifficulty: number;
    totalCount: number;
    score = 0;
    successCount = 0;
    appearCount = 0;
    fails: string[] = [];

    constructor(level = 0) {
        this.level = level;
        this.badStateDifficulty = Math.ceil(level / 3);
        this.totalCount = this.level * 3 + 7;
    }

    success() { ++this.successCount; }
    appear() { ++this.appearCount; }
    fail(name: string) { this.fails.push(name); }

    get failCount() { return this.fails.length; }
    get passCount() { return this.successCount + this.failCount; }
    get restCount() { return this.totalCount - this.passCount; }
    get restAppearCount() { return this.totalCount - this.appearCount; }
    /** 成功率% */
    get successRate() { return Math.round(this.successCount * 1000 / this.passCount) / 10 }
    get currentAppearSpeed() { return Math.max(200, 2000 - this.level * 100 - this.passCount * 30); } // TODO:
    get currentHideSpeed() { return Math.max(300, 3000 - this.level * 150 - this.passCount * 30); } // TODO:
}

type BadStateSet = BadStateLevelParam[];

interface BadStatesInDifficulty {
    [name: string]: BadStateSet;
}

type AllBadStates = BadStatesInDifficulty[];

class BadStateNames {
    names: string[];

    static byDifficulty(difficulty: number) {
        const badStateNames: string[] = [];
        for (let currentDifficulty = 1; currentDifficulty < allBadStates.length; ++currentDifficulty) {
            if (currentDifficulty > difficulty) break;
            const currentDifficultyBadStates = allBadStates[currentDifficulty];
            badStateNames.push(...Object.keys(currentDifficultyBadStates));
        }
        return new BadStateNames(badStateNames);
    }

    constructor(names: string[]) {
        this.names = names;
    }

    random() {
        return this.names[Math.floor(Math.random() * this.names.length)];
    }
}

class PlayerBadState {
    name: string;
    level: number;
    difficulty: number;
    displayName: string;
    displayLevel: number;
    param: BadStateLevelParam;
    description: string;

    constructor(name: string, level = 0) {
        this.name = name;
        this.level = level;
        const {difficulty, param} = this.findBadState();
        this.difficulty = difficulty;
        this.param = param;
        this.displayLevel = level + 1;
        this.displayName = difficulty ? `${name} Lv.${this.displayLevel}` : name;
        const description: string[] = [];
        if (this.param.delay) description.push(`反応が${this.param.delay / 1000}秒遅れる`);
        if (this.param.stop) description.push(`確率で${this.param.stop / 1000}秒動けなくなる`);
        if (this.param.trigger) description.push(`${this.param.trigger.join(", ")}を誘発`);
        if (this.param.period) description.push(`${this.param.period / 1000}秒で自然解消`);
        this.description = description.join(" ");
    }

    private findBadState() {
        let difficulty = 0;
        for (const badStatesInDifficulty of allBadStates) {
            const badState = badStatesInDifficulty[this.name];
            if (badState) {
                return { difficulty, param: badState[this.level]};
            }
            ++difficulty;
        }
        throw new Error("no badstate");
    }

    triggersNow() {
        return Math.random() * 100 < (this.param.prod || 100);
    }
}

/** 現在有効なバッドステート(モードの違い吸収) */
class PlayerBadStates {
    badStates: PlayerBadState[];
    serious: number;
    totalDelay: number;
    seriousSpeakIndex: number;
    private index: {[name: string]: PlayerBadState};

    constructor(badStates: PlayerBadState[]) {
        this.badStates = badStates;
        this.serious = badStates.reduce((sum, badState) => sum + (badState.param.serious || 1), 0);
        this.totalDelay = badStates.reduce((sum, badState) => sum + (badState.param.delay || 0), 0);

        const nextSeriousSpeakIndex = seriousSpeaks.findIndex((seriousSpeak) => seriousSpeak.serious > this.serious);
        this.seriousSpeakIndex = nextSeriousSpeakIndex === -1 ? seriousSpeaks.length - 1 : nextSeriousSpeakIndex - 1;
    }

    find(name: string) {
        if (!this.index) this.buildIndex();
        return this.index[name];
    }

    private buildIndex() {
        const index: {[name: string]: PlayerBadState} = {};
        for (const badState of this.badStates) {
            index[badState.name] = badState;
        }
        this.index = index;
    }

    get summary() {
        const summaries: string[] = [];
        if (this.totalDelay) summaries.push(`敏感になり${this.totalDelay / 1000}秒動きが遅れてしまう`);
        const dangers: string[] = [];
        for (const playerBadState of this.badStates) {
            if (playerBadState.param.danger) dangers.push(...playerBadState.param.danger);
        }
        if (dangers.length) summaries.push(`体が開発され${dangers.join(", ")}の危険がある`);
        return summaries.join("<br>");
    }
}

class Player {
    addMode: "immediate" | "lazy";

    badStates: PlayerBadState[] = [];

    newInGame(moguraGame: MoguraGame) {
        return new PlayerInMoguraGame(this, moguraGame);
    }

    snapShotBadState() {
        return new PlayerBadStates([...this.badStates]);
    }

    addBadState(name: string) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        let playerBadState: PlayerBadState;
        if (previousIndex === -1) {
            playerBadState = new PlayerBadState(name);
            this.badStates.push(playerBadState);
        } else {
            const previous = this.badStates[previousIndex];
            const nextLevel = previous.level + 1;
            if (nextLevel > BadStates.maxLevel(name)) return;
            playerBadState = new PlayerBadState(name, nextLevel);
            this.badStates.splice(previousIndex, 1);
            this.badStates.push(playerBadState);
        }
        return playerBadState;
    }

    removeBadState(name: string) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        if (previousIndex === -1) return;
        this.badStates.splice(previousIndex, 1);
    }

    removeBattleEndBadStates() {
        for (const name of BadStates.removeOnBattleEndNames) {
            this.removeBadState(name);
        }
    }
}

class PlayerInMoguraGame {
    player: Player;
    moguraGame: MoguraGame;
    startBadStates: PlayerBadStates;
    currentBadStates: PlayerBadStates;
    private inactiveTimer?: number;
    private speakTimers: Array<number | undefined> = [];
    private triggerStopTimers: {[name: string]: number} = {};
    private removeTimers: {[name: string]: number} = {};
    private inactive = false;

    constructor(player: Player, moguraGame: MoguraGame) {
        this.player = player;
        this.moguraGame = moguraGame;
        console.log("moguraGame", moguraGame);
        this.startBadStates = this.currentBadStates = player.snapShotBadState();
    }

    get addMode() { return this.player.addMode; }
    get effectiveBadStates() { return this.addMode === "immediate" ? this.currentBadStates : this.startBadStates; }

    addBadState(name: string) {
        const playerBadState = this.player.addBadState(name);
        this.currentBadStates = this.player.snapShotBadState();
        if (playerBadState) this.setBadStateTimer(playerBadState);
        MoguraView.updateBadStates(this.startBadStates, this.currentBadStates, this.effectiveBadStates);
    }

    removeBadState(name: string) {
        this.clearBadStateTimer(name);
        this.player.removeBadState(name);
        this.currentBadStates = this.player.snapShotBadState();
        MoguraView.updateBadStates(this.startBadStates, this.currentBadStates, this.effectiveBadStates);
    }

    removeBattleEndBadStates() {
        this.player.removeBattleEndBadStates();
        this.currentBadStates = this.player.snapShotBadState();
    }

    start = () => {
        const playerBadStates = this.effectiveBadStates;
        let offset = 1;
        for (const playerBadState of playerBadStates.badStates) {
            setTimeout(() => this.setBadStateTimer(playerBadState), offset);
            offset += 37; // タイミングがかぶらないように
        }
    }

    end = () => {
        MoguraView.hideInactive();
        this.clearTimers();
        this.removeBattleEndBadStates();
    }

    private clearBadStateTimer(name: string) {
        if (this.triggerStopTimers[name]) {
            clearTimeout(this.triggerStopTimers[name]);
            delete this.triggerStopTimers[name];
        }
        if (this.removeTimers[name]) {
            clearTimeout(this.removeTimers[name]);
            delete this.removeTimers[name];
        }
    }

    private clearTimers() {
        if (this.inactiveTimer) clearTimeout(this.inactiveTimer);
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

    private setBadStateTimer(playerBadState: PlayerBadState) {
        if (playerBadState.param.stop) {
            this.timerTriggerStopImmediate(playerBadState.name);
        }
        if (playerBadState.param.period) {
            this.timerRemoveBadState(playerBadState.name, playerBadState.param.period);
        }
    }

    private timerTriggerStopImmediate(name: string, playerBadState = this.effectiveBadStates.find(name)) {
        if (!this.inactive && playerBadState.triggersNow()) {
            this.setInactive(playerBadState.param.stop as number, () => { // 停止させる
                if (playerBadState.param.trigger) { // 停止後バッドステートを誘発
                    for (const name of playerBadState.param.trigger) {
                        this.addBadState(name);
                    }
                }
            });
            if (playerBadState.param.speak) { // しゃべる
                this.timerSpeaks(playerBadState.param.speak, playerBadState.param.speakInterval || 1000);
            }
        }
        delete this.triggerStopTimers[name];
        this.timerTriggerStop(name);
    }

    private timerTriggerStop(name: string) {
        if (this.triggerStopTimers[name]) return; // 前にかかっていたのがあったらそれにまかせる
        const playerBadState = this.effectiveBadStates.find(name);
        if (!playerBadState) return; // 解消されている場合
        if (!playerBadState.param.cycle) return; // 周期実行でない場合
        this.triggerStopTimers[name] = setTimeout(() => this.timerTriggerStopImmediate(name, playerBadState), playerBadState.param.cycle);
    }

    private timerRemoveBadState(name: string, period: number) {
        const playerBadState = this.effectiveBadStates.find(name);
        const previousHandle = this.removeTimers[name];
        if (previousHandle) clearTimeout(previousHandle); // 前にかかっていたのがあったら期限を更新
        this.removeTimers[name] = setTimeout(() => {
            delete this.removeTimers[name];
            this.removeBadState(name);
            if (playerBadState.param.endTrigger) { // 持続時間終了後バッドステートを誘発
                for (const name of playerBadState.param.endTrigger) {
                    this.addBadState(name);
                }
            }
        }, period);
    }

    private timerSpeaks(speaks: string[], interval: number) {
        const lastIndex = speaks.length - 1;
        for (let index = 0; index <= lastIndex; ++index) {
            this.timerSpeak(speaks[index], index, interval, index === lastIndex);
        }
    }

    private timerSpeak(speak: string, index: number, interval: number, last = false) {
        this.speakTimers[index] = setTimeout(() => {
            this.speakTimers[index] = undefined;
            if (last) this.speakTimers.length = 0;
            MoguraView.setSpeak(speak);
        }, 1 + index * interval);
    }

    private setInactive(period: number, onEnd: () => any) {
        this.inactive = true;
        MoguraView.showInactive();
        this.inactiveTimer = setTimeout(() => {
            delete this.inactiveTimer;
            this.inactive = false;
            MoguraView.hideInactive();
            onEnd();
        }, period);
    }

    hitMogura = (index: number) => {
        if (this.inactive) return;
        this.speakHit();
        const playerBadStates = this.effectiveBadStates;
        if (playerBadStates.totalDelay) {
            setTimeout(() => this.moguraGame.hitMogura(index), playerBadStates.totalDelay);
        } else {
            this.moguraGame.hitMogura(index);
        }
    }

    speakReady() {
        MoguraView.setSpeak(Speak.randomReadySpeak(this.effectiveBadStates.seriousSpeakIndex));
    }

    private speakHit() {
        MoguraView.setSpeak(Speak.randomHitSpeak(this.effectiveBadStates.seriousSpeakIndex));
    }
}

const stages = new Stages();
const player = new Player();
let moguraGame: MoguraGame;

function startGame() {
    gotoStartScene();
}

function gotoStartScene() {
    View.setScene("startScene");
}

function gotoMoguraScene() {
    player.addMode = View.getAddMode();
    moguraGame = new MoguraGame(stages.newStage(), gotoResultScene);
    View.setScene("moguraScene");
    MoguraView.setup();
    MoguraView.showStart();
    setTimeout(() => MoguraView.setStart("3"), 1);
    setTimeout(() => MoguraView.setStart("2"), 500);
    setTimeout(() => MoguraView.setStart("1"), 1000);
    setTimeout(() => MoguraView.setStart("START!"), 1500);
    setTimeout(() => {
        MoguraView.hideStart();
        setTimeout(moguraGame.playerInGame.start, 200);
        setTimeout(moguraGame.start, 400);
    }, 2000);
}

function gotoResultScene() {
    ResultView.setAddMode(player.addMode);
    ResultView.updateBadStates(moguraGame.playerInGame.startBadStates, moguraGame.playerInGame.currentBadStates);
    ResultView.updateInfo();
    View.setScene("resultScene");
}

class MoguraGame {
    stage: Stage;
    playerInGame: PlayerInMoguraGame;
    onEnd: () => any;

    private badStateNames: BadStateNames;
    private currentMoguras: {[index: string]: string} = {};
    private currentMoguraHits: {[index: string]: boolean} = {};

    constructor(stage: Stage, onEnd: () => any) {
        this.stage = stage;
        this.playerInGame = player.newInGame(this);
        this.onEnd = onEnd;
        this.badStateNames = BadStateNames.byDifficulty(stage.badStateDifficulty);
    }

    start = () => {
        this.appearMogura();
    }

    private end = () => {
        this.playerInGame.end();
        this.onEnd();
    }

    private get currentMoguraCount() { return Object.keys(this.currentMoguras).length; }

    private newMoguraIndex() {
        let index = Math.floor(Math.random() * (10 - this.currentMoguraCount));
        while (this.currentMoguras[index]) index = (index + 1) % 10;
        return index;
    }

    private newBadStateName() {
        return this.badStateNames.random();
    }

    private appearMogura = () => {
        if (this.stage.restAppearCount <= 0) return;
        const index = this.newMoguraIndex();
        const badStateName = this.newBadStateName();
        this.currentMoguras[index] = badStateName;
        this.stage.appear();
        MoguraView.appearMogura(index, badStateName);
        MoguraView.updateInfo();
        setTimeout(() => this.hideMogura(index), this.stage.currentHideSpeed);
        setTimeout(this.appearMogura, this.stage.currentAppearSpeed);
    }

    private hideMogura = (index: number) => {
        MoguraView.hideMogura(index);
        if (this.currentMoguraHits[index]) {
            delete this.currentMoguraHits[index];
        } else {
            const badStateName = this.currentMoguras[index];
            this.stage.fail(badStateName);
            this.playerInGame.addBadState(badStateName);
        }
        delete this.currentMoguras[index];
        MoguraView.updateInfo();
        if (this.stage.restCount <= 0) this.end();
    }

    hitMogura = (index: number) => {
        if (this.currentMoguras[index]) {
            this.currentMoguraHits[index] = true;
            this.stage.success();
            MoguraView.updateInfo();
            MoguraView.destroyMogura(index);
        }
    }
}
