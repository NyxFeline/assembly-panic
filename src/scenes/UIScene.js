import * as Phaser from "phaser";
import EventBus from "../systems/EventBus";

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene" });
    }

    create() {
        this.timerText = this.add.text(20, 16, "SYS TIMER: 10", {
            fontSize: "26px", color: "#00ff88",
        }).setDepth(10);

        this.scoreText = this.add.text(this.scale.width - 20, 16, "OUTPUT SCORE: 0", {
            fontSize: "26px", color: "#ffffff",
        }).setOrigin(1, 0).setDepth(10);

        this.comboText = this.add.text(20, 50, "CHAIN STATUS: x0", {
            fontSize: "18px", color: "#ffaa00",
        }).setDepth(10);

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

        EventBus.on("game:over", () => {
            this.timerText.setVisible(false);
            this.scoreText.setVisible(false);
            this.comboText.setVisible(false);
        });

        this.events.on("shutdown", () => {
            EventBus.off("timer:changed");
            EventBus.off("score:changed");
            EventBus.off("combo:changed");
            EventBus.off("game:over");
        });
    }
}