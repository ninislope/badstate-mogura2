class SceneState {
    scene: Scene = new StartScene();
    player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    start = () => {
        this.scene.start();
    }

    beginGame = () => {
        this.changeScene(new HomeScene(this.player, true, false));
    }

    startStage = () => {
        this.changeScene(new StageScene(this.player, true, true));
    }

    nextStage = () => {
        this.changeScene(new StageScene(this.player, true));
    }

    sameStage = () => {
        this.changeScene(new StageScene(this.player, false));
    }

    backHome = () => {
        this.changeScene(new HomeScene(this.player, true, true));
    }

    showResult = (moguraGame: MoguraGame) => {
        this.changeScene(new ResultScene(this.player, moguraGame));
    }

    repair = () => {
        this.changeScene(new RepairScene(this.player));
    }

    repairBackHome = (canRepair: boolean) => {
        this.changeScene(new HomeScene(this.player, false, canRepair));
    }

    private changeScene(scene: Scene) {
        this.scene.exit();
        this.scene = scene;
        this.scene.start();
    }
}
