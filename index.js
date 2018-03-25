const seriousSpeaks = [
    { serious: 0, speak: [""] },
    { serious: 1, speak: ["", "", "", "", "", "", "ん……"] },
    { serious: 3, speak: ["", "", "", "", "んっ……"] },
    { serious: 5, speak: ["", "", "", "", "んっ……", "ぁ……", "んぅっ……"] },
    { serious: 7, speak: ["", "", "んぁっ……", "ゃん……", "はぁっ……", "ふぁっ……"] },
];
const allBadStates = [
    {
        おもらし: [{ delay: 500, period: 4000 }],
    },
    {
        乳首敏感: [
            { serious: 1, delay: 50 },
            { serious: 1, delay: 80 },
            { serious: 1, delay: 120 },
            { serious: 2, delay: 160 },
            { serious: 2, delay: 200 },
        ],
        クリ敏感: [
            { serious: 1, delay: 40 },
            { serious: 1, delay: 80 },
            { serious: 1, delay: 120 },
            { serious: 2, delay: 160 },
            { serious: 2, delay: 200 },
        ],
    },
    {
        母乳体質: [
            { stop: 400, cycle: 10000, prod: 30, speak: ["んっ……おっぱい張って……っ"] },
            { stop: 800, cycle: 10000, prod: 30, speak: ["やっ……母乳がっ……!?"] },
            { stop: 1500, cycle: 8000, prod: 30, speak: ["だめ……母乳感じて……"] },
        ],
        おもらし癖: [
            { serious: 2, stop: 4000, cycle: 10000, prod: 10, trigger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
            { serious: 3, stop: 4000, cycle: 9000, prod: 20, trigger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
            { serious: 3, stop: 4000, cycle: 8000, prod: 30, trigger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
        ],
    }
];
function randomSpeak(seriousSpeakIndex) {
    // TODO: 直前に出したindex出さないようにしたい
    const speaks = seriousSpeaks[seriousSpeakIndex].speak;
    return speaks[Math.floor(Math.random() * speaks.length)];
}
const allBadStateMaxLevels = {};
for (const badStatesInDifficulty of allBadStates) {
    for (const name of Object.keys(badStatesInDifficulty)) {
        allBadStateMaxLevels[name] = badStatesInDifficulty[name].length - 1;
    }
}
const removeOnBattleEndBadStates = Object.keys(allBadStates[0]);
class View {
    static setScene(name) {
        for (const elem of document.querySelectorAll(".scene")) {
            elem.classList.add("hidden");
        }
        document.getElementById(name).classList.remove("hidden");
    }
    static getAddMode() {
        return document.querySelector('[name="addMode"]:checked').value;
    }
    static setAddMode(value) {
        for (const elem of document.querySelectorAll(`[name="addMode"]`)) {
            elem.checked = false;
        }
        document.querySelector(`[name="addMode"][value="${value}"]`).checked = true;
    }
    static updateBadStates(baseScene, previous, current) {
        const container = document.querySelector(`${baseScene} .badStates`);
        container.innerHTML = "";
        for (const badState of previous.badStates) {
            container.appendChild(View.createBadStateListElement(badState, "old"));
        }
        for (const badState of current.badStates) {
            const previousBadState = previous.find(badState.name);
            if (previousBadState && previousBadState.level === badState.level)
                continue;
            container.appendChild(View.createBadStateListElement(badState, "new"));
        }
    }
    static createBadStateListElement(badState, type) {
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
        document.querySelector("#moguraScene .level").textContent = `${stage.level}`;
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
        document.querySelector("#moguraScene .restCount").textContent = `${stage.restCount}`;
        document.querySelector("#moguraScene .successCount").textContent = `${stage.successCount}`;
        document.querySelector("#moguraScene .failCount").textContent = `${stage.failCount}`;
    }
    static updateBadStates(previous, current) {
        View.updateBadStates("#moguraScene", previous, current);
    }
    static moguras() {
        if (!MoguraView._moguras) {
            MoguraView._moguras = document.querySelectorAll("#moguraScene .mogura");
        }
        return MoguraView._moguras;
    }
    static appearMogura(index, value) {
        const mogura = this.moguras()[index];
        mogura.classList.remove("hidden", "destroyed");
        mogura.classList.add("appear");
        mogura.textContent = value;
    }
    static destroyMogura(index) {
        const mogura = this.moguras()[index];
        mogura.classList.remove("hidden", "appear");
        mogura.classList.add("destroyed");
    }
    static hideMogura(index) {
        const mogura = this.moguras()[index];
        mogura.classList.remove("appear", "destroyed");
        mogura.classList.add("hidden");
    }
    static setSpeak(speak) {
        document.querySelector("#moguraScene .speak").textContent = speak;
    }
    static showStart() {
        document.querySelector("#moguraScene .start").classList.add("show");
    }
    static hideStart() {
        document.querySelector("#moguraScene .start").classList.remove("show");
    }
    static setStart(value) {
        document.querySelector("#moguraScene .start").textContent = value;
    }
}
class ResultView {
    static updateInfo() {
        document.querySelector("#resultScene .totalCount").textContent = `${stage.totalCount}`;
        document.querySelector("#resultScene .successCount").textContent = `${stage.successCount}`;
        document.querySelector("#resultScene .failCount").textContent = `${stage.failCount}`;
        document.querySelector("#resultScene .successRate").textContent = `${stage.successRate}`;
    }
    static updateBadStates(previous, current) {
        View.updateBadStates("#resultScene", previous, current);
    }
}
class Stages {
    constructor() {
        this.stages = [];
    }
    get currentStage() { return this.stages[this.stages.length - 1]; }
    newStage() {
        const stage = new Stage(this.currentStage ? this.currentStage.level + 1 : 1);
        this.stages.push(stage);
        return stage;
    }
}
class Stage {
    constructor(level = 0) {
        this.score = 0;
        this.successCount = 0;
        this.appearCount = 0;
        this.fails = [];
        this.level = level;
        this.badStateDifficulty = Math.ceil(level / 3);
        this.totalCount = this.level * 3 + 7;
    }
    success() { ++this.successCount; }
    appear() { ++this.appearCount; }
    fail(name) { this.fails.push(name); }
    get failCount() { return this.fails.length; }
    get passCount() { return this.successCount + this.failCount; }
    get restCount() { return this.totalCount - this.passCount; }
    get restAppearCount() { return this.totalCount - this.appearCount; }
    /** 成功率% */
    get successRate() { return Math.round(this.successCount * 1000 / this.passCount) / 10; }
    get currentAppearSpeed() { return 2000 - this.level * 100 - this.passCount * 30; } // TODO:
    get currentHideSpeed() { return 3000 - this.level * 150 - this.passCount * 30; } // TODO:
}
class BadStateNames {
    static byDifficulty(difficulty) {
        const badStateNames = [];
        for (let currentDifficulty = 1; currentDifficulty < allBadStates.length; ++currentDifficulty) {
            if (currentDifficulty > difficulty)
                break;
            const currentDifficultyBadStates = allBadStates[currentDifficulty];
            badStateNames.push(...Object.keys(currentDifficultyBadStates));
        }
        return new BadStateNames(badStateNames);
    }
    constructor(names) {
        this.names = names;
    }
    random() {
        return this.names[Math.floor(Math.random() * this.names.length)];
    }
}
class PlayerBadState {
    constructor(name, level = 0) {
        this.name = name;
        this.level = level;
        this.displayLevel = level + 1;
        this.displayName = `${name} Lv.${this.displayLevel}`;
        this.param = this.findBadState();
        const description = [];
        if (this.param.delay)
            description.push(`反応が${this.param.delay / 1000}秒遅れる`);
        if (this.param.stop)
            description.push(`確率で${this.param.stop / 1000}秒動けなくなる`);
        if (this.param.trigger)
            description.push(`${this.param.trigger.join(", ")}を誘発`);
        this.description = description.join(" ");
    }
    findBadState() {
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
    constructor(badStates) {
        this.badStates = badStates;
        this.serious = badStates.reduce((sum, badState) => sum + (badState.param.serious || 1), 0);
        this.totalDelay = badStates.reduce((sum, badState) => sum + (badState.param.delay || 0), 0);
        const nextSeriousSpeakIndex = seriousSpeaks.findIndex((seriousSpeak) => seriousSpeak.serious > this.serious);
        this.seriousSpeakIndex = nextSeriousSpeakIndex === -1 ? seriousSpeaks.length - 1 : nextSeriousSpeakIndex - 1;
    }
    find(name) {
        if (!this.index)
            this.buildIndex();
        return this.index[name];
    }
    buildIndex() {
        const index = {};
        for (const badState of this.badStates) {
            index[badState.name] = badState;
        }
        this.index = index;
    }
}
class Player {
    constructor() {
        this.badStates = [];
    }
    snapShotBadState() {
        return new PlayerBadStates([...this.badStates]);
    }
    addBadState(name) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        let playerBadState;
        if (previousIndex === -1) {
            playerBadState = new PlayerBadState(name);
            this.badStates.push();
        }
        else {
            const previous = this.badStates[previousIndex];
            const nextLevel = previous.level + 1;
            if (nextLevel > allBadStateMaxLevels[name])
                return;
            playerBadState = new PlayerBadState(name, nextLevel);
            this.badStates.splice(previousIndex, 1);
            this.badStates.push(playerBadState);
        }
        return playerBadState;
    }
    removeBadState(name) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        if (previousIndex === -1)
            return;
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
let stage;
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
let currentMoguras;
let currentMoguraHits;
let startPlayerBadStates;
let currentPlayerBadStates;
let badStateNames;
function usePlayerBadStates() {
    return player.addMode === "immediate" ? currentPlayerBadStates : startPlayerBadStates;
}
function startMogura() {
    currentMoguras = {};
    currentMoguraHits = {};
    startPlayerBadStates = currentPlayerBadStates = player.snapShotBadState();
    badStateNames = BadStateNames.byDifficulty(stage.badStateDifficulty);
    setTimeout(appearMogura, 100);
}
function appearMogura() {
    if (stage.restAppearCount === 0)
        return;
    let index = Math.floor(Math.random() * (10 - Object.keys(currentMoguras).length));
    while (currentMoguras[index])
        index = (index + 1) % 10;
    const badStateName = badStateNames.random();
    currentMoguras[index] = badStateName;
    stage.appear();
    MoguraView.appearMogura(index, badStateName);
    MoguraView.updateInfo();
    setTimeout(() => {
        MoguraView.hideMogura(index);
        if (currentMoguraHits[index]) {
            delete currentMoguraHits[index];
        }
        else {
            const badStateName = currentMoguras[index];
            stage.fail(badStateName);
            player.addBadState(badStateName);
            currentPlayerBadStates = player.snapShotBadState();
            MoguraView.updateBadStates(startPlayerBadStates, currentPlayerBadStates);
        }
        delete currentMoguras[index];
        MoguraView.updateInfo();
        if (stage.restCount === 0)
            gotoResultScene();
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
function hitMogura(index) {
    const playerBadStates = usePlayerBadStates();
    MoguraView.setSpeak(randomSpeak(playerBadStates.seriousSpeakIndex));
    if (playerBadStates.totalDelay) {
        setTimeout(() => hitMoguraExec(index), playerBadStates.totalDelay);
    }
    else {
        hitMoguraExec(index);
    }
}
function hitMoguraExec(index) {
    if (currentMoguras[index]) {
        currentMoguraHits[index] = true;
        stage.success();
        MoguraView.updateInfo();
        MoguraView.destroyMogura(index);
    }
}
