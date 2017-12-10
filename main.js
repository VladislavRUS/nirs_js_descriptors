const fs = require('fs');
const Jimp = require("jimp");
const Loader = require('./Loader');
const PCA = require('./PCA');

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

const lambda = 0.95;
const featuresNumber = 4;

const trainingData = Loader.loadData(baseDir, trainParams);
const PCAResult = PCA.get(trainingData.vectors, lambda, featuresNumber);

PCA.apply(trainingData.vectors, PCAResult.eigenVectors, PCAResult.meanVector);