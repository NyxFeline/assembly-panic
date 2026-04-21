import * as Phaser from "phaser";
import EventBus from "./EventBus.js";

const PIXEL_FONT = '"Jersey 10", Courier, monospace';
const TEXT_STROKE = { stroke: "#000000", strokeThickness: 3 };

const PART_MAP = {
    A: { variants: ["head_1", "head_1a", "head_2", "head_3", "head_4", "head_4a", "head_5", "head_6", "head_7"], dx: 5, dy: 12, size: [298, 278] },
    S: { variants: ["track_1", "track_2"], dx: -1, dy: 44, size: [182, 97] },
    D: { variants: ["side_1", "side_2", "side_2a", "side_3", "side_4"], dx: 9, dy: -2, size: [188, 208] },
    F: { variants: ["back_1", "back_2", "back_3", "back_4", "back_5", "back_6"], dx: 10, dy: -9, size: [260, 280] },
};

export default class InputSystem {
    constructor(scene) {
        this.scene = scene;

        this.targetOrder = ["A", "S", "D"];
        this.currentInput = [];
        this.slots = [];
        this.parts = {};
        this.attachedParts = {};
        this.currentVariants = {};

        this.keys = {
            A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            F: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        };

        this._rollVariants();
    }

    _rollVariants() {
        ["A", "S", "D", "F"].forEach(key => {
            this.currentVariants[key] = Phaser.Math.RND.pick(PART_MAP[key].variants);
        });
    }

    _tex(key) {
        return this.currentVariants[key];
    }

    initSlots() {
        const cx = this.scene.W / 2;
        const spacing = 160;
        const y = 260;
        const startX = cx - (this.targetOrder.length - 1) * spacing / 2;

        this.slots = this.targetOrder.map((expectedKey, i) => {
            const x = startX + i * spacing;

            const sprite = this.scene.add
                .image(x, y, "slot_frame")
                .setDisplaySize(110, 110)
                .setDepth(5)
                .setTint(0x556677);

            const icon = this.scene.add
                .image(x, y, this._tex(expectedKey))
                .setDisplaySize(90, 90)
                .setAlpha(0.3)
                .setDepth(6);

            const label = this.scene.add
                .text(x, y + 66, expectedKey, {
                    fontSize: "15px", color: "#38bdf8",
                    fontFamily: PIXEL_FONT, ...TEXT_STROKE,
                })
                .setOrigin(0.5).setDepth(6);

            return { expectedKey, filled: false, x, y, sprite, icon, label };
        });
    }

    initParts() {
        const partKeys = ["A", "S", "D", "F"];
        const spacing = 150;
        const startX = this.scene.W / 2 - (partKeys.length - 1) * spacing / 2;
        const y = this.scene.H - 55;

        this.scene.add
            .rectangle(this.scene.W / 2, y, this.scene.W, 90, 0x0d1117)
            .setOrigin(0.5).setDepth(5);

        partKeys.forEach((key) => {
            const i = partKeys.indexOf(key);
            const x = startX + i * spacing;

            const bg = this.scene.add
                .rectangle(x, y - 10, 90, 90, 0x1a2a3a)
                .setStrokeStyle(1, 0x334455)
                .setDepth(5);

            const sprite = this.scene.add
                .image(x, y - 10, this._tex(key))
                .setDisplaySize(80, 80)
                .setDepth(6);

            this.scene.add
                .text(x, y + 26, `[${key}]`, {
                    fontSize: "10px", color: "#4488aa",
                    fontFamily: PIXEL_FONT, ...TEXT_STROKE,
                })
                .setOrigin(0.5).setDepth(6);

            this.parts[key] = { key, sprite, bg, x, y: y - 10 };
        });
    }

    snapPartToSlot(key, slot) {
        const part = this.parts[key];
        if (!part) return;

        const clone = this.scene.add
            .image(part.x, part.y, this._tex(key))
            .setDisplaySize(90, 90)
            .setDepth(20);

        this.scene.tweens.add({
            targets: clone,
            x: slot.x, y: slot.y,
            duration: 160,
            ease: "Cubic.easeOut",
            onComplete: () => {
                clone.destroy();

                slot.sprite.setTint(0x22c55e);
                slot.icon.setAlpha(1).setTint(0x22c55e);
                part.sprite.setAlpha(0.2);
                part.bg.setFillStyle(0x0d1117);

                this._attachToRobot(key, slot);
                this.scene.cameras.main.flash(60, 100, 255, 100, false);
            },
        });
    }

