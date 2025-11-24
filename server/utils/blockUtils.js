const blockColors = {
    I: 'cyan',
    J: 'blue',
    L: 'orange',
    O: 'yellow',
    S: 'green',
    T: 'purple',
    Z: 'red',
};

const blocks = {
    I: [
        [1, 1, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
};

function getRandomBlock() {
    const blockTypes = Object.keys(blocks);
    const type = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    const shape = blocks[type];
    const color = blockColors[type];

    return { type, shape, color };
}

module.exports = { blockColors, blocks, getRandomBlock };