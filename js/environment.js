class Environment {
    constructor(badStates, challenges, repairs, dopes, speak) {
        this.badStates = badStates;
        this.challenges = challenges;
        this.repairs = repairs;
        this.dopes = dopes;
        this.speak = speak;
        this.gameChallenges = new GameChallenges(this.challenges);
    }
}
