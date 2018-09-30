class Environment {
    badStates: BadStates;
    challenges: Challenges;
    repairs: Repairs;
    dopes: Dopes;
    speak: Speak;
    gameChallenges: GameChallenges;

    constructor(badStates: BadStates, challenges: Challenges, repairs: Repairs, dopes: Dopes, speak: Speak) {
        this.badStates = badStates;
        this.challenges = challenges;
        this.repairs = repairs;
        this.dopes = dopes;
        this.speak = speak;
        this.gameChallenges = new GameChallenges(this.challenges);
    }
}
