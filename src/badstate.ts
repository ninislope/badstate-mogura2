type BadStateSetsData = {
    [setName in BadStateSetName]: BadStateData[];
}

type BadStateSetsDataWeak = {
    [setName: string]: BadStateDataWeak[];
}

function asBadStateSetsData<T extends BadStateSetsDataWeak>(data: T) { return data; }

/** 感度上昇(数値の場合は全部位) */
type SensitivityAddition = number | SensitivityDetail;

/** 部位ごとの感度 */
interface SensitivityDetail {
    /** 肌全体 */
    skin?: number;
    /** 右乳首 */
    rightNipple?: number;
    /** 左乳首 */
    leftNipple?: number;
    /** 乳房 */
    bust?: number;
    /** 尿道 */
    urethra?: number;
    /** クリトリス(陰核) */
    clitoris?: number;
    /** 膣 */
    vagina?: number;
    /** ポルチオ(子宮膣部) */
    portio?: number;
    /** 子宮 */
    womb?: number; // uterusだと尿道のUとかぶるので
    /** 尻穴(肛門) */
    anal?: number;
    /** 尻肉 */
    hip?: number;
};

interface SensitivityDescription {
    part: SensitivePartWithAll,
    rate: number;
}

/** 回数有効化条件 */
interface BadStateCountCondition {
    /** バッドステートセット名 */
    name: string;
    /** それが付与された回数 */
    count: number;
}

/** 誘発指定 */
type BadStateTriggerParam = BadStateSetName | BadStateTriggerDetailParam;

interface BadStateTriggerDetailParam {
    name: BadStateSetName;
    progress: number;
}

type BadStateTriggerParamWeak = string | BadStateTriggerDetailParamWeak;

interface BadStateTriggerDetailParamWeak {
    name: string;
    progress: number;
}

/** バッドステートデータ */
interface BadStateData extends BadStateDataWeak {
    name?: BadStateSetName;
    trigger?: BadStateTriggerParam[];
    endTrigger?: BadStateTriggerParam[];
}

interface BadStateDataWeak {
    /** ベース名 */
    name?: string;
    /** レベル表現 */
    level?: string;
    /** 詳細説明 */
    description?: string;
    /** 感度上昇 */
    sensitivity?: SensitivityAddition;
    /** もぐら出現時間バイアス(%) 時間をこれに比例させる */
    hideSpeed?: number;
    /** 遅延(ms) */
    delay?: number;
    /** 追加効果発動周期(ms) */
    cycle?: number;
    /** 追加効果発動確率(%) */
    prod?: number;
    /** 追加効果発動時停止時間(ms) */
    stop?: number;
    /** 追加効果発動時の性的快楽 */
    sensation?: number;
    /** 追加効果発動時台詞 */
    speak?: Array<string | string[]>;
    /** 追加効果発動時台詞発話間隔(ms) */
    speakInterval?: number;
    /** 追加効果発動時誘発バッドステートセット名(停止時は停止後) */
    trigger?: BadStateTriggerParamWeak[];
    /** 持続時間(過ぎると進行度が下がる) */
    period?: number;
    /** 持続時間経過で下がる進行度(デフォルト1 trueなら全回復) */
    periodDown?: number | boolean;
    /** 持続時間終了時誘発バッドステートセット名 */
    endTrigger?: BadStateTriggerParamWeak[];
    /**
     * バッドステート起動（付与されなくても）回数を記録
     *
     * これと一緒にcountActivate等を進行度1で使うとカウントされないので注意
     */
    count?: number;
    /** 有効化に必要なバッドステートセット起動回数 */
    countActivate?: BadStateCountCondition[];
    /** 有効化に必要なバッドステートセット付与以降起動回数 */
    activeCountActivate?: BadStateCountCondition[];
    /** 説明用危険可能性 */
    danger?: string[];
    /** ステージ終了時進行度回復量(trueなら全回復) */
    stageDown?: number | boolean;
    /** 撤退時進行度回復量(trueなら全回復) */
    retryDown?: number | boolean;
}

type BadStateSets = {
    [setName in BadStateSetName]: BadStateSet;
}

/** バッドステート群 */
class BadStates {
    static fromData(badStateSets: BadStateSetsData) {
        return new BadStates(
            (Object.keys(badStateSets) as BadStateSetName[]).reduce((sets, setName, index) => {
                sets[setName] = BadStateSet.fromData(setName, index, badStateSets[setName]);
                return sets;
            }, {} as BadStateSets),
        );
    }

    badStateSets: BadStateSets;
    badStateSetNames: string[];

    constructor(badStateSets: BadStateSets) {
        this.badStateSets = badStateSets;
        this.badStateSetNames = Object.keys(this.badStateSets).sort((a, b) => this.badStateSets[a].index - this.badStateSets[b].index);
    }

    findSet(setName: BadStateSetName) {
        return this.badStateSets[setName];
    }
/*
    available = (stage: number, challenge: number, progress: number) =>
        this.badStateSetNames
        .map((setName) => this.badStateSets[setName].available(stage, challenge, progress))
        .reduce((all, current) => all.concat(current), []);
        */
}

/** バッドステートセット */
class BadStateSet {
    static fromData(name: BadStateSetName, index: number, badStates: BadStateData[]) {
        return new BadStateSet(name, index, badStates.map((badState, index) => new BadState({setName: name, setIndex: index, progress: index + 1, name, ...badState})));
    }

