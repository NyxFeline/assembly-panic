import * as Phaser from "phaser";
import EventBus from "./systems/EventBus.js";
import GlitchManager from "./systems/GlitchManager.js";
import InputSystem from "./systems/InputSystem.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("gear", "/assets/img/gear.png");
        this.load.image("chip", "/assets/img/chip.png");
        this.load.image("battery", "/assets/img/battery.png");
        this.load.image("bolt", "/assets/img/bolt.png");

        this.load.audio("glitch", "/assets/sounds/glitch.ogg");
        this.load.audio("bgm", "/assets/sounds/bgm.ogg");
        this.load.audio("click", "/assets/sounds/click.ogg");
        this.load.audio("error", "/assets/sounds/error.ogg");
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

        // Title
        this.add.text(this.W / 2, 100, "ASSEMBLY PANIC", {
            fontSize: "44px", color: "#00ff88", fontStyle: "bold",
        }).setOrigin(0.5);

        // Key guide
        const keys = [
            { key: "A", icon: "gear", label: "Gear" },
            { key: "S", icon: "chip", label: "Chip" },
            { key: "D", icon: "battery", label: "Battery" },
            { key: "F", icon: "bolt", label: "Bolt" },
        ];
        const spacing = 130;
        const startX = this.W / 2 - spacing * 1.5;
        const guideY = 260;

        keys.forEach(({ key, icon, label }, i) => {
            const x = startX + i * spacing;
            this.add.rectangle(x, guideY - 30, 52, 52, 0x223344).setOrigin(0.5);
            this.add.text(x, guideY - 30, `[${key}]`, {
                fontSize: "20px", color: "#ffdd00",
            }).setOrigin(0.5);
            this.add.image(x, guideY + 30, icon).setDisplaySize(48, 48);
            this.add.text(x, guideY + 62, label, {
                fontSize: "13px", color: "#aaaaaa",
            }).setOrigin(0.5);
        });

        this.add.text(this.W / 2, 370,
            "Nhìn icon → bấm phím đúng thứ tự\nCảnh báo đỏ = controls bị đảo!", {
            fontSize: "16px", color: "#888888",
            align: "center", lineSpacing: 8,
        }).setOrigin(0.5);

        this.add.text(this.W / 2, 420,
            "Khi đảo:  A ↔ D     S ↔ F", {
            fontSize: "15px", color: "#ff4444",
            fontFamily: "Courier, monospace",
            align: "center",
        }).setOrigin(0.5);

        // Click to start
        const offlineText = this.add.text(this.W / 2, 470, "SYSTEM OFFLINE - CLICK TO INITIALIZE", {
            fontSize: "20px", color: "#00ff88",
            fontFamily: "Courier, monospace",
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: offlineText, alpha: 0,
            duration: 600, yoyo: true, repeat: -1,
        });

        this.input.once("pointerdown", () => {
            this.children.removeAll(true);

            this.flashRect = this.add
                .rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0)
                .setDepth(99);

            if (this.cache.audio.exists("bgm")) {
                this.sound.play("bgm", { loop: true, volume: 0.5 });
            }

            this.glitchManager = new GlitchManager(this);
            this.inputSystem = new InputSystem(this);

            this.scene.launch("UIScene");
            this.startGame();
        });
    }


    startGame() {
        const cx = this.W / 2;

        this.scene.launch("UIScene");

        this.add.text(cx, 160, "CẦN:", {
            fontSize: "22px", color: "#ffdd00",
        }).setOrigin(0.5);

        this.inputSystem.renderOrderIcons();

        this.inputText = this.add.text(cx, 380, "", {
            fontSize: "28px", color: "#00ccff",
        }).setOrigin(0.5).setDepth(10);

        this.drawKeyBar();

        this.startTimer();
        this.glitchManager.startGlitchTimer();
    }

    drawKeyBar() {
        const keys = [
            { key: "A", icon: "gear" },
            { key: "S", icon: "chip" },
            { key: "D", icon: "battery" },
            { key: "F", icon: "bolt" },
        ];
        const spacing = 100;
        const startX = this.W / 2 - spacing * 1.5;
        const y = this.H - 48;

        this.add.rectangle(this.W / 2, y, this.W, 72, 0x111122).setOrigin(0.5);

        keys.forEach(({ key, icon }, i) => {
            const x = startX + i * spacing;
            this.add.image(x - 18, y, icon).setDisplaySize(30, 30).setAlpha(0.7);
            this.add.text(x + 14, y, `[${key}]`, {
                fontSize: "16px", color: "#666688",
            }).setOrigin(0, 0.5);
        });
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000, callback: this.onTick,
            callbackScope: this, loop: true,
        });
    }

    onTick() {
        this.timeLeft -= 1;
        const color = this.timeLeft <= 3 ? "#ff4444" : "#00ff88";
        EventBus.emit("timer:changed", this.timeLeft, color);

        if (this.timeLeft <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            this.timerEvent.remove();
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.input.keyboard.enabled = false;
        if (this.timerEvent) this.timerEvent.remove();
        this.glitchManager.stop();
        if (this.cache.audio.exists("bgm")) this.sound.stopByKey("bgm");
        this.time.removeAllEvents();

        EventBus.emit("game:over", {
            score: this.score,
            combo: this.combo,
        });
    }

    update() {
        if (!this.inputSystem) return;
        this.inputSystem.update();
    }
}