/** 治療データ */
interface RepairData {
    /** 抵抗値(この%分だけ効果を削る) */
    resist: number;
    /** 抵抗値(%)減少ステップ */
    resistStep: number;
    /** 抵抗値最小値(デフォルト0) */
    resistMin?: number;
    /** 感度上昇速度バイアス(%) */
    sensitiveSpeedBias: number;
    /** 説明 */
    description: string;
}

class Repair implements RepairData {
    resist: number;
    resistStep: number;
    resistMin: number;
    sensitiveSpeedBias: number;
    description: string;

    constructor(param: RepairData) {
        this.resist = param.resist;
        this.resistStep = param.resistStep;
        this.resistMin = param.resistMin || 0;
        this.sensitiveSpeedBias = param.sensitiveSpeedBias;
        this.description = param.description;
    }

    apply(player: Player) {
        ++player.repairCount;
        player.resist = this.resist;
        player.resistStep = this.resistStep;
        player.resistMin = this.resistMin;
        player.sensitiveSpeedBias = this.sensitiveSpeedBias;
        player.downBadStatesOnRetry();
    }

    get effectDescription() {
        let desc = "";
        if (this.resist > 0) {
            desc += `抵抗値は${this.resist}%になりました。その分だけ遅延時間・停止時間・持続時間・快感上昇速度が抑えられます。`;
        } else {
            desc += `抵抗値が${this.resist}%になりました。その分だけ遅延時間・停止時間・持続時間・快感上昇速度が加速されてしまいます。さらに`;
        }
        desc += `これはステージ挑戦ごとに${this.resistStep}%ずつ減るので注意してください。`;
        if (this.resistMin < 0 && this.resist > 0) desc += `また抵抗値が減りつづけるとマイナスになり、逆に快感上昇などが加速してしまう恐れがあります。`;
        if (this.sensitiveSpeedBias > 100) desc += `副作用として感度上昇速度が${this.sensitiveSpeedBias / 100}倍になるようです。`;
        return desc;
    }
}

class Repairs {
    static fromData(repairs: RepairData[]) {
        return new this(repairs.map(repair => new Repair(repair)));
    }

    repairs: Repair[];

    constructor(repairs: Repair[]) {
        this.repairs = repairs;
    }

    /**
     *
     * @param count 現在の治療済み回数
     */
    byCount(count: number): Repair | undefined {
        return this.repairs[count];
    }
}
