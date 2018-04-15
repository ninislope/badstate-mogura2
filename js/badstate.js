function asBadStateSetsData(data) { return data; }
;
/** バッドステート群 */
class BadStates {
    static fromData(badStateSets) {
        return new BadStates(Object.keys(badStateSets).reduce((sets, setName, index) => {
            sets[setName] = BadStateSet.fromData(setName, index, badStateSets[setName]);
            return sets;
        }, {}));
    }
    constructor(badStateSets) {
        this.badStateSets = badStateSets;
        this.badStateSetNames = Object.keys(this.badStateSets).sort((a, b) => this.badStateSets[a].index - this.badStateSets[b].index);
    }
    findSet(setName) {
        return this.badStateSets[setName];
    }
}
/** バッドステートセット */
class BadStateSet {
    constructor(name, index, badStates) {
        /*
            available = (stage: number, challenge: number, progress: number) => this.badStates.filter((badState) => badState.isAvailable(stage, challenge, progress));
        */
        this.byProgress = (progress) => this.badStates[progress - 1];
        this.name = name;
        this.index = index;
        this.badStates = badStates;
    }
    static fromData(name, index, badStates) {
        return new BadStateSet(name, index, badStates.map((badState, index) => new BadState(Object.assign({ setName: name, setIndex: index, progress: index + 1, name }, badState))));
    }
    get maxProgress() { return this.badStates.length; }
}
/** バッドステート */
class BadState {
    constructor(param) {
        this.sensitivity = 0;
        this.hideSpeed = 100;
        this.prod = 100;
        this.sensation = 0;
        this.speak = [];
        this.speakInterval = 1000;
        this.trigger = [];
        this.periodDown = 1;
        this.endTrigger = [];
        this.danger = [];
        for (const name of Object.keys(param)) {
            if (param[name] != null)
                this[name] = param[name];
        }
    }
    /** 追加効果発動が必要か */
    get needTrigger() { return Boolean(this.stop || this.speak.length || this.sensation || this.trigger.length); }
    get displayName() { return this.name + (this.level == null ? "" : " " + this.level); }
    /*isAvailable = (stage: number, challenge: number, progress: number) =>
        this.minStage <= stage && this.minChallenge <= challenge && progress === this.progress - 1;
*/
    triggersNow() {
        return Math.random() * 100 < (this.prod || 100);
    }
    randomSpeak() {
        return this.speak.map((speakStep) => speakStep instanceof Array ? speakStep[Math.floor(Math.random() * speakStep.length)] : speakStep);
    }
}
class BadStateDescription {
    constructor(badState, bias = 1) {
        this.badState = badState;
        this.bias = bias;
    }
    get summary() {
        return [
            this.description,
            this.delay,
            this.stop,
            this.period,
            this.sensitivity.join(" "),
        ].filter((str) => Boolean(str)).join(" ");
    }
    get setName() { return this.badState.setName; }
    get displayName() { return this.badState.displayName; }
    get description() { return this.badState.description; }
    get sensitivityObject() {
        if (typeof this.badState.sensitivity === "number") {
            if (this.badState.sensitivity === 0)
                return [];
            return [{ part: "all", rate: this.badState.sensitivity }];
        }
        const descriptions = [];
        for (const part of PlayerSensitivity.parts) {
            const rate = this.badState.sensitivity[part];
            if (rate)
                descriptions.push({ part, rate });
        }
        return descriptions;
    }
    get sensitivity() {
        return this.sensitivityObject.map((desc) => `${PlayerSensitivity.ja(desc.part, true)}感度+${desc.rate}%`);
    }
    get hideSpeed() {
        if (this.badState.hideSpeed > 100) {
            return `通常の${float2(this.badState.hideSpeed / 100)}倍遅く隠れる`;
        }
        else if (this.badState.hideSpeed < 100) {
            return `通常の${float2(100 / this.badState.hideSpeed)}倍速く隠れる`;
        }
        return;
    }
    get delay() { if (this.badState.delay)
        return `反応が${this.biasFormula(this.badState.delay / 1000)}秒遅れる`; }
    get prod() { if (this.badState.needTrigger)
        return `${this.badState.cycle ? `${float2(this.badState.cycle / 1000)}秒に一回` : ""}${this.badState.prod || 100}%の確率で+効果発動`; }
    get stop() { if (this.badState.stop)
        return `+効果発動で${this.biasFormula(this.badState.stop / 1000)}秒動けなくなる`; }
    get sensation() { if (this.badState.sensation)
        return `+効果発動で${this.badState.sensation === 1 ? "等" : this.badState.sensation}倍の快感を得る`; }
    get trigger() { if (this.badState.trigger && this.badState.trigger.length)
        return `+効果発動で${this.badState.trigger.map(param => typeof param === "string" ? param : param.name).join(", ")}を誘発`; }
    get period() { if (this.badState.period)
        return `${this.biasFormula(this.badState.period / 1000)}秒で${this.badState.periodDown === true ? "" : `${this.badState.periodDown}段階`}解消`; }
    get endTrigger() { if (this.badState.endTrigger && this.badState.endTrigger.length)
        return `解消時${this.badState.endTrigger.join(", ")}を誘発`; }
    get count() { if (this.badState.count)
        return `誘発（付与されない場合も含む）されると${this.badState.setName}のカウントが${this.badState.count}回増える`; }
    get countActivate() {
        if (this.badState.countActivate && this.badState.countActivate.length)
            return this.badState.countActivate.map((condition) => `${condition.name}の累計カウントが${condition.count}回以上`).join("、") + "になると付与可能になる";
    }
    get activeCountActivate() {
        if (this.badState.activeCountActivate && this.badState.activeCountActivate.length)
            return this.badState.activeCountActivate.map((condition) => `${condition.name}の付与以降カウントが${condition.count}回以上`).join("、") + "になると付与可能になる";
    }
    get danger() { if (this.badState.danger && this.badState.danger.length)
        return `${this.badState.danger.join("、")}の危険がある`; }
    get stageDown() { if (this.badState.stageDown)
        return this.badState.stageDown === true ? "バトルを終わると解消する" : `バトルを終わると${this.badState.stageDown}段階解消する`; }
    get retryDown() { return this.badState.retryDown ? this.badState.retryDown === true ? "治療で完全に解消する" : `治療をうけると${this.badState.retryDown}段階解消する` : "治療不能"; }
    biasFormula(value) {
        return this.bias === 1 ? `${float2(value)}` : `${float2(value * this.bias)}`;
    }
}
BadStateDescription.ja = {
    setName: "系列名",
    displayName: "名称",
    description: "説明",
    sensitivity: "感度",
    hideSpeed: "スピード",
    delay: "遅延",
    prod: "+効果発動条件",
    stop: "+効果: 行動不能",
    sensation: "+効果: 快感",
    trigger: "+効果: 誘発",
    period: "持続時間",
    endTrigger: "解消時誘発",
    count: "カウント",
    countActivate: "付与条件（累計回数）",
    activeCountActivate: "付与条件（付与以後回数）",
    danger: "危険性",
    stageDown: "バトル後解消",
    retryDown: "治療",
};
function float2(value) {
    return Math.round(value * 100) / 100;
}
