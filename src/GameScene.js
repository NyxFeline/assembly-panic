import * as Phaser from "phaser";
import EventBus from "./systems/EventBus.js";
import GlitchManager from "./systems/GlitchManager.js";
import InputSystem from "./systems/InputSystem.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.isGameOver = false;
        this.score = 0;
        this.combo = 0;
        this.maxTime = 10;
        this.timeLeft = 10;

        this.flashRect = this.add
            .rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0)
            .setDepth(99);

        const baseVariants = ["base_1", "base_1a", "base_2", "base_2a", "base_3", "base_4", "base_5"];
        this.robotBase = this.add
            .image(this.W / 2, this.H / 2 - 20, Phaser.Math.RND.pick(baseVariants))
            .setDisplaySize(220, 220)
            .setDepth(2)
            .setAlpha(0.2);

        if (this.cache.audio.exists("bgm")) {
            this.sound.play("bgm", { loop: true, volume: 0.5 });
        }

        this.glitchManager = new GlitchManager(this);
        this.inputSystem = new InputSystem(this);

        this.scene.launch("UIScene");
        this.startGame();
    }

    startGame() {
        this.inputSystem.initSlots();
        this.inputSystem.initParts();
        this.startTimer();
        this.glitchManager.startGlitchTimer();
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onTick,
            callbackScope: this,
            loop: true,
        });
    }

    onTick() {
        this.timeLeft -= 1;
        const color = this.timeLeft <= 3 ? "#ff4444" : "#00ff88";
        EventBus.emit("timer:changed", this.timeLeft, color);

        if (this.timeLeft <= 0 && !this.isGameOver) {
            this.timerEvent.remove();
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        if (this.inputSystem) {
            Object.values(this.inputSystem.keys).forEach(k => k.enabled = false);
        }

        if (this.timerEvent) this.timerEvent.remove();
        this.glitchManager.stop();
        if (this.cache.audio.exists("bgm")) this.sound.stopByKey("bgm");
        this.time.removeAllEvents();
        EventBus.emit("game:over", { score: this.score, combo: this.combo });
    }

    update() {
        if (!this.inputSystem) return;
        this.inputSystem.update();
    }
}