import * as Phaser from "phaser";
import EventBus from "./systems/EventBus.js";
import GlitchManager from "./systems/GlitchManager.js";
import InputSystem from "./systems/InputSystem.js";

const PIXEL_FONT = '"Press Start 2P", Courier, monospace';
const TEXT_STROKE = { stroke: "#000000", strokeThickness: 3 };

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("head_1", "/assets/img/robot_head_1.png");
        this.load.image("head_1a", "/assets/img/robot_head_1a.png");
        this.load.image("head_2", "/assets/img/robot_head_2.png");
        this.load.image("head_3", "/assets/img/robot_head_3.png");
        this.load.image("head_4", "/assets/img/robot_head_4.png");
        this.load.image("head_4a", "/assets/img/robot_head_4a.png");
        this.load.image("head_5", "/assets/img/robot_head_5.png");
        this.load.image("head_6", "/assets/img/robot_head_6.png");
        this.load.image("head_7", "/assets/img/robot_head_7.png");

        this.load.image("track_1", "/assets/img/robot_track_1.png");
        this.load.image("track_2", "/assets/img/robot_track_2.png");

        this.load.image("side_1", "/assets/img/robot_sideattach_1.png");
        this.load.image("side_2", "/assets/img/robot_sideattach_2.png");
        this.load.image("side_2a", "/assets/img/robot_sideattach_2a.png");
        this.load.image("side_3", "/assets/img/robot_sideattach_3.png");
        this.load.image("side_4", "/assets/img/robot_sideattach_4.png");

        this.load.image("back_1", "/assets/img/robot_backattach_1.png");
        this.load.image("back_2", "/assets/img/robot_backattach_2.png");
        this.load.image("back_3", "/assets/img/robot_backattach_3.png");
        this.load.image("back_4", "/assets/img/robot_backattach_4.png");
        this.load.image("back_5", "/assets/img/robot_backattach_5.png");
        this.load.image("back_6", "/assets/img/robot_backattach_6.png");

        this.load.image("base_1", "/assets/img/robot_base_1.png");
        this.load.image("base_1a", "/assets/img/robot_base_1a.png");
        this.load.image("base_2", "/assets/img/robot_base_2.png");
        this.load.image("base_2a", "/assets/img/robot_base_2a.png");
        this.load.image("base_3", "/assets/img/robot_base_3.png");
        this.load.image("base_4", "/assets/img/robot_base_4.png");
        this.load.image("base_5", "/assets/img/robot_base_5.png");

        this.load.image("slot_frame", "/assets/img/slot_frame.png");

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

        this.add.image(this.W / 2, this.H / 2, "robot_base")
            .setDisplaySize(220, 220)
            .setDepth(1)
            .setAlpha(0.6);

        this.add.text(this.W / 2, 80, "ASSEMBLY PANIC", {
            fontSize: "28px",
            color: "#00ff88",
            fontStyle: "bold",
            fontFamily: PIXEL_FONT,
            ...TEXT_STROKE,
        }).setOrigin(0.5);

        const guideKeys = [
            { key: "A", icon: "head", label: "HEAD" },
            { key: "S", icon: "track", label: "TRACK" },
            { key: "D", icon: "sideattach", label: "SIDE" },
            { key: "F", icon: "backattach", label: "BACK" },
        ];
        const spacing = 130;
        const startX = this.W / 2 - spacing * 1.5;
        const guideY = 240;

        guideKeys.forEach(({ key, icon, label }, i) => {
            const x = startX + i * spacing;
            this.add.rectangle(x, guideY - 30, 54, 54, 0x1a2a3a)
                .setStrokeStyle(1, 0x334455);
            this.add.text(x, guideY - 30, `[${key}]`, {
                fontSize: "13px",
                color: "#ffdd00",
                fontFamily: PIXEL_FONT,
                ...TEXT_STROKE,
            }).setOrigin(0.5);
            this.add.image(x, guideY + 32, icon).setDisplaySize(52, 52);
            this.add.text(x, guideY + 66, label, {
                fontSize: "9px",
                color: "#aaaaaa",
                fontFamily: PIXEL_FONT,
                ...TEXT_STROKE,
            }).setOrigin(0.5);
        });

        this.add.text(this.W / 2, 360,
            "Nhìn icon → bấm phím đúng thứ tự", {
            fontSize: "11px",
            color: "#888888",
            fontFamily: PIXEL_FONT,
            align: "center",
            lineSpacing: 8,
            ...TEXT_STROKE,
        }).setOrigin(0.5);

        this.add.text(this.W / 2, 400,
            "Cảnh báo đỏ = controls bị đảo!", {
            fontSize: "11px",
            color: "#ff4444",
            fontFamily: PIXEL_FONT,
            align: "center",
            ...TEXT_STROKE,
        }).setOrigin(0.5);

        const offlineText = this.add.text(this.W / 2, 460,
            "[ CLICK TO INITIALIZE ]", {
            fontSize: "15px",
            color: "#00ff88",
            fontFamily: PIXEL_FONT,
            ...TEXT_STROKE,
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

            this.robotBase = this.add
                .image(this.W / 2, this.H / 2 - 20, "robot_base")
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
        });
    }

    startGame() {
        this.inputSystem.initSlots();
        this.inputSystem.initParts();
        this.startTimer();
        this.glitchManager.startGlitchTimer();
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
        EventBus.emit("game:over", { score: this.score, combo: this.combo });
    }

    update() {
        if (!this.inputSystem) return;
        this.inputSystem.update();
    }
}