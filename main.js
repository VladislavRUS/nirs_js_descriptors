const fs = require('fs');
const Jimp = require("jimp");
const Loader = require('./Loader');
const PCA = require('./PCA');
const KNN = require('ml-knn');
const SVM = require('ml-svm');
const Helpers = require('./Helpers');



(async() => {

    const baseDir = './CroppedYale';

    const learningTypes = {
        KNN: 'KNN',
        SVM: 'SVM'
    };

    const learningType = learningTypes.SVM;

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

    const featuresNumber = 4;

    const trainingData = Loader.loadData(baseDir, trainParams);
    const PCAResult = await (PCA.get(Helpers.copy(trainingData.vectors), featuresNumber));
    const trainFeatures = PCA.apply(trainingData.vectors, PCAResult.eigenVectors, PCAResult.meanVector);

    const testData = Loader.loadData(baseDir, testParams);
    const testFeatures = PCA.apply(testData.vectors, PCAResult.eigenVectors, PCAResult.meanVector);

    let predictions;

    switch (learningType) {
        case learningTypes.KNN:
            {
                const knn = new KNN(trainFeatures, trainingData.classes);
                predictions = knn.predict(testFeatures);

                break;
            }
        case learningTypes.SVM:
            {
                let options = {
                    C: 0.01,
                    tol: 10e-4,
                    maxPasses: 10,
                    maxIterations: 100000,
                    kernel: 'rbf',
                    kernelOptions: {
                        sigma: 0.5
                    }
                };
                const svm = new SVM(options);

                svm.train(trainFeatures, trainingData.classes);

                predictions = svm.predict(testFeatures);

                break;
            }
    }

    let errors = Helpers.countErros(trainingData.classes, predictions)
    let probability = errors / trainingData.classes.length;

    console.log(learningType);
    console.log('Samples: ', trainingData.classes.length);
    console.log('Errors: ', errors);
    console.log('True probability: ', 1 - probability);
})();