export default class CustomMath
{
    // Conversion d'angles Degrès => Radians
    static degToRad( degValue ) {
        return degValue * ( Math.PI / 180 );
    }

    // Conversion d'angles Radians => Degrès
    static radToDeg( radValue ) {
        return radValue * ( 180 / Math.PI );
    }

    // Normalisation d'un angle
    static normalizeAngle( value, isRadian = false ) {
        const fullCircle = isRadian ? 2 * Math.PI : 360;

        value %= fullCircle;

        if(value >= 0) return value;

        value += fullCircle;

        return value;
    }
}