    _attachToRobot(key, slot) {
        const anchor = PART_MAP[key];
        const rb = this.scene.robotBase;
        const tx = rb.x + anchor.dx;
        const ty = rb.y + anchor.dy;

        if (this.attachedParts[key]) this.attachedParts[key].destroy();

        const partSprite = this.scene.add
            .image(slot.x, slot.y, this._tex(key))
            .setDisplaySize(...anchor.size)
            .setDepth(3)
            .setAlpha(0);

        this.scene.tweens.add({
            targets: partSprite,
            x: tx, y: ty, alpha: 1,
            duration: 220, ease: "Back.easeOut", delay: 60,
        });

        this.attachedParts[key] = partSprite;

        const attachedCount = Object.keys(this.attachedParts).length;
        const totalParts = this.targetOrder.length;
        const targetAlpha = 0.2 + (attachedCount / totalParts) * 0.75;

        this.scene.tweens.add({
            targets: rb, alpha: targetAlpha, duration: 300,
        });
    }

    onWrongInput(key) {
        const part = this.parts[key];
        if (part) {
            const ox = part.x;
            this.scene.tweens.add({
                targets: part.sprite,
                x: ox + 8, duration: 50, yoyo: true, repeat: 3,
                onComplete: () => { part.sprite.x = ox; },
            });
        }

        this.scene.cameras.main.shake(140, 0.013);
        this.scene.flashRect.setFillStyle(0xff2200, 0.3);
        this.scene.time.delayedCall(80, () => this.scene.flashRect.setAlpha(0));

        if (this.scene.cache.audio.exists("error")) {
            this.scene.sound.play("error", { volume: 0.6 });
        }

        this.scene.combo = 0;
        EventBus.emit("combo:changed", 0);
        this.currentInput = [];
        this.resetSlotsVisual();
    }

    resetSlotsVisual() {
        this.slots.forEach(slot => {
            slot.filled = false;
            slot.sprite.setTint(0x556677);
            slot.icon.setAlpha(0.3).clearTint();
        });
        Object.values(this.parts).forEach(p => {
            p.sprite.setAlpha(1);
            p.bg.setFillStyle(0x1a2a3a);
        });
    }

    handleInput(key) {
        if (this.scene.isGameOver) return;

        const slot = this.slots[this.currentInput.length];
        if (!slot) return;

        if (key === slot.expectedKey) {
            this.currentInput.push(key);
            slot.filled = true;
            this.snapPartToSlot(key, slot);

            if (this.scene.cache.audio.exists("click")) {
                this.scene.sound.play("click", { volume: 0.6 });
            }

            if (this.currentInput.length === this.slots.length) {
                this.onCompleteSequence();
            }
        } else {
            this.onWrongInput(key);
        }
    }

    onCompleteSequence() {
        this.slots.forEach(slot => {
            this.scene.tweens.add({
                targets: [slot.sprite, slot.icon, slot.label],
                alpha: 0,
                duration: 120,
            });
        });

        this.scene.cameras.main.flash(200, 255, 255, 255, false);
        this.scene.tweens.add({
            targets: this.scene.robotBase,
            alpha: 1,
            duration: 150, yoyo: true, hold: 120,
        });

        this.scene.combo += 1;
        this.scene.score += 10 * this.scene.combo;
        EventBus.emit("score:changed", this.scene.score);
        EventBus.emit("combo:changed", this.scene.combo);

        this.scene.time.delayedCall(450, () => this.resetOrder());
    }

    resetOrder() {
        this.slots.forEach(s => {
            s.sprite.destroy();
            s.icon.destroy();
            s.label.destroy();
        });
        this.slots = [];

        Object.values(this.attachedParts).forEach(s => {
            this.scene.tweens.add({
                targets: s, alpha: 0, duration: 150,
                onComplete: () => s.destroy(),
            });
        });
        this.attachedParts = {};

        this.scene.tweens.add({
            targets: this.scene.robotBase, alpha: 0.2, duration: 200,
        });

        Object.values(this.parts).forEach(p => {
            p.sprite.setAlpha(1);
            p.bg.setFillStyle(0x1a2a3a);
        });

        this._rollVariants();
        Object.values(this.parts).forEach(p => {
            p.sprite.setTexture(this._tex(p.key));
        });

        this.targetOrder = Phaser.Utils.Array.Shuffle(["A", "S", "D", "F"]).slice(0, 3);
        this.currentInput = [];

        this.initSlots();

        this.scene.timeLeft = this.scene.maxTime;
        this.scene.maxTime = Math.max(3, this.scene.maxTime - 0.5);
        EventBus.emit("timer:changed", this.scene.timeLeft, "#00ff88");
    }

    update() {
        const { JustDown } = Phaser.Input.Keyboard;
        const reverseMap = { A: "D", D: "A", S: "F", F: "S" };
        const translate = (k) => this.scene.glitchManager.isReversed ? reverseMap[k] : k;

        if (JustDown(this.keys.A)) this.handleInput(translate("A"));
        if (JustDown(this.keys.S)) this.handleInput(translate("S"));
        if (JustDown(this.keys.D)) this.handleInput(translate("D"));
        if (JustDown(this.keys.F)) this.handleInput(translate("F"));
    }
}