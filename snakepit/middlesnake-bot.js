/**
 * Snake Bot script.
 */
const MapUtils = require("../domain/mapUtils.js");

let log = null; // Injected logger
let level2 = false; //Set to true for level2

//Returns directions where tile is not blocked
function movableDirections(map, myCoords) {
	const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
	let ableToMove = [];

	directions.forEach((dir) => {
		if (MapUtils.canSnakeMoveInDirection(dir, myCoords, map)) {
			ableToMove.push(dir);
		}
	});
	return ableToMove;
}

function getDirectionCoordinates(position, direction) {
	const nextTileDirections = {
		RIGHT: { x: position.x + 1, y: position.y },
		LEFT: { x: position.x - 1, y: position.y },
		UP: { x: position.x, y: position.y - 1 },
		DOWN: { x: position.x, y: position.y + 1 },
	};

	return nextTileDirections[direction];
}

function findClosestDirectionToMiddle(directions, myCoords, middle, map) {
	let closest = 500;
	let keepFromMiddleDistance = 5;
	let shortestDiff = 500;
	let closestDirection = "";

	directions.forEach((c) => {
		const directionCoordinates = getDirectionCoordinates(myCoords, c);
		const distance = MapUtils.getEuclidianDistance(
			directionCoordinates,
			middle
		);

		let toKeepFromDistance = Math.abs(distance - keepFromMiddleDistance);
		const additionalDirections = movableDirections(map, directionCoordinates);

		if (
			toKeepFromDistance < shortestDiff &&
			additionalDirections.length > 0 &&
			level2
		) {
			closest = distance;
			closestDirection = c;
			shortestDiff = toKeepFromDistance;
		} else if (toKeepFromDistance < shortestDiff && !level2) {
			closest = distance;
			closestDirection = c;
			shortestDiff = toKeepFromDistance;
		}
	});

	return closestDirection;
}

function onMapUpdated(mapState, myUserId) {
	const map = mapState.getMap();
	const middle = { x: map.getWidth() / 2, y: map.getHeight() / 2 };

	let direction = "DOWN"; // <'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>
	const snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.
	const myCoords = MapUtils.getSnakePosition(myUserId, map);

	log("I am here:", myCoords);
	snakeBrainDump.myCoords = myCoords;

	const canMoveDirections = movableDirections(map, myCoords);

	direction = findClosestDirectionToMiddle(
		canMoveDirections,
		myCoords,
		middle,
		map
	);

	return {
		direction,
		debugData: snakeBrainDump,
	};
}

function bootStrap(logger) {
	log = logger;
}

function onGameEnded(event) {
	log("On Game Ended");
	log(event);
	// Implement as needed.
}

function onTournamentEnded(event) {
	log("On Tournament Ended");
	log(event);
	// Implement as needed.
}

function onSnakeDied(event) {
	log("On Snake Died");
	log(event);
	// Implement as needed.
}

function onGameStarted(event) {
	log("On Game Started");
	log(event);
	// Implement as needed.
}

function onGameResult(event) {
	log("On Game Result");
	log(event);
	// Implement as needed.
}

module.exports = {
	bootStrap,
	onGameEnded,
	onGameResult,
	onGameStarted,
	onMapUpdated,
	onSnakeDied,
	onTournamentEnded,
};
