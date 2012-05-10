function init() {
    var canvas = document.getElementsByTagName('canvas').item(0);
    var ctx = canvas.getContext('2d');

    var fieldWidth = 10;
    var fieldHeight = 20;
    var blockSize = 16;

    canvas.width = fieldWidth * blockSize;
    canvas.height = fieldHeight * blockSize;

    var canvasColor = '#ddd';
    var canvasWidth = canvas.offsetWidth;
    var canvasHeight = canvas.offsetHeight;

    function Engine() {
        this.objects = [];
        this.lastUpdate = new Date().getTime();
        this.lastRefresh = this.lastUpdate;
        this.updateInterval = 500;
        this.refreshInterval = 30;
        this.stopped = false;

        this.start = function () {
            this.stopped = false;
            this.draw();
        }

        this.drawObject = function (object) {
            var prims = object.getPrimitives();
            for (var i in prims) {
                var rect = prims[i].getCanvasRect();
                ctx.fillStyle = prims[i].getColor();
                ctx.fillRect(object.offset.x + rect.x, object.offset.y + rect.y, rect.width, rect.height);
                // console.log(object.offset.x + rect.x, object.offset.y + rect.y, rect.width, rect.height);
            }
        }

        this.draw = function () {
            if (this.stopped) {
                return;
            }

            this.lastRefresh = new Date().getTime();
            if (this.lastRefresh - this.lastUpdate > this.updateInterval) {
                for (var i in this.objects) {
                    this.objects[i].update();
                }
                this.lastUpdate = this.lastRefresh;
            }

            ctx.fillStyle = canvasColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            var drawObjects = [];
            for (var i in this.objects) {
                drawObjects.push(this.objects[i]);
            }
            for (var i in drawObjects) {
                this.drawObject(this.objects[i]);
            }

            var self = this;

            setTimeout(function () { self.draw(); }, this.refreshInterval);
        }

        this.stop = function () {
            this.stopped = true;
        }
        
        this.togglePause = function () {
            if (this.stopped) {
                this.start();
            } else {
                this.stop();
            }
        }
    }

    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;

        this.toMatrix = function () {
            return new Matrix([this.x, this.y]);
        }
    }

    function Matrix(coords) {
        this.coords = coords || [];

        this.mul = function (matr) {
            var m = this.coords.length;
            var n = typeof this.coords[0] == 'object' ? this.coords[0].length : 1;
            var p = matr.coords.length;

            if (m != matr.coords[0].length) {
                throw new Error('Matrix dont match');
            }

            var res = [];
            for (var i = 0; i < p; i++) {
                res.push([]);
                for (var j = 0; j < n; j++) {
                    var val = 0;
                    var c;
                    for (var k = 0; k < m; k++) {
                        c = n == 1 ? this.coords[k] : this.coords[k][j];
                        val += c * matr.coords[i][k];
                    }
                    if (n == 1) {
                        res[i] = val;
                    } else {
                        res[i].push(val);
                    }
                }
            }

            return new Matrix(res);
        }
    }

    function Matrix2d(x11, x12, x21, x22) {
        Matrix.call(this, [[x11, x12], [x21, x22]]);
    }

    var rotationMatrix = new Matrix2d(0, -1, 1, 0);

    function Rect(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;

        this.add = function (v) {
            this.x += v.x;
            this.y += v.y;
        }
    }

    function TetrisBlock(i, j, color) {
        this.toCanvasCoords = function (i, j) {
            return new Rect(
                i * blockSize + (blockSize - this.sizeCanvas) / 2,
                j * blockSize + (blockSize - this.sizeCanvas) / 2, 
                this.sizeCanvas, this.sizeCanvas);
        }

        this.getColor = function () {
            return this.color;
        }

        this.getCanvasRect = function () {
            return this.rect;
        }

        this.updateRect = function () {
            this.rect = this.toCanvasCoords(this.i, this.j);
        }

        this.transform = function (matrix) {
            var newCoords = new Matrix([this.i, this.j]).mul(rotationMatrix);
            this.i = newCoords.coords[0];
            this.j = newCoords.coords[1];
            this.updateRect();
        }

        this.sizeCanvas = 14;
        this.i = i;
        this.j = j;
        this.updateRect();
        this.color = color;
    }

    function TetrisFigure(i, j, color, rotation) {
        this.getPrimitives = function () {
            return this.primitives;
        }

        this.fall = function () {
            for (var i in this.primitives) {
                if (this.center.y + this.primitives[i].j >= fieldHeight - 1) {
                    return;
                }
            }
            this.center.y++;
            this.updateOffset();
        }

        this.update = function () {
            this.fall();
        }

        this.transform = function (matrix) {
            for (var i in this.primitives) {
                this.primitives[i].transform(matrix);
            }
        }

        this.rotate = function () {
            this.transform(rotationMatrix);
        }

        this.toCanvasOffset = function (v) {
            return new Vector(v.x * blockSize, v.y * blockSize);
        }

        this.updateOffset = function () {
            this.offset = this.toCanvasOffset(this.center);
        }

        this.addPrimitives = function (coords) {
            for (var i in coords) {
                this.primitives.push(new TetrisBlock(coords[i][0], coords[i][1], this.color));
            }
        }

        this.isLegalOffset = function (v) {
            for (var i in this.primitives) {
                var newX = this.center.x + this.primitives[i].i + v.x;
                var newY = this.center.y + this.primitives[i].j + v.y;
                if (newX < 0 || newX >= fieldWidth || newY < 0 || newY >= fieldHeight || 
                    bottom.intersect(new Vector(newX, newY))) 
                {
                    return false;
                }
            }
            return true;
        }

        this.realMove = function (v) {
            this.center.x += v.x;
            this.center.y += v.y;
            this.updateOffset();
        }

        this.move = function (v) {
            if (!this.isLegalOffset(v)) {
                return;
            }
            this.realMove(v);
        }

        this.drop = function () {
            var offset = new Vector(0, 1);
            while (offset.y < fieldHeight) {
                if (!this.isLegalOffset(offset)) {
                    break;
                }
                offset.y++;
            }

            offset.y--;
            if (offset.y > 0) {
                this.realMove(offset);
            }
        }

        this.primitives = [];
        this.center = new Vector(i, j);
        this.color = color;
        this.rotation = rotation;
        this.updateOffset();
    }

    var tetrisFigures = [
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#00f0f0", rotation);
        
            this.addPrimitives([
                    [0, 0], [0, 1], [0, 2], [0, 3]
                ]);
        },
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#00f", rotation);

            this.addPrimitives([
                    [0, 0], [0, 1], [1, 1], [2, 1]
                ]);
        },
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#f0a000", rotation);

            this.addPrimitives([
                    [0, 0], [1, 0], [2, 0], [2, -1]
                ]);
        },
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#f0f000", rotation);

            this.addPrimitives([
                    [0, 0], [1, 0], [0, 1], [1, 1]
                ]);
        },
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#00f000", rotation);

            this.addPrimitives([
                    [0, 1], [1, 0], [1, 1], [2, 0]
                ]);
        },
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#a000f0", rotation);

            this.addPrimitives([
                    [1, 0], [0, 1], [1, 1], [2, 1]
                ]);
        },
        function (i, j, rotation) {
            // Наследование от TetrisFigure
            TetrisFigure.call(this, i, j, "#f00000", rotation);

            this.addPrimitives([
                    [0, 0], [1, 0], [1, 1], [2, 1]
                ]);
        }
    ];


    function TetrisGame() {
        this.turnsToReplace = 0;
        this.offset = new Vector();

        this.getPrimitives = function () {
            return [];
        }

        this.replaceActionFigure = function () {
            this.turnsToReplace = 1;
        }

        this.update = function () {
            if (this.turnsToReplace >= 0) {
                this.turnsToReplace--;
            } 

            if (this.turnsToReplace == 0) {
                var num = Math.floor(Math.random() * tetrisFigures.length);
                var rotation = Math.floor(Math.random() * 4);
                var newFigure = new tetrisFigures[num](4, -1, rotation);
                if (bottom.isFallen(newFigure)) {
                    alert('Game over');
                    engine.stop();
                    return;
                }
                if (bottom.actionFigure) {
                    engine.objects.pop();
                }
                engine.objects.push(newFigure);
                bottom.actionFigure = newFigure;
            }
        }
    }

    var game = new TetrisGame();

    function TetrisBottom() {
        TetrisFigure.call(this, 0, 0, "", 0);

        this.actionFigure = null;

        this.isFallen = function (fig) {
            for (var ind in fig.primitives) {
                var i = fig.primitives[ind].i + fig.center.x;
                var j = fig.primitives[ind].j + fig.center.y;
                if (j == fieldHeight - 1) {
                    return true;
                }
                for (var ind2 in this.primitives) {
                    if ((i == this.primitives[ind2].i && j + 1 == this.primitives[ind2].j)) 
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        this.intersect = function (vec) {
            for (var ind in this.primitives) {
                if (this.primitives[ind].i == vec.x && this.primitives[ind].j == vec.y) {
                    return true;
                }
            }
            return false;
        }

        this.update = function () {
            var lines = 0;
            if (this.primitives.length > 0) {
                for (var j = fieldHeight - 1; j >= 0; j--) {
                    var full = true;
                    var toRemove = [];
                    for (var i = 0; i < fieldWidth; i++) {
                        var found = false;
                        for (var ind in this.primitives) {
                            if (this.primitives[ind].i == i && this.primitives[ind].j == j) {
                                toRemove.push(this.primitives[ind]);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            full = false;
                            break;
                        }
                    }
                    if (full) {
                        lines++;
                        for (var ind in toRemove) {
                            this.primitives.splice(this.primitives.indexOf(toRemove[ind]), 1);
                        }
                    }
                }
            }

            if (lines > 0) {
                for (var ind in this.primitives) {
                    this.primitives[ind].j += lines;
                    this.primitives[ind].updateRect();
                }
            } else {
                if (this.actionFigure) {
                    if (this.isFallen(this.actionFigure)) {
                        while (this.actionFigure.primitives.length > 0) {
                            var fig = this.actionFigure.primitives.pop();
                            fig.i += this.actionFigure.center.x;
                            fig.j += this.actionFigure.center.y;
                            fig.updateRect();
                            this.primitives.push(fig);
                        }

                        game.replaceActionFigure();
                    }
                }
            }
        }
    }

    document.body.onkeydown = function (e) {
        var e = e || window.event;
        console.log(e.keyCode);
        switch (e.keyCode) {
            case 37: // left
                bottom.actionFigure.move(new Vector(-1, 0));
                break;
            case 39: // rigth
                bottom.actionFigure.move(new Vector(1, 0));
                break;
            case 38: // up
                bottom.actionFigure.rotate();
                break;
            case 40: // down
                bottom.actionFigure.drop();
                break;
            case 80: // P
                engine.togglePause();
                break;
        }
    }

    var bottom = new TetrisBottom();
    var engine = new Engine();
    engine.objects = [game, bottom];
    engine.start();

    game.replaceActionFigure();
}
