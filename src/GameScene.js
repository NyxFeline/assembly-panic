import * as Phaser from "phaser";
import EventBus from "./systems/EventBus.js";
import GlitchManager from "./systems/GlitchManager.js";
import InputSystem from "./systems/InputSystem.js";

const PIXEL_FONT = '"Jersey 10", Courier, monospace';
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

        this.add.image(this.W / 2, this.H / 2, "base_1")
            .setDisplaySize(340, 340)
            .setDepth(1).setAlpha(0.15);

        this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.88)
            .setDepth(2);

        for (let scanY = 0; scanY < this.H; scanY += 4) {
            this.add.rectangle(this.W / 2, scanY, this.W, 1, 0x000000, 0.18)
                .setDepth(3);
        }

        this.add.text(this.W / 2, 50, "ASSEMBLY PANIC", {
            fontSize: "50px",
            color: "#00ff88",
            fontFamily: PIXEL_FONT,
            resolution: 2,
            ...TEXT_STROKE,
        }).setOrigin(0.5).setDepth(4);

        this.add.text(this.W / 2, 92, "GLITCHED  MACHINE  v1.0", {
            fontSize: "18px",
            color: "#336655",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(4);

        this.add.rectangle(this.W / 2, 112, 640, 1, 0x00ff88, 0.25).setDepth(4);

        const bootLines = [
            { text: "SYSTEM BOOT SEQUENCE...", color: "#557766" },
            { text: "", color: "#aaaaaa" },
            { text: "[A]  ──  ATTACH HEAD UNIT", color: "#00ff88" },
            { text: "[S]  ──  MOUNT TRACK SYSTEM", color: "#00ff88" },
            { text: "[D]  ──  EQUIP SIDE WEAPON", color: "#00ff88" },
            { text: "[F]  ──  INSTALL BACKPACK", color: "#00ff88" },
            { text: "", color: "#aaaaaa" },
            { text: "OBJECTIVE: MATCH KEY SEQUENCE BEFORE TIMER EXPIRES.", color: "#557766" },
        ];

        const termX = this.W / 2 - 230;
        const termStartY = 128;
        const lineH = 36;

        bootLines.forEach(({ text, color }, i) => {
            this.add.text(termX, termStartY + i * lineH, text, {
                fontSize: "20px",
                color,
                fontFamily: PIXEL_FONT,
                resolution: 2,
            }).setDepth(4);
        });

        this.add.rectangle(this.W / 2, 412, 640, 1, 0xff2200, 0.2).setDepth(4);

        this.add.rectangle(this.W / 2, 434, 645, 44, 0x1a0000, 1)
            .setDepth(4)
            .setStrokeStyle(1, 0xff2200, 0.5);

        this.add.text(this.W / 2, 420, "⚠  GLITCH MODE: CONTROLS INVERT", {
            fontSize: "20px",
            color: "#ff4444",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(5);

        this.add.text(this.W / 2, 442,
            "[A] = [D]    [D] = [A]    [S] = [F]    [F] = [S]", {
            fontSize: "20px",
            color: "#ff8800",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(5);

        const warnText = this.add.text(this.W / 2, 470,
            "⚠  WARNING: SYSTEM GLITCH DETECTED. INPUTS MAY INVERT.  ⚠", {
            fontSize: "15px",
            color: "#ff4444",
            fontFamily: PIXEL_FONT,
            resolution: 2,
            align: "center",
        }).setOrigin(0.5).setDepth(5);

        this.tweens.add({
            targets: warnText,
            alpha: 0.15,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        const btnY = 510;
        const btnBg = this.add.rectangle(this.W / 2, btnY, 380, 46, 0x001a0d, 1)
            .setDepth(4)
            .setStrokeStyle(2, 0x00ff88, 1);

        const btnText = this.add.text(this.W / 2, btnY, "[ CLICK TO INITIALIZE ]", {
            fontSize: "24px",
            color: "#00ff88",
            fontFamily: PIXEL_FONT,
            resolution: 2,
            ...TEXT_STROKE,
        }).setOrigin(0.5).setDepth(5);

        this.tweens.add({
            targets: [btnBg, btnText],
            alpha: 0.25,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        this.add.text(this.W / 2, 560,
            "SYS BUILD 0.4.1  //  ANTHROPIC ROBOTICS CORP  //  NyxFeline", {
            fontSize: "10px",
            color: "#2a4a38",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(4);

        this.input.once("pointerdown", () => {
            this.children.removeAll(true);

            this.flashRect = this.add
                .rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0)
                .setDepth(99);

            const baseVariants = ["base_1", "base_1a", "base_2", "base_2a", "base_3", "base_4", "base_5"];
            const chosenBase = Phaser.Math.RND.pick(baseVariants);

            this.robotBase = this.add
                .image(this.W / 2, this.H / 2 - 20, chosenBase)
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