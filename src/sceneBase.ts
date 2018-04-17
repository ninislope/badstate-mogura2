class Scene {
    private scenes!: NodeListOf<Element>;

    start() {

    }

    exit() {

    }

    save() {
        const names = Object.keys(_player);
        return names;
    }

    protected setScene(name: string) {
        if (!this.scenes) this.scenes = document.querySelectorAll(".scene");
        for (const elem of this.scenes) {
            elem.classList.add("hidden");
        }
        document.getElementById(name)!.classList.remove("hidden");
    }
}

class MainScene extends Scene {
    player: Player;
    badStatesContainer: HTMLOListElement | HTMLUListElement;
    statusesContainer: HTMLDivElement;
    badStateDiffSource: "previousStageBadStates" | "previousChallengeBadStates";
    showBadStateDetail: boolean;
    private normalStatusElements!: NormalStatusElements;
    private sensitivityStatusElements: SensitivityStatusElements;

    constructor(
        player: Player,
        badStatesContainer: HTMLOListElement | HTMLUListElement,
        statusesContainer: HTMLDivElement,
        badStateDiffSource: "previousStageBadStates" | "previousChallengeBadStates",
        sensitivityDiffSource: "previousStageSensitivity" | "previousChallengeSensitivity",
        showBadStateDetail = true,
    ) {
        super();
        this.player = player;
        this.badStatesContainer = badStatesContainer;
        this.statusesContainer = statusesContainer;
        this.badStateDiffSource = badStateDiffSource;
        this.showBadStateDetail = showBadStateDetail;
        this.sensitivityStatusElements = SensitivityStatusElements.create(player, sensitivityDiffSource);
        this.setBadStatesView();
        this.createStatuses();
    }

    protected getAddMode() {
        return (document.querySelector('[name="addMode"]:checked') as HTMLInputElement).value as "immediate" | "lazy";
    }

    protected setAddMode(value: "immediate" | "lazy") {
        for (const elem of document.querySelectorAll(`[name="addMode"]`) as NodeListOf<HTMLInputElement>) {
            elem.checked = false;
        }
        (document.querySelector(`[name="addMode"][value="${value}"]`) as HTMLInputElement).checked = true;
    }

