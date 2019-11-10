interface ActionSpeakData {
    minSensitivity: number;
    speaks: string[];
}

class Speak {
    actionSpeaks: ActionSpeakData[];
    previousActionSpeakIndex = -1;

    constructor(actionSpeaks: ActionSpeakData[]) {
        this.actionSpeaks = actionSpeaks;
    }

    randomReadySpeak(sensitivity: number) {
        return this.randomHitSpeak(sensitivity);
    }

    randomHitSpeak(sensitivity: number) {
        const speaks = this.actionSpeaks.find((actionSpeak) => actionSpeak.minSensitivity <= sensitivity)!.speaks;
        return this.randomFromActionSpeaks(speaks);
    }

    private randomFromActionSpeaks(speaks: string[]): string {
        if (speaks.length <= 1) return speaks[0];
        const index = Math.floor(Math.random() * speaks.length);
        if (index === this.previousActionSpeakIndex) return this.randomFromActionSpeaks(speaks); // 直前に出したindex出さないように
        return speaks[index];
    }
}
