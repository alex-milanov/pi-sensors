const Rx = require('rx');
const $ = Rx.Observable;
const socket = require('socket.io-client')('http://10.42.0.1:8080')

// sensors
const dht = require('node-dht-sensor');
const raspiSensors = require('raspi-sensors');
const TSL2561 = new RaspiSensors.Sensor({
	type    : "TSL2561",
	address : 0X39
}, "light_sensor");

const getDht = Rx.Observable.create(function (observer) {
    dht.read(22, 17, function(err, temperature, humidity) {
        observer.onNext({
          humidity,
          temperature
        });
        observer.onCompleted();
    });
    // Note that this is optional, you do not have to return this if you require no cleanup
    return function () {
        console.log('disposed');
    };
});


const getTs = Rx.Observable.create(function (observer) {
  TSL2561.fetch((err, data) => {
      observer.onNext({
        luminocity: data.value
      });
      observer.onCompleted();
  });

  return function () {
      console.log('disposed');
  };
});

/*
dht.read(22, 17, function(err, temperature, humidity) {
    if (!err) {
        console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
            'humidity: ' + humidity.toFixed(1) + '%'
        );
    }
});
*/

/*
const getData = () => {
  return {
    temperature: 24,
    humidity: 85,
    luminocity: 1000
  }
}*/

const getData = () => $.merge(
  getDht(),
  getTs()
).reduce((o, d) => Object.assign({},o,d), {});

socket.on('connect', function() {
	console.log("connected");
  socket.emit('join', 'pi');

  socket.on('joined', res => {
    $.interval(5000)
  		.timeInterval()
      .flatMap(getData)
      .subscribe(data => {
        socket.emit('message', {
          username: 'pi',
          message: data
        });
        console.log(data);
      });
  });

})
