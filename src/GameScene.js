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

        // State
        this.isGameOver = false;
        this.score = 0;
        this.combo = 0;
        this.maxTime = 10;
        this.timeLeft = 10;

        this.glitchManager = new GlitchManager(this);
        this.inputSystem = new InputSystem(this);

        this.flashRect = this.add
            .rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0)
            .setDepth(99);

        this.showStartScreen();
    }

    showStartScreen() {
        const cx = this.W / 2;

        this.add.text(cx, 120, "ASSEMBLY PANIC", {
            fontSize: "44px", color: "#00ff88", fontStyle: "bold",
        }).setOrigin(0.5);

        const keys = [
            { key: "A", icon: "gear", label: "Gear" },
            { key: "S", icon: "chip", label: "Chip" },
            { key: "D", icon: "battery", label: "Battery" },
            { key: "F", icon: "bolt", label: "Bolt" },
        ];
        const spacing = 130;
        const startX = cx - (spacing * 1.5);
        const guideY = 280;

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

        this.add.text(cx, 400,
            "Nhìn icon → bấm phím đúng thứ tự\nCảnh báo đỏ = controls bị đảo!", {
            fontSize: "16px", color: "#888888",
            align: "center", lineSpacing: 8,
        }).setOrigin(0.5);

        const startText = this.add.text(cx, 490, "CLICK TO START", {
            fontSize: "28px", color: "#ffffff",
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText, alpha: 0,
            duration: 600, yoyo: true, repeat: -1,
        });

        this.input.once("pointerdown", () => {
            this.children.removeAll(true);
            this.flashRect = this.add
                .rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0)
                .setDepth(99);
            this.startGame();
        });
    }

    startGame() {
        if (this.cache.audio.exists("bgm")) {
            this.sound.play("bgm", { loop: true, volume: 0.4 });
        }

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
        EventBus.emit("game:over");

        this.input.keyboard.enabled = false;
        if (this.timerEvent) this.timerEvent.remove();
        this.glitchManager.stop();
        if (this.cache.audio.exists("bgm")) this.sound.stopByKey("bgm");
        this.time.removeAllEvents();

        this.cameras.main.setBackgroundColor("#0000aa");
        this.children.list.forEach(child => child.setVisible(false));

        const bsodContent = [
            ":( YOUR ROBOT HAS ENCOUNTERED AN ERROR",
            "",
            "FATAL ERROR: CONSCIOUSNESS_DELETED",
            "",
            `SCORE            : ${this.score}`,
            `COMBO MAX        : x${this.combo}`,
            "",
            "A critical process has stopped.",
            "Collecting error data...",
            "",
            "Press  [R]  TO REBOOT SYSTEM",
        ].join("\n");

        this.add.text(80, 80, bsodContent, {
            fontSize: "18px",
            color: "#ffffff",
            fontFamily: "Courier, monospace",
            lineSpacing: 10,
            align: "left",
        }).setDepth(100);

        this.input.keyboard.enabled = true;
        const rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        rKey.once("down", () => this.scene.restart());
    }

    update() {
        this.inputSystem.update();
    }
}