window.onload = function () {
	// The functionality to be run when the when the page is loaded. 
	var game = new MazeGame(30, 40);
	game.render();
}

function MazeGame (r, c) {
	var container = document.getElementById("maze");
	var maze = new Maze(r, c);
	maze.generate();

	var squareWidth = (100 / c) + "%";
	var squareHeight = (100 / r) + "%";

	this.render = function () {
		container.innerHTML = "";
		for (var i = 0; i < maze.rows(); i++) {
			for (var j = 0; j < maze.columns(); j++) {
				addSquare(i, j);
			}
		}
	}

	function addSquare (r, c) {
		var tile = maze.getTile(r, c);
		var square = document.createElement("div");
		square.style.width = squareWidth;
		square.style.height = squareHeight;
		if (!tile.isWall()) {
			square.style.backgroundColor = "#fff";
		}
		square.setAttribute("class", "square");
		square.setAttribute("id", r + "-" + c);

		container.appendChild(square);
	}
}

function Maze (r, c) {
	var self = this;
	var rows = r;
	var columns = c;
	var map = [];
	var start;

	// Initialize a map
	for (var i = 0; i < r; i++) {
		map[i] = [];
		for (var j = 0; j < c; j++) {
			map[i][j] = new MazeTile(i, j);
		}
	}

	this.rows = function () {
		return rows;
	}

	this.columns = function () {
		return columns;
	}

	this.generate = function () {
		var start = randomTile();
		var stack = [start];
		while (stack.length != 0) {
			var current = stack.pop();
			if (current.validPath()) {
				current.setWall(false);
				var neighbors = [current.north(), current.east(), 
						current.south(), current.west()];
				neighbors = shuffle(neighbors);
				for (var i = 0; i < neighbors.length; i++) {
					if (neighbors[i] != null && neighbors[i].isWall()) {
						stack.push(neighbors[i]);
					}
				}
			}
		}
	}

	this.getStart = function () {
		return start;
	}

	this.getTile = function (r, c) {
			if (r instanceof Coordinate) {
				c = r.getColumn();
				r = r.getRow();
			}
			return map[r][c];
	}

	function randomTile () {
		var r = randomInt(0, rows);
		var c = randomInt(0, columns);
		return self.getTile(r, c);
	}

	function MazeTile (r, c) {
		var row = r;
		var column = c;
		var tile = new Tile();
		var isWall = true;
		var self = this;

		this.setWall = function (bool) {
			isWall = bool;
		}

		this.validPath = function () {
			var n = self.north();
			var e = self.east();
			var s = self.south();
			var w = self.west();

			var pathCount = 0;
			if (n != null && !n.isWall()) pathCount++;
			if (s != null && !s.isWall()) pathCount++;
			if (e != null && !e.isWall()) pathCount++;
			if (w != null && !w.isWall()) pathCount++;

			if (pathCount > 1) return false;

			if (validRow(row - 1) && validColumn(column + 1)) {
				// Check if northeast makes a 4-block
				var ne = map[row - 1][column + 1];
				if (!xor(n.isWall(), e.isWall()) 
							&& !ne.isWall()) {
					return false;
				}
			}

			if (validRow(row + 1) && validColumn(column + 1)) {
				// Check if southeast makes a 4-block
				var se = map[row + 1][column + 1];
				if (!xor(s.isWall(), e.isWall()) 
							&& !se.isWall()) {
					return false;
				}
			}

			if (validRow(row + 1) && validColumn(column - 1)) {
				// Check if southwest makes a 4-block
				var sw = map[row + 1][column - 1];
				if (!xor(s.isWall(), w.isWall()) 
							&& !sw.isWall()) {
					return false;
				}
			}

			if (validRow(row - 1) && validColumn(column - 1)) {
				// Check if northwest makes a 4-block
				var nw = map[row - 1][column - 1];
				if (!xor(n.isWall(), w.isWall()) 
							&& !nw.isWall()) {
					return false;
				}
			}

			return true;
		}

		this.isWall = function () {
			return isWall;
		}

		this.north = function () {
			var result = null; 
			if (validRow(row - 1)) {
				result = map[row - 1][column];
			}
			return result;
		}

		this.south = function () {
			var result = null; 
			if (validRow(row + 1)) {
				result = map[row + 1][column];
			}
			return result;
		}

		this.west = function () {
			var result = null; 
			if (validColumn(column - 1)) {
				result = map[row][column - 1];
			}
			return result;
		}

		this.east = function () {
			var result = null; 
			if (validColumn(column + 1)) {
				result = map[row][column + 1];
			}
			return result;
		}

		function validRow (i) {
			return i < rows && i >= 0;
		}

		function validColumn (i) {
			return i < columns && i >= 0;
		}
	}
}

function Coordinate (r, c) {
	var row = r;
	var column = c;
	var self = this;

	this.getRow = function () {
		return row;
	}

	this.getColumn = function () {
		return column;
	}

	this.getCol = function () {
		return self.getColumn();
	}

	this.getX = function () {
		return self.getColumn();
	}

	this.getY = function () {
		return self.getRow();
	}

	this.r = function () {
		return self.getRow();
	}

	this.c = function () {
		return self.getColumn();
	}
}

function Tile () {

}

function shuffle (arr) {
	for (var i = arr.length - 1; i > 0; i--) {
		var j = randomInt(0, i + 1);
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
  return arr;
}

function xor (a, b) {
	return !((a && b) || (!a && !b));
}

function randomInt (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}