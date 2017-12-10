const Helpers = require('./Helpers');

const PGMParser = {
    getPGMImage: function (buffer) {
        let bytes = this.buffer2Array(buffer);

        let str = '';
        for (let i = 0; i < 15; i++) {
            str += String.fromCharCode(bytes[i]);
        }

        str = str.replace(/\n/g, ' ').split(' ');

        const magicNumber = str[0];
        const width = parseInt(str[1], 10);
        const height = parseInt(str[2], 10);
        const maxValue = parseInt(str[3], 10);

        const matrix = Helpers.createMatrix(width, height, 0);

        bytes = bytes.slice(15);

        matrix.forEach((row, i) => {
            row.forEach((column, j) => {
                matrix[i][j] = bytes[i * width + j];
            });
        })

        return {
            width: width,
            height: height,
            maxValue: maxValue,
            matrix: matrix
        }
    },
    buffer2Array: function (buffer) {
        return [...buffer];
    }
}

module.exports = PGMParser;