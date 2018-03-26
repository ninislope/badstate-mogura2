const seriousSpeaks = [
    { serious: 0, speak: [""] },
    { serious: 1, speak: ["", "", "", "", "", "", "ん……"] },
    { serious: 3, speak: ["", "", "", "", "んっ……"] },
    { serious: 5, speak: ["", "", "", "", "んっ……", "ぁ……", "んぅっ……"] },
    { serious: 7, speak: ["", "", "んぁっ……", "ゃん……", "はぁっ……", "ふぁっ……"] },
    { serious: 9, speak: ["んぁぁっ♡", "やっ……だめっ", "んぁっ……", "ゃん……", "はぁんっ……", "ふぁっ……", "くひぃっ♡"] },
];
const allBadStates = [
    {
        おもらし: [{ serious: 4, delay: 500, period: 4000 }],
        発情: [{ serious: 3, delay: 300, period: 8000 }],
        ハメられ: [{ serious: 4, stop: 100, cycle: 500, prod: 100, period: 3500, endTrigger: ["膣内射精"], speak: ["膣内だめっ♡", ""], speakInterval: 350 }],
        膣内射精: [{ serious: 4, delay: 1000, stop: 3000, prod: 100, period: 4000, speak: ["いやぁぁぁぁぁっ♡"] }],
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
        膨乳: [
            { serious: 1, delay: 80 },
            { serious: 2, delay: 160 },
            { serious: 2, delay: 240 },
            { serious: 3, delay: 320 },
            { serious: 3, delay: 360 },
        ],
        乳首肥大化: [
            { serious: 1, delay: 50 },
            { serious: 1, delay: 100 },
            { serious: 1, delay: 150 },
            { serious: 2, delay: 200, stop: 80, cycle: 7000, prod: 20 },
            { serious: 2, delay: 250, stop: 80, cycle: 7000, prod: 50 },
        ],
        クリ肥大化: [
            { serious: 1, delay: 60 },
            { serious: 1, delay: 120 },
            { serious: 1, delay: 180 },
            { serious: 2, delay: 240, stop: 80, cycle: 9000, prod: 20 },
            { serious: 3, delay: 300, stop: 80, cycle: 9000, prod: 50 },
        ],
        媚薬: [
            { serious: 1, stop: 80, cycle: 5000, prod: 40, period: 6000, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"] },
            { serious: 2, stop: 160, cycle: 4000, prod: 60, period: 8000, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"] },
            { serious: 2, stop: 240, cycle: 3000, prod: 80, period: 16000, trigger: ["発情"], danger: ["発情"], speak: ["ふわぁっ♡"] },
        ],
    },
    {
        母乳体質: [
            { stop: 400, cycle: 10000, prod: 30, danger: ["母乳分泌"], speak: ["んっ……おっぱい張って……っ"] },
            { stop: 800, cycle: 10000, prod: 30, danger: ["母乳分泌"], speak: ["やっ……母乳がっ……!?"] },
            { stop: 1500, cycle: 8000, prod: 30, danger: ["母乳分泌"], speak: ["だめ……母乳感じて……"] },
        ],
        おもらし癖: [
            { serious: 2, stop: 4000, cycle: 10000, prod: 10, trigger: ["おもらし"], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
            { serious: 3, stop: 4000, cycle: 9000, prod: 20, trigger: ["おもらし"], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
            { serious: 3, stop: 4000, cycle: 8000, prod: 30, trigger: ["おもらし"], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
        ],
        乳首ローター: [
            { serious: 1, stop: 80, cycle: 1500, prod: 10, speak: ["ふゃぁぁ……っ"] },
            { serious: 2, stop: 80, cycle: 1000, prod: 10, speak: ["ふゃぁぁ……っ"] },
            { serious: 2, stop: 80, cycle: 500, prod: 15, speak: ["ふゃぁぁ……っ"] },
        ],
        クリローター: [
            { serious: 1, stop: 80, cycle: 1500, prod: 10, speak: ["ひぁ……っ"] },
            { serious: 2, stop: 80, cycle: 1000, prod: 10, speak: ["ひぁ……っ"] },
            { serious: 2, stop: 80, cycle: 500, prod: 15, speak: ["ひぁ……っ"] },
        ],
        バイブ: [
            { serious: 1, stop: 80, cycle: 800, prod: 5, speak: ["あぁぁ……っ"] },
            { serious: 2, stop: 80, cycle: 700, prod: 10, speak: ["あぁぁ……っ"] },
            { serious: 2, stop: 80, cycle: 600, prod: 15, speak: ["あぁぁ……っ"] },
        ],
    },
    {
        挿入: [
            { serious: 3, stop: 1000, prod: 80, period: 7500, trigger: ["ハメられ"], speak: ["ふあぁんっ♡"] },
        ],
    },
];
class BadStates {
    static maxLevel(name) {
        if (!this.allBadStateMaxLevels)
            this.buildMaxLevels();
        return this.allBadStateMaxLevels[name];
    }
    static buildMaxLevels() {
        const allBadStateMaxLevels = {};
        for (const badStatesInDifficulty of allBadStates) {
            for (const name of Object.keys(badStatesInDifficulty)) {
                allBadStateMaxLevels[name] = badStatesInDifficulty[name].length - 1;
            }
        }
        this.allBadStateMaxLevels = allBadStateMaxLevels;
    }
}
BadStates.all = allBadStates;
BadStates.removeOnBattleEndNames = Object.keys(allBadStates[0]);
class Speak {
    static randomReadySpeak(seriousSpeakIndex) {
        return this.randomHitSpeak(seriousSpeakIndex);
    }
    static randomHitSpeak(seriousSpeakIndex) {
        // TODO: 直前に出したindex出さないようにしたい
        const speaks = this.seriousSpeaks[seriousSpeakIndex].speak;
        return speaks[Math.floor(Math.random() * speaks.length)];
    }
}
Speak.seriousSpeaks = seriousSpeaks;
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
    static setAddMode(baseScene, value) {
        for (const elem of document.querySelectorAll(`[name="addMode"]`)) {
            elem.checked = false;
        }
        document.querySelector(`${baseScene} [name="addMode"][value="${value}"]`).checked = true;
    }
    static updateBadStates(baseScene, previous, current, summary) {
        const summaryContainer = document.querySelector(`${baseScene} .badStatesSummary`);
        summaryContainer.innerHTML = summary.summary;
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
        document.querySelector("#moguraScene .level").textContent = `${moguraGame.stage.level}`;
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
        document.querySelector("#moguraScene .restCount").textContent = `${moguraGame.stage.restCount}`;
        document.querySelector("#moguraScene .successCount").textContent = `${moguraGame.stage.successCount}`;
        document.querySelector("#moguraScene .failCount").textContent = `${moguraGame.stage.failCount}`;
    }
    static updateBadStates(previous, current, effective) {
        View.updateBadStates("#moguraScene", previous, current, effective);
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
    static showInactive() {
        document.querySelector("#moguraScene .inactive").classList.add("show");
    }
    static hideInactive() {
        document.querySelector("#moguraScene .inactive").classList.remove("show");
    }
}
class ResultView {
    static updateInfo() {
        document.querySelector("#resultScene .level").textContent = `${moguraGame.stage.level}`;
        document.querySelector("#resultScene .totalCount").textContent = `${moguraGame.stage.totalCount}`;
        document.querySelector("#resultScene .successCount").textContent = `${moguraGame.stage.successCount}`;
        document.querySelector("#resultScene .failCount").textContent = `${moguraGame.stage.failCount}`;
        document.querySelector("#resultScene .successRate").textContent = `${moguraGame.stage.successRate}`;
    }
    static updateBadStates(previous, current) {
        View.updateBadStates("#resultScene", previous, current, current);
    }
    static setAddMode(value) {
        View.setAddMode("#resultScene", value);
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
    get currentAppearSpeed() { return Math.max(200, 2000 - this.level * 100 - this.passCount * 30); } // TODO:
    get currentHideSpeed() { return Math.max(300, 3000 - this.level * 150 - this.passCount * 30); } // TODO:
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
        const { difficulty, param } = this.findBadState();
        this.difficulty = difficulty;
        this.param = param;
        this.displayLevel = level + 1;
        this.displayName = difficulty ? `${name} Lv.${this.displayLevel}` : name;
        const description = [];
        if (this.param.delay)
            description.push(`反応が${this.param.delay / 1000}秒遅れる`);
        if (this.param.stop)
            description.push(`確率で${this.param.stop / 1000}秒動けなくなる`);
        if (this.param.trigger)
            description.push(`${this.param.trigger.join(", ")}を誘発`);
        if (this.param.period)
            description.push(`${this.param.period / 1000}秒で自然解消`);
        this.description = description.join(" ");
    }
    findBadState() {
        let difficulty = 0;
        for (const badStatesInDifficulty of allBadStates) {
            const badState = badStatesInDifficulty[this.name];
            if (badState) {
                return { difficulty, param: badState[this.level] };
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
    get summary() {
        const summaries = [];
        if (this.totalDelay)
            summaries.push(`敏感になり${this.totalDelay / 1000}秒動きが遅れてしまう`);
        const dangers = [];
        const dangersUniq = {};
        for (const playerBadState of this.badStates) {
            if (playerBadState.param.danger) {
                for (const danger of playerBadState.param.danger) {
                    if (!dangersUniq[danger]) {
                        dangersUniq[danger] = true;
                        dangers.push(...playerBadState.param.danger);
                    }
                }
            }
        }
        if (dangers.length)
            summaries.push(`体が開発され${dangers.join(", ")}の危険がある`);
        return summaries.join("<br>");
    }
}
class Player {
    constructor() {
        this.badStates = [];
    }
    newInGame(moguraGame) {
        return new PlayerInMoguraGame(this, moguraGame);
    }
    snapShotBadState() {
        return new PlayerBadStates([...this.badStates]);
    }
    addBadState(name) {
        const previousIndex = this.badStates.findIndex((badStateLevel) => badStateLevel.name === name);
        let playerBadState;
        if (previousIndex === -1) {
            playerBadState = new PlayerBadState(name);
            this.badStates.push(playerBadState);
        }
        else {
            const previous = this.badStates[previousIndex];
            const nextLevel = previous.level + 1;
            if (nextLevel > BadStates.maxLevel(name))
                return previous;
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
    removeBattleEndBadStates() {
        for (const name of BadStates.removeOnBattleEndNames) {
            this.removeBadState(name);
        }
    }
}
class PlayerInMoguraGame {
    constructor(player, moguraGame) {
        this.speakTimers = [];
        this.triggerStopTimers = {};
        this.removeTimers = {};
        this.inactive = false;
        this.start = () => {
            const playerBadStates = this.effectiveBadStates;
            let offset = 1;
            for (const playerBadState of playerBadStates.badStates) {
                setTimeout(() => this.setBadStateTimer(playerBadState), offset);
                offset += 37; // タイミングがかぶらないように
            }
        };
        this.end = () => {
            MoguraView.hideInactive();
            this.clearTimers();
            this.removeBattleEndBadStates();
        };
        this.hitMogura = (index) => {
            if (this.inactive)
                return;
            this.speakHit();
            const playerBadStates = this.effectiveBadStates;
            if (playerBadStates.totalDelay) {
                setTimeout(() => this.moguraGame.hitMogura(index), playerBadStates.totalDelay);
            }
            else {
                this.moguraGame.hitMogura(index);
            }
        };
        this.player = player;
        this.moguraGame = moguraGame;
        console.log("moguraGame", moguraGame);
        this.startBadStates = this.currentBadStates = player.snapShotBadState();
    }
    get addMode() { return this.player.addMode; }
    get effectiveBadStates() { return this.addMode === "immediate" ? this.currentBadStates : this.startBadStates; }
    addBadState(name) {
        const playerBadState = this.player.addBadState(name);
        this.currentBadStates = this.player.snapShotBadState();
        if (playerBadState)
            this.setBadStateTimer(playerBadState);
        MoguraView.updateBadStates(this.startBadStates, this.currentBadStates, this.effectiveBadStates);
    }
    removeBadState(name) {
        this.clearBadStateTimer(name);
        this.player.removeBadState(name);
        this.currentBadStates = this.player.snapShotBadState();
        MoguraView.updateBadStates(this.startBadStates, this.currentBadStates, this.effectiveBadStates);
    }
    removeBattleEndBadStates() {
        this.player.removeBattleEndBadStates();
        this.currentBadStates = this.player.snapShotBadState();
    }
    clearBadStateTimer(name) {
        if (this.triggerStopTimers[name]) {
            clearTimeout(this.triggerStopTimers[name]);
            delete this.triggerStopTimers[name];
        }
        if (this.removeTimers[name]) {
            clearTimeout(this.removeTimers[name]);
            delete this.removeTimers[name];
        }
    }
    clearTimers() {
        if (this.inactiveTimer)
            clearTimeout(this.inactiveTimer);
        for (const handle of this.speakTimers) {
            if (handle)
                clearTimeout(handle);
        }
        for (const name of Object.keys(this.triggerStopTimers)) {
            clearTimeout(this.triggerStopTimers[name]);
        }
        for (const name of Object.keys(this.removeTimers)) {
            clearTimeout(this.removeTimers[name]);
        }
    }
    setBadStateTimer(playerBadState) {
        if (playerBadState.param.stop) {
            if (!this.triggerStopTimers[name])
                this.timerTriggerStopImmediate(playerBadState.name); // 前にかかっていたのがあったらそれにまかせる
        }
        if (playerBadState.param.period) {
            this.timerRemoveBadState(playerBadState.name, playerBadState.param.period);
        }
    }
    timerTriggerStopImmediate(name, playerBadState = this.effectiveBadStates.find(name)) {
        if (!this.inactive && playerBadState.triggersNow()) {
            this.setInactive(playerBadState.param.stop, () => {
                if (playerBadState.param.trigger) {
                    for (const name of playerBadState.param.trigger) {
                        this.addBadState(name);
                    }
                }
            });
            if (playerBadState.param.speak) {
                this.timerSpeaks(playerBadState.param.speak, playerBadState.param.speakInterval || 1000);
            }
        }
        delete this.triggerStopTimers[name];
        this.timerTriggerStop(name);
    }
    timerTriggerStop(name) {
        if (this.triggerStopTimers[name])
            return; // 前にかかっていたのがあったらそれにまかせる
        const playerBadState = this.effectiveBadStates.find(name);
        if (!playerBadState)
            return; // 解消されている場合
        if (!playerBadState.param.cycle)
            return; // 周期実行でない場合
        this.triggerStopTimers[name] = setTimeout(() => this.timerTriggerStopImmediate(name, playerBadState), playerBadState.param.cycle);
    }
    timerRemoveBadState(name, period) {
        const playerBadState = this.effectiveBadStates.find(name);
        const previousHandle = this.removeTimers[name];
        if (previousHandle)
            clearTimeout(previousHandle); // 前にかかっていたのがあったら期限を更新
        this.removeTimers[name] = setTimeout(() => {
            delete this.removeTimers[name];
            this.removeBadState(name);
            if (playerBadState.param.endTrigger) {
                for (const name of playerBadState.param.endTrigger) {
                    this.addBadState(name);
                }
            }
        }, period);
    }
    timerSpeaks(speaks, interval) {
        const lastIndex = speaks.length - 1;
        for (let index = 0; index <= lastIndex; ++index) {
            this.timerSpeak(speaks[index], index, interval, index === lastIndex);
        }
    }
    timerSpeak(speak, index, interval, last = false) {
        this.speakTimers[index] = setTimeout(() => {
            this.speakTimers[index] = undefined;
            if (last)
                this.speakTimers.length = 0;
            MoguraView.setSpeak(speak);
        }, 1 + index * interval);
    }
    setInactive(period, onEnd) {
        this.inactive = true;
        MoguraView.showInactive();
        this.inactiveTimer = setTimeout(() => {
            delete this.inactiveTimer;
            this.inactive = false;
            MoguraView.hideInactive();
            onEnd();
        }, period);
    }
    speakReady() {
        MoguraView.setSpeak(Speak.randomReadySpeak(this.effectiveBadStates.seriousSpeakIndex));
    }
    speakHit() {
        MoguraView.setSpeak(Speak.randomHitSpeak(this.effectiveBadStates.seriousSpeakIndex));
    }
}
const stages = new Stages();
const player = new Player();
let moguraGame;
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
    constructor(stage, onEnd) {
        this.currentMoguras = {};
        this.currentMoguraHits = {};
        this.ended = false;
        this.start = () => {
            this.appearMogura();
        };
        this.end = () => {
            this.ended = true;
            this.playerInGame.end();
            this.onEnd();
        };
        this.appearMogura = () => {
            if (this.stage.restAppearCount <= 0)
                return;
            const index = this.newMoguraIndex();
            const badStateName = this.newBadStateName();
            this.currentMoguras[index] = badStateName;
            this.stage.appear();
            MoguraView.appearMogura(index, badStateName);
            MoguraView.updateInfo();
            setTimeout(() => this.hideMogura(index), this.stage.currentHideSpeed);
            setTimeout(this.appearMogura, this.stage.currentAppearSpeed);
        };
        this.hideMogura = (index) => {
            MoguraView.hideMogura(index);
            if (this.currentMoguraHits[index]) {
                delete this.currentMoguraHits[index];
            }
            else {
                const badStateName = this.currentMoguras[index];
                this.stage.fail(badStateName);
                this.playerInGame.addBadState(badStateName);
            }
            delete this.currentMoguras[index];
            MoguraView.updateInfo();
            if (this.stage.restCount <= 0 && !this.ended)
                this.end();
        };
        this.hitMogura = (index) => {
            if (this.currentMoguras[index]) {
                this.currentMoguraHits[index] = true;
                this.stage.success();
                MoguraView.updateInfo();
                MoguraView.destroyMogura(index);
            }
        };
        this.stage = stage;
        this.playerInGame = player.newInGame(this);
        this.onEnd = onEnd;
        this.badStateNames = BadStateNames.byDifficulty(stage.badStateDifficulty);
    }
    get currentMoguraCount() { return Object.keys(this.currentMoguras).length; }
    newMoguraIndex() {
        let index = Math.floor(Math.random() * (10 - this.currentMoguraCount));
        while (this.currentMoguras[index])
            index = (index + 1) % 10;
        return index;
    }
    newBadStateName() {
        return this.badStateNames.random();
    }
}
