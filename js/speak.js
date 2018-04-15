class Speak {
    constructor(actionSpeaks) {
        this.previousActionSpeakIndex = -1;
        this.actionSpeaks = actionSpeaks;
    }
    randomReadySpeak(sensitivity) {
        return this.randomHitSpeak(sensitivity);
    }
    randomHitSpeak(sensitivity) {
        const speaks = this.actionSpeaks.find((actionSpeak) => actionSpeak.minSensitivity <= sensitivity).speaks;
        return this.randomFromActionSpeaks(speaks);
    }
    randomFromActionSpeaks(speaks) {
        if (speaks.length <= 1)
            return speaks[0];
        const index = Math.floor(Math.random() * speaks.length);
        if (index === this.previousActionSpeakIndex)
            return this.randomFromActionSpeaks(speaks); // 直前に出したindex出さないように
        return speaks[index];
    }
}
