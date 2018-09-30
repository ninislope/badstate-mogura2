/*



class A{

    get summary() {
        const summaries: string[] = [];
        if (this.totalDelay) summaries.push(`敏感になり${this.totalDelay / 1000}秒動きが遅れてしまう`);
        const dangers: string[] = [];
        const dangersUniq: {[name: string]: boolean} = {};
        for (const playerBadState of this.badStates) {
            if (playerBadState.param.danger) {
                for (const danger of playerBadState.param.danger) {
                    if (!dangersUniq[danger]) {
                        dangersUniq[danger] = true;
                        dangers.push(...playerBadState.param.danger);
                    }
                }
            }
        }
        if (dangers.length) summaries.push(`体が開発され${dangers.join(", ")}の危険がある`);
        return summaries.join("<br>");
    }
}*/
const _setTimeout = setTimeout;
function speedUp(num) {
    setTimeout = function (a, b) { return _setTimeout(a, b / num); };
}
function skipStage() {
    if (_player.environment.gameChallenges.currentGameChallenge.currentGameStage && _player.environment.gameChallenges.currentGameChallenge.currentGameStage.level + 1 > _player.environment.gameChallenges.challenges.challenge(1).stages.length) {
        console.log("この先のステージは未実装です");
        return;
    }
    return _player.environment.gameChallenges.currentGameChallenge.newGameStage();
}
const _environment = new Environment(BadStates.fromData(badStateSets), Challenges.fromData(challenges, stages), Repairs.fromData(repairs), Dopes.fromData(dopes), new Speak(actionSpeaks));
const _player = new Player(_environment);
// let moguraGame: MoguraGame;
/*
player.baseSensitivity.anal += 1005;
player.baseSensitivity.clitoris += 1005;
player.baseSensitivity.hip += 1005;
player.baseSensitivity.portio += 1005;
player.baseSensitivity.skin += 1005;
player.baseSensitivity.vagina += 1005;
player.baseSensitivity.womb += 1005;
*/
/*
_player.baseSensitivity.urethra += 65;
_player.baseSensitivity.bust += 405;
_player.baseSensitivity.rightNipple += 500;
_player.baseSensitivity.leftNipple -= 5;
_player.previousChallengeSensitivity = new PlayerSensitivity();
*/
let sceneState = new SceneState(_player);
