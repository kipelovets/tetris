// Copyright 2012-2013 by Ben Jacobs <benmillerj@gmail.com>; released under
// the terms of the GNU Public License. Based on concept/code (copyright
// 2000-2003 under the terms of the GPL) by David Glick <dglick@gmail.com> The
// original game, and source, can be found at
// http://nonsense.wglick.org/cowtris.html
var CONSTANTS = {
    NUM_COLS: 10,
    NUM_ROWS: 22,
    NUM_BREEDS: 7,
    BLOCK_SIZE: 20,
    GAME_AREA_COLOR: '#D5CCBB'
}

/*
Here the pieces are defined, one line per piece. The first 2 values in each
line are the x and y coordinates for the center of the piece when it starts.
The other 4 pairs give the x- and y-offsets of each block from the center of
the piece.
*/

CowDef = [
5, 1, -1, 0, 0, 0, 1, 0, 2, 0, // Guernsey
5, 1, -1, -1, -1, 0, 0, 0, 1, 0, // AberdeenAngus
5, 1, 1, -1, -1, 0, 0, 0, 1, 0, // Ayrshire
5, 1, -1, -1, 0, -1, 0, 0, 1, 0, // Hereford
5, 1, 0, -1, 1, -1, -1, 0, 0, 0, // Jersey
5, 0, -1, 0, 0, 0, 1, 0, 0, 1, // TexasLonghorn
5, 1, 0, -1, 1, -1, 0, 0, 1, 0, // Holstein
5, 1, 0, 0, 0, 0, 0, 0, 0, 0, // MadCow
5, 1, 0, 0, 0, 0, 0, 0, 0, 0, // HolyCow
5, 1, 0, 0, 0, 0, 0, 0, 0, 0 // PurpleCow
];

var ROTATION_NAMES = {
    RotNormal: 0,
    RotRight: 1,
    RotFlipped: 2,
    RotLeft: 3
};

var ROTATIONS = Object.keys(ROTATION_NAMES);

var BREEDS = {
    Guernsey: 0,
    AberdeenAngus: 1,
    Ayrshire: 2,
    Hereford: 3,
    Jersey: 4,
    TexasLonghorn: 5,
    Holstein: 6,
    MadCow: 7,
    HolyCow: 8,
    PurpleCow: 9
};

// these could be functions, but this is pretty quick
var BREED_NAMES = Object.keys(BREEDS);

var Point = function(x, y) {
        return {
            x: x,
            y: y
        };
    };

var Cow = function(breed) {
        var rotation = ROTATION_NAMES.RotNormal,
            breed = breed,
            name = BREED_NAMES[breed],
            special = false,
            position = function() {
                return new Point(
                CowDef[10 * breed], CowDef[10 * breed + 1])
            }(),
            offset = function() {
                var offsets = [];

                for(var i = 0; i <= 3; i += 1) {
                    offsets.push(new Point(
                    CowDef[10 * breed + 2 + 2 * i], CowDef[10 * breed + 3 + 2 * i]));
                }

                return offsets;
            }(),
            setRotation = function() {
                for(var i = 0; i <= 3; i += 1) {
                    var x = offset[i].x,
                        y = offset[i].y;

                    offset[i].x = -y;
                    offset[i].y = x;
                }
            };

        return {
            get rotation() {
                return rotation;
            }, get breed() {
                return breed;
            }, get name() {
                return name;
            }, get special() {
                return special;
            }, get position() {
                return position;
            }, get offset() {
                return offset;
            }, rotate_right: function() {
                rotation = (rotation + 1) % 4;
                setRotation();
            },
            rotate_left: function() {
                rotation = (rotation - 1) % 4;
                setRotation();
            },
            move_right: function() {
                position.x += 1;
            },
            move_left: function() {
                position.x += 1;
            },
            advance: function() {
                position.y += 1;
            },
        }
    };

var Board = function() {
        var ctx = document.getElementById('canvas').getContext('2d'),
            cowMap = new Image(),
            Dropping = false,
            DropHeight = -1,
            board = function() {
                var empty_board = [];
                for(var i = CONSTANTS.NUM_ROWS - 1; i >= 0; i--) {
                    empty_board.push(Array.apply(null, new Array(5)).map(Number.prototype.valueOf, 0))
                }
                return empty_board;
            }();

        cowMap.src = './resources/images/source.png';

        return {
            drawCow: function(cow) {
                for(var i = 0; i <= 3; i += 1) {
                    var BLOCK_SIZE = CONSTANTS.BLOCK_SIZE;

                    // PREFIXES: 'S' IS FOR 'SOURCE' AND 'D' IS FOR 'DESTINATION'
                    // DRAWIMAGE(IMAGE, SX, SY, SWIDTH, SHEIGHT, DX, DY, DWIDTH, DHEIGHT)
                    ctx.drawImage(cowMap,
                        (i + 4 * cow.rotation) * BLOCK_SIZE,
                        cow.breed * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE,
                        (cow.offset[i].x + cow.position.x) * BLOCK_SIZE,
                        (cow.offset[i].y + cow.position.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE);
                }
            },

            eraseCow: function(cow) {
                for(var i = 0; i <= 3; i += 1) {
                    var BLOCK_SIZE = CONSTANTS.BLOCK_SIZE;

                    ctx.fillStyle = "rgb(255,255,255)";
                    // fillRect(x, y, width, height)
                    ctx.fillRect(
                        (cow.offset[i].x + cow.position.x) * BLOCK_SIZE,
                        (cow.offset[i].y + cow.position.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE);
                }
            }
        };
    };

var Game = function() {
        var interval = 1000,
            intervalID, piece = new Cow(Math.floor(Math.random() * 7)),
            gameInProgress = false,
            gamePaused = false,
            gameOver = false,
            score = 0,
            rows = 0,
            level = 0
            board = new Board(),
            oldBoard = new Board();

        return {
            start: function() {
                GameInProgress = true;
                board.drawCow(piece);
                intervalID = setInterval(this.advanceCurrentPiece, interval);
            },

            advanceCurrentPiece: function() {
                var provisionalPiece = clone(piece);
                this.board.eraseCow(piece)
                piece.advance();
                this.board.drawCow(piece);
            },

            createNewPiece: function() {
                return new Cow(Math.floor(Math.random() * 7));
            }
        }
    };

function init() {
    // ADJUST CANVAS SIZE
    document.getElementById('canvas').width = CONSTANTS.NUM_COLS * CONSTANTS.BLOCK_SIZE;
    document.getElementById('canvas').height = CONSTANTS.NUM_ROWS * CONSTANTS.BLOCK_SIZE;

    var game = new Game();
    game.start();
}