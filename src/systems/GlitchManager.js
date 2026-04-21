import EventBus from "./EventBus.js";
import { GLITCH_DURATION } from "../config/constants.js";

export default class GlitchManager {
    constructor(scene) {
        this.scene = scene;
        this.isReversed = false;
        this.glitchText = null;
        this.glitchTween = null;

        this._timer1 = null;
        this._timer2 = null;
        this._timer3 = null;

        this.glitchSound = null;
    }

    startGlitchTimer() {
        this._timer1 = this.scene.time.delayedCall(Phaser.Math.Between(5000, 8000), () => {
            if (this.scene.isGameOver) return;

            const redFlash = this.scene.add
                .rectangle(this.scene.W / 2, this.scene.H / 2, this.scene.W, this.scene.H, 0xff0000, 0.12)
                .setDepth(50);

            const warnText = this.scene.add
                .text(this.scene.W / 2, this.scene.H / 2 - 30, "⚠ SYSTEM ERROR\nREVERSE CONTROL", {
                    fontSize: "30px", color: "#ff4444", align: "center",
                })
                .setOrigin(0.5)
                .setDepth(51);

            const warnTween = this.scene.tweens.add({
                targets: warnText, alpha: 0, duration: 200, yoyo: true, repeat: -1,
            });

            this._timer2 = this.scene.time.delayedCall(1000, () => {
                if (this.scene.isGameOver) {
                    redFlash.destroy();
                    warnText.destroy();
                    return;
                }

                warnTween.stop();
                warnText.destroy();
                redFlash.destroy();

                this.isReversed = true;
                EventBus.emit("glitch:start");

                if (this.scene.cache.audio.exists("glitch")) {
                    this.glitchSound = this.scene.sound.add("glitch");
                    this.glitchSound.play({ loop: true, volume: 0.5 });
                }


                this.glitchText = this.scene.add
                    .text(20, 78, "[ REVERSED ]", {
                        fontSize: "15px", color: "#ff4444",
                    })
                    .setDepth(10);

                this.glitchTween = this.scene.tweens.add({
                    targets: this.glitchText, alpha: 0, duration: 300, yoyo: true, repeat: -1,
                });

                this._timer3 = this.scene.time.delayedCall(GLITCH_DURATION, () => {
                    this.isReversed = false;
                    EventBus.emit("glitch:end");

                    if (this.scene.cache.audio.exists("glitch")) {
                        this.scene.sound.stopByKey("glitch");
                    }

                    if (this.glitchSound && this.glitchSound.isPlaying) {
                        this.glitchSound.stop();
                        this.glitchSound = null;
                    }

                    this.glitchTween.stop();
                    this.glitchText.destroy();
                    this.glitchText = null;
                    this.glitchTween = null;

                    this.startGlitchTimer();
                });
            });
        });
    }

    stop() {
        if (this._timer1) {
            this._timer1.remove();
            this._timer1 = null;
        }
        if (this._timer2) {
            this._timer2.remove();
            this._timer2 = null;
        }
        if (this._timer3) {
            this._timer3.remove();
            this._timer3 = null;
        }

        if (this.glitchTween) this.glitchTween.stop();
        if (this.glitchText) this.glitchText.destroy();

        if (this.glitchSound && this.glitchSound.isPlaying) {
            this.scene.tweens.add({
                targets: this.glitchSound,
                volume: 0,
                duration: 100,
                onComplete: () => {
                    this.glitchSound.stop();
                    this.glitchSound = null;
                },
            });
        }

        this.isReversed = false;
        this.glitchText = null;
        this.glitchTween = null;
    }
}