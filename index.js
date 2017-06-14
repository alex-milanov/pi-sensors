const Rx = require('rx');
const $ = Rx.Observable;
const socket = require('socket.io-client')('http://10.42.0.1:8080')

// sensors
const dht = require('node-dht-sensor');
const RaspiSensors = require('raspi-sensors');
const TSL2561 = new RaspiSensors.Sensor({
	type    : "TSL2561",
	address : 0X39
}, "light_sensor");

console.log(dht, TSL2561);

const getDht = () => $.create(function (observer) {
    console.log('getting dht');
    dht.read(22, 17, function(err, temperature, humidity) {
        console.log(err, temperature, humidity);
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


const getTs = () => $.create(function (observer) {
  console.log('getting ts');

  TSL2561.fetch((err, data) => {
      console.log(err, data);
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

const getData = () => $.merge(getDht(),getTs()).reduce((o, d) => Object.assign({},o,d), {});

socket.on('connect', function() {
  console.log("connected");
  socket.emit('join', 'pi');
  socket.on('joinSuccess', res => {
    console.log('joined');
    $.interval(300)
      .timeInterval()
      .subscribe(data => {
        getData().subscribe(data =>
          socket.emit('message', {
            username: 'pi',
            message: data
          }));
        console.log(data);
      });
  });

})
