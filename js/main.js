window.onload = function () {
	// The functionality to be run when the when the page is loaded. 
	var seed = Math.floor(Math.random() * 10000000) + 1111111;
	var game = new MazeGame(seed, 12, 20);
	game.render();
	game.listen(window);
}

function MazeGame (s, r, c) {
	var seed = s;
	var self = this;
	var container = document.getElementById("maze");
	var maze = new Maze(s, r, c);
	maze.generate();

	var player = maze.getStart();

	var squareWidth = Math.floor((100 / c) * 100) / 100 + "%";
	var squareHeight = Math.floor((100 / r) * 100) / 100 + "%";

	this.listen = function (cont) {
		cont.onkeydown = function (e) {
			e = e || window.event; 
		  var charCode = e.charCode || e.keyCode;
		  switch (charCode) {
		  	case 65: // a
		  	case 37: // left
		  		self.moveWest();
		  		break;
		  	case 87: // w
		  	case 38: // up
			  	self.moveNorth();
		  		break;
		  	case 68: // d
		  	case 39: //right
			  	self.moveEast();
		  		break;
		  	case 83: //s
		  	case 40: // down
		  		self.moveSouth();
		  		break;
		  }
		}
	}

	this.move = function (newTile) {
		if (newTile != null && !newTile.isWall()) {
			if (player != null) {
				document.getElementById(player.getId()).style.backgroundColor = "#fff";
			}
			player = newTile;
			document.getElementById(player.getId()).style.backgroundColor = "red";
		}
	}

	this.moveNorth = function () {
		self.move(player.north());
	}

	this.moveEast = function () {
		if (player.bordersEast() && player.isDoor()) {
			maze = maze.eastMaze();
			maze.generate();
			player = maze.getLeftDoor();
			self.render();
		} else {
			self.move(player.east());
		}
	}

	this.moveSouth = function () {
		self.move(player.south());
	}

	this.moveWest = function () {
		if (player.bordersWest() && player.isDoor()) {
			maze = maze.westMaze();
			maze.generate();
			player = maze.getRightDoor();
			self.render();
		} else {
			self.move(player.west());
		}
	}

	this.render = function () {
		container.innerHTML = "";
		for (var i = 0; i < maze.rows(); i++) {
			for (var j = 0; j < maze.columns(); j++) {
				addSquare(i, j);
			}
		}
		self.move(player);
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
		square.setAttribute("id", tile.getId());

		container.appendChild(square);
	}
}

function Maze (s, r, c) {
	var self = this;
	var rows = r;
	var columns = c;
	var map = [];
	var start, leftDoor, rightDoor;
	var seed = s;

	// Initialize a map
	for (var i = 0; i < r; i++) {
		map[i] = [];
		for (var j = 0; j < c; j++) {
			map[i][j] = new MazeTile(i, j);
		}
	}

	this.westMaze = function () {
		return new Maze(seed + 1, rows, columns);
	}

	this.eastMaze = function () {
		return new Maze(seed - 1, rows, columns);
	}


	this.rows = function () {
		return rows;
	}

	this.columns = function () {
		return columns;
	}

	this.generate = function () {
		start = randomTile(seed);
		var stack = [start];
		var eastPaths = [];
		var westPaths = [];
		var count = 0;
		while (stack.length != 0) {
			var current = stack.pop();
			if (current.validPath()) {
				current.setWall(false);
				if (current.bordersWest()) {
					westPaths.push(current);
				} else if (current.bordersEast()) {
					eastPaths.push(current);
				}
				var neighbors = [current.north(), current.east(), 
						current.south(), current.west()];
				neighbors = shuffle(seed + 5 * count, neighbors);
				for (var i = 0; i < neighbors.length; i++) {
					if (neighbors[i] != null && neighbors[i].isWall()) {
						stack.push(neighbors[i]);
					}
				}
				count++;
			}
		}

		if (westPaths.length > 0) {
			leftDoor = seedChoice(seed + 6, westPaths).west();
			leftDoor.setWall(false);
			leftDoor.setDoor(true);
		}
		if (eastPaths.length > 0) {
			rightDoor = seedChoice(seed + 9, eastPaths).east();
			rightDoor.setWall(false);
			rightDoor.setDoor(true);
		}
	}

	this.getLeftDoor = function () {
		return leftDoor;
	}

	this.getRightDoor = function () {
		return rightDoor;
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

	function randomTile (s) {
		var r = randomInt(s + 2, rows - 2, 1);
		var c = randomInt(s + 4, columns - 2, 1);
		return self.getTile(r, c);
	}

	function MazeTile (r, c) {
		var row = r;
		var column = c;
		var isWall = true;
		var self = this;
		var isDoor = false; 

		this.isDoor = function () {
			return isDoor;
		}

		this.setDoor = function (b) {
			isDoor = b;
		}

		this.getId = function () {
			return row + "-" + column;
		}

		this.setWall = function (bool) {
			isWall = bool;
		}

		this.bordersWest = function () {
			return column <= 1;
		}

		this.bordersEast = function () {
			return column >= columns - 2;
		}

		// Returns whether this maze tile is a candidate to become a new path tile
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

			if (self.north() === null || self.south() === null 
					|| self.east() === null || self.west() === null) {
				return false;
			}

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
			return i <= rows - 1 && i >= 0;
		}

		function validColumn (i) {
			return i <= columns - 1 && i >= 0;
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

}

function shuffle (seed, arr) {
	for (var i = arr.length - 1; i > 0; i--) {
		seed += 5;
		var j = randomInt(seed, i + 1, 0);
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
  return arr;
}

function xor (a, b) {
	return !((a && b) || (!a && !b));
}

function random (seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function randomInt (seed, max, min) {
    if (!min) min = 0;
    return min + Math.floor(random(seed) * (max - min));
}

function seedChoice (seed, choices) {
    return choices[Math.floor(random(seed) * choices.length)];
}