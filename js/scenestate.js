"use strict";
class SceneState {
    constructor(player) {
        this.scene = new StartScene();
        this.start = () => {
            this.scene.start();
        };
        this.beginGame = () => {
            this.changeScene(new HomeScene(this.player, true));
        };
        this.startStage = () => {
            this.changeScene(new StageScene(this.player, true, true));
        };
        this.nextStage = () => {
            this.changeScene(new StageScene(this.player, true));
        };
        this.sameStage = () => {
            this.changeScene(new StageScene(this.player, false));
        };
        this.backHome = () => {
            this.changeScene(new HomeScene(this.player, true));
        };
        this.showResult = (moguraGame) => {
            this.changeScene(new ResultScene(this.player, moguraGame));
        };
        this.repair = () => {
            this.changeScene(new RepairScene(this.player));
        };
        this.dope = () => {
            this.changeScene(new DopeScene(this.player));
        };
        this.repairBackHome = () => {
            this.changeScene(new HomeScene(this.player, false));
        };
        this.dopeBackHome = () => {
            this.changeScene(new HomeScene(this.player, false));
        };
        this.player = player;
    }
    changeScene(scene) {
        this.scene.exit();
        this.scene = scene;
        this.scene.start();
    }
}
