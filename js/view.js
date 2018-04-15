class MoguraView {
}
class ResultView {
    static updateInfo() {
        document.querySelector("#resultScene .level").textContent = `${moguraGame.gameStageChallenge.level}`;
        document.querySelector("#resultScene .totalCount").textContent = `${moguraGame.gameStageChallenge.totalCount}`;
        document.querySelector("#resultScene .successCount").textContent = `${moguraGame.gameStageChallenge.successCount}`;
        document.querySelector("#resultScene .failCount").textContent = `${moguraGame.gameStageChallenge.failCount}`;
        document.querySelector("#resultScene .successRate").textContent = `${moguraGame.gameStageChallenge.successRate}`;
    }
    static updateBadStates(previous, current) {
        View.updateBadStates("#resultScene", previous, current, current);
    }
    static setAddMode(value) {
        View.setAddMode("#resultScene", value);
    }
}
