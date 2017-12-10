const fs = require('fs');
const Jimp = require("jimp");
const Loader = require('./Loader');
const PCA = require('./PCA');
const KNN = require('ml-knn');
const Helpers = require('./Helpers');

const baseDir = './CroppedYale';

const trainParams = {
    class: {
        start: 0,
        end: 5
    },
    samples: {
        start: 0,
        end: 5
    }
};

const testParams = {
    class: {
        start: 0,
        end: 5
    },
    samples: {
        start: 5,
        end: 10
    }
};

const lambda = 0.95;
const featuresNumber = 4;

const trainingData = Loader.loadData(baseDir, trainParams);
const PCAResult = PCA.get(trainingData.vectors, lambda, featuresNumber);

// KNN
const trainFeatures = PCA.apply(trainingData.vectors, PCAResult.eigenVectors, PCAResult.meanVector);
const knn = new KNN(trainFeatures, trainingData.classes);

const testData = Loader.loadData(baseDir, testParams);
const testFeatures = PCA.apply(testData.vectors, PCAResult.eigenVectors, PCAResult.meanVector);

let predictions = knn.predict(testFeatures);

let errors = Helpers.countErros(trainingData.classes, predictions) 
let probability = errors / trainingData.classes.length;

console.log(errors, 1 - probability);