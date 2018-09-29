/**
 * 治療
 *
 * 設定回数分だけ治療可能
 * regist: 抵抗値（この%分だけ各種効果を減少）
 * ステージクリアごとにresistStepだけ減っていき、resistMinに到達するとそのままになる。
 * sensitiveSpeedBias: 感度上昇割合が元と比べてこの%になる
 */
const repairs: RepairData[] = [
//     {resist:  0, resistStep: 0.0, sensitiveSpeedBias: 100}, // 25面で0
    {resist: 10, resistMin: 0, resistStep: 0.2, sensitiveSpeedBias: 100,
        description: "抵抗薬を使ってバッドステートの治療と抵抗値付与を行い、再挑戦をサポートします。" +
        "治療できるバッドステートは限られていますので、出来るだけかからないようにしてください。"
    }, // 25面で5
    {resist: 20, resistMin: 0, resistStep: 0.3, sensitiveSpeedBias: 105,
        description: "抵抗薬を使ってバッドステートの治療と抵抗値付与を行い、再挑戦をサポートします。" +
        "2回目からは軽微ですが感度上昇が速くなる副作用が付くのでご注意ください。"
    }, // 25面で12.5
    {resist:  32, resistMin:    0, resistStep:  0.4, sensitiveSpeedBias:  110, description: "抵抗薬がだんだんなじんで来て、抵抗値も期待できます。"}, // 25面で22
    {resist:  42, resistMin:    0, resistStep:  0.5, sensitiveSpeedBias:  130, description: "お疲れ様です。なかなか攻略できませんね……。抵抗薬の浸透度は良好ですので頑張ってください。"}, // 25面で29.5
    {resist:  52, resistMin:    0, resistStep:  0.5, sensitiveSpeedBias:  160, description: "抵抗薬の浸透は理想的で、おそらく最大の抵抗効果を発揮すると思います。次こそは攻略を狙いたいですね。"}, // 25面で39.5 折り返し
    {resist:  56, resistMin:    0, resistStep:  0.7, sensitiveSpeedBias:  200, description: "少し抵抗効果減少速度と感度上昇速度が気になりますが、おそらく問題ない範囲だと思います。頑張ってください。"}, // 25面で38.5
    {resist:  60, resistMin:    0, resistStep:  1.1, sensitiveSpeedBias:  250, description: "思ったより薬効の減少が大きいです。今回は大丈夫ですが、次回の治療では思わしい抵抗値が得られない可能性があります。"}, // 25面で32.5
    {resist:  63, resistMin:    0, resistStep:  1.7, sensitiveSpeedBias:  310, description: "初期抵抗値は上昇していますが、効果減少速度と感度上昇速度が芳しくないですね……。"}, // 25面で20.5
    {resist:  65, resistMin:    0, resistStep:  2.5, sensitiveSpeedBias:  380, description: "想定より効果減少が激しいです。治療はやや危険な水準です……。"}, // 25面で2.5
    {resist:  66, resistMin:  -10, resistStep:  3.0, sensitiveSpeedBias:  460, description: "薬効が飽和状態に近く、副作用が大きくなっています。治療はお勧めしません。"}, // 25面で-9
    {resist:  67, resistMin:  -16, resistStep:  3.3, sensitiveSpeedBias:  550, description: "薬効がほぼ飽和しており、副作用が顕著に大きくなっています。治療はお勧めしません。"}, // 25面で-15.5
    {resist:  68, resistMin:  -23, resistStep:  3.6, sensitiveSpeedBias:  650, description: "薬効がおそらく飽和しています。最初は良いですが、攻略を進めると危険です。治療リスクを理解してお願いします。"}, // 25面で-22 折り返し
    {resist:  65, resistMin:  -35, resistStep:  3.9, sensitiveSpeedBias:  760, description: "薬効飽和を過ぎたので効果の全体的な減少が見込まれます。治療はお勧めしません。"}, // 25面で-32.5
    {resist:  60, resistMin:  -47, resistStep:  4.2, sensitiveSpeedBias:  880, description: "研究を重ねていますが今のところ薬効の反転を阻止する手立てはありません……。治療リスクを理解してお願いします。"}, // 25面で-45
    {resist:  54, resistMin:  -60, resistStep:  4.5, sensitiveSpeedBias: 1000, description: "本当に危険水域です。薬効の反転防止は望み薄です……。治療リスクを理解してお願いします。"}, // 25面で-58.5
    {resist:  47, resistMin:  -75, resistStep:  4.8, sensitiveSpeedBias: 1000, description: "打つ手はありません……。治療はリスクを理解してお願いします……。"}, // 25面で-73
    {resist:  39, resistMin:  -90, resistStep:  5.1, sensitiveSpeedBias: 1000, description: "……治療はリスクを理解してお願いします。"}, // 25面で-88.5
    {resist:  30, resistMin: -110, resistStep:  5.4, sensitiveSpeedBias: 1000, description: "……治療はリスクを理解してお願いします。"}, // 25面で-105
    {resist:  20, resistMin: -130, resistStep:  5.8, sensitiveSpeedBias: 1000, description: "本当に治療以外の手段がないときのみ治療下さい。残念ながら我々にはもう責任が持てません。"}, // 25面で-125
    {resist:   9, resistMin: -150, resistStep:  6.3, sensitiveSpeedBias: 1000, description: "本来の薬効がもうほとんど残っていません……。攻略の継続は不可能では……。"}, // 25面で-148.5
    {resist:  -3, resistMin: -180, resistStep:  6.8, sensitiveSpeedBias: 1000, description: "この調子だとほぼ副作用しか出ないのではないでしょうか……。攻略はやめてください……。"}, // 25面で-173
    {resist: -16, resistMin: -220, resistStep:  7.8, sensitiveSpeedBias: 1000, description: "もう副作用しか出ないと思います……。攻略中断をお願いします……。"}, // 25面で-211
    {resist: -30, resistMin: -400, resistStep: 11.0, sensitiveSpeedBias: 1000, description: "そんなお体にして本当に申し訳ありません……。お願いですから攻略中断を……。"}, // 25面で-305
];
