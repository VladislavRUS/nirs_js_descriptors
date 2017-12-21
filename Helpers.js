const fs = require('fs');
const Jimp = require("jimp");
const numeric = require('./libs/numeric');

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

    matrix2image: function (matrix, name) {
        const height = matrix.length;
        const width = matrix[0].length;

        new Jimp(width, height, (err, image) => {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    image.setPixelColor(matrix[i][j], j, i);
                }
            }

            image.write(name + '.jpg');
        });
    },

    getStringFromMatrix: function(matrix) {
        let str = '';
        str += matrix.length + '\n';

        matrix.forEach(row => {
            row.forEach(value => {
                str += parseInt(value.x) + ' ' + parseInt(value.y) + '\n'
            });
        });

        return str;
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

    transposeMatrix: function (matrix) {

        const transposedMatrix = Helpers.createMatrix(matrix.length, matrix[0].length);

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                transposedMatrix[j][i] = Helpers.copy(matrix[i][j]);
            }
        }

        return transposedMatrix;
    },

    getConjugateMatrix: function(complexMatrix) {
        return complexMatrix.map(row => {
            return row.map(value => {
                return {
                    x: value.x,
                    y: -value.y
                };
            });
        })
    },  

    multiplyMatrices(first, second) {
        let m = first.length, q = second[0].length, n = second.length;

        let result = Helpers.createMatrix(q, m, { x: 0, y: 0});

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < q; j++) {
                for (let k = 0; k < n; k++) {
                    let mul = Helpers.multiplyComplexValues(first[i][k], second[k][j]);
                    result[i][j] = Helpers.addComplexValues(result[i][j], mul);
                }
            }
        }

        return result;
    },

    getComplexVector: function (realVector, imaginaryVector) {
        if (realVector.length !== imaginaryVector.length) {
            throw new Error('Lengths are not equal!');
        }

        const complex = [];

        realVector.forEach(function (value, idx) {
            complex.push({
                x: value,
                y: imaginaryVector[idx]
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
        const sobelOperatorX = [
            [-1, +0, +1],
            [-2, +0, +2],
            [-1, +0, +1]
        ];

        const matrix = image.matrix;
        let result = Helpers.createMatrix(image.width, image.height, 0);

        for (let i = 1; i < image.height - 1; i++) {
            for (let j = 1; j < image.width - 1; j++) {

                let rows = matrix.slice(i - 1, i + 2);
                let window = rows.map(row => row.slice(j - 1, j + 2));

                let arr = [];

                window.forEach((row, rowIdx) => {
                    row.forEach((value, columnIdx) => {
                        arr.push(value * sobelOperatorX[rowIdx][columnIdx]);
                    });
                });

                result[i][j] = arr.reduce((first, second) => first + second);
            }
        }

        result = result
            .map(row => row.slice(1, row.length - 1))
            .slice(1, result.length - 1);

        return result;
    },

    getYGradient: function (image) {
        const sobelOperatorY = [
            [-1, -2, -1],
            [+0, +0, +0],
            [+1, +2, +1]
        ];

        const matrix = image.matrix;
        let result = Helpers.createMatrix(image.width, image.height, 0);

        for (let i = 1; i < image.height - 1; i++) {
            for (let j = 1; j < image.width - 1; j++) {

                let rows = matrix.slice(i - 1, i + 2);
                let window = rows.map(row => row.slice(j - 1, j + 2));

                let arr = [];

                window.forEach((row, rowIdx) => {
                    row.forEach((value, columnIdx) => {
                        arr.push(value * sobelOperatorY[rowIdx][columnIdx]);
                    });
                });

                result[i][j] = arr.reduce((first, second) => first + second);
            }
        }

        result = result
            .map(row => row.slice(1, row.length - 1))
            .slice(1, result.length - 1);

        return result;
    },

    substructComplexVectors: function (first, second) {
        return first.map((complexValue, idx) => {
            return {
                x: complexValue.x - second[idx].x,
                y: complexValue.y - second[idx].y
            }
        });
    },

    calcFeatures: function (vector, eigenVectors) {
        let maxValue = Number.MIN_VALUE;

        eigenVectors.forEach(eigenVector => {
            eigenVector = eigenVector.map(complexValue => this.getComplexModule(complexValue));

            let vectorMaxValue = Math.max(...eigenVector);

            if (vectorMaxValue > maxValue) {
                maxValue = vectorMaxValue;
            }
        });

        const N = eigenVectors[0].length;
        const ortogonality = false;
        let featureVector = [];

        for (let i = 0; i < N; i++) {
            let complexBaseVector = eigenVectors.map(eigenVector => eigenVector[i]);

            featureVector[i] = this.AFS(vector, complexBaseVector, maxValue, ortogonality);
        }

        return featureVector;
    },

    AFS: function (complexVector, complexBaseVector, maxBaseValue, ortogonality) {
        const afsType = 1;

        let sum = 0,
            outputValue = 0;
        let firstMaxBaseValue = 1 / maxBaseValue,
            secondMaxBaseValue = Math.pow(firstMaxBaseValue, 2),
            N = complexVector.length;

        for (let i = 0; i < N; i++) {
            let zBase = complexBaseVector[i],
                z = complexVector[i];

            let valBase = Helpers.getComplexModule(zBase),
                val = Helpers.getComplexModule(z);

            let angle = Helpers.getComplexAngle(z),
                angleBase = Helpers.getComplexAngle(zBase);

            let diff = Helpers.toDegrees(angle) - Helpers.toDegrees(angleBase);

            if (diff < -180) {
                diff = diff + 180;

            } else if (diff > 180) {
                diff = diff - 180;
            }

            let angleCoef = ortogonality ?
                0.5 * (1 + Math.cos(diff)) :
                Math.abs(Math.cos(diff));

            switch (afsType) {
                case 1:
                    {
                        val *= valBase * firstMaxBaseValue;
                        break;
                    }
                case 2:
                    {
                        val *= valBase * valBase * secondMaxBaseValue;
                        break;
                    }
            }

            outputValue += angleCoef * val;
            sum += val;
        }

        return outputValue / sum;
    },

    copy: function (object) {
        return JSON.parse(JSON.stringify(object));
    },

    getComplexModule: function (complexValue) {
        return Math.sqrt(Math.pow(complexValue.x, 2) + Math.pow(complexValue.y, 2));
    },

    getComplexAngle: function (complexValue) {
        return Math.atan(complexValue.y / complexValue.x);
    },

    toDegrees: function (radians) {
        return radians * 180 / Math.PI;
    },

    addComplexValues: function (first, second) {
        return {
            x: first.x + second.x,
            y: first.y + second.y
        }
    },

    multiplyComplexValues: function (first, second) {
        return {
            x: first.x * second.x - first.y * second.y,
            y: first.x * second.y + first.y * second.x
        }
    },

    countErros: function (classes, predicted) {
        let errors = 0;

        classes.forEach((cl, idx) => {
            if (cl !== predicted[idx]) {
                errors++;
            }
        });

        return errors;
    }
};

module.exports = Helpers;