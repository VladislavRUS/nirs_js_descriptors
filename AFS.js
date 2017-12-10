const Helpers = require('./Helpers');

function AFS(complexVector, complexBaseVector, maxBaseValue, ortogonality) {
    const afsType = 2;

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

        diff = diff < -180 ?
            diff + 180 :
            diff - 180;
        
        
    }
}

module.exports = AFS;