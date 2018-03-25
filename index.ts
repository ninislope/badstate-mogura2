const seriousSpeaks = [
    {serious: 0, speak: [""]},
    {serious: 1, speak: ["", "", "", "", "", "", "ん……"]},
    {serious: 3, speak: ["", "", "", "", "んっ……"]},
    {serious: 5, speak: ["", "", "", "", "んっ……", "ぁ……", "んぅっ……"]},
    {serious: 7, speak: ["", "", "んぁっ……", "ゃん……", "はぁっ……", "ふぁっ……"]},
];

const allBadStates: AllBadStates = [
    { // difficulty=0 これは出現しないが行動依存でつく レベルは1のみ
        おもらし: [{delay: 50, period: 4000}],
    },
    { // difficulty=1
        乳首敏感: [
            {delay: 20},
            {delay: 30},
            {delay: 50},
        ],
        クリ敏感: [
            {delay: 10},
            {delay: 30},
            {delay: 60},
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
        document.querySelector<HTMLSpanElement>("#moguraScene .level")!.textContent = `${stage.level}`;
        for (const mogura of this.moguras()) {
            // hide mogura
            mogura.classList.remove("appear", "destroyed");
            mogura.classList.add("hidden");
        }
        MoguraView.updateInfo();
        const playerBadStates = player.snapShotBadState();
        MoguraView.updateBadStates(playerBadStates, playerBadStates);
        MoguraView.setSpeak(randomSpeak(playerBadStates.seriousSpeakIndex) || "……");
    }

    static updateInfo() {
        document.querySelector<HTMLSpanElement>("#moguraScene .restCount")!.textContent = `${stage.restCount}`;
        document.querySelector<HTMLSpanElement>("#moguraScene .successCount")!.textContent = `${stage.successCount}`;
        document.querySelector<HTMLSpanElement>("#moguraScene .failCount")!.textContent = `${stage.failCount}`;
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
        document.querySelector<HTMLSpanElement>("#resultScene .totalCount")!.textContent = `${stage.totalCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successCount")!.textContent = `${stage.successCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .failCount")!.textContent = `${stage.failCount}`;
        document.querySelector<HTMLSpanElement>("#resultScene .successRate")!.textContent = `${stage.successRate}`;
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
    get currentAppearSpeed() { return 2000 - this.level * 100 - this.passCount * 5; } // TODO:
    get currentHideSpeed() { return 3000 - this.level * 150 - this.passCount * 5; } // TODO:
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

type BadState = BadStateLevelParam[];

interface BadStatesInDifficulty {
    [name: string]: BadState;
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

function randomSpeak(seriousSpeakIndex: number) {
    // TODO: 直前に出したindex出さないようにしたい
    const speaks = seriousSpeaks[seriousSpeakIndex].speak;
    return speaks[Math.floor(Math.random() * speaks.length)];
}

const allBadStateMaxLevels: {[name: string]: number} = {};
for (const badStatesInDifficulty of allBadStates) {
    for (const name of Object.keys(badStatesInDifficulty)) {
        allBadStateMaxLevels[name] = badStatesInDifficulty[name].length - 1;
    }
}

const removeOnBattleEndBadStates = Object.keys(allBadStates[0]);

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

        const seriousSpeakIndex = seriousSpeaks.findIndex((seriousSpeak) => seriousSpeak.serious <= this.serious);
        this.seriousSpeakIndex = seriousSpeakIndex === -1 ? seriousSpeaks.length - 1 : seriousSpeakIndex;
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

    snapShotBadState() {
        return new PlayerBadStates([...this.badStates]);
    }

    addBadState(name: string) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        if (previousIndex === -1) {
            this.badStates.push(new PlayerBadState(name));
        } else {
            const previous = this.badStates[previousIndex];
            const nextLevel = previous.level + 1;
            if (nextLevel > allBadStateMaxLevels[name]) return;
            this.badStates.splice(previousIndex, 1);
            this.badStates.push(new PlayerBadState(name, nextLevel));
        }
    }

    removeBadState(name: string) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        if (previousIndex === -1) return;
        this.badStates.splice(previousIndex, 1);
    }

    battleEnd() {
        for (const name of removeOnBattleEndBadStates) {
            this.removeBadState(name);
        }
    }
}

const stages = new Stages();
const player = new Player();
let stage: Stage;

function startGame() {
    gotoStartScene();
}

function gotoStartScene() {
    View.setScene("startScene");
}

function gotoMoguraScene() {
    player.addMode = View.getAddMode();
    stage = stages.newStage();
    View.setScene("moguraScene");
    MoguraView.setup();
    MoguraView.showStart();
    setTimeout(() => MoguraView.setStart("3"), 1);
    setTimeout(() => MoguraView.setStart("2"), 1000);
    setTimeout(() => MoguraView.setStart("1"), 2000);
    setTimeout(() => MoguraView.setStart("START!"), 3000);
    setTimeout(() => {
        MoguraView.hideStart();
        startMogura();
    }, 3500);
}

let currentMoguras: {[index: string]: string};
let currentMoguraHits: {[index: string]: boolean};
let startPlayerBadStates: PlayerBadStates;
let currentPlayerBadStates: PlayerBadStates;
let badStateNames: BadStateNames;

function startMogura() {
    currentMoguras = {};
    currentMoguraHits = {};
    startPlayerBadStates = currentPlayerBadStates = player.snapShotBadState();
    badStateNames = BadStateNames.byDifficulty(stage.badStateDifficulty);
    setTimeout(appearMogura, 100);
}

function appearMogura() {
    if (stage.restAppearCount === 0) return;
    let index = Math.floor(Math.random() * (10 - Object.keys(currentMoguras).length));
    while (currentMoguras[index]) index = (index + 1) % 10;
    const badStateName = badStateNames.random();
    currentMoguras[index] = badStateName;
    stage.appear();
    MoguraView.appearMogura(index, badStateName);
    MoguraView.updateInfo();
    setTimeout(() => {
        MoguraView.hideMogura(index);
        if (currentMoguraHits[index]) {
            delete currentMoguraHits[index];
        } else {
            const badStateName = currentMoguras[index];
            stage.fail(badStateName);
            player.addBadState(badStateName);
            currentPlayerBadStates = player.snapShotBadState();
            MoguraView.updateBadStates(startPlayerBadStates, currentPlayerBadStates);
        }
        delete currentMoguras[index];
        MoguraView.updateInfo();
        if (stage.restCount === 0) gotoResultScene();
    }, stage.currentHideSpeed);
    setTimeout(appearMogura, stage.currentAppearSpeed);
}

function gotoResultScene() {
    player.battleEnd();
    View.setScene("resultScene");
    View.setAddMode(player.addMode);
    ResultView.updateBadStates(startPlayerBadStates, currentPlayerBadStates);
    ResultView.updateInfo();
}

function hitMogura(index: number) {
    const playerBadStates = player.addMode === "immediate" ? currentPlayerBadStates : startPlayerBadStates;
    if (playerBadStates.totalDelay) {
        setTimeout(() => hitMoguraExec(index), playerBadStates.totalDelay);
    } else {
        hitMoguraExec(index);
    }
}

function hitMoguraExec(index: number) {
    if (currentMoguras[index]) {
        currentMoguraHits[index] = true;
        stage.success();
        MoguraView.updateInfo();
        MoguraView.destroyMogura(index);
    }
}