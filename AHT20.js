const i2c = require( 'i2c-bus' );

//I2C constants
let ADDRESS;
//I2C Commands
const SOFT_RESET = Buffer.from( [0xBA] );
const CALIBRATE = Buffer.from( [0xE1, 0x08, 0x00] );
const MEASURE = Buffer.from( [0xAC, 0x33, 0x00] );
//Sensor values
const STATUS_BUSY = 0x80;
const STATUS_READY = 0x18;
const AHT20 = class {
    ready = false;

    constructor( bus, address = 0x38 ) {
        //if a number was passed, open that bus, otherwise, store the passed in bus
        if ( typeof bus === "number" ) {
            this.bus = i2c.open( bus, err => {
                if ( err ) {
                    throw "Failed to open bus\n" + err;
                }
            } ).promisifiedBus();
        } else if ( bus?.promisifiedBus ) {
            this.bus = bus.promisifiedBus();
        } else if ( bus?.i2cFuncs && bus?.bus ) {
            this.bus = bus;
        } else {
            throw "Invalid bus";
        }

        ADDRESS = address;

        this.reset()
            .then( () => this.#calibrate() )
            .then( () => this.ready = true )
            .catch( err => {
                throw err;
            } );
    }

    readData() {
        return new Promise( async ( resolve, reject ) => {
            await this.#whenReady( 0, true );
            let buffer = Buffer.alloc( 7 );
            this.bus.i2cWrite( ADDRESS, MEASURE.length, MEASURE )
                .then( async () => {
                    await this.#whenReady( STATUS_READY, true );
                    return this.bus.i2cRead( ADDRESS, buffer.length, buffer );
                } ).then( () => {
                resolve( {
                    humidity: round( ((buffer[1] << 12) | (buffer[2] << 4) | (buffer[3] >> 4)) * 100 / 0x100000, 2 ),
                    temperature: round( (((buffer[3] & 0xF) << 16) | (buffer[4] << 8) | buffer[5]) * 200.0 / 0x100000 - 50, 2 )
                } );
            } ).catch( err => {
                reject( "Failed to read data\n" + err );
            } );
        } )
    }

    async reset() {
        return new Promise( async ( resolve, reject ) => {
            await this.#whenReady();
            this.bus.i2cWrite( ADDRESS, SOFT_RESET.length, SOFT_RESET ).then( () => {
                resolve( true );
            } ).catch( err => {
                reject( "Error resetting sensor\n" + err );
            } );
        } );
    }

    //calibrates the sensor, returns true when done
    async #calibrate() {
        return new Promise( async resolve => {
            await this.#whenReady();
            this.bus.i2cWrite( ADDRESS, CALIBRATE.length, CALIBRATE ).then( () => {
                resolve();
            } ).catch( err => {
                //ignore if this fails. Newer AHT20 don't seem to need calibration.
                resolve();
            } )
        } )
    }

    #getStatus() {
        return new Promise( ( resolve, reject ) => {
            let buffer = Buffer.alloc( 1 );
            this.bus.i2cRead( ADDRESS, 1, buffer ).then( () => {
                resolve( buffer.readInt8() );
            } ).catch( err => {
                reject( "Error reading status\n" + err );
            } );
        } );
    }

    #whenReady( code = 0x00, waitForReady ) {
        return new Promise( resolve => {
            const checkStatus = async () => {
                const status = await this.#getStatus();
                if ( status !== STATUS_BUSY
                    && (code ? status === code : true)
                    && (waitForReady ? this.ready : true) ) {
                    resolve( true );
                } else {
                    setTimeout( checkStatus, 10 );
                }
            }
            checkStatus();
        } );
    }
}

function round( value, dmp ) {
    return Math.round( value / Math.pow( 10, -dmp ) ) / Math.pow( 10, dmp );
}

module.exports = AHT20;