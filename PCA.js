const ml_pca = require('ml-pca');
const Helpers = require('./Helpers');

const PCA = {
    get: function(dataVectors, lambda, featuresNumber) {
        const fullImageSize = dataVectors[0].length;

        let meanVector = [];

        for (let i = 0; i < fullImageSize; i++) {
            meanVector.push({r: 0, i: 0});
        }

        dataVectors.forEach((vector) => {
            vector.forEach((complexValue, idx) => {
                meanVector[idx].r += complexValue.r;
                meanVector[idx].i += complexValue.i;
            });
        });

        //Среднее
        meanVector.forEach(complexValue => {
            complexValue.r /= dataVectors.length;
            complexValue.i /= dataVectors.length;
        })

        //Вычли среднее
        dataVectors.forEach(vector => {
            vector.forEach((complexValue, idx) => {
                complexValue.r -= meanVector[idx].r;
                complexValue.i -= meanVector[idx].i;
            });
        });

        realVectors = dataVectors.map(vector => vector.map(complexValue => complexValue.r));
        imagVector = dataVectors.map(vector => vector.map(complexValue => complexValue.i));

        const realPca = new ml_pca(realVectors);
        const realEigenVectors = realPca.getEigenvectors();

        const imagPca = new ml_pca(imagVector);
        const imagEigenVectors = imagPca.getEigenvectors();

        const result = [];

        realEigenVectors.forEach((realVector, vectorIdx) => {
            let vector = [];
            realVector = realVector.slice(0, featuresNumber);

            realVector.forEach((realValue, valueIdx) => {
                vector.push({
                    r: realValue,
                    i: imagEigenVectors[vectorIdx][valueIdx]
                });
            });

            result.push(vector);
        });

        return {
            eigenVectors: result,
            meanVector: meanVector
        }
    },

    apply: function(dataVectors, eigenVectors, meanVector) {
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