const ml_pca = require('ml-pca');
const Helpers = require('./Helpers');
const numeric = require('./libs/numeric');
const PythonShell = require('python-shell');
const fs = require('fs');

const PCA = {
    get: async function (dataVectors, featuresNumber) {
        return new Promise(function (resolve, reject) {
            const fullImageSize = dataVectors[0].length;

            let meanVector = [];

            for (let i = 0; i < fullImageSize; i++) {
                meanVector.push({
                    x: 0,
                    y: 0
                });
            }

            dataVectors.forEach((vector) => {
                vector.forEach((complexValue, idx) => {
                    meanVector[idx].x += complexValue.x;
                    meanVector[idx].y += complexValue.y;
                });
            });

            //Среднее
            meanVector.forEach(complexValue => {
                complexValue.x /= dataVectors.length;
                complexValue.y /= dataVectors.length;
            })

            //Вычли среднее
            dataVectors.forEach(vector => {
                vector.forEach((complexValue, idx) => {
                    complexValue.x -= meanVector[idx].x;
                    complexValue.y -= meanVector[idx].y;
                });
            });

            const transposedData = Helpers.transposeMatrix(dataVectors);
            const conjugatedMatrix = Helpers.getConjugateMatrix(dataVectors);

            const mul = Helpers.multiplyMatrices(conjugatedMatrix, transposedData);

            fs.writeFileSync('matrix.txt', Helpers.getStringFromMatrix(mul));

            PythonShell.run('eigen_values.py', (err, results) => {
                if (err) {
                    reject();

                } else {
                    results = results
                        .map(str =>
                            str.trim()
                            .replace(/\r/g, '')
                            .replace(/\[/g, '')
                            .replace(/\]/g, '')
                            .replace(/\j/g, '')
                            .split(' ').join(' '))
                        .join(' ')
                        .split(' ')
                        .filter(str => str !== '');

                    let eigenVectors = Helpers.createMatrix(mul.length, mul.length);

                    let row = 0,
                        col = 0;

                    for (let i = 0; i < results.length; i += 2) {

                        eigenVectors[row][col] = {
                            x: parseFloat(results[i]),
                            y: parseFloat(results[i + 1])
                        };

                        if (col === mul.length - 1) {
                            col = 0;
                            row++;

                        } else {
                            col++;
                        }
                    }

                    eigenVectors = Helpers.multiplyMatrices(transposedData, eigenVectors);

                    resolve({
                        eigenVectors: eigenVectors,
                        meanVector: meanVector
                    });
                }
            });
        });
    },

    apply: function (dataVectors, eigenVectors, meanVector) {
        const featureVectors = [];

        dataVectors.forEach(vector => {
            const resultVector = Helpers.substructComplexVectors(vector, meanVector);
            const featureVector = Helpers.calcFeatures(resultVector, eigenVectors);

            featureVectors.push(featureVector);
        });

        return featureVectors;
    }
};

module.exports = PCA;