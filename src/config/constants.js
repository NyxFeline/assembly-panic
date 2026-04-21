export const PIXEL_FONT = '"Jersey 10", Courier, monospace';

export const TEXT_STROKE = { stroke: "#000000", strokeThickness: 3 };

export const GLITCH_DURATION = 3000;

export const PART_MAP = {
    A: { variants: ["head_1", "head_1a", "head_2", "head_3", "head_4", "head_4a", "head_5", "head_6", "head_7"], dx: 5, dy: 12, size: [298, 278] },
    S: { variants: ["track_1", "track_2"], dx: -1, dy: 44, size: [182, 97] },
    D: { variants: ["side_1", "side_2", "side_2a", "side_3", "side_4"], dx: 9, dy: -2, size: [188, 208] },
    F: { variants: ["back_1", "back_2", "back_3", "back_4", "back_5", "back_6"], dx: 10, dy: -9, size: [260, 280] },
};

export const REVERSE_MAP = { A: "D", D: "A", S: "F", F: "S" };