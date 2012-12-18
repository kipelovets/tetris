// Copyright 2012 by Ben Jacobs <benmillerj@gmail.com>; released under the terms of the GNU Public License
// Based on code copyright 2000-2003 by David Glick <dglick@gmail.com>
// The original game, and source, can be found at http://nonsense.wglick.org/cowtris.html

var CONSTANTS = {
	NUM_COLS : 10,
	NUM_ROWS : 22,
	NUM_BREEDS : 7,
	BLOCK_SIZE : 20,
	GAME_AREA_COLOR : '#D5CCBB'
}

/*
Here the pieces are defined, one line per piece. The first 2 values in each
line are the x and y coordinates for the center of the piece when it starts.
The other 4 pairs give the x- and y-offsets of each block from the center of
the piece.
*/

TetridDef = [
	5,  1, -1,  0,  0,  0,  1,  0,  2,  0, // Guernsey
    5,  1, -1, -1, -1,  0,  0,  0,  1,  0, // AberdeenAngus
	5,  1,  1, -1, -1,  0,  0,  0,  1,  0, // Ayrshire
	5,  1, -1, -1,  0, -1,  0,  0,  1,  0, // Hereford
	5,  1,  0, -1,  1, -1, -1,  0,  0,  0, // Jersey
	5,  0, -1,  0,  0,  0,  1,  0,  0,  1, // TexasLonghorn
	5,  1,  0, -1,  1, -1,  0,  0,  1,  0, // Holstein
	5,  1,  0,  0,  0,  0,  0,  0,  0,  0, // MadCow
	5,  1,  0,  0,  0,  0,  0,  0,  0,  0, // HolyCow
	5,  1,  0,  0,  0,  0,  0,  0,  0,  0  // PurpleCow
	];

var ROTATION_NAMES = {
    RotNormal : 0,
	RotRight : 1,
	RotFlipped : 2,
	RotLeft : 3
};

var ROTATIONS = Object.keys(ROTATION_NAMES);

var BREEDS = {
	Guernsey : 0,
	AberdeenAngus : 1,
	Ayrshire : 2,
	Hereford : 3,
	Jersey : 4,
	TexasLonghorn : 5,
	Holstein : 6,
	MadCow : 7,
	HolyCow : 8,
	PurpleCow : 9
};

// these could be functions, but this is pretty quick
var BREED_NAMES = Object.keys(BREEDS);

var Point = function (x, y) {
	return { x : x, y : y };
}

var Tetrid = function (breed) {
	return {
        // "CENTER" OF TETRID
	    Position : function() {
            return new Point (
                TetridDef[10 * breed],
                TetridDef[10 * breed + 1]
                )
        }(),

        // OFFSETS OF EACH BLOCK FROM CENTER
	    SqOffset : function() {
            var offsets = [];

            for (var i = 0; i <= 3; i+=1) {
                offsets.push(new Point(
                    TetridDef[10 * breed + 2 + 2 * i],
                    TetridDef[10 * breed + 3 + 2 * i]
                    ));
            }

            return offsets;
        }(),

        // PIECE'S CURRENT ROTATION
	    Rotation : ROTATION_NAMES.RotNormal,
	    Breed : breed,
        Name : BREED_NAMES[breed],
	    Special : false,
	}
};

var Board = function() {
	return {
		Square : function () {  // stores the contents of the board
			if (!self._board) {
				self._board = new Array();
				for (var i = CONSTANTS.NUM_ROWS - 1; i >= 0; i--) {
					self._board.push(function () {
						row = [];
						for (var x = CONSTANTS.NUM_COLS - 1; x >= 0; x--) {
							row.push(0);
						}
						return row;
					}());
				};
			}

			return self._board;
		},

	  	CurPiece : new Tetrid(), // the current falling tetrid
	    NextBreed :  -1,		 // the breed of the next tetrid (used in displaying the Next Piece indicator)
	    Dropping :  false,     	 // whether the current piece is Dropping quickly
	    DropHeight :  -1, 		 // the y position of the piece when it started dropping

        DrawTetrid : function (tetrid) {

        },
	};
};

var Game = {
	_board : 0,

    Score : 0,   	// score
    Rows : 0,    	// rows deleted
    Level : 0,    	// current level

	GameInProgress : false, // whether a game is in progress
	GamePaused : false,		// whether the game is paused (0 = not paused, >0 = paused
	OldGamePaused : 0,		// the previous bGamePaused value
	GameOver : false,		// whether a game has been played and ended (used in showing the "Game Over" indicator)

	Board : new Board(),
	OldBoard : new Board()
};

function init() {
	// adjust canvas size
	document.getElementById('canvas').width = CONSTANTS.NUM_COLS * CONSTANTS.BLOCK_SIZE;
	document.getElementById('canvas').height = CONSTANTS.NUM_ROWS * CONSTANTS.BLOCK_SIZE;

	var ctx = document.getElementById('canvas').getContext('2d');

	var cowMap = new Image ();

    var a_cow = new Tetrid(BREEDS.Hereford);

    console.log(a_cow);

	cowMap.onload = function() {
        for (var i = 0; i <= 3; i+=1) {
            var BLOCK_SIZE = CONSTANTS.BLOCK_SIZE;

            ctx.drawImage(cowMap,
                i * 20, // ROTATION FACTOR TO FOLLOW
                a_cow.Breed * 20,
                BLOCK_SIZE,
                BLOCK_SIZE,
                (a_cow.SqOffset[i].x + a_cow.Position.x) * BLOCK_SIZE,
                (a_cow.SqOffset[i].y + a_cow.Position.y) * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
                )
        }

		// prefixes: 's' is for 'source' and 'd' is for 'destination'
		// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

		// GUERNSEY
		// * * * *

		// ctx.drawImage(cowMap,  0, 0, 20, 20,  0, 0, 20, 20);
		// ctx.drawImage(cowMap, 20, 0, 20, 20, 20, 0, 20, 20);
		// ctx.drawImage(cowMap, 60, 0, 20, 20, 60, 0, 20, 20);
		// ctx.drawImage(cowMap, 40, 0, 20, 20, 40, 0, 20, 20);

		// HOLSTEIN-FRISEIAN
		// * *
		// * *

		// ctx.drawImage(cowMap,  0, 120, 20, 20,  0, 40, 20, 20);
		// ctx.drawImage(cowMap, 20, 120, 20, 20, 20, 40, 20, 20);
		// ctx.drawImage(cowMap, 40, 120, 20, 20,  0, 60, 20, 20);
		// ctx.drawImage(cowMap, 60, 120, 20, 20, 20, 60, 20, 20);

		// AYRSHIRE
		//     *
		// * * *
		// ctx.drawImage(cowMap,  0, 40, 20, 20, 40, 100, 20, 20);
		// ctx.drawImage(cowMap, 20, 40, 20, 20,  0, 120, 20, 20);
		// ctx.drawImage(cowMap, 40, 40, 20, 20,  20, 120, 20, 20);
		// ctx.drawImage(cowMap, 60, 40, 20, 20,  40, 120, 20, 20);

		// TEXAS LONGHORN

		// ABERDEEN-ANGUS

		// JERSEY

		// HEREFORD

	};
	cowMap.src = './resources/images/source.png';
}