const { getRandomBlock } = require('../utils/blockUtils');
const { isCollision } = require('./collisionManager');
const { fixBlock, checkLines, setHoverBlock } = require('./blockManager');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');
const { refreshGame } = require('./refreshGame');

class Game {
    constructor(socket, player) {
        this.attach(socket, player);
    }

    attach(socket, player) {
        this.socket = socket;
        if (player) this.player = player;
        this.updateRoom();
    }

    updateRoom() {
        const room = this.socket.data.room || getRoomById(getPlayerRoom(this.socket.id));
        if (!this.socket.data.room && room) this.socket.data.room = room;
        this.room = room;
        return room;
    }

    moveBlock(direction) {
        const player = this.player || this.socket.data.player;
        if (!player) return false;
        this.player = player;

        const room = this.updateRoom();
        if (((!room && player.isGameOver) || (room && room.isGameOver))) return false;

        if (isCollision(player, direction)) {
            if (!player.isGameOver && direction.y === 1) {
                fixBlock(player, this.socket);
                checkLines(player, this.socket);

                player.currentBlock = player.nextBlock;

                if (room) {
                    const playerInRoom = room.players.find(p => p.id === this.socket.id);
                    if (!playerInRoom) return false;

                    if (typeof playerInRoom.blocksFixed === 'undefined') {
                        playerInRoom.blocksFixed = 0;
                    }

                    playerInRoom.blocksFixed += 1;

                    if (!room.blocksQueue[playerInRoom.blocksFixed]) {
                        room.blocksQueue[playerInRoom.blocksFixed] = getRandomBlock();
                    }

                    player.nextBlock = { ...room.blocksQueue[playerInRoom.blocksFixed] };
                } else {
                    player.nextBlock = getRandomBlock();
                }

                player.position = { x: 4, y: 0 };

                if (isCollision(player, { x: 0, y: 0 })) {
                    player.isGameOver = true;
                    this.socket.emit('gameOver', { score: player.score });
                    return false;
                }

                refreshGame(this.socket, player);
            }

            if (direction.y === 1 && player.position.y <= 0) {
                if (isCollision(player, { x: 0, y: 0 })) {
                    player.isGameOver = true;
                    this.socket.emit('gameOver', { score: player.score });
                    if (room) refreshGame(this.socket, player);
                }
            }

            return false;
        }

        player.position.x += direction.x;
        player.position.y += direction.y;

        setHoverBlock(player);
        refreshGame(this.socket, player);

        return true;
    }

    rotateBlock() {
        const player = this.player || this.socket.data.player;
        if (!player || player.isGameOver) return;

        const { shape, type } = player.currentBlock;
        const rotatedShape = rotateMatrix(shape);
        const offset = getRotationOffset(type, shape, rotatedShape);

        if (!canRotate(player, rotatedShape, offset.x, offset.y)) {
            const wallKickOffsets = type === 'I'
                ? [
                    { x: 0, y: 0 },
                    { x: -1, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: -1 },
                    { x: -2, y: 0 },
                    { x: 2, y: 0 }
                ]
                : [
                    { x: -1, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: -1 }
                ];

            let rotationSucceeded = false;

            for (const kick of wallKickOffsets) {
                if (canRotate(player, rotatedShape, offset.x + kick.x, offset.y + kick.y)) {
                    player.position.x += offset.x + kick.x;
                    player.position.y += offset.y + kick.y;
                    rotationSucceeded = true;
                    break;
                }
            }

            if (!rotationSucceeded) return;
        }

        player.currentBlock.shape = rotatedShape;
        player.position.x += offset.x;
        player.position.y += offset.y;

        setHoverBlock(player);
        refreshGame(this.socket, player);
    }

    dropBlock() {
        const player = this.player || this.socket.data.player;
        if (!player || player.isGameOver) return;

        while (this.moveBlock({ x: 0, y: 1 }));
        refreshGame(this.socket, player);
    }
}

function canRotate(player, shape, offsetX = 0, offsetY = 0) {
    if (!player) return false;

    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (!shape[y][x]) continue;

            const newX = player.position.x + x + offsetX;
            const newY = player.position.y + y + offsetY;

            if (newX < 0 || newX >= 10 || newY >= 22) {
                return false;
            }

            if (newY >= 0) {
                const cell = player.grid[newY][newX];
                if (cell !== null && cell !== 'hover') {
                    return false;
                }
            }
        }
    }

    return true;
}

function rotateMatrix(matrix) {
    return matrix[0].map((_, index) =>
        matrix.map(row => row[index]).reverse()
    );
}

function getRotationOffset(type, shape, rotatedShape) {
    const currentWidth = shape[0].length;
    const currentHeight = shape.length;
    const newWidth = rotatedShape[0].length;
    const newHeight = rotatedShape.length;

    const offsetX = Math.floor((currentWidth - newWidth) / 2);
    const offsetY = Math.floor((currentHeight - newHeight) / 2);

    switch (type) {
        case 'O':
            return { x: 0, y: 0 };
        case 'I':
        case 'J':
        case 'L':
        case 'S':
        case 'T':
        case 'Z':
            return { x: offsetX, y: offsetY };
        default:
            return { x: 0, y: 0 };
    }
}

const games = new Map();

function getGame(socket, player) {
    let game = games.get(socket.id);
    if (!game) {
        game = new Game(socket, player);
        games.set(socket.id, game);
    } else {
        game.attach(socket, player || game.player);
    }
    return game;
}

function moveBlock(socket, player, direction) {
    return getGame(socket, player).moveBlock(direction);
}

function rotateBlock(socket) {
    return getGame(socket).rotateBlock();
}

function dropBlock(socket) {
    return getGame(socket).dropBlock();
}

module.exports = {
    Game,
    games,
    getGame,
    refreshGame,
    moveBlock,
    rotateBlock,
    dropBlock
};
