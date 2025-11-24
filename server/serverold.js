// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const { handleSocketConnection } = require('./socket/socketHandlers');
// const lobbyRoutes = require('./routes/lobbyRoutes');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"]
//     }
// });

// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// const blockColors = {
// 	I: 'cyan',
// 	J: 'blue',
// 	L: 'orange',
// 	O: 'yellow',
// 	S: 'green',
// 	T: 'purple',
// 	Z: 'red',
// };

// const blocks = {
// 	I: [
// 		[0, 0, 0, 0],
// 		[1, 1, 1, 1],
// 	],
// 	J: [ 
// 		[1, 0, 0],
// 		[1, 1, 1],
// 		[0, 0, 0]
// 	],
// 	L: [
// 		[0, 0, 1],
// 		[1, 1, 1],
// 		[0, 0, 0]
// 	],
// 	O: [
// 		[0, 1, 1, 0],
// 		[0, 1, 1, 0],
// 	],
// 	S: [
// 		[0, 1, 1],
// 		[1, 1, 0],
// 		[0, 0, 0]
// 	],
// 	T: [
// 		[0, 1, 0],
// 		[1, 1, 1],
// 		[0, 0, 0]
// 	],
// 	Z: [
// 		[1, 1, 0],
// 		[0, 1, 1],
// 		[0, 0, 0]
// 	],
// };

// app.get('/', (req, res) => {
//     res.json({ message: 'Bonjour depuis le serveur Node.js 🚀' });
// });

// io.on('connection', (socket) => {
// 	console.log('🔌 Utilisateur connecté:', socket.id);

// 	function getRandomBlock() {
// 		const blockTypes = Object.keys(blocks);
// 		const type = blockTypes[Math.floor(Math.random() * blockTypes.length)];
// 		const shape = blocks[type];
// 		const color = blockColors[type];

// 		return { type, shape, color };
// 	}

// 	function initPlayer() {
// 		players[socket.id] = {
// 		grid: Array.from({ length: 22 }, () => Array(10).fill(null)),
// 		currentBlock: getRandomBlock(),
// 		nextBlock: getRandomBlock(),
// 		position: { x: 4, y: 0 },
// 		score: 0,
// 		speed: 1000,
// 		level: 1,
// 		isGameOver: false,
// 		columnsCleared: 0,
// 		totalColumnsCleared: 0
// 		};

// 		socket.emit('receiveGame', players[socket.id]);
// 	}

// 	function getDynamicGrid(player) {
// 		const { grid, currentBlock, position } = player;
// 		const displayGrid = grid.map(row => row.slice());

// 		currentBlock.shape.forEach((row, y) => {
// 			row.forEach((cell, x) => {
// 			if (cell) {
// 				const gridY = position.y + y;
// 				const gridX = position.x + x;
// 				if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
// 					displayGrid[gridY][gridX] = currentBlock.color;
// 				}
// 				}
// 			});
// 		});

// 		return displayGrid;
// 	}

// 	function refreshGame() {
// 		const player = players[socket.id];
// 		if (!player) return;

// 		socket.emit('refreshGame', {
// 		...player,
// 		grid: getDynamicGrid(player)
// 		});
// 	}

// 	function isCollision(direction) {
// 		const player = players[socket.id];
// 		if (!player) return false;

// 		for (let y = 0; y < player.currentBlock.shape.length; y++) {
// 			for (let x = 0; x < player.currentBlock.shape[y].length; x++) {
// 				if (player.currentBlock.shape[y][x]) {
// 					const newX = player.position.x + x + direction.x;
// 					const newY = player.position.y + y + direction.y;
					
// 					if (newX < 0 || newX >= 10 || newY >= 22) {
// 						return true;
// 					}

// 					if (newY >= 0 && player.grid[newY][newX] && player.grid[newY][newX] !== 'hover') {
// 						return true;
// 					}
// 				}
// 			}
// 		}
// 		return false;
// 	}

// 	function fixBlock() {
// 		const player = players[socket.id];
// 		if (!player) return;

// 		player.currentBlock.shape.forEach((row, y) => {
// 			row.forEach((cell, x) => {
// 				if (cell) {
// 					const gridY = player.position.y + y;
// 					const gridX = player.position.x + x;
// 					if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
// 						player.grid[gridY][gridX] = player.currentBlock.color;
// 					}
// 				}
// 			}
// 			);
// 		});
// 		checkLines();
// 	}

// 	function checkLines() {
// 		const player = players[socket.id];
// 		if (!player) return;

// 		let newGrid = player.grid.filter(row => !row.every(cell => cell !== null));
// 		const linesCleared = player.grid.length - newGrid.length;
// 		player.columnsCleared += linesCleared;		
// 		for (let i = 0; i < linesCleared; i++) {
// 			newGrid.unshift(Array(10).fill(null));
// 		}
		
// 		player.grid = newGrid;
// 		player.score += linesCleared * 100;
// 		player.totalColumnsCleared += linesCleared;
// 		while (player.columnsCleared >= 7) {
// 			player.columnsCleared = Math.min(0, player.columnsCleared - 7);
// 			player.speed = Math.max(100, Math.floor(player.speed * 0.77));
// 			player.level += 1;
// 			player.updateSpeed();
// 		}
// 	}

// 	function setHoverBlock() {
// 		const player = players[socket.id];
// 		if (!player) return;
		
