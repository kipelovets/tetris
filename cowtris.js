/*jslint white: true */

// Copyright 2012-2013 by Ben Jacobs <benmillerj@gmail.com>; released under
// the terms of the GNU Public License. Based on concept/code (copyright
// 2000-2003 under the terms of the GPL) by David Glick <dglick@gmail.com> The
// original game, and source, can be found at
// http://nonsense.wglick.org/cowtris.html
var CONSTANTS = {
    num_cols: 10,
    num_rows: 22,
    block_size: 20,
    game_area_color: 'rgb(213, 204, 187)'
    };

/*
Here the pieces are defined, one line per piece. The first 2 values in each
line are the x and y coordinates for the center of the piece when it starts.
The other 4 pairs give the x- and y-offsets of each block from the center of
the piece.
*/

var _NormalCowDef = [
    5, 1, -1, 0, 0, 0, 1, 0, 2, 0, // Guernsey
    5, 1, -1, -1, -1, 0, 0, 0, 1, 0, // AberdeenAngus
    5, 1, 1, -1, -1, 0, 0, 0, 1, 0, // Ayrshire
    5, 1, -1, -1, 0, -1, 0, 0, 1, 0, // Hereford
    5, 1, 0, -1, 1, -1, -1, 0, 0, 0, // Jersey
    5, 0, -1, 0, 0, 0, 1, 0, 0, 1, // TexasLonghorn
    5, 1, 0, -1, 1, -1, 0, 0, 1, 0, // Holstein
    ];

var _SpecialCowDef = [
    5, 1, 0, 0, 0, 0, 0, 0, 0, 0, // MadCow
    5, 1, 0, 0, 0, 0, 0, 0, 0, 0, // HolyCow
    5, 1, 0, 0, 0, 0, 0, 0, 0, 0 // PurpleCow
    ];

var CowDef = _NormalCowDef;

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

var Point = function (x, y) {
    return { 'x': x, 'y': y };
};

var Cow = function(breed) {
    // 'private variables'
    var _rotation = ROTATION_NAMES.RotNormal,
        _breed = breed,
        _name = BREED_NAMES[breed],
        _special = false,
        _center = (function () {
            return new Point(CowDef[10 * breed], CowDef[10 * breed + 1]);
        }()),
        _offsets = (function () {
            var offsets = [], i;

            for(i = 0; i <= 3; i += 1) {
                offsets.push(new Point(
                CowDef[10 * breed + 2 + 2 * i], CowDef[10 * breed + 3 + 2 * i]));
            }

            return offsets;
        }());

    var _setRotation = function () {
        var i;

        for (i = 0; i <= 3; i+=1) {
            var x = _offsets[i].x, y = _offsets[i].y;

            _offsets[i].x = -y;
            _offsets[i].y = x;
        }
    };

    return {
        set rotation(val) {
            if (typeof val !== 'number') {
                throw new TypeError();
            } else if ( 0 > val || val > 3 ) {
                throw new RangeError();
            } else {
                _rotation = val;
                return _rotation;
            }
        },
        get rotation() {
            return _rotation;
        },
        get breed() {
            return _breed;
        },
        get name() {
            return _name;
        },
        get special() {
            return _special;
        },
        get center() {
            return _center;
        },
        set center(val) {
            _center = val;
        },
        get positions() {
            return _offsets.map(function(p) {
                return new Point(p.x + _center.x, p.y + _center.y);
            });
        },
        set offsets(val) {
            _offsets = [];
            val.forEach(function(p) {
                _offsets.push(new Point(p.x, p.y));
            });
        },
        get offsets() {
          return _offsets; 
        },

        rotate: function () {
            this.rotation = (this.rotation + 1) % 4;
            _setRotation();
        },
        move_right: function () {
            this.center = new Point(this.center.x + 1, this.center.y);
        },
        move_left: function () {
            this.center = new Point(this.center.x - 1, this.center.y);
        },
        advance: function () {
            this.center = new Point(this.center.x, this.center.y + 1);
        },
        clone: function () {
            var cow = new Cow(this.breed), x;
            cow.center = this.center;
            cow.rotation = this.rotation;
            cow.offsets = this.offsets;

            return cow;
        }
    }
};

