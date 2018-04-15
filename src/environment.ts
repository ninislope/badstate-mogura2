class Environment {
    badStates: BadStates;
    challenges: Challenges;
    repairs: Repairs;
    speak: Speak;
    gameChallenges: GameChallenges;

    constructor(badStates: BadStates, challenges: Challenges, repairs: Repairs, speak: Speak) {
        this.badStates = badStates;
        this.challenges = challenges;
        this.repairs = repairs;
        this.speak = speak;
        this.gameChallenges = new GameChallenges(this.challenges);
    }
}
