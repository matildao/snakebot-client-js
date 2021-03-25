/**
* HUNTER SNAKE
*/

const MapUtils = require('../domain/mapUtils.js');
let log = null; // Injected logger

function getNextPosition(position, direction) {
	const nextTileDirections = {
		RIGHT: { x: position.x + 1, y: position.y },
		LEFT: { x: position.x - 1, y: position.y },
		UP: { x: position.x, y: position.y - 1 },
		DOWN: { x: position.x, y: position.y + 1 },
	};

	return nextTileDirections[direction];
}

function getDirectionToPosition(directions, myCoords, position) {
	let closest = Number.MAX_VALUE;
	let closestDirection;

	directions.forEach((dir) => {
		const directionCoordinates = getNextPosition(myCoords, dir);
		const distance = MapUtils.getManhattanDistance(directionCoordinates, position);

		if (distance < closest) {
			closest = distance;
			closestDirection = dir;
		}
	});
	return closestDirection;
}

function getClosestStarPosition(myCoords, map){
    let stars = MapUtils.listCoordinatesContainingFood(myCoords, map);
    return MapUtils.sortByClosestTo(stars, myCoords)[0];
}
 
function onMapUpdated(mapState, myUserId) {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const defaultDirection = 'UP';
    const map = mapState.getMap();
    const snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

    // 1. All information om banan
    const myCoords = MapUtils.getSnakePosition(myUserId, map);
    log('I am here:', myCoords);

    // 2. Vad ska snaken göra? Strategi etc
    let possibleDirections = directions.filter(dir => MapUtils.canSnakeMoveInDirection(dir, myCoords, map));
    let direction = possibleDirections[0] ?? defaultDirection;

    const starPosition = getClosestStarPosition(myCoords, map);
    direction = starPosition ? getDirectionToPosition(possibleDirections, myCoords, starPosition, map) : direction;
    
    // 3. Then shake that snake!
    return {
        direction,
        debugData: snakeBrainDump
    };
 }
 
function bootStrap(logger) {
    log = logger;
}

function onGameEnded(event) {
    log('On Game Ended');
    log(event);
    // Implement as needed.
}

function onTournamentEnded(event) {
    log('On Tournament Ended');
    log(event);
    // Implement as needed.
}

function onSnakeDied(event) {
    log('Oh no, oh no no no no no');
    log(event);
    // Implement as needed.
}

function onGameStarted(event) {
    log('On Game Started');
    log(event);
    // Implement as needed.
}

function onGameResult(event) {
    log('On Game Result');
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
    onTournamentEnded
};