var Board = function () {
    var _ctx = document.getElementById('canvas').getContext('2d'),
        _cowMap = new Image(),
        _dropping = false,
        _dropHeight = -1,
        _board = (function () {
            var empty_board = [], i;
            for(i = 0; i < CONSTANTS.num_cols; i++) {
                empty_board.push(Array.apply(null, new Array(CONSTANTS.num_rows)).map(Number.prototype.valueOf, 0))
            }
            return empty_board;
        }());

    _cowMap.src = './resources/images/source.png';

    _ctx.fillStyle = CONSTANTS.game_area_color;
    _ctx.fillRect(0, 0, CONSTANTS.block_size * CONSTANTS.num_cols, CONSTANTS.block_size * CONSTANTS.num_rows);

    return {
        drawCow: function(cow) {
            var i;
            for (i = 0; i < cow.positions.length; i++) {
                var block_size = CONSTANTS.block_size, point = cow.positions[i];

                // PREFIXES: 'S' IS FOR 'SOURCE' AND 'D' IS FOR 'DESTINATION'
                // DRAWIMAGE(IMAGE, SX, SY, SWIDTH, SHEIGHT, DX, DY, DWIDTH, DHEIGHT)
                _ctx.drawImage(_cowMap,
                    (i + 4 * cow.rotation) * block_size,
                    cow.breed * block_size,
                    block_size,
                    block_size,
                    point.x * block_size,
                    point.y * block_size,
                    block_size,
                    block_size);
            }
        },

        eraseCow: function(cow) {
            cow.positions.forEach(function(p) {
                _ctx.fillStyle = CONSTANTS.game_area_color;
                _ctx.fillRect(
                    p.x * CONSTANTS.block_size,
                    p.y * CONSTANTS.block_size,
                    CONSTANTS.block_size,
                    CONSTANTS.block_size);
            });
        },

        isConflicted: function(cow) {
            var isConflicted = false;
            
            cow.positions.forEach(function(p) {
                if (p.x >= CONSTANTS.num_cols || p.x < 0) {
                    isConflicted = true;
                } else if (p.y >= CONSTANTS.num_rows) {
                    isConflicted = true;
                } else if (_board[p.x][p.y] === 1) {
                    isConflicted = true;
                }
            });

            if (isConflicted)
                console.log('conflict detected');

            return isConflicted;
        },

        addToBoard: function(cow) {
            cow.positions.forEach(function (p) {
                _board[p.x][p.y] = 1;
            });
        },

        logBoard: function() {
            return _board.map(function(row) {
                return row.map(function(point) {
                    return String(point);
                });
            }).join('\n');
        }
    };
};

var Game = function () {
    var _interval = 200,
        _intervalID,
        _piece = new Cow(Math.floor(Math.random() * 7)),
        _gameInProgress = false,
        _gamePaused = false,
        _gameOver = false,
        _score = 0,
        _rows = 0,
        _level = 0
        _board = new Board(),
        _oldBoard = new Board();

    return {
        get piece () {
            return _piece;
        },
        set piece (val) {
            return _piece = val;
        },
        get board () {
            return _board;
        },
        get interval () {
            return _interval;
        },
        get intervalID () {
            return _intervalID;
        },
        set intervalID (val) {
            return _intervalID = val;
        },
        get gameInProgress () {
            return _gameInProgress;
        },
        set gameInProgress (val) {
            return _gameInProgress = val;
        },

        start: function () {
            this.gameInProgr
ess = true;
            this.board.drawCow(this.piece);
            this.intervalID = setInterval( (function(self) { 
                return function () { 
                    self.advancePiece(); 
                } 
            })(this), this.interval);
        },

        advancePiece: function () {
            var provisional = this.piece.clone();
            provisional.advance();

            if ( this.board.isConflicted(provisional) ) {
                this.board.addToBoard(this.piece);
                this.piece = new Cow(Math.floor(Math.random() * 7));
            } else {
                this.board.eraseCow(this.piece)
                this.piece.advance();
                this.board.drawCow(this.piece);
            }
        },

        movePieceRight: function () {
            var provisional = this.piece.clone();
            provisional.move_right();

            if ( !this.board.isConflicted(provisional) ) {
                this.board.eraseCow(this.piece)
                this.piece.move_right();
                this.board.drawCow(this.piece);
            }
        },

        movePieceLeft: function () {
            var provisional = this.piece.clone();
            provisional.move_left();

            if ( !this.board.isConflicted(provisional) ) {
                this.board.eraseCow(this.piece)
                this.piece.move_left();
                this.board.drawCow(this.piece);
            }
        },

        dropPiece: function () {

        },

        rotatePiece: function () {
            var provisional = this.piece.clone();
            provisional.rotate();

            if ( this.board.isConflicted(provisional) ) {
                this.board.addToBoard(this.piece);
                this.piece = new Cow(Math.floor(Math.random() * 7));
            } else {
                this.board.eraseCow(this.piece)
                this.piece.rotate();
                this.board.drawCow(this.piece);
            }
        }
    }
};

function init() {
    // ADJUST CANVAS SIZE
    document.getElementById('canvas').width = CONSTANTS.num_cols * CONSTANTS.block_size;
    document.getElementById('canvas').height = CONSTANTS.num_rows * CONSTANTS.block_size;

    var game = new Game();

    window.onkeydown = function (e) {
        switch(e.keyCode) {
            case 32: // space
                game.dropPiece();
                break;
            case 37: // left
                game.movePieceLeft();
                break;
            case 38:
                game.rotatePiece();
                break;            
            case 39: // right
                game.movePieceRight();
                break;
            case 40: // down
                game.advancePiece();
                break;
        }      
    };

    game.start();
}