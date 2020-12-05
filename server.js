const io = require('socket.io')();
var sensor = require('node-dht-sensor');
const si = require('systeminformation');
const Gpio = require('pigpio').Gpio;
const motor = new Gpio(17, {mode: Gpio.OUTPUT});
const spawn = require("child_process").spawn;
var kill  = require('tree-kill');

let pulseWidth = 2000;
let increment = 50;

io.on('connection', (client) => {

  client.on('disconnect', () =>{
    console.log("A device has been disconnected");
  })

  client.on("subscribeTemperatureHumidity", (interval) => {
    setInterval(() =>{
      sensor.read(11, 4, function(err, temperature, humidity) {
        if (!err) {
            // console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
            //     'humidity: ' + humidity.toFixed(1) + '%'
            // );
            client.emit("temperatureHumidity", temperature, humidity);
        }
      });
    }, interval);
  });

  client.on("subscribeMakeRotations", (choice, nbRotations) => {
    console.log("On rentre dans subsribeMakeRotation " + choice +" " + nbRotations);
    const pythonProcess = spawn('python',["./../Servo/pythonScript.py", choice, nbRotations]);
  });

  client.on("subscribeMakeAngle", (choice, angle) => {
    console.log("On rentre dans Angle " + choice +" " + angle);
    const pythonProcess = spawn('python',["./../Servo/pythonScript.py", choice, angle]);
  });

  client.on("subscribeMakeMove", (isMoving, PIDPythonProcess) => {
    let pythonProcess;
    let pid;
    if(isMoving == 1){
      pythonProcess = spawn('python',["./../Servo/servo.py"]);
      console.log("PID " + pythonProcess.pid);
      client.emit("PIDPythonProcess", pythonProcess.pid);
    }
    if(isMoving === 0){
      console.log('kill');
      console.log("PID " + PIDPythonProcess);
      kill(PIDPythonProcess);
      }
    })
  });


sensor.read(11, 4, function(err, temperature, humidity) {
  if (!err) {
      console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
          'humidity: ' + humidity.toFixed(1) + '%'
      );
    }
});



const port = 8000;
io.listen(port);
console.log('listening on port ', port);

