# AHT20
A Node.js library for reading temperature and humidity values over I2C from an AHT20

## Installation 

`npm install aht20`

The only dependency is `i2c-bus` and this package will work on any Linux board compatible with the library.
[See the library for more details.](https://www.npmjs.com/package/i2c-bus?activeTab=readme#installation) 

Tested on a Raspberry Pi 3B.

## Usage

```javascript
const AHT20 = require( "aht20" );

const sensor = new AHT20(1);
sensor.readData().then( data => console.log( data ) );
```
Running the above code will use I2C bus 1 to read the temperature and humidity from a connected AHT20.
The output is the temperature in Celsius and the humidity as a percentage and looks something like this:
```json
{ 
    "humidity": 16.15, 
    "temperature": 23.96 
}
```
You can pass in different bus by changing the number in the constructor or passing in an `i2c-bus` bus object. 
See the API or example folder for more details.

See the [`i2c-bus` README](https://www.npmjs.com/package/i2c-bus) or look online for wiring.

## API

All functionality is through the AHT20 Class. See [`./examples`](./examples) for usage.

### new AHT20(bus, address)
* bus - a number or I2C Bus
* address - optional, defaults to `0x38` - the address of the AHT20

Returns a new AHT20 object.

### readData()

An asynchronous function that returns the temperature (Celsius) and humidity (%) date from the sensor.

### reset()

An asynchronous function that resets the sensor.

## Author & License

© 2024 OrangeJedi. Released under the MIT License.