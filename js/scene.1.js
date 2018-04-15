class Scene {
    start() {
    }
    exit() {
    }
    setScene(name) {
        if (!this.scenes)
            this.scenes = document.querySelectorAll(".scene");
        for (const elem of this.scenes) {
            elem.classList.add("hidden");
        }
        document.getElementById(name).classList.remove("hidden");
    }
}
class MainScene extends Scene {
    constructor(player, badStatesContainer, statusesContainer, badStateDiffSource, sensitivityDiffSource) {
        super();
        this.player = player;
        this.badStatesContainer = badStatesContainer;
        this.statusesContainer = statusesContainer;
        this.badStateDiffSource = badStateDiffSource;
        this.sensitivityStatusElements = SensitivityStatusElements.create(player, sensitivityDiffSource);
        this.createStatuses();
    }
    getAddMode() {
        return document.querySelector('[name="addMode"]:checked').value;
    }
    setAddMode(value) {
        for (const elem of document.querySelectorAll(`[name="addMode"]`)) {
            elem.checked = false;
        }
        document.querySelector(`[name="addMode"][value="${value}"]`).checked = true;
    }
    updateBadStates() {
        this.badStatesContainer.innerHTML = "";
        const diff = new PlayerBadStateDiff(player[this.badStateDiffSource], player.badStates);
        for (const diffEntry of diff.sortedBadStateDiffEntries) {
            this.badStatesContainer.appendChild(BadStateListElementGenerator.create(diffEntry));
        }
    }
    updateStatuses() {
        this.sensitivityStatusElements.update();
    }
    createStatuses() {
        const normalContainer = this.statusesContainer.querySelector(".normal");
        const sensitivity1Container = this.statusesContainer.querySelector(".sensitivity1");
        const sensitivity2Container = this.statusesContainer.querySelector(".sensitivity2");
        for (const part of PlayerSensitivity.parts.slice(0, 6)) {
            sensitivity1Container.appendChild(this.sensitivityStatusElements.element(part).container);
        }
        for (const part of PlayerSensitivity.parts.slice(6)) {
            sensitivity2Container.appendChild(this.sensitivityStatusElements.element(part).container);
        }
        sensitivity2Container.appendChild(this.sensitivityStatusElements.element("all").container);
    }
}
class SensitivityStatusElement {
    constructor(container, titleElem, valueElem, rateElem, diffRateElem, isAll = false) {
        this._weak = false;
        this._showRate = false;
        this._minusDiffRate = false;
        this._showDiffRate = false;
        this.container = container;
        this.titleElem = titleElem;
        this.valueElem = valueElem;
        this.rateElem = rateElem;
        this.diffRateElem = diffRateElem;
        this.isAll = isAll;
    }
    static create(title, isAll = false) {
        const li = document.createElement("li");
        li.className = "sensitivityStatus";
        const titleElem = document.createElement("span");
        titleElem.className = "title";
        li.appendChild(titleElem);
        const titleTextElem = document.createElement("span");
        titleTextElem.textContent = title;
        if (title.length > 3) {
            titleTextElem.style.transform = `scale(${2.7 / title.length}, 1)`;
            titleTextElem.style.width = "3em";
            titleTextElem.style.wordBreak = "keep-all";
        }
        titleElem.appendChild(titleTextElem);
        const weakElem = document.createElement("span");
        weakElem.className = "weakMark";
        weakElem.textContent = "★弱点";
        titleElem.appendChild(weakElem);
        const valueElem = document.createElement("span");
        valueElem.className = "value";
        li.appendChild(valueElem);
        const rateElem = document.createElement("span");
        rateElem.className = "rate";
        li.appendChild(rateElem);
        const diffRateElem = document.createElement("span");
        diffRateElem.className = "diffRate";
        diffRateElem.style.position = "relative";
        diffRateElem.style.zIndex = "10";
        li.appendChild(diffRateElem);
        return new this(li, titleElem, valueElem, rateElem, diffRateElem, isAll);
    }
    set value(value) {
        if (this._value === value)
            return;
        this._value = value;
        this.valueElem.textContent = value.toString();
        const color = this.colorCode(Math.log10(value) / (3 + Number(this.isAll)));
        this.valueElem.style.color = color;
        // this.titleElem.style.color = color;
        if (!this.isAll)
            this.weak = value >= 500;
    }
    set rate(rate) {
        if (this._rate === rate)
            return;
        this._rate = rate;
        this.showRate = rate !== 1;
        this.rateElem.textContent = `${(Math.round(rate * 10) / 10).toString()}倍`; // 0.0倍
        this.rateElem.style.color = this.colorCode(Math.log10(rate) / 2);
    }
    set diffRate(diffRate) {
        if (this._diffRate === diffRate)
            return;
        this._diffRate = diffRate;
        this.showDiffRate = Boolean(diffRate);
        if (diffRate) {
            this.minusDiffRate = diffRate < 0;
            this.diffRateElem.textContent = (Math.round(diffRate * 100)).toString(); // 100%
        }
    }
    // all用
    get weak() { return this._weak; }
    set weak(weak) {
        if (this.weak === weak)
            return;
        this._weak = weak;
        if (weak) {
            this.titleElem.classList.add("weak");
        }
        else {
            this.titleElem.classList.remove("weak");
        }
    }
    get showRate() { return this._showRate; }
    set showRate(showRate) {
        if (this.showRate === showRate)
            return;
        this._showRate = showRate;
        if (this.showRate) {
            this.rateElem.classList.add("show");
        }
        else {
            this.rateElem.classList.remove("show");
        }
    }
    get showDiffRate() { return this._showDiffRate; }
    set showDiffRate(showDiffRate) {
        if (this.showDiffRate === showDiffRate)
            return;
        this._showDiffRate = showDiffRate;
        if (this.showDiffRate) {
            this.diffRateElem.classList.add("show");
        }
        else {
            this.diffRateElem.classList.remove("show");
            this.diffRateElem.textContent = "";
        }
    }
    get minusDiffRate() { return this._minusDiffRate; }
    set minusDiffRate(minusDiffRate) {
        if (this.minusDiffRate === minusDiffRate)
            return;
        this._minusDiffRate = minusDiffRate;
        if (this.minusDiffRate) {
            this.diffRateElem.classList.add("minus");
        }
        else {
            this.diffRateElem.classList.remove("minus");
        }
    }
    colorCode(value) {
        return `#${((Math.min(0xff, Math.round(0xff * Math.max(value, 0)))) * 0x10000).toString(16)}`;
    }
}
class SensitivityStatusElements {
    static create(player, diffSource) {
        const elements = {};
        for (let index = 0; index < PlayerSensitivity.parts.length; ++index) {
            const part = PlayerSensitivity.parts[index];
            const partJa = PlayerSensitivity.partsJa[index];
            elements[part] = SensitivityStatusElement.create(partJa);
        }
        elements.all = SensitivityStatusElement.create(PlayerSensitivity.allPartJa, true);
        return new this(player, elements, diffSource);
    }
    constructor(player, elements, diffSource) {
        this.player = player;
        this.elements = elements;
        this.diffSource = diffSource;
    }
    element(part) {
        return this.elements[part];
    }
    update() {
        const initialSensitivity = this.player.initialSensitivity;
        const sensitivity = this.player.sensitivity;
        const diffSensitivity = this.diffSource ? this.player[this.diffSource] : undefined;
        let weakCount = 0;
        for (const part of PlayerSensitivity.parts) {
            const element = this.elements[part];
            element.value = sensitivity[part];
            element.rate = sensitivity[part] / initialSensitivity[part];
            element.diffRate = diffSensitivity ? sensitivity[part] / diffSensitivity[part] - 1 : undefined;
            if (element.weak)
                ++weakCount;
        }
        const initialAll = initialSensitivity.all;
        const all = sensitivity.all;
        const diffAll = diffSensitivity ? diffSensitivity.all : undefined;
        const allElement = this.elements.all;
        allElement.value = all;
        allElement.rate = all / initialAll;
        allElement.diffRate = diffAll ? all / diffAll - 1 : undefined;
        allElement.weak = weakCount === PlayerSensitivity.parts.length; // 全部位が弱点になったら弱点にする
    }
}
class BadStateListElementGenerator {
    static create(diffEntry) {
        switch (diffEntry.type) {
            case "add": return this.createBadStateListElementSingle(diffEntry);
            case "remove": return this.createBadStateListElementSingle(diffEntry);
            case "up": return this.createBadStateListElementDiff(diffEntry);
            case "down": return this.createBadStateListElementDiff(diffEntry);
            case "same": return this.createBadStateListElementSingle(diffEntry);
        }
    }
    static createBadStateListElementSingle(diffEntry) {
        const li = document.createElement("li");
        li.className = diffEntry.type;
        this.addName(li, diffEntry.first);
        this.addDescription(li, diffEntry.first);
        this.addEffectDescription(li, diffEntry.first);
        return li;
    }
    static createBadStateListElementDiff(diffEntry) {
        const before = diffEntry.before;
        const after = diffEntry.after;
        const li = document.createElement("li");
        li.className = diffEntry.type;
        const beforeElem = document.createElement("span");
        beforeElem.className = "before";
        this.addName(beforeElem, before);
        this.addDescription(beforeElem, before);
        this.addEffectDescription(beforeElem, before);
        li.appendChild(beforeElem);
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "→";
        li.appendChild(arrow);
        const afterElem = document.createElement("span");
        afterElem.className = "before";
        this.addName(afterElem, after);
        this.addDescription(afterElem, after);
        this.addEffectDescription(afterElem, after);
        li.appendChild(afterElem);
        return li;
    }
    static addName(container, badState) {
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = badState.displayName;
        container.appendChild(name);
    }
    static addDescription(container, badState) {
        if (badState.description) {
            const description = document.createElement("span");
            description.className = "description";
            description.textContent = badState.description;
            container.appendChild(description);
        }
    }
    static addEffectDescription(container, badState) {
        const effectDescription = badState.effectDescription(player.effectiveRate);
        if (effectDescription) {
            const effect = document.createElement("span");
            effect.className = "effect";
            effect.textContent = effectDescription;
            container.appendChild(effect);
        }
    }
}
class StartScene extends Scene {
    start() {
        console.log("start");
        this.setScene("startScene");
    }
}
class HomeScene extends MainScene {
    constructor(newChallenge, canRepair) {
        super(player, document.querySelector(`#homeScene .badStates`), document.querySelector(`#homeScene .statuses`), "previousChallengeBadStates", "previousChallengeSensitivity");
        this.newChallenge = newChallenge;
        this.canRepair = canRepair;
    }
    start() {
        this.setScene("homeScene");
        this.setAddMode(player.addMode);
        if (this.newChallenge)
            environment.gameChallenges.newGameChallenge();
        this.setStartStageButton();
        this.setRepairButtonState(this.canRepair);
        this.updateBadStates();
        this.updateStatuses();
        const gameChallenge = environment.gameChallenges.currentGameChallenge;
    }
    setStartStageButton() {
        const elem = document.querySelector("#startStageButton");
        const challengeCount = environment.gameChallenges.currentGameChallenge.count;
        if (challengeCount === 1) {
            elem.textContent = "挑戦";
        }
        else {
            elem.textContent = `再挑戦（${challengeCount - 1}回目）`;
        }
    }
    setRepairButtonState(show) {
        const elem = document.querySelector("#repairButton");
        if (show) {
            elem.setAttribute("disabled", "");
        }
        else {
            elem.setAttribute("disabled", "disabled");
        }
    }
}
class RepairScene extends Scene {
    start() {
        this.setScene("repairScene");
        const previousPlayerBadStates = player.downBadStatesOnRetry();
        const gameChallenge = environment.gameChallenges.currentGameChallenge;
        player.resist = gameChallenge.challenge.resist;
        player.sensitiveSpeedBias = gameChallenge.challenge.sensitiveSpeedBias;
    }
}
class StageScene extends Scene {
    constructor(next, firstStage = false) {
        super();
        this.next = next;
        this.firstStage = firstStage;
    }
    start() {
        if (this.next)
            environment.gameChallenges.currentGameChallenge.newGameStage();
        if (this.firstStage) {
            player.addMode = this.getAddMode();
            player.previousChallengeSensitivity = player.sensitivity.copy();
            player.previousChallengeBadStates = player.badStates;
        }
        player.previousStageSensitivity = player.sensitivity.copy();
        player.previousStageBadStates = player.badStates;
        const gameStage = environment.gameChallenges.currentGameChallenge.currentGameStage;
        moguraGame = new MoguraGame(player, gameStage.newGameStageChallenge(), () => sceneState.showResult());
        this.setScene("stageScene");
        MoguraView.setup();
        MoguraView.showStart();
        setTimeout(() => MoguraView.setStart("3"), 1);
        setTimeout(() => MoguraView.setStart("2"), 500);
        setTimeout(() => MoguraView.setStart("1"), 1000);
        setTimeout(() => MoguraView.setStart("START!"), 1500);
        setTimeout(() => {
            MoguraView.hideStart();
            setTimeout(moguraGame.gamePlayer.start, 400);
            setTimeout(moguraGame.start, 400);
        }, 2000);
    }
}
class ResultScene extends Scene {
    start() {
        ResultView.updateBadStates(moguraGame.gamePlayer.startBadStates, moguraGame.gamePlayer.currentBadStates);
        ResultView.updateInfo();
        this.setScene("resultScene");
    }
}
