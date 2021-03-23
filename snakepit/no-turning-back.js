/**
 * Snake Bot script.
 */
const MapUtils = require('../domain/mapUtils.js');

let log = null; // Injected logger
/**
 * INFO!!!! SET THIS FLAG TO SWITCH BETWEEN LEVEL 1 AND 2
 */
const useLevel2 = false;

const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const UP = 'UP';
const DOWN = 'DOWN';

const LEFTDOWN = 'leftdown';
const RIGHTDOWN = 'rightdown';
const LEFTUP = 'leftup';
const RIGHTUP = 'rightup';

function onMapUpdated(mapState, myUserId) {
    const map = mapState.getMap();
    let direction = 'DOWN'; // <'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>
    const snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

    // 1. Where's what etc.
    const myCoords = MapUtils.getSnakePosition(myUserId, map);
    log('I am here:', myCoords);
    snakeBrainDump.myCoords = myCoords;

    // 2. Do some nifty planning...
    // (Tip: see MapUtils for some off-the-shelf navigation aid.
    const directions = [LEFT, RIGHT, UP, DOWN];
    if (useLevel2) {
        direction = levelTwo(directions, myCoords, map);
    } else {
        direction = levelOne(directions, myCoords, map);
    }

    // 3. Then shake that snake!
    return {
        direction,
        debugData: snakeBrainDump
    };
}

/**
 * Starts with LEFT/RIGHT. Save possible directions, prioritize a direction that has adjacent available tile. 
 * Default: DOWN.
 * 
 * @param {coordinate} myCoords 
 * @param {map} map 
 * @returns 
 */
