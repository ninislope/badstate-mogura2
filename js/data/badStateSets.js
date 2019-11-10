"use strict";
/**
 * バッドステート
 *
 * 説明は https://github.com/ninislope/badstate-mogura2/blob/master/src/badstate.ts#L75
 *
 * - もぐらで付与されるもの
 * - 別バステから付与されるもの（ハメられなど）
 * - 回数カウントで有効化され、かつ別バステから付与されるもの（連続絶頂体質など）
 * - プログラム的に条件で付与されるもの（子宮屈服なら絶頂時に屈服絶頂余韻もつく など）
 * - 付与回数の中間計算に用いられてすぐ解消し、実際の効果を持たないもの（露出快感など）
 * などバリエーションがあることに注意
 *
 * 入力中のチェックは
 *
 * ```
 * const badStateSets: BadStateSetsDataWeak = ({...});
 * ```
 *
 * コンパイル時は
 *
 * ```
 * const badStateSets = ({...});
 * ```
 */
const badStateSets = ({
    // 絶頂系
    絶頂余韻: [
        { level: "Lv.1", sensitivity: { vagina: 20, womb: 20 }, delay: 100, period: 3000, retryDown: true },
        // 1段階ずつ解消して影響の減少を表現
        ...Array.from({ length: 499 }, (_, index) => ({ level: `Lv.${index + 2}`, sensitivity: { vagina: 25 + index * 5, womb: 25 + index * 5 }, delay: 100 + index * 10, period: Math.max(500 - index * 5, 100), retryDown: true })),
    ],
    屈服絶頂余韻: [
        // 絶頂余韻も同時起動する 感度などはそちらで
        // 余韻の1/3だけ行動できない
        { level: "Lv.1", stop: 1000, period: 1000, stageDown: true, trigger: ["絶頂余韻"] },
        ...Array.from({ length: 499 }, (_, index) => {
            let sum = 0;
            let index2 = Math.min(index, 98);
            while (index2)
                sum += index2--;
            const time = (3000 + 500 * (index + 1) - sum * 5) / 3; // Lv.100あたりまでは絶頂余韻と同じ時間 / 3
            return { level: `Lv.${index + 2}`, stop: time, period: time, stageDown: true };
        }),
    ],
    絶頂: 
    // [特殊]: 絶頂時に自動付与 回数カウント・感度上昇用
    // 回数カウントと感度上昇だけして即時解消(快感もあがるがその後で解消される)
    Array.from({ length: 500 }, (_, index) => ({ period: 0, periodDown: true, count: 1 + index, sensation: 1, sensitivity: 10 + 5 * index, trigger: ["子宮屈服", "連続絶頂体質"], onceLog: "して" })),
    /*
    {period: 0, count:  1, sensation: 1, sensitivity:  10, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  2, sensation: 1, sensitivity:  20, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  3, sensation: 1, sensitivity:  30, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  4, sensation: 1, sensitivity:  40, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  5, sensation: 1, sensitivity:  50, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  6, sensation: 1, sensitivity:  60, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  7, sensation: 1, sensitivity:  70, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  8, sensation: 1, sensitivity:  80, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count:  9, sensation: 1, sensitivity:  90, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 10, sensation: 1, sensitivity: 100, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 11, sensation: 1, sensitivity: 110, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 12, sensation: 1, sensitivity: 120, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 13, sensation: 1, sensitivity: 130, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 14, sensation: 1, sensitivity: 140, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 15, sensation: 1, sensitivity: 150, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 16, sensation: 1, sensitivity: 160, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 17, sensation: 1, sensitivity: 170, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 18, sensation: 1, sensitivity: 180, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 19, sensation: 1, sensitivity: 190, trigger: ["子宮屈服", "連続絶頂体質"]},
    {period: 0, count: 20, sensation: 1, sensitivity: 200, trigger: ["子宮屈服", "連続絶頂体質"]},
,*/
    連続絶頂体質: [
        { countActivate: [{ name: "絶頂", count: 200 }], level: "Lv.1", description: "絶頂時20%快感が残ってしまう" },
        { countActivate: [{ name: "絶頂", count: 400 }], level: "Lv.2", description: "絶頂時40%快感が残ってしまう" },
        { countActivate: [{ name: "絶頂", count: 1000 }], level: "Lv.3", description: "絶頂時60%快感が残ってしまう" },
        { countActivate: [{ name: "絶頂", count: 3000 }], level: "Lv.4", description: "絶頂時80%快感が残ってしまう" },
    ],
    子宮屈服: [
        { countActivate: [{ name: "絶頂", count: 500 }], description: "絶頂で動けなくなってしまう" },
    ],
    // 汎用
    膣内射精: [
        { sensation: 4, sensitivity: { vagina: 20, womb: 20 }, delay: 300, stop: 1000, prod: 100, period: 4000, stageDown: 1, speak: ["いやぁぁぁぁぁっ♡"], onceLog: "されて" },
    ],
    発情: [
        { level: "（軽度）", sensitivity: 20, count: 1, period: 8000, retryDown: 1 },
        { level: "（中度）", sensitivity: 50, count: 1, period: 8000, retryDown: 1, activeCountActivate: [{ name: "発情", count: 3 }] },
        { level: "（重度）", sensitivity: 100, count: 1, period: 8000, retryDown: 2, activeCountActivate: [{ name: "発情", count: 8 }] },
    ],
    // 三点
    "乳首敏感(左)": [
        { level: "Lv.1", sensitivity: { leftNipple: 5 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.2", sensitivity: { leftNipple: 10 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.3", sensitivity: { leftNipple: 20 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.4", sensitivity: { leftNipple: 40 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.Max", sensitivity: { leftNipple: 100 }, sensation: 0.5, retryDown: 1 },
        { name: "左乳首弄り", sensitivity: { leftNipple: 100 }, sensation: 1, stop: 100, period: 100, stageDown: 1, speak: ["ひゃぁんっ♡"], hideSpeed: 50, onceLog: "を受けて" },
    ],
    "乳首敏感(右)": [
        { level: "Lv.1", sensitivity: { rightNipple: 5 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.2", sensitivity: { rightNipple: 10 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.3", sensitivity: { rightNipple: 20 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.4", sensitivity: { rightNipple: 40 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.Max", sensitivity: { rightNipple: 100 }, sensation: 0.5, retryDown: 1 },
        { name: "右乳首弄り", sensitivity: { rightNipple: 100 }, sensation: 1, stop: 100, period: 100, stageDown: 1, speak: ["ひゃぁんっ♡"], hideSpeed: 50, onceLog: "を受けて" },
    ],
    クリ敏感: [
        { level: "Lv.1", sensitivity: { clitoris: 5 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.2", sensitivity: { clitoris: 10 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.3", sensitivity: { clitoris: 20 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.4", sensitivity: { clitoris: 40 }, sensation: 0.5, retryDown: 1 },
        { level: "Lv.Max", sensitivity: { clitoris: 100 }, sensation: 0.5, retryDown: 1 },
        { name: "クリ弄り", sensitivity: { clitoris: 100 }, sensation: 1, stop: 100, period: 100, stageDown: 1, speak: ["ひゃぁんっ♡"], hideSpeed: 50, onceLog: "を受けて" },
    ],
    "乳首肥大化(左)": [
        { level: "Lv.1", sensitivity: { leftNipple: 5 }, delay: 15 },
        { level: "Lv.2", sensitivity: { leftNipple: 10 }, delay: 30 },
        { level: "Lv.3", sensitivity: { leftNipple: 20 }, delay: 45 },
        { level: "Lv.4", sensitivity: { leftNipple: 40 }, delay: 60, sensation: 1, stop: 80, cycle: 7000, prod: 20, speak: ["やっ……乳首……っ"] },
        { level: "Lv.Max", sensitivity: { leftNipple: 100 }, delay: 75, sensation: 1.5, stop: 120, cycle: 6000, prod: 50, speak: ["乳首擦れちゃ……っ"] },
    ],
    "乳首肥大化(右)": [
        { level: "Lv.1", sensitivity: { rightNipple: 5 }, delay: 15 },
        { level: "Lv.2", sensitivity: { rightNipple: 10 }, delay: 30 },
        { level: "Lv.3", sensitivity: { rightNipple: 20 }, delay: 45 },
        { level: "Lv.4", sensitivity: { rightNipple: 40 }, delay: 60, sensation: 1, stop: 80, cycle: 7000, prod: 20, speak: ["やっ……乳首……っ"] },
        { level: "Lv.Max", sensitivity: { rightNipple: 100 }, delay: 75, sensation: 1.5, stop: 120, cycle: 6000, prod: 50, speak: ["乳首擦れちゃ……っ"] },
    ],
    クリ肥大化: [
        { level: "Lv.1", sensitivity: { clitoris: 5 }, delay: 15 },
        { level: "Lv.2", sensitivity: { clitoris: 10 }, delay: 30 },
        { level: "Lv.3", sensitivity: { clitoris: 20 }, delay: 45 },
        { level: "Lv.4", sensitivity: { clitoris: 40 }, delay: 60, sensation: 1, stop: 80, cycle: 8000, prod: 20, speak: ["あっクリ……"] },
        { level: "Lv.Max", sensitivity: { clitoris: 100 }, delay: 75, sensation: 1.5, stop: 120, cycle: 6000, prod: 50, speak: ["クリだめ……っ"] },
    ],
    乳首ローター: [
        { level: "（弱）", sensation: 1, sensitivity: { leftNipple: 5, rightNipple: 5 }, stop: 50, cycle: 1500, prod: 10, retryDown: true, speak: ["ふゃぁぁ……っ"] },
        { level: "（中）", sensation: 2, sensitivity: { leftNipple: 10, rightNipple: 10 }, stop: 70, cycle: 1200, prod: 10, retryDown: true, speak: ["ふゃぁぁ……っ"] },
        { level: "（強）", sensation: 3, sensitivity: { leftNipple: 15, rightNipple: 15 }, stop: 100, cycle: 1000, prod: 15, retryDown: true, speak: ["ふゃぁぁぁ……っ"] },
        { level: "（超強 呪い）", sensation: 4, sensitivity: { leftNipple: 25, rightNipple: 25 }, stop: 130, cycle: 1000, prod: 20, speak: ["ふゃぁぁぁ……っ"] },
    ],
    クリローター: [
        { level: "（弱）", sensation: 1, sensitivity: { clitoris: 5 }, stop: 50, cycle: 1500, prod: 10, retryDown: true, speak: ["ひぁ……っ"] },
        { level: "（中）", sensation: 2, sensitivity: { clitoris: 10 }, stop: 70, cycle: 1200, prod: 10, retryDown: true, speak: ["ひぁ……っ"] },
        { level: "（強）", sensation: 3, sensitivity: { clitoris: 15 }, stop: 100, cycle: 1000, prod: 15, retryDown: true, speak: ["ひぁぁ……っ"] },
        { level: "（超強 呪い）", sensation: 3, sensitivity: { clitoris: 25 }, stop: 130, cycle: 1000, prod: 20, speak: ["ひぁぁ……っ"] },
    ],
    クリブラシ: [
        { level: "（低速）", sensation: 1, sensitivity: { clitoris: 5 }, stop: 50, cycle: 1000, prod: 10, retryDown: true, speak: ["ひぁ……っ"] },
        { level: "（中速）", sensation: 1, sensitivity: { clitoris: 10 }, stop: 70, cycle: 700, prod: 10, retryDown: true, speak: ["ひぁ……っ"] },
        { level: "（高速）", sensation: 1, sensitivity: { clitoris: 15 }, stop: 100, cycle: 500, prod: 15, retryDown: true, speak: ["ひぁぁ……っ"] },
        { level: "（高速 呪い）", sensation: 1, sensitivity: { clitoris: 25 }, stop: 130, cycle: 500, prod: 20, speak: ["ひぁぁ……っ"] },
    ],
    "乳首ピアス(右)": [
        {},
        { name: "永久乳首ピアス(右)" },
    ],
    // おっぱい
    膨乳: [
        { level: "Cカップ", sensitivity: { bust: 3 }, delay: 5 },
        { level: "Dカップ", sensitivity: { bust: 6 }, delay: 15 },
        { level: "Eカップ", sensitivity: { bust: 10 }, delay: 30 },
        { level: "Fカップ", sensitivity: { bust: 15 }, delay: 50 },
        { level: "Gカップ", sensitivity: { bust: 30 }, delay: 75 },
        { level: "Hカップ", sensitivity: { bust: 50 }, delay: 100 },
        { level: "Iカップ", sensitivity: { bust: 100 }, delay: 125 },
        { level: "Jカップ", sensitivity: { bust: 160 }, delay: 150 },
        { level: "Kカップ", sensitivity: { bust: 240 }, delay: 150 },
        { level: "Lカップ", sensitivity: { bust: 320 }, delay: 150 },
    ],
    母乳体質: [
        { level: "Lv.1", sensation: 1, sensitivity: { bust: 30, leftNipple: 30, rightNipple: 30 }, stop: 300, cycle: 10000, prod: 30, danger: ["母乳分泌"], trigger: ["母乳濡れ"], speak: ["んっ……おっぱい張って……っ"] },
        { level: "Lv.2", sensation: 1.5, sensitivity: { bust: 50, leftNipple: 50, rightNipple: 50 }, stop: 600, cycle: 9000, prod: 30, danger: ["母乳分泌"], trigger: ["母乳濡れ"], speak: ["やっ……母乳がっ……!?"] },
        { level: "Lv.3", sensation: 2, sensitivity: { bust: 90, leftNipple: 90, rightNipple: 90 }, stop: 1000, cycle: 8000, prod: 30, danger: ["母乳分泌"], trigger: ["母乳濡れ"], speak: ["だめ……母乳感じて……っ"] },
    ],
    母乳濡れ: [
        { level: "", sensitivity: { bust: 30, leftNipple: 50, rightNipple: 50 }, period: 3000, periodDown: true, stageDown: true, count: 1, onceLog: "になって" },
    ],
    搾乳機: [ // TODO:
    ],
    // 膣内・子宮
    バイブ: [
        { level: "（弱）", sensation: 1, sensitivity: { clitoris: 3, vagina: 10, womb: 5 }, stop: 80, cycle: 2000, prod: 5, retryDown: true, speak: ["あぁぁ……っ"] },
        { level: "（中）", sensation: 2, sensitivity: { clitoris: 6, vagina: 20, womb: 10 }, stop: 80, cycle: 1800, prod: 10, retryDown: true, speak: ["あぁぁ……っ"] },
        { level: "（強）", sensation: 3, sensitivity: { clitoris: 9, vagina: 30, womb: 15 }, stop: 80, cycle: 1500, prod: 15, retryDown: true, speak: ["あぁぁぁ……っ"] },
        { level: "（強 呪い）", sensation: 4, sensitivity: { clitoris: 15, vagina: 60, womb: 25 }, stop: 80, cycle: 2000, prod: 20, speak: ["あぁぁぁ……っ"] },
        { name: "膣内射精バイブ", level: "（強 呪い）", sensation: 4, sensitivity: { clitoris: 15, vagina: 60, womb: 40 }, stop: 80, cycle: 2000, prod: 20, trigger: ["膣内射精"], speak: ["あぁ……っ"] },
    ],
    子宮脱: [
        { sensation: 5, sensitivity: { vagina: 50, womb: 300 }, delay: 200 },
    ],
    卵巣肥大化: [ // TODO:
    ],
    // アナル・尻肉
    アナルビーズ: [
        { name: "振動アナルビーズ" },
    ],
    アナルバイブ: [
        { name: "射精アナルバイブ" },
    ],
    尻肉肥大化: [ // TODO:
    ],
    // 尿道・おもらし
    おもらし癖: [
        { level: "Lv.1", stop: 3000, cycle: 8000, prod: 10, trigger: [{ name: "おもらし", progress: 2 }], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"] },
        { level: "Lv.2", stop: 3000, cycle: 8000, prod: 20, trigger: [{ name: "おもらし", progress: 2 }], danger: ["おもらし"], speak: ["いやっ……も、もれ……\n", "ふわぁぁぁぁぁ……っ"], countActivate: [{ name: "おもらし", count: 10 }] },
        { level: "Lv.3", stop: 3000, cycle: 8000, prod: 40, trigger: [{ name: "おもらし", progress: 2 }], danger: ["おもらし"], speak: ["いやっ……またもれっ……\n", "ふわぁぁぁぁぁ……っ"], countActivate: [{ name: "おもらし", count: 25 }] },
        { name: "おまたゆるゆる", stop: 3000, cycle: 8000, prod: 65, trigger: [{ name: "おもらし", progress: 2 }], danger: ["おもらし"], speak: ["いやっ……もれちゃっ……\n", "ふわぁぁぁぁぁ……っ"], countActivate: [{ name: "おもらし", count: 50 }] },
        { name: "強制おもらし", stop: 3000, cycle: 8000, prod: 100, trigger: [{ name: "おもらし", progress: 2 }], danger: ["おもらし"], speak: ["だめっ……もれてっ……\n", "ふわぁぁぁぁぁ……っ"], countActivate: [{ name: "おもらし", count: 80 }] },
    ],
    尿道ローター: [],
    尿道カテーテル: [
        { stop: 100, cycle: 8000, prod: 70, trigger: ["おもらし"], danger: ["おもらし"], speak: ["やっ……もれてる……っ"] },
    ],
    おもらし: [
        { level: "（少量）", sensation: 1, sensitivity: { urethra: 100 }, delay: 100, period: 3000, periodDown: true, stageDown: true, count: 1, trigger: ["尿道性感"], onceLog: "して" },
        { level: "", sensation: 2, sensitivity: { urethra: 100 }, delay: 300, period: 4000, periodDown: true, stageDown: true, count: 1, trigger: ["おもらし癖", "尿道性感"], onceLog: "して" },
    ],
    尿道性感: [
        { level: "(軽度)", sensitivity: { urethra: 150 }, countActivate: [{ name: "おもらし", count: 30 }], description: "尿道で感じてしまう" },
        { level: "(中度)", sensitivity: { urethra: 250 }, countActivate: [{ name: "おもらし", count: 80 }], description: "尿道で激しく感じてしまう" },
        { level: "(重度)", sensitivity: { urethra: 400 }, countActivate: [{ name: "おもらし", count: 150 }], description: "尿道でイってしまう" },
    ],
    // セックス
    挿入: [
        { sensation: 1, sensitivity: { vagina: 20, womb: 10 }, stop: 1000, prod: 80, period: 7500, stageDown: 1, trigger: ["ハメられ"], speak: ["ふあぁんっ♡"] },
    ],
    ハメられ: [
        { sensation: 1, sensitivity: { vagina: 20, womb: 10 }, stop: 100, cycle: 500, prod: 100, period: 3500, stageDown: 1, endTrigger: ["膣内射精"], speak: ["膣内だめっ♡", ""], speakInterval: 350, onceLog: "て" },
    ],
    // 媚薬系
    媚薬: [
        { level: "Lv.1", sensitivity: 10, stop: 80, cycle: 5000, prod: 40, period: 4000, retryDown: true, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"] },
        { level: "Lv.2", sensitivity: 30, stop: 160, cycle: 4000, prod: 60, period: 6000, retryDown: true, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"] },
        { level: "Lv.3", sensitivity: 50, stop: 240, cycle: 3000, prod: 80, period: 8000, retryDown: true, trigger: ["発情"], danger: ["発情"], speak: ["ふわぁっ♡"] },
    ],
    体液媚薬化: [
        { level: "（軽度）", sensitivity: 50, cycle: 6000, prod: 40, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"] },
        { level: "（中度）", sensitivity: 100, cycle: 5000, prod: 60, trigger: ["発情"], danger: ["発情"], speak: ["んぅっ♡"] },
        { level: "（重度）", sensitivity: 200, cycle: 4000, prod: 80, trigger: ["発情"], danger: ["発情"], speak: ["ふわぁっ♡"] },
    ],
    催淫ガス: [
        { level: "Lv.1", sensitivity: 10, stop: 80, cycle: 5000, prod: 40, period: 4000, retryDown: true, trigger: ["発情"], danger: ["発情"], hideSpeed: 70, speak: ["んぅっ♡"] },
        { level: "Lv.2", sensitivity: 30, stop: 160, cycle: 4000, prod: 60, period: 6000, retryDown: true, trigger: ["発情"], danger: ["発情"], hideSpeed: 70, speak: ["んぅっ♡"] },
        { level: "Lv.3", sensitivity: 50, stop: 240, cycle: 3000, prod: 80, period: 8000, retryDown: true, trigger: ["発情"], danger: ["発情"], hideSpeed: 70, speak: ["ふわぁっ♡"] },
    ],
    // 露出
    // 露出性感は回数を加算するためtriggerは個別
    "露出の呪い(上)": [
        { name: "服乳首上20cm", sensation: 0, sensitivity: { skin: 2, bust: 2, leftNipple: 2, rightNipple: 2 }, cycle: 4000 },
        { name: "服乳首上10cm", sensation: 0.1, sensitivity: { skin: 3, bust: 3, leftNipple: 3, rightNipple: 3 }, cycle: 4000, retryDown: 1 },
        { name: "服乳首上2cm", sensation: 0.3, sensitivity: { skin: 10, bust: 3, leftNipple: 3, rightNipple: 3 }, cycle: 4000, retryDown: 2, trigger: ["露出快感"] },
        { name: "服乳首上0cm", sensation: 1, sensitivity: { skin: 20, bust: 5, leftNipple: 15, rightNipple: 15 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感"] },
        { name: "服乳首下3cm", sensation: 1, sensitivity: { skin: 30, bust: 10, leftNipple: 25, rightNipple: 25 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感"] },
        { name: "服胸下", sensation: 1, sensitivity: { skin: 35, bust: 15, leftNipple: 25, rightNipple: 25 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感"] },
        { name: "トップレス", sensation: 1, sensitivity: { skin: 40, bust: 15, leftNipple: 25, rightNipple: 25 }, cycle: 4000, retryDown: 3, trigger: ["露出快感", "露出快感", "露出快感"] },
    ],
    "露出の呪い(下)": [
        { name: "スカート股下20cm", sensation: 0, sensitivity: { skin: 2, urethra: 2, clitoris: 2, vagina: 2, anal: 2, hip: 1 }, cycle: 4000 },
        { name: "スカート股下16cm", sensation: 0, sensitivity: { skin: 3, urethra: 3, clitoris: 3, vagina: 3, anal: 3, hip: 2 }, cycle: 4000, retryDown: 1 },
        { name: "スカート股下10cm", sensation: 0.1, sensitivity: { skin: 8, urethra: 8, clitoris: 8, vagina: 8, anal: 8, hip: 5 }, cycle: 4000, retryDown: 2, trigger: ["露出快感"] },
        { name: "スカート股下3cm", sensation: 0.3, sensitivity: { skin: 10, urethra: 20, clitoris: 20, vagina: 20, anal: 20, hip: 10 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感"] },
        { name: "スカート股下0cm", sensation: 1, sensitivity: { skin: 20, urethra: 30, clitoris: 30, vagina: 30, anal: 30, hip: 20 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感"] },
        { name: "スカート股上3cm", sensation: 1.5, sensitivity: { skin: 30, urethra: 40, clitoris: 40, vagina: 40, anal: 40, hip: 25 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感", "露出快感"] },
        { name: "スカート股上7cm", sensation: 1.5, sensitivity: { skin: 35, urethra: 50, clitoris: 50, vagina: 50, anal: 50, hip: 30 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感", "露出快感", "露出快感"] },
        { name: "ボトムレス", sensation: 1.5, sensitivity: { skin: 40, urethra: 50, clitoris: 50, vagina: 50, anal: 50, hip: 30 }, cycle: 4000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感", "露出快感", "露出快感"] },
    ],
    服透明化: [
        { level: "3%", sensation: 0, sensitivity: 2, cycle: 5000 },
        { level: "10%", sensation: 0.1, sensitivity: 3, cycle: 5000, retryDown: 1, trigger: ["露出快感"] },
        { level: "20%", sensation: 0.2, sensitivity: 5, cycle: 5000, retryDown: 2, trigger: ["露出快感"] },
        { level: "30%", sensation: 0.3, sensitivity: 10, cycle: 5000, retryDown: 2, trigger: ["露出快感", "露出快感"] },
        { level: "50%", sensation: 0.5, sensitivity: 25, cycle: 5000, retryDown: 2, trigger: ["露出快感", "露出快感", "露出快感"] },
        { level: "80%", sensation: 0.8, sensitivity: 40, cycle: 5000, retryDown: 1, trigger: ["露出快感", "露出快感", "露出快感", "露出快感", "露出快感"] },
    ],
    ノーパン暗示: [
        { sensation: 1, sensitivity: { skin: 30, urethra: 40, clitoris: 40, vagina: 40, anal: 40, hip: 20 }, cycle: 5000, trigger: ["露出快感", "露出快感", "露出快感"] },
    ],
    露出快感: [
        { period: 0, count: 1, trigger: ["露出性感"], onceLog: "を受けて" },
    ],
    露出性感: [
        { level: "(軽度)", sensitivity: { skin: 100, bust: 50, leftNipple: 50, rightNipple: 50, urethra: 50, clitoris: 50, vagina: 50, anal: 50, hip: 30 }, countActivate: [{ name: "露出快感", count: 30 }], description: "露出を期待してしまう" },
        { level: "(中度)", sensitivity: { skin: 150, bust: 70, leftNipple: 70, rightNipple: 70, urethra: 70, clitoris: 70, vagina: 70, anal: 70, hip: 60 }, countActivate: [{ name: "露出快感", count: 100 }], description: "露出の快感が頭から離れなくなってしまう" },
        { level: "(重度)", sensitivity: { skin: 200, bust: 100, leftNipple: 100, rightNipple: 100, urethra: 100, clitoris: 100, vagina: 100, anal: 100, hip: 100 }, countActivate: [{ name: "露出快感", count: 500 }], description: "露出を抑えられなくなってしまう" },
    ],
    // 触手・性的生物
    触手服: [
        { name: "触手ショーツ", sensation: 1, sensitivity: { skin: 1, urethra: 20, clitoris: 20, vagina: 10, anal: 15, hip: 10 }, cycle: 4000, prod: 20, stop: 10 },
        { name: "触手下着", sensation: 1.5, sensitivity: { skin: 10, bust: 20, leftNipple: 30, rightNipple: 30, urethra: 30, clitoris: 30, vagina: 20, anal: 25, hip: 20 }, cycle: 4000, prod: 20, stop: 20, retryDown: 1 },
        { name: "触手服", sensation: 2, sensitivity: { skin: 50, bust: 30, leftNipple: 50, rightNipple: 50, urethra: 80, clitoris: 60, vagina: 50, anal: 70, hip: 40 }, cycle: 2000, prod: 25, stop: 80, retryDown: 1 },
        { name: "触手服(呪い)", sensation: 2, sensitivity: { skin: 50, bust: 30, leftNipple: 50, rightNipple: 50, urethra: 80, clitoris: 60, vagina: 50, anal: 70, hip: 40 }, cycle: 2000, prod: 25, stop: 80 },
    ],
    淫虫: [ // TODO:
    ],
    // 催眠・脳改造
    "脳改造(絶頂発作)": [ // TODO:
    ],
    "脳改造(発情発作)": [ // TODO:
    ],
    "脳改造(敏感発作)": [ // TODO:
    ],
    被虐快感催眠: [ // TODO:
    ],
});
