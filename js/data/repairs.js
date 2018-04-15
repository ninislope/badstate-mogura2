// 設定回数分だけ治療可能
const repairs = [
    //     {resist:  0, resistStep: 0.0, sensitiveSpeedBias: 100}, // 25面で0
    { resist: 5, resistMin: 0, resistStep: 0.1, sensitiveSpeedBias: 100,
        description: "抵抗薬を使ってバッドステートの治療と抵抗値付与を行い、再挑戦をサポートします。" +
            "治療できるバッドステートは限られていますので、出来るだけかからないようにしてください。"
    },
    { resist: 10, resistMin: 0, resistStep: 0.2, sensitiveSpeedBias: 105,
        description: "抵抗薬を使ってバッドステートの治療と抵抗値付与を行い、再挑戦をサポートします。" +
            "2回目からは軽微ですが感度上昇が速くなる副作用が付くのでご注意ください。"
    },
    { resist: 15, resistMin: 0, resistStep: 0.3, sensitiveSpeedBias: 110, description: "抵抗薬がだんだんなじんで来て、抵抗値も期待できます。" },
    { resist: 25, resistMin: 0, resistStep: 0.6, sensitiveSpeedBias: 130, description: "お疲れ様です。なかなか攻略できませんね……。抵抗薬の浸透度は良好ですので頑張ってください。" },
    { resist: 33, resistMin: 0, resistStep: 0.9, sensitiveSpeedBias: 160, description: "抵抗薬の浸透は理想的で、おそらく最大の抵抗効果を発揮すると思います。次こそは攻略を狙いたいですね。" },
    { resist: 40, resistMin: 0, resistStep: 1.2, sensitiveSpeedBias: 200, description: "少し抵抗効果減少速度と感度上昇速度が気になりますが、おそらく問題ない範囲だと思います。頑張ってください。" },
    { resist: 45, resistMin: 0, resistStep: 1.5, sensitiveSpeedBias: 250, description: "思ったより薬効の減少が大きいです。今回は大丈夫ですが、次回の治療では思わしい抵抗値が得られない可能性があります。" },
    { resist: 48, resistMin: 0, resistStep: 1.8, sensitiveSpeedBias: 310, description: "初期抵抗値は上昇していますが、効果減少速度と感度上昇速度が芳しくないですね……。" },
    { resist: 50, resistMin: -3, resistStep: 2.1, sensitiveSpeedBias: 380, description: "想定より効果減少が激しいです。治療はやや危険な水準です……。" },
    { resist: 51, resistMin: -10, resistStep: 2.4, sensitiveSpeedBias: 460, description: "薬効が飽和状態に近く、副作用が大きくなっています。治療はお勧めしません。" },
    { resist: 52, resistMin: -16, resistStep: 2.7, sensitiveSpeedBias: 550, description: "薬効がほぼ飽和しており、副作用が顕著に大きくなっています。治療はお勧めしません。" },
    { resist: 53, resistMin: -23, resistStep: 3.0, sensitiveSpeedBias: 650, description: "薬効がおそらく飽和しています。最初は良いですが、攻略を進めると危険です。治療リスクを理解してお願いします。" },
    { resist: 52, resistMin: -35, resistStep: 3.4, sensitiveSpeedBias: 760, description: "薬効飽和を過ぎたので効果の全体的な減少が見込まれます。治療はお勧めしません。" },
    { resist: 50, resistMin: -47, resistStep: 3.8, sensitiveSpeedBias: 880, description: "研究を重ねていますが今のところ薬効の反転を阻止する手立てはありません……。治療リスクを理解してお願いします。" },
    { resist: 47, resistMin: -60, resistStep: 4.2, sensitiveSpeedBias: 1000, description: "本当に危険水域です。薬効の反転防止は望み薄です……。治療リスクを理解してお願いします。" },
    { resist: 43, resistMin: -75, resistStep: 4.6, sensitiveSpeedBias: 1000, description: "打つ手はありません……。治療はリスクを理解してお願いします……。" },
    { resist: 38, resistMin: -90, resistStep: 5.0, sensitiveSpeedBias: 1000, description: "……治療はリスクを理解してお願いします。" },
    { resist: 32, resistMin: -110, resistStep: 5.5, sensitiveSpeedBias: 1000, description: "……治療はリスクを理解してお願いします。" },
    { resist: 25, resistMin: -130, resistStep: 6.0, sensitiveSpeedBias: 1000, description: "本当に治療以外の手段がないときのみ治療下さい。残念ながら我々にはもう責任が持てません。" },
    { resist: 17, resistMin: -150, resistStep: 6.6, sensitiveSpeedBias: 1000, description: "本来の薬効がもうほとんど残っていません……。攻略の継続は不可能では……。" },
    { resist: 6, resistMin: -180, resistStep: 7.2, sensitiveSpeedBias: 1000, description: "この調子だと次回は副作用しか出ないのではないでしょうか……。攻略はやめてください……。" },
    { resist: -16, resistMin: -220, resistStep: 8.0, sensitiveSpeedBias: 1000, description: "もう副作用しか出ないと思います……。攻略中断をお願いします……。" },
    { resist: -30, resistMin: -400, resistStep: 11.0, sensitiveSpeedBias: 1000, description: "そんなお体にして本当に申し訳ありません……。お願いですから攻略中断を……。" },
];