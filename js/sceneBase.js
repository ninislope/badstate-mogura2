"use strict";
class Scene {
    start() {
    }
    exit() {
    }
    save() {
        const names = Object.keys(_player);
        return names;
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
    constructor(player, badStatesContainer, statusesContainer, logsContainer, badStateDiffSource, sensitivityDiffSource, showBadStateDetail = true) {
        super();
        this.shownlogsCount = 0;
        this.player = player;
        this.badStatesContainer = badStatesContainer;
        this.statusesContainer = statusesContainer;
        this.logsContainer = logsContainer;
        this.badStateDiffSource = badStateDiffSource;
        this.showBadStateDetail = showBadStateDetail;
        this.sensitivityStatusElements = SensitivityStatusElements.create(player, sensitivityDiffSource);
        this.setBadStatesView();
        this.createStatuses();
        this.showlogsFirst();
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
        const diff = new PlayerBadStateDiff(this.player[this.badStateDiffSource], this.player.badStates);
        for (const diffEntry of diff.sortedBadStateDiffEntries) {
            const element = BadStateListElementGenerator.create(this.player, diffEntry);
            this.badStatesContainer.appendChild(element.li);
            if (this.showBadStateDetail) {
                for (const entry of element.entries) {
                    entry.elem.onclick = () => this.doShowBadStateDetail(entry.badState);
                }
            }
        }
    }
    updateStatuses() {
        this.updateNormalStatuses();
        this.sensitivityStatusElements.update();
    }
    updateLogs() {
        const newLogs = this.player.logs.slice(0, this.player.logs.length - this.shownlogsCount);
        this.logsContainer.insertBefore(this.createLogsFragment(newLogs), this.logsContainer.firstChild);
        this.shownlogsCount = this.player.logs.length;
    }
    showlogsFirst() {
        this.logsContainer.appendChild(this.createLogsFragment(this.player.logs));
        this.shownlogsCount = this.player.logs.length;
        this.logsContainer.scrollTop = 0;
    }
    createLogsFragment(logs) {
        const fragment = document.createDocumentFragment();
        for (const log of this.player.logs) {
            fragment.appendChild(log);
        }
        return fragment;
    }
    setBadStatesView() {
        if (this.showBadStateDetail) {
            this.badStatesContainer.classList.add("canShowDetail");
        }
        else {
            this.badStatesContainer.classList.remove("canShowDetail");
        }
    }
    createStatuses() {
        this.createNormalStatuses();
        this.createSensitivityStatuses();
    }
    createNormalStatuses() {
        const normalContainer = this.statusesContainer.querySelector(".normal");
        normalContainer.innerHTML = "";
        this.normalStatusElements = new NormalStatusElements();
        normalContainer.appendChild(this.normalStatusElements.sensation.container);
        normalContainer.appendChild(this.normalStatusElements.delay.container);
        normalContainer.appendChild(this.normalStatusElements.repair.container);
        normalContainer.appendChild(this.normalStatusElements.resist.container);
        normalContainer.appendChild(this.normalStatusElements.sensitiveSpeedBias.container);
        normalContainer.appendChild(this.normalStatusElements.dope.container);
        normalContainer.appendChild(this.normalStatusElements.speedBoost.container);
        normalContainer.appendChild(this.normalStatusElements.patience.container);
        normalContainer.appendChild(this.normalStatusElements.orgasm.container);
        normalContainer.appendChild(this.normalStatusElements.leak.container);
        normalContainer.appendChild(this.normalStatusElements.milk.container);
    }
    updateNormalStatuses() {
        this.normalStatusElements.sensation.update(this.player.sensation);
        this.normalStatusElements.delay.update(this.player.delay / 1000);
        this.normalStatusElements.repair.update(this.player.repairCount);
        this.normalStatusElements.resist.update(this.player.resist);
        this.normalStatusElements.sensitiveSpeedBias.update(this.player.sensitiveSpeedBias / 100);
        this.normalStatusElements.dope.update(this.player.dopeCount);
        this.normalStatusElements.speedBoost.update(this.player.speedBoost);
        this.normalStatusElements.patience.update(this.player.patience);
        this.normalStatusElements.orgasm.update(this.player.orgasmCount);
        this.normalStatusElements.leak.update(this.player.badStates.badStateCounts.おもらし || 0);
        this.normalStatusElements.milk.update(this.player.badStates.badStateCounts.母乳濡れ || 0);
    }
    createSensitivityStatuses() {
        const sensitivity1Container = this.statusesContainer.querySelector(".sensitivity1");
        const sensitivity2Container = this.statusesContainer.querySelector(".sensitivity2");
        sensitivity1Container.innerHTML = "";
        sensitivity2Container.innerHTML = "";
        for (const part of PlayerSensitivity.parts.slice(0, 5)) {
            sensitivity1Container.appendChild(this.sensitivityStatusElements.element(part).container);
        }
        for (const part of PlayerSensitivity.parts.slice(5)) {
            sensitivity2Container.appendChild(this.sensitivityStatusElements.element(part).container);
        }
        sensitivity2Container.appendChild(this.sensitivityStatusElements.element("all").container);
    }
    doShowBadStateDetail(badState) {
        if (this.showBadStateDetail)
            BadStateDetailDialog.show(new BadStateDescription(badState, this.player.effectiveRate));
    }
}
class NormalStatusElement {
    constructor(container, titleElem, valueElem, colorFunc, autoHide) {
        this._show = true;
        this.container = container;
        this.titleElem = titleElem;
        this.valueElem = valueElem;
        this.colorFunc = colorFunc;
        this.autoHide = autoHide;
    }
    static create(title, unit, colorFunc, autoHide) {
        const li = document.createElement("li");
        li.className = "normalStatus";
        const titleElem = document.createElement("span");
        titleElem.className = "title";
        li.appendChild(titleElem);
        const titleTextElem = document.createElement("span");
        titleTextElem.textContent = title;
        if (title.length > 5) {
            titleTextElem.style.transform = `scale(${4.5 / title.length}, 1)`;
            titleTextElem.style.width = "5em";
            titleTextElem.style.wordBreak = "keep-all";
        }
        titleElem.appendChild(titleTextElem);
        const valueElem = document.createElement("span");
        valueElem.className = "value";
        li.appendChild(valueElem);
        const unitElem = document.createElement("span");
        unitElem.className = "unit";
        unitElem.textContent = unit;
        li.appendChild(unitElem);
        return new this(li, titleElem, valueElem, colorFunc, autoHide);
    }
    update(value) {
        this.value = value;
    }
    set value(value) {
        if (this._value === value)
            return;
        this._value = value;
        if (this.autoHide !== undefined)
            this.show = value !== this.autoHide;
        this.valueElem.textContent = float2(value).toString();
        const color = this.colorCode(this.colorFunc(value));
        this.valueElem.style.color = color;
    }
    get show() { return this._show; }
    set show(show) {
        if (this.show === show)
            return;
        this._show = show;
        if (this.show) {
            this.container.classList.remove("hide");
        }
        else {
            this.container.classList.add("hide");
        }
    }
    colorCode(value) {
        return `#${((Math.min(0xff, Math.round(0xff * Math.max(value, 0)))) * 0x10000).toString(16)}`;
    }
}
class NormalStatusElements {
    constructor() {
        this.sensation = NormalStatusElement.create("快感", " / 1000", (num) => Math.log10(num + 1) / 3);
        this.delay = NormalStatusElement.create("遅延", "秒", (num) => Math.log10(num + 1) * 2);
        this.repair = NormalStatusElement.create("治療回数", "回", (num) => Math.log10(num + 1) / 1.5, 0);
        this.resist = NormalStatusElement.create("抵抗値", "%", (num) => Math.log10(Math.max(0, 0 - num)) / 1.5, 0);
        this.sensitiveSpeedBias = NormalStatusElement.create("感度上昇速度", "倍", (num) => Math.log10(num), 1);
        this.dope = NormalStatusElement.create("ドーピング数", "回", (num) => Math.log10(Math.max(0, num + 1)) / 1.5, 0);
        this.speedBoost = NormalStatusElement.create("精神加速", "%", (num) => Math.log10(Math.max(0, 100 - num)) / 1.9, 100);
        this.patience = NormalStatusElement.create("我慢値", "%", (num) => Math.log10(Math.max(0, 100 - num)) / 1.9, 100);
        this.orgasm = NormalStatusElement.create("絶頂回数", "回", (num) => Math.log10(num + 1) / 3);
        this.leak = NormalStatusElement.create("おもらし回数", "回", (num) => Math.log10(num + 1) / 2, 0);
        this.milk = NormalStatusElement.create("射乳回数", "回", (num) => Math.log10(num + 1) / 2, 0);
    }
}
class SensitivityStatusElement {
    constructor(container, titleElem, valueElem, rateElem, diffRateElem, diffValueElem, isAll = false) {
        this._weak = false;
        this._showRate = false;
        this._minusDiff = false;
        this._showDiff = false;
        this.container = container;
        this.titleElem = titleElem;
        this.valueElem = valueElem;
        this.rateElem = rateElem;
        this.diffRateElem = diffRateElem;
        this.diffValueElem = diffValueElem;
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
        li.appendChild(diffRateElem);
        const diffValueElem = document.createElement("span");
        diffValueElem.className = "diffValue";
        li.appendChild(diffValueElem);
        return new this(li, titleElem, valueElem, rateElem, diffRateElem, diffValueElem, isAll);
    }
    update(initial, current, previous) {
        this.value = current;
        this.rate = current / initial;
        this.diffRate = previous ? current / previous - 1 : undefined;
        this.diffValue = previous ? current - previous : undefined;
    }
    // all用
    get weak() { return this._weak; }
    set weak(weak) {
        if (this.weak === weak)
            return;
        this._weak = weak;
        if (weak) {
            this.container.classList.add("weak");
        }
        else {
            this.container.classList.remove("weak");
        }
    }
    set value(value) {
        if (this._value === value)
            return;
        this._value = value;
        this.valueElem.textContent = Math.round(value).toString();
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
        this.showDiff = Boolean(diffRate);
        if (diffRate) {
            this.minusDiff = diffRate < 0;
            this.diffRateElem.textContent = (Math.round(diffRate * 100)).toString(); // 100%
        }
    }
    set diffValue(diffValue) {
        if (this._diffValue === diffValue)
            return;
        this._diffValue = diffValue;
        this.showDiff = Boolean(diffValue);
        if (diffValue) {
            this.minusDiff = diffValue < 0;
            this.diffValueElem.textContent = Math.round(diffValue).toString();
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
    get showDiff() { return this._showDiff; }
    set showDiff(showDiff) {
        if (this.showDiff === showDiff)
            return;
        this._showDiff = showDiff;
        if (this.showDiff) {
            this.diffRateElem.classList.add("show");
            this.diffValueElem.classList.add("show");
        }
        else {
            this.diffRateElem.classList.remove("show");
            this.diffRateElem.textContent = "";
            this.diffValueElem.classList.remove("show");
            this.diffValueElem.textContent = "";
        }
    }
    get minusDiff() { return this._minusDiff; }
    set minusDiff(minusDiff) {
        if (this.minusDiff === minusDiff)
            return;
        this._minusDiff = minusDiff;
        if (this.minusDiff) {
            this.diffRateElem.classList.add("minus");
            this.diffValueElem.classList.add("minus");
        }
        else {
            this.diffRateElem.classList.remove("minus");
            this.diffValueElem.classList.remove("minus");
        }
    }
    colorCode(value) {
        return `#${((Math.min(0xff, Math.round(0xff * Math.max(value, 0)))) * 0x10000).toString(16)}`;
    }
}
class SensitivityStatusElements {
    constructor(player, elements, diffSource) {
        this.player = player;
        this.elements = elements;
        this.diffSource = diffSource;
    }
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
            element.update(initialSensitivity[part], sensitivity[part], diffSensitivity ? diffSensitivity[part] : undefined);
            if (element.weak)
                ++weakCount;
        }
        const allElement = this.elements.all;
        allElement.update(initialSensitivity.all, sensitivity.all, diffSensitivity ? diffSensitivity.all : undefined);
        allElement.weak = weakCount === PlayerSensitivity.parts.length; // 全部位が弱点になったら弱点にする
    }
}
class BadStateListElementGenerator {
    static create(player, diffEntry) {
        switch (diffEntry.type) {
            case "add": return this.createBadStateListElementSingle(player, diffEntry);
            case "remove": return this.createBadStateListElementSingle(player, diffEntry);
            case "up": return this.createBadStateListElementDiff(player, diffEntry);
            case "down": return this.createBadStateListElementDiff(player, diffEntry);
            case "same": return this.createBadStateListElementSingle(player, diffEntry);
        }
    }
    static createBadStateListElementSingle(player, diffEntry) {
        const li = document.createElement("li");
        li.classList.add("diff", "badState", diffEntry.type);
        const badState = diffEntry.first;
        this.addName(li, badState);
        this.addEffect(player, li, badState);
        return { li, entries: [{ elem: li, badState }] };
    }
    static createBadStateListElementDiff(player, diffEntry) {
        const before = diffEntry.before;
        const after = diffEntry.after;
        const li = document.createElement("li");
        li.classList.add("diff", diffEntry.type);
        const beforeElem = document.createElement("span");
        beforeElem.classList.add("badState", "before");
        this.addName(beforeElem, before);
        this.addEffect(player, beforeElem, before);
        li.appendChild(beforeElem);
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "→";
        li.appendChild(arrow);
        const afterElem = document.createElement("span");
        afterElem.classList.add("badState", "after");
        this.addName(afterElem, after);
        this.addEffect(player, afterElem, after);
        li.appendChild(afterElem);
        return { li, entries: [{ elem: beforeElem, badState: before }, { elem: afterElem, badState: after }] };
    }
    static addName(container, badState) {
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = badState.displayName;
        container.appendChild(name);
    }
    static addEffect(player, container, badState) {
        const description = new BadStateDescription(badState, player.effectiveRate).summary;
        if (description) {
            const effect = document.createElement("span");
            effect.className = "effect";
            effect.textContent = description;
            container.appendChild(effect);
        }
    }
}
class BadStateDetailDialog {
    static show(desc) {
        if (!this.elem)
            this.elem = new BadStateDetailDialogElems();
        this.elem.container.classList.remove("hide");
        this.display(desc, "displayName");
        this.display(desc, "description");
        this.elem.sensitivity.innerHTML = "";
        const sensitivity = desc.sensitivityObject;
        if (sensitivity.length) {
            for (const sdesc of sensitivity) {
                this.elem.sensitivity.appendChild(this.createSensitivityElement(sdesc));
            }
        }
        this.elem.effects.innerHTML = "";
        for (const prop of this.effects) {
            const effectElem = this.createEffectElement(desc, prop);
            if (effectElem)
                this.elem.effects.appendChild(effectElem);
        }
    }
    static hide() {
        if (!this.elem)
            this.elem = new BadStateDetailDialogElems();
        this.elem.container.classList.add("hide");
    }
    static display(desc, prop) {
        if (!this.elem)
            this.elem = new BadStateDetailDialogElems();
        const description = desc[prop];
        if (description) {
            this.elem[prop].textContent = description.toString();
            this.elem[prop].classList.remove("hide");
        }
        else {
            this.elem[prop].classList.add("hide");
        }
    }
    static createSensitivityElement(sdesc) {
        const li = document.createElement("li");
        li.className = "sensitivityDescription";
        const part = document.createElement("span");
        part.className = "part";
        part.textContent = `${PlayerSensitivity.ja(sdesc.part, true)}`;
        li.appendChild(part);
        const rate = document.createElement("span");
        rate.className = "rate";
        rate.textContent = sdesc.rate.toString();
        li.appendChild(rate);
        return li;
    }
    static createEffectElement(desc, prop) {
        const value = desc[prop];
        if (!value)
            return;
        const name = BadStateDescription.ja[prop];
        const li = document.createElement("li");
        li.className = "effect";
        const nameElem = document.createElement("span");
        nameElem.className = "name";
        nameElem.textContent = name;
        li.appendChild(nameElem);
        const valueElem = document.createElement("span");
        valueElem.className = "value";
        valueElem.textContent = value.toString();
        li.appendChild(valueElem);
        return li;
    }
}
BadStateDetailDialog.effects = [
    "hideSpeed",
    "delay",
    "prod",
    "stop",
    "sensation",
    "trigger",
    "period",
    "endTrigger",
    "count",
    "countActivate",
    "activeCountActivate",
    "danger",
    "stageDown",
    "retryDown",
];
class BadStateDetailDialogElems {
    constructor() {
        this.container = document.querySelector(".badStateDetail");
        this.displayName = this.container.querySelector(".displayName");
        this.description = this.container.querySelector(".description");
        this.sensitivity = this.container.querySelector(".sensitivity");
        this.effects = this.container.querySelector(".effects");
    }
}
