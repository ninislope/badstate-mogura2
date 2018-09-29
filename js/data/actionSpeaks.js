/**
 * もぐらヒット時などにしゃべる台詞
 *
 * 全体の感度がminSensitivity以上の感度で当該の組をしゃべる
 */
const actionSpeaks = [
    { minSensitivity: 0, speaks: [""] },
    { minSensitivity: 500, speaks: ["", "", "", "", "", "", "ん……"] },
    { minSensitivity: 700, speaks: ["", "", "", "", "んっ……"] },
    { minSensitivity: 1000, speaks: ["", "", "", "", "んっ……", "ぁ……", "んぅっ……"] },
    { minSensitivity: 1500, speaks: ["", "", "んぁっ……", "ゃん……", "はぁっ……", "ふぁっ……"] },
    { minSensitivity: 2000, speaks: ["んぁぁっ♡", "やっ……だめっ", "んぁっ……", "ゃん……", "はぁんっ……", "ふぁっ……", "くひぃっ♡"] },
];
