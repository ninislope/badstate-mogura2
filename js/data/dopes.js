"use strict";
/**
 * ドーピング
 *
 * 設定回数分だけドーピング可能
 * speedBoost: 精神加速（もぐら速度を100/speedBoostにする）
 * ステージクリアごとにspeedBoostStepだけ減っていき、speedBoostMinに到達するとそのままになる。
 * patience: 我慢値（感度を100/patienceにする）
 * ステージクリアごとにpatienceStepだけ減っていき、patienceMinに到達するとそのままになる。
 */
const dopes = [
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。",
        speedBoost: 150, speedBoostMin: 100, speedBoostStep: 4, patience: 120, patienceStep: 1, patienceMin: 100,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。2回くらいなら大丈夫だろう",
        speedBoost: 200, speedBoostMin: 150, speedBoostStep: 4, patience: 150, patienceStep: 1, patienceMin: 120,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。このくらいが潮時だろうか？",
        speedBoost: 300, speedBoostMin: 150, speedBoostStep: 6, patience: 200, patienceStep: 2, patienceMin: 150,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。まだいけるか？それとも？",
        speedBoost: 350, speedBoostMin: 100, speedBoostStep: 10, patience: 250, patienceStep: 4, patienceMin: 150,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。さすがにまずいだろうか？でも感度が……",
        speedBoost: 380, speedBoostMin: 100, speedBoostStep: 10, patience: 300, patienceStep: 8, patienceMin: 100,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。……きっと大丈夫だ。",
        speedBoost: 400, speedBoostMin: 80, speedBoostStep: 15, patience: 250, patienceStep: 8, patienceMin: 80,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。感度を抑えないと……。",
        speedBoost: 420, speedBoostMin: 60, speedBoostStep: 20, patience: 200, patienceStep: 8, patienceMin: 50,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。これ以上は……でも最初だけでもないともたない……。",
        speedBoost: 450, speedBoostMin: 50, speedBoostStep: 20, patience: 150, patienceStep: 8, patienceMin: 30,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。もう効果が……でもこれを使わないと……。",
        speedBoost: 480, speedBoostMin: 30, speedBoostStep: 25, patience: 100, patienceStep: 8, patienceMin: 25,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。感度を元に戻さないと……。",
        speedBoost: 500, speedBoostMin: 20, speedBoostStep: 30, patience: 90, patienceStep: 9, patienceMin: 20,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。感度が元に戻らない……。",
        speedBoost: 300, speedBoostMin: 30, speedBoostStep: 20, patience: 60, patienceStep: 10, patienceMin: 10,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。もうダメだ……。そのことはわかってるけど……。",
        speedBoost: 200, speedBoostMin: 40, speedBoostStep: 20, patience: 30, patienceStep: 5, patienceMin: 5,
    },
    {
        description: "ラベルには「精神加速・感度我慢の効果があります。非常に強力なので何回も使用しないでください」とある。うあぁ……。",
        speedBoost: 50, speedBoostMin: 10, speedBoostStep: 20, patience: 20, patienceStep: 5, patienceMin: 1,
    },
];
