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

module.exports = { blockColors, blocks, Piece, getRandomBlock };