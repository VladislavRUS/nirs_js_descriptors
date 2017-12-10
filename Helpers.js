const fs = require('fs');
const Jimp = require("jimp");
const AFS = require('./AFS');

const Helpers = {
    scaleImage: function (image, scaleFactor) {
        const matrix = image.matrix;
        const height = matrix.length;
        const width = matrix[0].length;

        const ver = Math.floor(height / scaleFactor);
        const hor = Math.floor(width / scaleFactor);

        const coef = 1 / (Math.pow(scaleFactor, 2));

        const result = this.createMatrix(hor, ver);

        for (let i = 0; i < ver; i++) {
            for (let j = 0; j < hor; j++) {
                val = 0;

                for (let k = 0; k < scaleFactor; k++) {
                    for (let l = 0; l < scaleFactor; l++) {
                        val += matrix[scaleFactor * i + k][scaleFactor * j + l];;
                    }
                }

                result[i][j] = val * coef;
            }
        }

        image.height = result.length;
        image.width = result[0].length;
        image.matrix = result;

        return image;
    },

    matrix2image: function (matrix) {
        const width = matrix.length;
        const height = matrix[0].length;

        new Jimp(width, height, (err, image) => {
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    image.setPixelColor(matrix[i][j], j, i);
                }
            }

            image.write('test.jpg');
        });
    },
    createMatrix: function (width, height, fillNumber) {
        const matrix = [];

        for (let i = 0; i < height; i++) {
            matrix[i] = [];
        }

        if (fillNumber !== undefined) {
            matrix.forEach(function (row, rowIdx) {
                for (let j = 0; j < width; j++) {
                    row[j] = fillNumber;
                }
            });
        }

        return matrix;
    },

    image2Vector: function (image) {
        const gradient = this.getImageGradient(image);

        gradient.x = this.matrix2Vector(gradient.x);
        gradient.y = this.matrix2Vector(gradient.y);

        return this.getComplexVector(gradient.x, gradient.y);
    },

    getComplexVector: function (realVector, imaginaryVector) {
        if (realVector.length !== imaginaryVector.length) {
            throw new Error('Lengths are not equal!');
        }

        const complex = [];

        realVector.forEach(function (value, idx) {
            complex.push({
                r: value,
                i: imaginaryVector[idx]
            })
        });

        return complex;
    },

    matrix2Vector: function (matrix) {
        let result = [];

        matrix.forEach(row => {
            result = result.concat(row);
        });

        return result;
    },

    getImageGradient: function (image) {
        return {
            x: this.getXGradient(image),
            y: this.getYGradient(image)
        }
    },

    getXGradient: function (image) {
        const filter = [1, 0, -1];
        const matrix = image.matrix;
        let result = Helpers.createMatrix(image.width, image.height, 0);

        for (let i = 0; i < image.height; i++) {
            for (let j = 0; j < image.width; j++) {

                result[i][j] = matrix[i]
                    .slice(j, j + filter.length)
                    .map((pixelValue, idx) => pixelValue *= filter[idx])
                    .reduce((first, second) => first + second);
            }
        }

        result = result.slice(1, result.length - 1);
        result = result.map(row => row.slice(1, row.length - 1));

        this.matrix2image(result);

        return result;
    },

    getYGradient: function (image) {
        const filter = [1, 0, -1];
        const matrix = image.matrix;
        let result = Helpers.createMatrix(image.width, image.height, 0);

        for (let i = 1; i < image.height - 1; i++) {
            for (let j = 0; j < image.width; j++) {

                let current = matrix[i][j],
                    prev = matrix[i - 1][j],
                    next = matrix[i + 1][j];

                result[i][j] = [current, prev, next]
                    .map((pixelValue, idx) => pixelValue *= filter[idx])
                    .reduce((first, second) => first + second);
            }
        }

        result = result.slice(1, result.length - 1);
        result = result.map((row => row.slice(1, row.length - 1)));

        return result;
    },

    substructComplexVectors: function (first, second) {
        return first.map((complexValue, idx) => {
            return {
                r: complexValue.r - second[idx].r,
                i: complexValue.i - second[idx].i
            }
        });
    },

    calcFeatures: function(vector, eigenVectors) {
        const result = [];

        let maxValue = Number.MIN_VALUE;

        eigenVectors.forEach(eigenVector => {
            eigenVector = eigenVector.map(complexValue => this.getComplexModule(complexValue));

            let vectorMaxValue = Math.max(...eigenVector);

            if (vectorMaxValue > maxValue) {
                maxValue = vectorMaxValue;
            }
        });

        const N = eigenVectors[0].length;
        const ortogonality = true;
        let featureVector = [];

        for (let i = 0; i < N; i++) {
            let complexBaseVector = eigenVectors.map(eigenVector => eigenVector[i]);

            featureVector[i] = new AFS(vector, complexBaseVector, maxValue, ortogonality);
        }

        return result;
    },

    AFS: function(complexVector, complexBaseVector, maxBaseValue, ortogonality) {

    },

    getComplexModule: function(complexValue) {
        return Math.sqrt(Math.pow(complexValue.r, 2) + Math.pow(complexValue.i, 2));
    },

    getComplexAngle: function(complexValue) {
        return Math.atan(complexValue.i / complexValue/r);
    },

    toDegrees: function(radians) {
        return radians * 180 / Math.PI;
    },

    addComplexValues: function(first, second) {
        return {
            r: first.r + second.r,
            i: first.i + second.i
        }
    },

    multiplyComplexValues: function(first, second) {
        return {
            r: first.r * second.r - first.i * second.i,
            i: first.r * second.i + first.i * second.r
        }
    }
};

module.exports = Helpers;