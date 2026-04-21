import * as Phaser from "phaser";
import EventBus from "../systems/EventBus";
import { PIXEL_FONT } from "../config/constants.js";

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene" });
    }

    create() {
        this.timerText = this.add.text(20, 16, "SYS TIMER: 10", {
            fontSize: "26px", color: "#00ff88",
            fontFamily: PIXEL_FONT,
        }).setDepth(10);

        this.scoreText = this.add.text(this.scale.width - 20, 16, "OUTPUT SCORE: 0", {
            fontSize: "26px", color: "#ffffff",
            fontFamily: PIXEL_FONT,
        }).setOrigin(1, 0).setDepth(10);

        this.comboText = this.add.text(20, 50, "CHAIN STATUS: x0", {
            fontSize: "18px", color: "#ffaa00",
            fontFamily: PIXEL_FONT,
        }).setDepth(10);

        this.glitchWarning = this.add.text(
            this.scale.width / 2, this.scale.height / 2 - 40,
            "⚠  INPUT MATRIX INVERTED  ⚠\n[A] = [D]     [S] = [F]", {
            fontSize: "22px", color: "#ff4444",
            fontFamily: PIXEL_FONT,
            align: "center", lineSpacing: 6, resolution: 2,
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        this.glitchWarningTween = null;

        EventBus.on("timer:changed", (time, color) => {
            this.timerText.setText(`SYS TIMER: ${Math.ceil(time)}`);
            this.timerText.setColor(color);
        });

        EventBus.on("score:changed", (score) => {
            this.scoreText.setText(`OUTPUT SCORE: ${score}`);
        });

        EventBus.on("combo:changed", (combo) => {
            this.comboText.setText(`CHAIN STATUS: x${combo}`);
        });

        EventBus.on("game:over", ({ score, combo }) => {
            this.timerText.setVisible(false);
            this.scoreText.setVisible(false);
            this.comboText.setVisible(false);
            this.glitchWarning.setVisible(false);
            if (this.glitchWarningTween) this.glitchWarningTween.stop();

            this.add.rectangle(
                this.scale.width / 2, this.scale.height / 2,
                this.scale.width, this.scale.height, 0x0000aa
            ).setDepth(50);

            const bsodLines = [
                ":( YOUR ROBOT HAS ENCOUNTERED AN ERROR",
                "",
                "FATAL ERROR: CONSCIOUSNESS_DELETED",
                "",
                `OUTPUT SCORE     : ${score}`,
                `COMBO MAX        : x${combo}`,
                "",
                "A critical process has stopped.",
                "Collecting error data...",
                "",
            ].join("\n");

            const bsodText = this.add.text(80, 80, "", {
                fontSize: "18px", color: "#ffffff",
                fontFamily: PIXEL_FONT,
                lineSpacing: 10, align: "left",
            }).setDepth(51);

            let charIndex = 0;
            const typeEvent = this.time.addEvent({
                delay: 18,
                repeat: bsodLines.length - 1,
                callback: () => {
                    charIndex++;
                    bsodText.setText(bsodLines.substring(0, charIndex));

                    if (charIndex >= bsodLines.length) {
                        typeEvent.remove();

                        const rebootText = this.add.text(
                            80, bsodText.y + bsodText.height + 16,
                            "Press  [R]  TO REBOOT SYSTEM", {
                            fontSize: "18px", color: "#ffffff",
                            fontFamily: PIXEL_FONT,
                        }).setDepth(51);

                        this.tweens.add({
                            targets: rebootText, alpha: 0,
                            duration: 500, yoyo: true, repeat: -1,
                        });

                        const rKey = this.input.keyboard.addKey(
                            Phaser.Input.Keyboard.KeyCodes.R
                        );
                        rKey.once("down", () => {
                            EventBus.removeAllListeners();
                            this.scene.stop("UIScene");
                            this.scene.start("GameScene");
                        });
                    }
                },
            });
        });

        EventBus.on("glitch:start", () => {
            this.timerText.setColor("#ff4444");
            this.scoreText.setColor("#ff4444");
            this.comboText.setColor("#ff4444");
            this.glitchWarning.setVisible(true);
            this.glitchWarningTween = this.tweens.add({
                targets: this.glitchWarning, alpha: 0,
                duration: 300, yoyo: true, repeat: -1,
            });
        });

        EventBus.on("glitch:end", () => {
            this.timerText.setColor("#00ff88");
            this.scoreText.setColor("#ffffff");
            this.comboText.setColor("#ffaa00");
            this.glitchWarning.setVisible(false);
            if (this.glitchWarningTween) {
                this.glitchWarningTween.stop();
                this.glitchWarning.setAlpha(1);
            }
        });

        this.events.on("shutdown", () => {
            EventBus.off("timer:changed");
            EventBus.off("score:changed");
            EventBus.off("combo:changed");
            EventBus.off("game:over");
            EventBus.off("glitch:start");
            EventBus.off("glitch:end");
        });
    }
}