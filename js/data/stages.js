/**
 * ステージ設定
 *
 * enemyCount: 敵数
 * appearSpeed: もぐらの出現間隔（ミリ秒）
 *   startから始まって、1回ごとにstepずつ減少していき、endに到達したらそのままになる
 * hideSpeed: もぐらが出現してから隠れるまでの間隔
 *   出現スピードの1.5倍がデフォルト;
 * badStates: このステージで出現するバッドステート群
 *   2回以上たたきミスすると2回目以降は進行度が上がる
 *   maxProgressの設定がある場合は最大進行度がそのステージではそこまでになる
 *   weightは出現確率に関わる重み デフォルトは100
 */
const stages = [
    {
        name: "入り口1",
        enemyCount: 7,
        appearSpeed: { start: 1400, end: 1100, step: 30 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            膨乳: { maxProgress: 2 },
            尿道カテーテル: { weight: 1 },
        },
    },
    {
        name: "入り口2",
        enemyCount: 10,
        appearSpeed: { start: 1200, end: 900, step: 30 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            膨乳: { maxProgress: 2 },
            尿道カテーテル: { weight: 1 },
            媚薬: { weight: 200 },
        },
    },
    {
        name: "第一階層通路",
        enemyCount: 12,
        appearSpeed: { start: 900, end: 700, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            乳首ローター: { maxProgress: 1 },
            クリローター: { maxProgress: 1 },
            クリブラシ: { weight: 50, maxProgress: 1 },
            膨乳: { maxProgress: 4 },
            母乳体質: { weight: 5, maxProgress: 1 },
            尿道カテーテル: { weight: 2 },
            媚薬: { weight: 200 },
        },
    },
    {
        name: "媚薬部屋",
        enemyCount: 12,
        appearSpeed: { start: 800, end: 600, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            乳首ローター: { maxProgress: 1 },
            クリローター: { maxProgress: 1 },
            クリブラシ: { weight: 50, maxProgress: 1 },
            膨乳: { maxProgress: 5 },
            母乳体質: { weight: 5, maxProgress: 1 },
            尿道カテーテル: { weight: 3 },
            媚薬: { weight: 600 },
            催淫ガス: { weight: 800 },
            体液媚薬化: { weight: 1, maxProgress: 1 },
        },
    },
    {
        name: "第二階層通路",
        enemyCount: 10,
        appearSpeed: { start: 900, end: 600, step: 30 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            乳首ローター: { maxProgress: 1 },
            クリローター: { maxProgress: 1 },
            クリブラシ: { weight: 50, maxProgress: 1 },
            膨乳: { maxProgress: 5 },
            母乳体質: { weight: 5, maxProgress: 1 },
            尿道カテーテル: { weight: 3 },
            媚薬: {},
            催淫ガス: { weight: 20 },
            体液媚薬化: { weight: 1, maxProgress: 1 },
        },
    },
    {
        name: "おもちゃのへや",
        enemyCount: 14,
        appearSpeed: { start: 800, end: 500, step: 30 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            乳首ローター: { weight: 300 },
            クリローター: { weight: 300 },
            クリブラシ: { weight: 300 },
            バイブ: { weight: 500 },
            膨乳: { maxProgress: 5 },
            母乳体質: { weight: 5, maxProgress: 1 },
            尿道カテーテル: { weight: 30 },
            媚薬: {},
            催淫ガス: { weight: 20 },
            体液媚薬化: { weight: 2, maxProgress: 1 },
        },
    },
    {
        name: "第三階層通路",
        enemyCount: 12,
        appearSpeed: { start: 850, end: 650, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { maxProgress: 3 },
            "乳首肥大化(右)": { maxProgress: 3 },
            クリ肥大化: { maxProgress: 3 },
            乳首ローター: { maxProgress: 3 },
            クリローター: { maxProgress: 3 },
            クリブラシ: { maxProgress: 3 },
            バイブ: { maxProgress: 3 },
            膨乳: { maxProgress: 5 },
            母乳体質: { weight: 5, maxProgress: 1 },
            尿道カテーテル: { weight: 3 },
            媚薬: {},
            催淫ガス: { weight: 20 },
            体液媚薬化: { weight: 2, maxProgress: 1 },
        },
    },
    {
        name: "改造室",
        enemyCount: 20,
        appearSpeed: { start: 800, end: 400, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": { weight: 400 },
            "乳首肥大化(右)": { weight: 400 },
            クリ肥大化: { weight: 400 },
            乳首ローター: {},
            クリローター: {},
            クリブラシ: {},
            バイブ: {},
            膨乳: { weight: 400 },
            母乳体質: { weight: 400 },
            尿道カテーテル: { weight: 150 },
            媚薬: {},
            催淫ガス: { weight: 20 },
            体液媚薬化: { weight: 150 },
        },
    },
    {
        name: "即ハメ地帯",
        enemyCount: 40,
        appearSpeed: { start: 500, end: 400, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": {},
            "乳首肥大化(右)": {},
            クリ肥大化: {},
            乳首ローター: {},
            クリローター: {},
            クリブラシ: {},
            バイブ: {},
            膨乳: {},
            母乳体質: { weight: 200 },
            おもらし癖: { weight: 200 },
            尿道カテーテル: {},
            媚薬: {},
            催淫ガス: { weight: 200 },
            体液媚薬化: { weight: 200 },
            "露出の呪い(上)": {},
            "露出の呪い(下)": {},
            ノーパン暗示: {},
            服透明化: {},
            触手服: { weight: 200 },
            挿入: { weight: 400 },
        },
    },
    {
        name: "第四階層通路",
        enemyCount: 12,
        appearSpeed: { start: 850, end: 500, step: 30 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": {},
            "乳首肥大化(右)": {},
            クリ肥大化: {},
            乳首ローター: {},
            クリローター: {},
            クリブラシ: {},
            バイブ: {},
            膨乳: {},
            母乳体質: { weight: 50 },
            尿道カテーテル: { weight: 10 },
            媚薬: {},
            催淫ガス: { weight: 20 },
            体液媚薬化: { weight: 10, maxProgress: 1 },
        },
    },
    {
        name: "公衆便所",
        enemyCount: 20,
        appearSpeed: { start: 800, end: 400, step: 20 },
        badStates: {
            "乳首敏感(左)": { weight: 10 },
            "乳首敏感(右)": { weight: 10 },
            クリ敏感: { weight: 10 },
            "乳首肥大化(左)": { weight: 10 },
            "乳首肥大化(右)": { weight: 10 },
            クリ肥大化: { weight: 10 },
            乳首ローター: { weight: 10 },
            クリローター: { weight: 10 },
            クリブラシ: { weight: 10 },
            バイブ: { weight: 10 },
            膨乳: { weight: 10 },
            母乳体質: {},
            おもらし癖: { weight: 500 },
            尿道カテーテル: { weight: 500 },
            媚薬: {},
            催淫ガス: {},
            体液媚薬化: {},
        },
    },
    {
        name: "露出調教VR室",
        enemyCount: 20,
        appearSpeed: { start: 800, end: 400, step: 20 },
        badStates: {
            "乳首敏感(左)": { weight: 10 },
            "乳首敏感(右)": { weight: 10 },
            クリ敏感: { weight: 10 },
            "乳首肥大化(左)": { weight: 10 },
            "乳首肥大化(右)": { weight: 10 },
            クリ肥大化: { weight: 10 },
            乳首ローター: { weight: 10 },
            クリローター: { weight: 10 },
            クリブラシ: { weight: 10 },
            バイブ: { weight: 10 },
            膨乳: { weight: 10 },
            母乳体質: {},
            おもらし癖: {},
            尿道カテーテル: {},
            媚薬: {},
            催淫ガス: { weight: 200 },
            体液媚薬化: { maxProgress: 1 },
            "露出の呪い(上)": { weight: 800 },
            "露出の呪い(下)": { weight: 800 },
            ノーパン暗示: { weight: 800 },
            服透明化: { weight: 800 },
        },
    },
    {
        name: "第五階層通路",
        enemyCount: 15,
        appearSpeed: { start: 800, end: 500, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": {},
            "乳首肥大化(右)": {},
            クリ肥大化: {},
            乳首ローター: {},
            クリローター: {},
            クリブラシ: {},
            バイブ: {},
            膨乳: {},
            母乳体質: {},
            おもらし癖: {},
            尿道カテーテル: {},
            媚薬: {},
            催淫ガス: { weight: 200 },
            体液媚薬化: { maxProgress: 1 },
            "露出の呪い(上)": {},
            "露出の呪い(下)": {},
            ノーパン暗示: { weight: 50 },
            服透明化: {},
        },
    },
    {
        name: "生物室",
        enemyCount: 20,
        appearSpeed: { start: 700, end: 450, step: 20 },
        badStates: {
            "乳首敏感(左)": {},
            "乳首敏感(右)": {},
            クリ敏感: {},
            "乳首肥大化(左)": {},
            "乳首肥大化(右)": {},
            クリ肥大化: {},
            乳首ローター: {},
            クリローター: {},
            クリブラシ: {},
            バイブ: {},
            膨乳: {},
            母乳体質: {},
            おもらし癖: {},
            尿道カテーテル: {},
            媚薬: {},
            催淫ガス: { weight: 200 },
            体液媚薬化: {},
            "露出の呪い(上)": {},
            "露出の呪い(下)": {},
            ノーパン暗示: { weight: 20 },
            服透明化: {},
            触手服: { weight: 3000 },
        },
    },
];
