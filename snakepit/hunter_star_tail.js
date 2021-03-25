/**
* HUNTER SNAKE 2
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

function getClosestTailPosition(myCoords, map, myUserId){
    const contents = MapUtils.getOccupiedMapTiles(map)
    const snakeCoordinates = MapUtils.getSnakeCoordinates(myUserId, map)

    let tails = []
    for (const [key, value] of Object.entries(contents)) {
        if (value.content === 'snaketail') tails.push(key)
    }
    let positions = MapUtils.translatePositions(tails, map.getWidth())
    // exlude our own snake 
    positions = positions.filter(coords => !snakeCoordinates.some(snakeCoord => (snakeCoord.y === coords.y && snakeCoord.x === coords.x)))
    return MapUtils.sortByClosestTo(positions, myCoords)[0];
}
 
function onMapUpdated(mapState, myUserId) {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const defaultDirection = 'UP';
    const map = mapState.getMap();
    const snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

    // 1. All information om banan
    const myCoords = MapUtils.getSnakePosition(myUserId, map);

    // 2. Vad ska snaken göra? Strategi etc
    let possibleDirections = directions.filter(dir => MapUtils.canSnakeMoveInDirection(dir, myCoords, map));
    let direction = possibleDirections[0] ?? defaultDirection;

    const closePositions = []
    const starPosition = getClosestStarPosition(myCoords, map);
    if (starPosition) closePositions.push(starPosition)
    const tailPosition = getClosestTailPosition(myCoords, map, myUserId);
    if (tailPosition) closePositions.push(tailPosition)

    const closest = MapUtils.sortByClosestTo(closePositions, myCoords)[0];
    direction = closest ? getDirectionToPosition(possibleDirections, myCoords, closest, map) : direction;
    
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
