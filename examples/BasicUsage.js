const AHT20 = require( "../AHT20" );

const sensor = new AHT20( 1 );
sensor.readData().then( data => console.log( data ) );

/* Expected Output:
{
    humidity: 16.15,
    temperature: 23.96
}
 */