    /** セット名 */
    name: string;
    /** 順番 */
    index: number;
    badStates: BadState[];

    constructor(name: string, index: number, badStates: BadState[]){
        this.name = name;
        this.index = index;
        this.badStates = badStates;
    }

    get maxProgress() { return this.badStates.length; }
/*
    available = (stage: number, challenge: number, progress: number) => this.badStates.filter((badState) => badState.isAvailable(stage, challenge, progress));
*/
    byProgress = (progress: number) => this.badStates[progress - 1];
}

/** バッドステート */
class BadState implements BadStateData {
    name!: BadStateSetName;
    level?: string;
    description?: string;
    sensitivity: SensitivityAddition = 0;
    hideSpeed = 100;
    delay?: number;
    cycle?: number;
    prod = 100;
    stop?: number;
    sensation = 0;
    speak: Array<string | string[]> = [];
    speakInterval = 1000;
    trigger: BadStateTriggerParam[] = [];
    period?: number;
    periodDown: number | boolean = 1;
    endTrigger?: BadStateTriggerParam[] = [];
    count?: number;
    countActivate?: BadStateCountCondition[];
    activeCountActivate?: BadStateCountCondition[];
    danger?: string[] = [];
    stageDown?: number | boolean;
    retryDown?: number | boolean;

    /** バッドステートセット名 */
    setName!: BadStateSetName;
    /** バッドステートセット順番 */
    setIndex!: number;
    /** 進行度 */
    progress!: number;

    constructor(param: BadStateData & {setName: BadStateSetName; setIndex: number; progress: number}) {
        for (const name of Object.keys(param) as Array<keyof BadStateData | "progress" | "setName" | "setIndex">) {
            if (param[name] != null) this[name] = param[name];
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
    static ja = {
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

    badState: BadState;
    bias: number;

    constructor(badState: BadState, bias = 1) {
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
    get sensitivityObject(): SensitivityDescription[] {
        if (typeof this.badState.sensitivity === "number") {
            if (this.badState.sensitivity === 0) return [];
            return [{part: "all", rate: this.badState.sensitivity}];
        }
        const descriptions: SensitivityDescription[] = [];
        for (const part of PlayerSensitivity.parts) {
            const rate = this.badState.sensitivity[part];
            if (rate) descriptions.push({part, rate});
        }
        return descriptions;
    }
    get sensitivity() {
        return this.sensitivityObject.map((desc) => `${PlayerSensitivity.ja(desc.part, true)}感度+${desc.rate}%`);
    }
    get hideSpeed() {
        if (this.badState.hideSpeed > 100) {
            return `通常の${float2(this.badState.hideSpeed / 100)}倍遅く隠れる`;
        } else if (this.badState.hideSpeed < 100) {
            return `通常の${float2(100 / this.badState.hideSpeed)}倍速く隠れる`;
        }
        return;
    }
    get delay() { if (this.badState.delay) return `反応が${this.biasFormula(this.badState.delay / 1000)}秒遅れる`; }
    get prod() { if (this.badState.needTrigger) return `${this.badState.cycle ? `${float2(this.badState.cycle / 1000)}秒に一回` : ""}${this.badState.prod || 100}%の確率で+効果発動`; }
    get stop() { if (this.badState.stop) return `+効果発動で${this.biasFormula(this.badState.stop / 1000)}秒動けなくなる`; }
    get sensation() { if (this.badState.sensation) return `+効果発動で${this.badState.sensation === 1 ? "等" : this.badState.sensation}倍の快感を得る`; }
    get trigger() { if (this.badState.trigger && this.badState.trigger.length) return `+効果発動で${this.badState.trigger.map(param => typeof param === "string" ? param : param.name).join(", ")}を誘発`; }
    get period() { if (this.badState.period) return `${this.biasFormula(this.badState.period / 1000)}秒で${this.badState.periodDown === true ? "" : `${this.badState.periodDown}段階`}解消`; }
    get endTrigger() { if (this.badState.endTrigger && this.badState.endTrigger.length) return `解消時${this.badState.endTrigger.join(", ")}を誘発`; }
    get count() { if (this.badState.count) return `誘発（付与されない場合も含む）されると${this.badState.setName}のカウントが${this.badState.count}回増える`; }
    get countActivate() {
        if (this.badState.countActivate && this.badState.countActivate.length) return this.badState.countActivate.map((condition) =>
            `${condition.name}の累計カウントが${condition.count}回以上`,
        ).join("、") + "になると付与可能になる";
    }
    get activeCountActivate() {
        if (this.badState.activeCountActivate && this.badState.activeCountActivate.length) return this.badState.activeCountActivate.map((condition) =>
            `${condition.name}の付与以降カウントが${condition.count}回以上`,
        ).join("、") + "になると付与可能になる";
    }
    get danger() { if (this.badState.danger && this.badState.danger.length) return `${this.badState.danger.join("、")}の危険がある`; }
    get stageDown() { if (this.badState.stageDown) return this.badState.stageDown === true ? "バトルを終わると解消する" : `バトルを終わると${this.badState.stageDown}段階解消する`; }
    get retryDown() { return this.badState.retryDown ? this.badState.retryDown === true ? "治療で完全に解消する" : `治療をうけると${this.badState.retryDown}段階解消する` : "治療不能"; }

    private biasFormula(value: number) {
        return this.bias === 1 ? `${float2(value)}` : `${float2(value * this.bias)}`;
    }
}

function float2(value: number) {
    return Math.round(value * 100) / 100;
}