const AHT20 = require( "../AHT20" );
const i2c = require( 'i2c-bus' );

let bus1 = i2c.open(1, err =>{
    if(err){
        throw err;
    }
});

const sensor = new AHT20(bus1);

async function readData(){
    let data = await sensor.readData();
    console.log(data);
}

readData();


/* Expected Output:
{
    humidity: 16.15,
    temperature: 23.96
}
 */