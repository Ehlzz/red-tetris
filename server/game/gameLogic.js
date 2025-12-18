const { getRandomBlock } = require('../utils/blockUtils');
const { getDynamicGrid } = require('../utils/gridUtils');
const { isCollision } = require('./collisionManager');
const { fixBlock, checkLines, setHoverBlock } = require('./blockManager');
const { getPlayerRoom, getRoomById } = require('./lobbyManager');
const { getPlayer } = require('./playerManager');

function refreshGame(socket, player) {
    if (!player) return;
    const room = socket.data.room || getRoomById(getPlayerRoom(socket.id));
    if (!socket.data.room && room) socket.data.room = room;

    if (room) {
        if (room.players.length === 1) {
            room.players.forEach(p => {
                socket.emit('multiplayerGameEnd', {
                    winner: player,
                    room: room
                });
                p.isGameOver = false;
            });
            room.gameStarted = false;
        }
        room.players.forEach(p => {
            if (p.id === socket.id) {
                if (player.isGameOver) {
                    p.isGameOver = true;
                }
                p.grid = getDynamicGrid(player);
                p.nextBlock = player.nextBlock;
                p.score = player.score;
                p.level = player.level;
                p.totalColumnsCleared = player.totalColumnsCleared;
            }
        });
        socket.emit('refreshGame', {
            ...player,
            grid: getDynamicGrid(player),
            room: room
        });
    } else {
        socket.emit('refreshGame', {
            ...player,
            grid: getDynamicGrid(player),
        });
    }
}

function moveBlock(socket, player, direction) {
    if (!player) return false;
    const room = socket.data.room || getRoomById(getPlayerRoom(socket.id));
    if (!socket.data.room && room) socket.data.room = room;
    if (((!room && player.isGameOver) || (room && room.isGameOver))) return false;

    if (isCollision(player, direction)) {
        if (!player.isGameOver && direction.y === 1) {
            fixBlock(player, socket);
            checkLines(player, socket);
            player.currentBlock = player.nextBlock;
            if (room) {
                const playerInRoom = room.players.find(p => p.id === socket.id);
                if (!playerInRoom) return false;
                if (typeof playerInRoom.blocksFixed === 'undefined') {
                    playerInRoom.blocksFixed = 0;
                }
                playerInRoom.blocksFixed += 1;
                if (!room.blocksQueue[playerInRoom.blocksFixed]) {
                    room.blocksQueue[playerInRoom.blocksFixed] = getRandomBlock();
                }
                player.nextBlock = { ...room.blocksQueue[playerInRoom.blocksFixed]};
            }
            else {
                player.nextBlock = getRandomBlock();
            }
            player.position = { x: 4, y: 0 };
            refreshGame(socket, player);
        }
        if (direction.y === 1 && isCollision(player, { x: 0, y: 0 })) {
            player.isGameOver = true;
            socket.emit('gameOver', { score: player.score });
            if (room) {
                refreshGame(socket, player);
            }
        }
        return false;
    }
    
    player.position.x += direction.x;
    player.position.y += direction.y;

    setHoverBlock(player);
    refreshGame(socket, player);

    return true;
}

function canRotate(player, shape, offsetX = 0, offsetY = 0) {
    if (!player) return false;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {

                const newX = player.position.x + x + offsetX;
                const newY = player.position.y + y + offsetY;
                
                if (newX < 0 || newX >= 10 || newY >= 22) {
                    return false;
                }
                
                if (newY >= 0 && player.grid[newY][newX] && player.grid[newY][newX] !== 'hover') {
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
    
    switch(type) {
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

function rotateBlock(socket) {
    const player = socket.data.player;
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
    refreshGame(socket, player);
};

function dropBlock(socket) {
    const player = socket.data.player;
    if (!player || player.isGameOver) return;

    while (moveBlock(socket, player, { x: 0, y: 1 }));
    refreshGame(socket, player);
}

module.exports = { refreshGame, moveBlock, rotateBlock, dropBlock, rotateBlock };