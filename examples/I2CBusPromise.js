const AHT20 = require( "../AHT20" );
const i2c = require( 'i2c-bus' );

i2c.openPromisified( 1 ).then( bus1 => {
    const sensor = new AHT20( bus1 );
    sensor.readData().then( data => console.log( data ) );
} );

/* Expected Output:
{
    humidity: 16.15,
    temperature: 23.96
}
 */