// 		let hoverY = player.position.y;
// 		while (!isCollision({ x: 0, y: hoverY - player.position.y + 1 })) {
// 			hoverY++;
// 		}

// 		const grid = player.grid.map(row => row.map(cell => (cell === 'hover' ? null : cell)));
// 		player.grid = grid;
		
// 		for (let y = 0; y < player.currentBlock.shape.length; y++) {
// 			for (let x = 0; x < player.currentBlock.shape[y].length; x++) {
// 				if (player.currentBlock.shape[y][x]) {
// 					const gridY = hoverY + y;
// 					const gridX = player.position.x + x;
// 					if (gridY >= 0 && gridY < 22 && gridX >= 0 && gridX < 10) {
// 						player.grid[gridY][gridX] = 'hover';
// 					}
// 				}
// 			}
// 		}

// 	}

// 	function moveBlock(direction) {
// 		const player = players[socket.id];
// 		if (!player || player.isGameOver) return false;
// 		if (isCollision(direction)) {
// 			if (!player.isGameOver && direction.y === 1) {
// 				fixBlock();
// 				player.currentBlock = player.nextBlock;
// 				player.nextBlock = getRandomBlock();
// 				player.position = { x: 4, y: 0 };
				
// 				if (isCollision({ x: 0, y: 0 })) {
// 					player.isGameOver = true;
// 					socket.emit('gameOver', { score: player.score });
// 					console.log('💀 Game Over pour:', socket.id, 'Score:', player.score);
// 					return false;
// 				}
				
// 				refreshGame();
// 			}
// 			return false;
// 		}
// 		player.position.x += direction.x;
// 		player.position.y += direction.y;

// 		setHoverBlock();
// 		refreshGame();

// 		return true;
// 	}

// 	socket.on('startGame', () => {
// 		console.log('▶️ Jeu démarré pour:', socket.id);

// 		initPlayer();

// 		let loop;
// 		function startLoop() {
// 			clearInterval(loop);
// 			const player = players[socket.id];
// 			if (!player) return;
// 			loop = setInterval(() => {
// 				const p = players[socket.id];
// 				if (!p || p.isGameOver) {
// 					clearInterval(loop);
// 					return;
// 				}
// 				moveBlock({ x: 0, y: 1 });
// 			}, player.speed);
// 		}

// 		startLoop();

// 		players[socket.id].updateSpeed = () => startLoop();
// 	});

// 	socket.on('moveBlock', (direction) => {
// 		moveBlock(direction);
// 	});

// 	function canRotate(shape, offsetX = 0, offsetY = 0) {
// 		const player = players[socket.id];
// 		if (!player) return false;
		
// 		for (let y = 0; y < shape.length; y++) {
// 			for (let x = 0; x < shape[y].length; x++) {
// 				if (shape[y][x]) {
// 					const newX = player.position.x + x + offsetX;
// 					const newY = player.position.y + y + offsetY;
					
// 					if (newX < 0 || newX >= 10 || newY >= 22) {
// 						console.log('Rotation impossible: hors limites');
// 						return false;
// 					}
					
// 					if (newY >= 0 && player.grid[newY][newX] && player.grid[newY][newX] !== 'hover') {
// 						return false;
// 					}
// 				}
// 			}
// 		}
// 		return true;
// 	}

// 	function rotateMatrix(matrix) {
// 		return matrix[0].map((_, index) =>
// 			matrix.map(row => row[index]).reverse()
// 		);
// 	}

// 	function getRotationOffset(type, shape, rotatedShape) {
// 		const currentWidth = shape[0].length;
// 		const currentHeight = shape.length;
// 		const newWidth = rotatedShape[0].length;
// 		const newHeight = rotatedShape.length;
		
// 		const offsetX = Math.floor((currentWidth - newWidth) / 2);
// 		const offsetY = Math.floor((currentHeight - newHeight) / 2);
		
// 		switch(type) {
// 			case 'O':
// 				return { x: 0, y: 0 };
// 			case 'I':
// 			case 'J':
// 			case 'L':
// 			case 'S':
// 			case 'T':
// 			case 'Z':
// 				return { x: offsetX, y: offsetY };
// 			default:
// 				return { x: 0, y: 0 };
// 		}
// 	}

// 	socket.on('rotateBlock', () => {
// 		const player = players[socket.id];
// 		if (!player || player.isGameOver) return;
// 		const { shape, type } = player.currentBlock;

// 		const rotatedShape = rotateMatrix(shape);
// 		const offset = getRotationOffset(type, shape, rotatedShape);

// 		if (!canRotate(rotatedShape, offset.x, offset.y)) return;
	
// 		player.currentBlock.shape = rotatedShape;
// 		player.position.x += offset.x;
// 		player.position.y += offset.y;

// 		setHoverBlock();
// 		refreshGame();
// 	});

// 	socket.on('dropBlock', () => {
// 		const player = players[socket.id];
// 		if (!player || player.isGameOver) return;

// 		while (moveBlock({ x: 0, y: 1 }))
// 		refreshGame();
// 	});

// 	socket.on('resetGame', () => {
// 		console.log('🔄 Reset du jeu pour:', socket.id);
// 		// Supprimer le joueur existant pour le réinitialiser
// 		delete players[socket.id];
// 		console.log('✨ Jeu réinitialisé pour:', socket.id);
// 	});

// });

// server.listen(PORT, () => {
//     console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
// });

// app.use('/lobby', lobbyRoutes);