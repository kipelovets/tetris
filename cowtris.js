var TO_RADIANS = Math.PI/180;

var NUM_COLS = 10;
var NUM_ROWS = 22;

var NUM_BREEDS = 7;
var BLOCK_SIZE = 20;

var GAME_AREA_COLOR = '#D5CCBB';

_rotations = {
    RotNormal : 0,
    RotRight : 1,
    RotFlipped : 2,
    RotLeft : 3
};

function init() {
	// adjust canvas size
	document.getElementById('canvas').width = NUM_COLS * BLOCK_SIZE;
	document.getElementById('canvas').height = NUM_ROWS * BLOCK_SIZE;

	var ctx = document.getElementById('canvas').getContext('2d');

	var cowMap = new Image();
	cowMap.onload = function(){
		/*
		Here the pieces are defined, one line per piece. The first 2 values in each line are the x and y coordinates for the center of the piece when it starts.The other 4 pairs give the x- and y-offsets of each block from the center of the piece.
		*/
		TetridDef = Array(
			[5,  1, -1,  0,  0,  0,  1,  0,  2,  0], // Guernsey
			[5,  1, -1, -1, -1,  0,  0,  0,  1,  0], // AberdeenAngus
			[5,  1,  1, -1, -1,  0,  0,  0,  1,  0], // Ayrshire
			[5,  1, -1, -1,  0, -1,  0,  0,  1,  0], // Hereford
			[5,  1,  0, -1,  1, -1, -1,  0,  0,  0], // Jersey
			[5,  0, -1,  0,  0,  0,  1,  0,  0,  1], // TexasLonghorn
			[5,  1,  0, -1,  1, -1,  0,  0,  1,  0], // Holstein
			[5,  1,  0,  0,  0,  0,  0,  0,  0,  0], // MadCow
			[5,  1,  0,  0,  0,  0,  0,  0,  0,  0], // HolyCow
			[5,  1,  0,  0,  0,  0,  0,  0,  0,  0]  // PurpleCow
			);

		// prefixes: 's' is for 'source' and 'd' is for 'destination'
		// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

		// GUERNSEY
		// * * * *
		ctx.drawImage(cowMap,  0, 0, 20, 20,  0, 0, 20, 20);
		ctx.drawImage(cowMap, 20, 0, 20, 20, 20, 0, 20, 20);
		ctx.drawImage(cowMap, 60, 0, 20, 20, 60, 0, 20, 20);
		ctx.drawImage(cowMap, 40, 0, 20, 20, 40, 0, 20, 20);

		// HOLSTEIN-FRISEIAN
		// * *
		// * *
		ctx.drawImage(cowMap,  0, 120, 20, 20,  0, 40, 20, 20);
		ctx.drawImage(cowMap, 20, 120, 20, 20, 20, 40, 20, 20);
		ctx.drawImage(cowMap, 40, 120, 20, 20,  0, 60, 20, 20);
		ctx.drawImage(cowMap, 60, 120, 20, 20, 20, 60, 20, 20);

		// AYRSHIRE
		//     *
		// * * *
		ctx.drawImage(cowMap,  0, 40, 20, 20, 40, 100, 20, 20);
		ctx.drawImage(cowMap, 20, 40, 20, 20,  0, 120, 20, 20);
		ctx.drawImage(cowMap, 40, 40, 20, 20,  20, 120, 20, 20);
		ctx.drawImage(cowMap, 60, 40, 20, 20,  40, 120, 20, 20);

		// TEXAS LONGHORN

		// ABERDEEN-ANGUS

		// JERSEY

		// HEREFORD

	};
	cowMap.src = './resources/images/source.png';
}