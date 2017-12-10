const fs = require('fs');
const Helpers = require('./Helpers');
const PGMParser = require('./PGMParser');

const Loader = {
    loadData: function (baseDir, params) {

        let vectors = [],
            classes = [],
            exampleIndex = 0;

        const directorires = fs.readdirSync(baseDir).slice(params.class.start, params.class.end);
        
        directorires.forEach((directory, classIdx) => {

            let images = fs.readdirSync(baseDir + '/' + directory);

            images = images.slice(params.samples.start, params.samples.end);

            images.forEach(imageName => {
                const fileName = baseDir + '/' + directory + '/' + imageName;

                const buffer = fs.readFileSync(fileName);
                const image = Helpers.scaleImage(PGMParser.getPGMImage(buffer), 2);
                const vector = Helpers.image2Vector(image);

                vectors[exampleIndex] = vector;
                classes[exampleIndex] = classIdx;

                exampleIndex++;
            });
        });

        return {
            vectors: vectors,
            classes: classes
        }
    }
}

module.exports = Loader;