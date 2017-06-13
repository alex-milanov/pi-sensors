// Load raspi-sensors plugin
var RaspiSensors = require('raspi-sensors');

console.log('raspi-sensors test v0.1');

// Create some sensors
var TSL2561 = new RaspiSensors.Sensor({
	type    : "TSL2561",
	address : 0X39
}, "light_sensor");


// Define a callback
var dataLog = function(err, data) {
	if(err) {
		console.error("An error occured!");
		console.error(err.cause);
		return;
	}

	// Only log for now
	console.log(data);
}


// Fetch some value at a certain interval
TSL2561.fetchInterval(dataLog, 4);

// After 20s of logging, stop everything
setTimeout(function() {
	console.log("Time to stop the logging of values!");

	TSL2561.fetchClear();
}, 20000)

console.log('Control send back to the main thread');
