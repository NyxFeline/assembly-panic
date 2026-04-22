import * as Phaser from "phaser";
import EventBus from "./EventBus.js";
import {
    GLITCH_DURATION,
    GLITCH_MIN_DELAY, GLITCH_MAX_DELAY, GLITCH_TELEGRAPH,
    PIXEL_FONT,
} from "../config/constants.js";

export default class GlitchManager {
    constructor(scene) {
        this.scene = scene;
        this.isReversed = false;
        this.glitchText = null;
        this.glitchTween = null;

        this._timer1 = null;
        this._timer2 = null;
        this._timer3 = null;

        this._warnTween = null;
        this._warnText = null;
        this._redFlash = null;

        this.glitchSound = null;
    }

    startGlitchTimer() {
        this._timer1 = this.scene.time.delayedCall(Phaser.Math.Between(GLITCH_MIN_DELAY, GLITCH_MAX_DELAY), () => {
            if (this.scene.isGameOver) return;

            this._redFlash = this.scene.add
                .rectangle(this.scene.W / 2, this.scene.H / 2, this.scene.W, this.scene.H, 0xff0000, 0.12)
                .setDepth(50);

            this._warnText = this.scene.add
                .text(this.scene.W / 2, this.scene.H / 2 - 30, "⚠ SYSTEM ERROR\nREVERSE CONTROL", {
                    fontSize: "30px", color: "#ff4444", align: "center",
                })
                .setOrigin(0.5)
                .setDepth(51);

            this._warnTween = this.scene.tweens.add({
                targets: this._warnText, alpha: 0, duration: 200, yoyo: true, repeat: -1,
            });

            this._timer2 = this.scene.time.delayedCall(GLITCH_TELEGRAPH, () => {
                if (this.scene.isGameOver) {
                    if (this._redFlash) { this._redFlash.destroy(); this._redFlash = null; }
                    if (this._warnText) { this._warnText.destroy(); this._warnText = null; }
                    if (this._warnTween) { this._warnTween.stop(); this._warnTween = null; }
                    return;
                }

                this._warnTween.stop();
                this._warnText.destroy();
                this._redFlash.destroy();

                this._warnTween = null;
                this._warnText = null;
                this._redFlash = null;

                this.isReversed = true;
                EventBus.emit("glitch:start");

                if (this.scene.cache.audio.exists("glitch")) {
                    this.glitchSound = this.scene.sound.add("glitch");
                    this.glitchSound.play({ loop: true, volume: 0.5 });
                }

                this.glitchText = this.scene.add
                    .text(20, 78, "[ REVERSED ]", {
                        fontSize: "15px", color: "#ff4444",
                        fontFamily: PIXEL_FONT,
                    })
                    .setDepth(10);

                this.glitchTween = this.scene.tweens.add({
                    targets: this.glitchText, alpha: 0, duration: 300, yoyo: true, repeat: -1,
                });

                this._timer3 = this.scene.time.delayedCall(GLITCH_DURATION, () => {
                    this.isReversed = false;
                    EventBus.emit("glitch:end");

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

        if (this._warnTween) { this._warnTween.stop(); this._warnTween = null; }
        if (this._warnText) { this._warnText.destroy(); this._warnText = null; }
        if (this._redFlash) { this._redFlash.destroy(); this._redFlash = null; }

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