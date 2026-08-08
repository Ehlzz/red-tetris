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
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	J: [ 
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	],
	O: [
		[1, 1],
		[1, 1]
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	],
	T: [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	],
};

class Piece {
	constructor(type, shape, color) {
		this.type = type;
		this.shape = shape.map(row => row.slice());
		this.color = color;
	}

	static random() {
		const blockTypes = Object.keys(blocks);
		const type = blockTypes[Math.floor(Math.random() * blockTypes.length)];
		const shape = blocks[type];
		const color = blockColors[type];
		return new Piece(type, shape, color);
	}

	rotate() {
		const rotated = this.shape[0].map((_, index) =>
			this.shape.map(row => row[index]).reverse()
		);
		this.shape = rotated;
		return this.shape;
	}
	
	/* istanbul ignore next */
	clone() {
		return new Piece(this.type, this.shape.map(r => r.slice()), this.color);
	}

	toJSON() {
		const { type, shape, color } = this;
		return { type, shape, color };
	}
}

function getRandomBlock() {
	return Piece.random();
}

function getBlockByType(type) {
	return { type, shape: blocks[type].map(row => row.slice()), color: blockColors[type] };
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

class BlockBag {
	constructor() {
		this.queue = [];
	}

	refill() {
		this.queue.push(...shuffle(Object.keys(blocks)));
	}

	next() {
		if (this.queue.length === 0) this.refill();
		const type = this.queue.shift();
		return new Piece(type, blocks[type], blockColors[type]);
	}
}

function createBag() {
	return new BlockBag();
}

module.exports = { blockColors, blocks, Piece, getRandomBlock, getBlockByType, BlockBag, createBag };