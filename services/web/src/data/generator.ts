const VERTICAL_WIDE_DOOR: string[][] = [
    ['48','50','50','52'],
    ['49','51','51','53'],
    ['26','28','28','30'],
    ['27','29','29','31']
];

const VERTICAL_DOOR: string[][] = [
    ['48','50','52'],
    ['49','51','53'],
    ['26','28','30'],
    ['27','29','31']
];

const HORIZONTAL_DOOR: string[][] = [
    ['64','65','36','37'],
    ['62','63','38','39'],
    ['60','61','40','41']
];

function getTileType(current: number, max: number): number {
    if (current === max - 1) return 7;
    if (current === max - 2) return 6;
    if (current >= 2) return 2;
    return current;
}

function getPatch(rowType: number, colType: number): number {
    return [
        [1,2,23,17,19,21,25,26],
        [3,4,24,18,20,22,27,28],
        [5,6,-19,-19,-19,-19,35,36],
        [7,8,-19,-19,-19,-19,29,30],
        [9,10,-19,-19,-19,-19,31,32],
        [11,12,-19,-19,-19,-19,33,34],
        [13,14,47,45,43,41,37,38],
        [15,16,48,46,44,42,39,40]
    ][rowType][colType] + 19;
}

function writeDoor(array: string[][], x: number, y: number, door: string[][]) {
    for (let height = 0; height < door.length && array[y + height]; ++height) {
        for (let width = 0; width < door[height].length; ++width) {
            if (y + height > array.length || x + width > array[y + height].length) return;
            array[y + height][x + width] = door[height][width];
        }
    }
}

export function addDoors(inputString: string, doors:{x: number, y: number, type: number}[]): string {
    const csvArrays = inputString.split('\n').map(row => row.split(','));

    for (let doorData of doors) {
        const doorArray = [VERTICAL_DOOR, HORIZONTAL_DOOR, VERTICAL_WIDE_DOOR][doorData.type];
        writeDoor(csvArrays, doorData.x, doorData.y, doorArray);
    }

    return csvArrays.map(row => row.join(',')).join('\n');
}

export function generateRoom(width: number, height: number): string[] {
    const scrwid = 21;
    const scrheight = 15;

    const strbuffer: string[] = [];
    const lines: string[] = [];

    for (let y = 0; y < height * scrheight; ++y) {
        for (let x = 0; x < width * scrwid; ++x) {
            strbuffer.push(getPatch(getTileType(x, width * scrwid), getTileType(y, height * scrheight)).toString());
        }

        lines.push(strbuffer.join(','));
        strbuffer.length = 0;
    }

    return lines;
}