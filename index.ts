const seriousSpeaks = [
    {serious: 0, speak: [""]},
    {serious: 1, speak: ["", "", "", "", "", "", "ん……"]},
    {serious: 3, speak: ["", "", "", "", "んっ……"]},
    {serious: 5, speak: ["", "", "", "", "んっ……", "ぁ……", "んぅっ……"]},
    {serious: 7, speak: ["", "", "んぁっ……", "ゃん……", "はぁっ……", "ふぁっ……"]},
];

const allBadStates: AllBadStates = [
    { // difficulty=0 これは出現しないが行動依存でつく レベルは1のみ
        おもらし: [{delay: 500, period: 4000}],
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
    },
    { // difficulty=2
        母乳体質: [
            {stop: 400, cycle: 10000, prod: 30, speak: ["んっ……おっぱい張って……っ"]},
            {stop: 800, cycle: 10000, prod: 30, speak: ["やっ……母乳がっ……!?"]},
            {stop: 1500, cycle: 8000, prod: 30, speak: ["だめ……母乳感じて……"]},
        ],
        おもらし癖: [
            {serious: 2, stop: 4000, cycle: 10000, prod: 10, trigger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"]},
            {serious: 3, stop: 4000, cycle: 9000, prod: 20, trigger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"]},
            {serious: 3, stop: 4000, cycle: 8000, prod: 30, trigger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"]},
        ],
    }
];

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

    static setAddMode(value: "immediate" | "lazy") {
        for (const elem of document.querySelectorAll(`[name="addMode"]`) as NodeListOf<HTMLInputElement>) {
            elem.checked = false;
        }
        (document.querySelector(`[name="addMode"][value="${value}"]`) as HTMLInputElement).checked = true;
    }

    static updateBadStates(baseScene: string, previous: PlayerBadStates, current: PlayerBadStates) {
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
        MoguraView.updateBadStates(moguraGame.playerInGame.startBadStates, moguraGame.playerInGame.currentBadStates);
        MoguraView.setSpeak(Speak.randomHitSpeak(moguraGame.playerInGame.effectiveBadStates.seriousSpeakIndex) || "……");
    }

    static updateInfo() {
        document.querySelector<HTMLSpanElement>("#moguraScene .restCount")!.textContent = `${moguraGame.stage.restCount}`;
        document.querySelector<HTMLSpanElement>("#moguraScene .successCount")!.textContent = `${moguraGame.stage.successCount}`;
        document.querySelector<HTMLSpanElement>("#moguraScene .failCount")!.textContent = `${moguraGame.stage.failCount}`;
    }

    static updateBadStates(previous: PlayerBadStates, current: PlayerBadStates) {
        View.updateBadStates("#moguraScene", previous, current);
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
}

class ResultView {
    static updateInfo() {
        document.querySelector<HTMLSpanElement>("#resultScene .totalCount")!.textContent = `${moguraGame.stage.totalCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successCount")!.textContent = `${moguraGame.stage.successCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .failCount")!.textContent = `${moguraGame.stage.failCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successRate")!.textContent = `${moguraGame.stage.successRate}`;
    }

    static updateBadStates(previous: PlayerBadStates, current: PlayerBadStates) {
        View.updateBadStates("#resultScene", previous, current);
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
    get currentAppearSpeed() { return 2000 - this.level * 100 - this.passCount * 30; } // TODO:
    get currentHideSpeed() { return 3000 - this.level * 150 - this.passCount * 30; } // TODO:
}

interface BadStateLevelParam {
    /** 深刻度(デフォルト1) */
    serious?: number;
    /** 遅延 */
    delay?: number;
    /** 停止時間 */
    stop?: number;
    /** 停止時間サイクル */
    cycle?: number;
    /** 停止確率(%) */
    prod?: number;
    /** 停止時台詞 */
    speak?: string[];
    /** 停止時に誘発するバッドステート名 */
    trigger?: string[];
    /** バッドステート持続時間 */
    period?: number;
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
    displayName: string;
    displayLevel: number;
    param: BadStateLevelParam;
    description: string;

    constructor(name: string, level = 0) {
        this.name = name;
        this.level = level;
        this.displayLevel = level + 1;
        this.displayName = `${name} Lv.${this.displayLevel}`;
        this.param = this.findBadState();
        const description: string[] = [];
        if (this.param.delay) description.push(`反応が${this.param.delay / 1000}秒遅れる`);
        if (this.param.stop) description.push(`確率で${this.param.stop / 1000}秒動けなくなる`);
        if (this.param.trigger) description.push(`${this.param.trigger.join(", ")}を誘発`);
        if (this.param.period) description.push(`${this.param.period / 1000}秒で自然解消`);
        this.description = description.join(" ");
    }

    private findBadState() {
        for (const badStatesInDifficulty of allBadStates) {
            const badState = badStatesInDifficulty[this.name];
            if (badState) {
                return badState[this.level];
            }
        }
        throw new Error("no badstate");
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
}

class Player {
    addMode: "immediate" | "lazy";

    badStates: PlayerBadState[] = [];

    newInGame() {
        return new PlayerInMoguraGame(this);
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
    startBadStates: PlayerBadStates;
    currentBadStates: PlayerBadStates;

    constructor(player: Player) {
        this.player = player;
        this.startBadStates = this.currentBadStates = player.snapShotBadState();
    }

    get addMode() { return this.player.addMode; }
    get effectiveBadStates() { return this.addMode === "immediate" ? this.currentBadStates : this.startBadStates; }

    addBadState(name: string) {
        this.player.addBadState(name);
        this.currentBadStates = this.player.snapShotBadState();
    }

    removeBadState(name: string) {
        this.player.removeBadState(name);
        this.currentBadStates = this.player.snapShotBadState();
    }

    removeBattleEndBadStates() {
        this.player.removeBattleEndBadStates();
        this.currentBadStates = this.player.snapShotBadState();
    }

    hitMogura = (index: number) => {
        const playerBadStates = this.effectiveBadStates;
        MoguraView.setSpeak(Speak.randomHitSpeak(playerBadStates.seriousSpeakIndex));
        if (playerBadStates.totalDelay) {
            setTimeout(() => moguraGame.hitMogura(index), playerBadStates.totalDelay);
        } else {
            moguraGame.hitMogura(index);
        }
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
    moguraGame = new MoguraGame(stages.newStage(), player.newInGame(), gotoResultScene);
    View.setScene("moguraScene");
    MoguraView.setup();
    MoguraView.showStart();
    setTimeout(() => MoguraView.setStart("3"), 1);
    setTimeout(() => MoguraView.setStart("2"), 500);
    setTimeout(() => MoguraView.setStart("1"), 1000);
    setTimeout(() => MoguraView.setStart("START!"), 1500);
    setTimeout(() => {
        MoguraView.hideStart();
        setTimeout(moguraGame.start, 100);
    }, 2000);
}

function gotoResultScene() {
    View.setScene("resultScene");
    View.setAddMode(player.addMode);
    ResultView.updateBadStates(moguraGame.playerInGame.startBadStates, moguraGame.playerInGame.currentBadStates);
    ResultView.updateInfo();
}

class MoguraGame {
    stage: Stage;
    playerInGame: PlayerInMoguraGame;
    onEnd: () => any;

    private badStateNames: BadStateNames;
    private currentMoguras: {[index: string]: string} = {};
    private currentMoguraHits: {[index: string]: boolean} = {};

    constructor(stage: Stage, playerInGame: PlayerInMoguraGame, onEnd: () => any) {
        this.stage = stage;
        this.playerInGame = playerInGame;
        this.onEnd = onEnd;
        this.badStateNames = BadStateNames.byDifficulty(stage.badStateDifficulty);
    }

    start = () => {
        this.appearMogura();
    }

    private end = () => {
        this.playerInGame.removeBattleEndBadStates();
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
        if (this.stage.restAppearCount === 0) return;
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
            MoguraView.updateBadStates(this.playerInGame.startBadStates, this.playerInGame.currentBadStates);
        }
        delete this.currentMoguras[index];
        MoguraView.updateInfo();
        if (this.stage.restCount === 0) this.end();
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