    protected updateBadStates() {
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

    protected updateStatuses() {
        this.updateNormalStatuses();
        this.sensitivityStatusElements.update();
    }

    private setBadStatesView() {
        if (this.showBadStateDetail) {
            this.badStatesContainer.classList.add("canShowDetail");
        } else {
            this.badStatesContainer.classList.remove("canShowDetail");
        }
    }

    private createStatuses() {
        this.createNormalStatuses();
        this.createSensitivityStatuses();
    }

    private createNormalStatuses() {
        const normalContainer = this.statusesContainer.querySelector(".normal") as HTMLUListElement;
        normalContainer.innerHTML = "";
        this.normalStatusElements = new NormalStatusElements();
        normalContainer.appendChild(this.normalStatusElements.sensation.container);
        normalContainer.appendChild(this.normalStatusElements.delay.container);
        normalContainer.appendChild(this.normalStatusElements.repair.container);
        normalContainer.appendChild(this.normalStatusElements.resist.container);
        normalContainer.appendChild(this.normalStatusElements.orgasm.container);
        normalContainer.appendChild(this.normalStatusElements.leak.container);
    }

    private updateNormalStatuses() {
        this.normalStatusElements.sensation.update(this.player.sensation);
        this.normalStatusElements.delay.update(this.player.delay / 1000);
        this.normalStatusElements.repair.update(this.player.repairCount);
        this.normalStatusElements.resist.update(this.player.resist);
        this.normalStatusElements.orgasm.update(this.player.orgasmCount);
        this.normalStatusElements.leak.update(this.player.badStates.badStateCounts.おもらし || 0);
    }

    private createSensitivityStatuses() {
        const sensitivity1Container = this.statusesContainer.querySelector(".sensitivity1") as HTMLUListElement;
        const sensitivity2Container = this.statusesContainer.querySelector(".sensitivity2") as HTMLUListElement;
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

    private doShowBadStateDetail(badState: BadState) {
        if (this.showBadStateDetail) BadStateDetailDialog.show(new BadStateDescription(badState, this.player.effectiveRate));
    }
}

class NormalStatusElement {
    static create(title: string, unit: string, colorFunc: (value: number) => number, autoHideZero = false) {
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

        return new this(li, titleElem, valueElem, colorFunc, autoHideZero);
    }

    container: HTMLLIElement; titleElem: HTMLSpanElement; valueElem: HTMLSpanElement;
    colorFunc: (value: number) => number;
    autoHideZero: boolean;

    private _value?: number;
    private _show = true;

    constructor(container: HTMLLIElement, titleElem: HTMLSpanElement, valueElem: HTMLSpanElement, colorFunc: (value: number) => number, autoHideZero = false) {
        this.container = container; this.titleElem = titleElem; this.valueElem = valueElem;
        this.colorFunc = colorFunc;
        this.autoHideZero = autoHideZero;
    }

    update(value: number) {
        this.value = value;
    }

    private set value(value: number) {
        if (this._value === value) return;
        this._value = value;
        if (this.autoHideZero) this.show = value !== 0;
        this.valueElem.textContent = float2(value).toString();
        const color = this.colorCode(this.colorFunc(value));
        this.valueElem.style.color = color;
    }

    private get show() { return this._show; }
    private set show(show) {
        if (this.show === show) return;
        this._show = show;
        if (this.show) {
            this.container.classList.remove("hide");
        } else {
            this.container.classList.add("hide");
        }
    }

    private colorCode(value: number) {
        return `#${((Math.min(0xff, Math.round(0xff * Math.max(value, 0)))) * 0x10000).toString(16)}`;
    }
}

class NormalStatusElements {
    sensation = NormalStatusElement.create("快感", " / 1000", (num) => Math.log10(num + 1) / 3);
    delay = NormalStatusElement.create("遅延", "秒", (num) => Math.log10(num + 1) * 2);
    repair = NormalStatusElement.create("治療回数", "回", (num) => Math.log10(num + 1) / 1.5, true);
    resist = NormalStatusElement.create("抵抗値", "%", (num) => Math.log10(Math.max(0, 0 - num)) / 1.5, true);
    orgasm = NormalStatusElement.create("絶頂回数", "回", (num) => Math.log10(num + 1) / 3);
    leak = NormalStatusElement.create("おもらし回数", "回", (num) => Math.log10(num + 1) / 2, true);
}

class SensitivityStatusElement {
    static create(title: string, isAll = false) {
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

    container: HTMLLIElement; titleElem: HTMLSpanElement; valueElem: HTMLSpanElement; rateElem: HTMLSpanElement; diffRateElem: HTMLSpanElement; diffValueElem: HTMLSpanElement;
    isAll: boolean;

    private _value?: number;
    private _rate?: number;
    private _diffRate?: number;
    private _diffValue?: number;
    private _weak = false;
    private _showRate = false;
    private _minusDiff = false;
    private _showDiff = false;

    constructor(container: HTMLLIElement, titleElem: HTMLSpanElement, valueElem: HTMLSpanElement, rateElem: HTMLSpanElement, diffRateElem: HTMLSpanElement, diffValueElem: HTMLSpanElement, isAll = false) {
        this.container = container; this.titleElem = titleElem; this.valueElem = valueElem; this.rateElem = rateElem; this.diffRateElem = diffRateElem; this.diffValueElem = diffValueElem;
        this.isAll = isAll;
    }

    update(initial: number, current: number, previous?: number) {
        this.value = current;
        this.rate = current / initial;
        this.diffRate = previous ? current / previous - 1 : undefined;
        this.diffValue = previous ? current - previous : undefined;
    }

    // all用
    get weak() { return this._weak; }
    set weak(weak) {
        if (this.weak === weak) return;
        this._weak = weak;
        if (weak) {
            this.container.classList.add("weak");
        } else {
            this.container.classList.remove("weak");
        }
    }

    private set value(value: number) {
        if (this._value === value) return;
        this._value = value;
        this.valueElem.textContent = Math.round(value).toString();
        const color = this.colorCode(Math.log10(value) / (3 + Number(this.isAll)));
        this.valueElem.style.color = color;
        // this.titleElem.style.color = color;
        if (!this.isAll) this.weak = value >= 500;
    }

    private set rate(rate: number) {
        if (this._rate === rate) return;
        this._rate = rate;
        this.showRate = rate !== 1;
        this.rateElem.textContent = `${(Math.round(rate * 10) / 10).toString()}倍`; // 0.0倍
        this.rateElem.style.color = this.colorCode(Math.log10(rate) / 2);
    }

    private set diffRate(diffRate: number | undefined) {
        if (this._diffRate === diffRate) return;
        this._diffRate = diffRate;
        this.showDiff = Boolean(diffRate);
        if (diffRate) {
            this.minusDiff = diffRate < 0;
            this.diffRateElem.textContent = (Math.round(diffRate * 100)).toString(); // 100%
        }
    }

    private set diffValue(diffValue: number | undefined) {
        if (this._diffValue === diffValue) return;
        this._diffValue = diffValue;
        this.showDiff = Boolean(diffValue);
        if (diffValue) {
            this.minusDiff = diffValue < 0;
            this.diffValueElem.textContent = Math.round(diffValue).toString();
        }
    }

    private get showRate() { return this._showRate; }
    private set showRate(showRate) {
        if (this.showRate === showRate) return;
        this._showRate = showRate;
        if (this.showRate) {
            this.rateElem.classList.add("show");
        } else {
            this.rateElem.classList.remove("show");
        }
    }

    private get showDiff() { return this._showDiff; }
    private set showDiff(showDiff) {
        if (this.showDiff === showDiff) return;
        this._showDiff = showDiff;
        if (this.showDiff) {
            this.diffRateElem.classList.add("show");
            this.diffValueElem.classList.add("show");
        } else {
            this.diffRateElem.classList.remove("show");
            this.diffRateElem.textContent = "";
            this.diffValueElem.classList.remove("show");
            this.diffValueElem.textContent = "";
        }
    }

    private get minusDiff() { return this._minusDiff; }
    private set minusDiff(minusDiff) {
        if (this.minusDiff === minusDiff) return;
        this._minusDiff = minusDiff;
        if (this.minusDiff) {
            this.diffRateElem.classList.add("minus");
            this.diffValueElem.classList.add("minus");
        } else {
            this.diffRateElem.classList.remove("minus");
            this.diffValueElem.classList.remove("minus");
        }
    }

    private colorCode(value: number) {
        return `#${((Math.min(0xff, Math.round(0xff * Math.max(value, 0)))) * 0x10000).toString(16)}`;
    }
}

class SensitivityStatusElements {
    static create(player: Player, diffSource?: "previousStageSensitivity" | "previousChallengeSensitivity") {
        const elements = {} as {[part in SensitivePartWithAll]: SensitivityStatusElement};
        for (let index = 0; index < PlayerSensitivity.parts.length; ++index) {
            const part = PlayerSensitivity.parts[index];
            const partJa = PlayerSensitivity.partsJa[index];
            elements[part] = SensitivityStatusElement.create(partJa);
        }
        elements.all = SensitivityStatusElement.create(PlayerSensitivity.allPartJa, true);

        return new this(player, elements, diffSource);
    }

    player: Player;
    elements: {[part in SensitivePartWithAll]: SensitivityStatusElement};
    diffSource?: "previousStageSensitivity" | "previousChallengeSensitivity";

    constructor(player: Player, elements: {[part in SensitivePartWithAll]: SensitivityStatusElement}, diffSource?: "previousStageSensitivity" | "previousChallengeSensitivity") {
        this.player = player;
        this.elements = elements;
        this.diffSource = diffSource;
    }

    element(part: SensitivePartWithAll) {
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
            if (element.weak) ++weakCount;
        }

        const allElement = this.elements.all;
        allElement.update(initialSensitivity.all, sensitivity.all, diffSensitivity ? diffSensitivity.all : undefined);
        allElement.weak = weakCount === PlayerSensitivity.parts.length; // 全部位が弱点になったら弱点にする
    }
}

interface BadStateListElement {
    li: HTMLLIElement;
    entries: Array<{badState: BadState; elem: HTMLElement}>;
}

class BadStateListElementGenerator {
    static create(player: Player, diffEntry: PlayerBadStateDiffEntry) {
        switch (diffEntry.type) {
            case "add": return this.createBadStateListElementSingle(player, diffEntry);
            case "remove": return this.createBadStateListElementSingle(player, diffEntry);
            case "up": return this.createBadStateListElementDiff(player, diffEntry);
            case "down": return this.createBadStateListElementDiff(player, diffEntry);
            case "same": return this.createBadStateListElementSingle(player, diffEntry);
        }
    }

    private static createBadStateListElementSingle(player: Player, diffEntry: PlayerBadStateDiffEntry): BadStateListElement {
        const li = document.createElement("li");
        li.classList.add("diff", "badState", diffEntry.type);
        const badState = diffEntry.first;
        this.addName(li, badState);
        this.addEffect(player, li, badState);
        return {li, entries: [{elem: li, badState}]};
    }

    private static createBadStateListElementDiff(player: Player, diffEntry: PlayerBadStateDiffEntry): BadStateListElement {
        const before = diffEntry.before as BadState;
        const after = diffEntry.after as BadState;
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
        return {li, entries: [{elem: beforeElem, badState: before}, {elem: afterElem, badState: after}]};
    }

    private static addName(container: HTMLElement, badState: BadState) {
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = badState.displayName;
        container.appendChild(name);
    }

    private static addEffect(player: Player, container: HTMLElement, badState: BadState) {
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
    private static effects: Array<keyof BadStateDescription> = [
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
    private static elem?: BadStateDetailDialogElems;

    static show(desc: BadStateDescription) {
        if (!this.elem) this.elem = new BadStateDetailDialogElems();

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
            if (effectElem) this.elem.effects.appendChild(effectElem);
        }
    }

    static hide() {
        if (!this.elem) this.elem = new BadStateDetailDialogElems();
        this.elem.container.classList.add("hide");
    }

    private static display(desc: BadStateDescription, prop: keyof BadStateDetailDialogElems & keyof BadStateDescription) {
        if (!this.elem) this.elem = new BadStateDetailDialogElems();
        const description = desc[prop];
        if (description) {
            this.elem[prop].textContent = description.toString();
            this.elem[prop].classList.remove("hide");
        } else {
            this.elem[prop].classList.add("hide");
        }
    }

    private static createSensitivityElement(sdesc: SensitivityDescription) {
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

    private static createEffectElement(desc: BadStateDescription, prop: keyof BadStateDescription) {
        const value = desc[prop];
        if (!value) return;
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

class BadStateDetailDialogElems {
    container = document.querySelector(".badStateDetail") as HTMLDivElement;
    displayName = this.container.querySelector(".displayName") as HTMLSpanElement;
    description = this.container.querySelector(".description") as HTMLSpanElement;
    sensitivity = this.container.querySelector(".sensitivity") as HTMLUListElement;
    effects = this.container.querySelector(".effects") as HTMLUListElement;
}
