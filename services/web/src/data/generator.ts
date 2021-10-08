

export function generateRoom(width: number, height: number, doorPoses: number[][]): string[] {
    const scrwid = 20;
    const scrheight = 13;

    const strbuffer = [];
    const lines = [];

    for (let y = 0; y < height * scrheight; ++y) {
        for (let x = 0; x < width * scrwid; ++x) {
            if ( doorPoses.length && doorPoses[0][0] === x && doorPoses[0][1] === y ) {
                strbuffer.push('0');
                doorPoses.shift();
            } else if ( x - 2 < 0 || x + 3 > width * scrwid) {
                strbuffer.push('1');
            } else if ( y - 2 < 0 || y + 3 > height * scrheight) {
                strbuffer.push('1');
            } else {
                strbuffer.push('0');
            }
        }

        lines.push(strbuffer.join(','));
        strbuffer.length = 0;
    }

    return lines;
}