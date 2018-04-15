class Environment {
    constructor(badStates, challenges, repairs, speak) {
        this.badStates = badStates;
        this.challenges = challenges;
        this.repairs = repairs;
        this.speak = speak;
        this.gameChallenges = new GameChallenges(this.challenges);
    }
}
