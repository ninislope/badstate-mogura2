/** 治療データ */
interface DopeData {
    /** 精神加速(%) もぐらの速度を1/speedBoostにする */
    speedBoost: number;
    /** 精神加速鈍化ステップ(%) */
    speedBoostStep: number;
    /** 精神加速最小値(%) */
    speedBoostMin: number;
    /** 我慢値(%) 感度を1/patienceにする */
    patience: number;
    /** 我慢値減少ステップ(%) */
    patienceStep: number;
    /** 我慢最小値(%) */
    patienceMin: number;
    /** 説明 */
    description: string;
}

class Dope implements DopeData {
    speedBoost: number;
    speedBoostStep: number;
    speedBoostMin: number;
    patience: number;
    patienceStep: number;
    patienceMin: number;
    description: string;

    constructor(param: DopeData) {
        this.speedBoost = param.speedBoost;
        this.speedBoostStep = param.speedBoostStep;
        this.speedBoostMin = param.speedBoostMin;
        this.patience = param.patience;
        this.patienceStep = param.patienceStep;
        this.patienceMin = param.patienceMin;
        this.description = param.description;
    }

    apply(player: Player) {
        player.dope(this);
    }

    get effectDescription() {
        let desc = "";
        if (this.speedBoost >= 100) {
            desc += `精神加速は${this.speedBoost}%になりました。もぐらの速度が1/${float2(this.speedBoost / 100)}倍に見えます。`;
        } else {
            desc += `精神加速が${this.speedBoost}%になりました。もぐらの速度が${float2(1 / this.speedBoost / 100)}倍に見えてしまいます。さらに`;
        }
        desc += `精神加速はステージ挑戦ごとに${this.speedBoostStep}%ずつ鈍化するので注意してください。`;
        if (this.speedBoostMin < 0 && this.speedBoost > 0) desc += `また精神加速が鈍化しつづけると、逆にもぐらが速く見えてついていけなくなる恐れがあります。`;

        if (this.patience >= 100) {
            desc += `我慢値は${this.patience}%になりました。感度が1/${float2(this.patience / 100)}倍に抑えられます。`;
        } else {
            desc += `我慢値が${this.patience}%になりました。感度が${float2(1 / this.patience / 100)}倍に増幅されてしまいます。さらに`;
        }
        desc += `我慢値はステージ挑戦ごとに${this.patienceStep}%ずつ減少するので注意してください。`;
        if (this.patienceMin < 0 && this.patience > 0) desc += `また我慢値が減少しつづけると、逆に感度が上がってしまう恐れがあります。`;
        return desc;
    }
}

class Dopes {
    static fromData(dopes: DopeData[]) {
        return new this(dopes.map(dope => new Dope(dope)));
    }

    dopes: Dope[];

    constructor(dopes: Dope[]) {
        this.dopes = dopes;
    }

    /**
     *
     * @param count 現在のドーピング回数
     */
    byCount(count: number): Dope | undefined {
        return this.dopes[count];
    }
}
