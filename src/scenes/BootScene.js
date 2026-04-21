import * as Phaser from "phaser";
import { PIXEL_FONT, TEXT_STROKE } from "../config/constants.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
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
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.image(W / 2, H / 2, "base_1")
            .setDisplaySize(340, 340)
            .setDepth(1).setAlpha(0.15);

        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88)
            .setDepth(2);

        const scanlines = this.add.graphics().setDepth(3).setAlpha(0.18);
        scanlines.fillStyle(0x000000, 1);
        for (let scanY = 0; scanY < H; scanY += 4) {
            scanlines.fillRect(0, scanY, W, 1);
        }

        this.add.text(W / 2, 50, "ASSEMBLY PANIC", {
            fontSize: "50px",
            color: "#00ff88",
            fontFamily: PIXEL_FONT,
            resolution: 2,
            ...TEXT_STROKE,
        }).setOrigin(0.5).setDepth(4);

        this.add.text(W / 2, 92, "GLITCHED  MACHINE  v1.0", {
            fontSize: "18px",
            color: "#336655",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(4);

        this.add.rectangle(W / 2, 112, 640, 1, 0x00ff88, 0.25).setDepth(4);

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

        const termX = W / 2 - 230;
        bootLines.forEach(({ text, color }, i) => {
            this.add.text(termX, 128 + i * 36, text, {
                fontSize: "20px",
                color,
                fontFamily: PIXEL_FONT,
                resolution: 2,
            }).setDepth(4);
        });

        this.add.rectangle(W / 2, 412, 640, 1, 0xff2200, 0.2).setDepth(4);

        this.add.rectangle(W / 2, 434, 645, 44, 0x1a0000, 1)
            .setDepth(4)
            .setStrokeStyle(1, 0xff2200, 0.5);

        this.add.text(W / 2, 420, "⚠  GLITCH MODE: CONTROLS INVERT", {
            fontSize: "20px",
            color: "#ff4444",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(5);

        this.add.text(W / 2, 442,
            "[A] = [D]    [D] = [A]    [S] = [F]    [F] = [S]", {
            fontSize: "20px",
            color: "#ff8800",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(5);

        const warnText = this.add.text(W / 2, 470,
            "⚠  WARNING: SYSTEM GLITCH DETECTED. INPUTS MAY INVERT.  ⚠", {
            fontSize: "15px",
            color: "#ff4444",
            fontFamily: PIXEL_FONT,
            resolution: 2,
            align: "center",
        }).setOrigin(0.5).setDepth(5);

        this.warnTween = this.tweens.add({
            targets: warnText,
            alpha: 0.15,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        const btnY = 510;
        const btnBg = this.add.rectangle(W / 2, btnY, 380, 46, 0x001a0d, 1)
            .setDepth(4)
            .setStrokeStyle(2, 0x00ff88, 1);

        const btnText = this.add.text(W / 2, btnY, "[ CLICK TO INITIALIZE ]", {
            fontSize: "24px",
            color: "#00ff88",
            fontFamily: PIXEL_FONT,
            resolution: 2,
            ...TEXT_STROKE,
        }).setOrigin(0.5).setDepth(5);

        this.btnTween = this.tweens.add({
            targets: [btnBg, btnText],
            alpha: 0.25,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        this.add.text(W / 2, 560,
            "SYS BUILD 0.4.1  //  ANTHROPIC ROBOTICS CORP  //  NyxFeline", {
            fontSize: "10px",
            color: "#2a4a38",
            fontFamily: PIXEL_FONT,
            resolution: 2,
        }).setOrigin(0.5).setDepth(4);

        this.input.once("pointerdown", () => {
            if (this.sound.context?.state === "suspended") {
                this.sound.context.resume();
            }

            this.warnTween?.stop();
            this.btnTween?.stop();

            this.scene.start("GameScene");
        });
    }
}