function levelOne(directions, myCoords, map) {
    const leftDownCoord = { x: myCoords.x - 1, y: myCoords.y + 1 };
    const leftUpCoord = { x: myCoords.x - 1, y: myCoords.y - 1 };
    const rightUpCoord = { x: myCoords.x + 1, y: myCoords.y - 1 };
    const rightDownCoord = { x: myCoords.x + 1, y: myCoords.y + 1 };

    let fallback = [];
    let better = [];

    directions.forEach(d => {
        if (MapUtils.canSnakeMoveInDirection(d, myCoords, map)) {
            fallback.push(d);

            if (d === LEFT) {
                if (MapUtils.isTileAvailableForMovementTo(leftDownCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(leftUpCoord, map)) {
                    better.push(d);
                }
            }
            if (d === RIGHT) {
                if (MapUtils.isTileAvailableForMovementTo(rightUpCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(rightDownCoord, map)) {
                    better.push(d);
                }
            }
            if (d === UP) {
                if (MapUtils.isTileAvailableForMovementTo(leftUpCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(rightUpCoord, map)) {
                    better.push(d);
                }
            }
            if (d === DOWN) {
                if (MapUtils.isTileAvailableForMovementTo(leftDownCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(rightDownCoord, map)) {
                    better.push(d);
                }
            }
        }
    });

    let direction = DOWN;
    if (better.length !== 0) {
        direction = better[0];
    }
    else if (fallback.length !== 0) {
        direction = fallback[0];
    }
    return direction;
}

/**
 * Starts with LEFT/RIGHT. Save possible directions, prioritize a direction that has adjacent available tile. 
 * Also check the available reach forward up to 10 tiles. 
 * Default: DOWN.
 * 
 * @param {coordinate} myCoords The coordinate
 * @param {map} map The game map
 * @returns 
 */
function levelTwo(directions, myCoords, map) {
    const longReach = 10;
    const shortReach = 5;

    const leftDownCoord = { x: myCoords.x - 1, y: myCoords.y + 1 };
    const leftUpCoord = { x: myCoords.x - 1, y: myCoords.y - 1 };
    const rightUpCoord = { x: myCoords.x + 1, y: myCoords.y - 1 };
    const rightDownCoord = { x: myCoords.x + 1, y: myCoords.y + 1 };

    let fallback = [];
    let better = [];
    let best = [];

    directions.forEach(d => {
        if (MapUtils.canSnakeMoveInDirection(d, myCoords, map)) {
            fallback.push(d);

            if (d === LEFT) {
                if (MapUtils.isTileAvailableForMovementTo(leftDownCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(leftUpCoord, map)) {
                    better.push(d);

                    const reachLeft = isTileAvailableInDirectionAndReach(myCoords, map, longReach, d);
                    const reachLeftDown = isTileAvailableInDirectionAndReach(myCoords, map, longReach, LEFTDOWN);
                    const reachLeftUp = isTileAvailableInDirectionAndReach(myCoords, map, longReach, LEFTUP);

                    if (reachLeft || reachLeftDown || reachLeftUp) {
                        best.push(d);
                    }
                } else if (isTileAvailableInDirectionAndReach(myCoords, map, shortReach, d)) {
                    better.push(d);
                }
            }
            if (d === RIGHT) {
                if (MapUtils.isTileAvailableForMovementTo(rightUpCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(rightDownCoord, map)) {
                    better.push(d);

                    const reachRight = isTileAvailableInDirectionAndReach(myCoords, map, longReach, d);
                    const reachRightDown = isTileAvailableInDirectionAndReach(myCoords, map, longReach, RIGHTDOWN);
                    const reachRightUp = isTileAvailableInDirectionAndReach(myCoords, map, longReach, RIGHTUP);

                    if (reachRight || reachRightDown || reachRightUp) {
                        best.push(d);
                    }
                } else if (isTileAvailableInDirectionAndReach(myCoords, map, shortReach, d)) {
                    better.push(d);
                }
            }
            if (d === UP) {
                if (MapUtils.isTileAvailableForMovementTo(leftUpCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(rightUpCoord, map)) {
                    better.push(d);

                    const reachUp = isTileAvailableInDirectionAndReach(myCoords, map, longReach, d);
                    const reachLeftUp = isTileAvailableInDirectionAndReach(myCoords, map, longReach, LEFTUP);
                    const reachRightUp = isTileAvailableInDirectionAndReach(myCoords, map, longReach, RIGHTUP);

                    if (reachUp || reachLeftUp || reachRightUp) {
                        best.push(d);
                    }
                } else if (isTileAvailableInDirectionAndReach(myCoords, map, shortReach, d)) {
                    better.push(d);
                }
            }
            if (d === DOWN) {
                if (MapUtils.isTileAvailableForMovementTo(leftDownCoord, map) ||
                    MapUtils.isTileAvailableForMovementTo(rightDownCoord, map)) {
                    better.push(d);

                    const reachDown = isTileAvailableInDirectionAndReach(myCoords, map, longReach, d);
                    const reachLeftDown = isTileAvailableInDirectionAndReach(myCoords, map, longReach, LEFTDOWN);
                    const reachRightDown = isTileAvailableInDirectionAndReach(myCoords, map, longReach, RIGHTDOWN);

                    if (reachDown || reachLeftDown || reachRightDown) {
                        best.push(d);
                    }
                } else if (isTileAvailableInDirectionAndReach(myCoords, map, shortReach, d)) {
                    better.push(d);
                }
            }

        }
    });

    let direction = DOWN;
    if (best.length !== 0) {
        direction = best[0];
    }
    else if (better.length !== 0) {
        direction = better[0];
    }
    else if (fallback.length !== 0) {
        direction = fallback[0];
    }
    return direction;
}

/**
 * Check one step up, down, right, left depending on input. 
 * 
 * @param {*} myCoords The coordinate
 * @param {*} map The game map
 * @param {*} reach How many tiles forward to check
 * @param {*} direction The direction to check: lowerleft | lowerright | upperleft | upperright
 * @returns True if can move the whole reach in the direction
 */
function isTileAvailableInDirectionAndReach(myCoords, map, reach, direction) {
    let i = 0;
    let available = true;

    while (available && i < reach) {
        let coord = myCoords;
        if (direction === LEFT) {
            coord = { x: myCoords.x - i, y: myCoords.y };
        }
        if (direction === RIGHT) {
            coord = { x: myCoords.x + i, y: myCoords.y };
        }
        if (direction === UP) {
            coord = { x: myCoords.x, y: myCoords.y - i };
        }
        if (direction === DOWN) {
            coord = { x: myCoords.x, y: myCoords.y + i };
        }
        if (direction === LEFTDOWN) {
            coord = { x: myCoords.x - i, y: myCoords.y + 1 };
        }
        if (direction === RIGHTDOWN) {
            coord = { x: myCoords.x + i, y: myCoords.y + 1 };
        }
        if (direction === LEFTUP) {
            coord = { x: myCoords.x - i, y: myCoords.y - 1 };
        }
        if (direction === RIGHTUP) {
            coord = { x: myCoords.x + i, y: myCoords.y - 1 };
        }

        available = MapUtils.isTileAvailableForMovementTo(coord, map);
        i++
    }

    return available;
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
    log('On Snake Died');
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
