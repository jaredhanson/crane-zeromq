/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , zmq = require('zeromq')
  , util = require('util');


/**
 * `Connection` constructor.
 *
 * @api public
 */
function Connection(options) {
  EventEmitter.call(this);
  
  var self = this;
  process.nextTick(function() {
    self.emit('ready');
  })
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Connection, EventEmitter);

Connection.prototype.publish = function(topic, msg, cb) {
  console.log('ZMQ PUBLISH');
  

  if (1) {
    var sock = zmq.socket('push');

    sock.bindSync('tcp://127.0.0.1:3000');
    console.log('Producer bound to port 3000');

    var i = 0;

    setInterval(function(){
      console.log('sending work');
      sock.send('some work ' + ++i);
    }, 500);
  }
  
  if (0) {
    var publisher = zmq.socket('pub');

    publisher.bindSync("tcp://*:5556");
    publisher.bindSync("ipc://weather.ipc");

    function zeropad(num) {
      while (num.length < 5) {
        num = "0" + num;
      }
      return num;
    };

    function rand(upper, extra) {
      var num = Math.abs(Math.round(Math.random() * upper));
      return num + (extra || 0);
    };

    while (true) {
      // Get values that will fool the boss
      var zipcode     = rand(100000)
        //, zipcode = "10001"
        , temperature = rand(215, -80)
        , relhumidity = rand(50, 10)
        , update      = zeropad(zipcode.toString()) + ' ' + temperature + ' ' + relhumidity;
      console.log(update)
      publisher.send(update);
    }
  }
}

Connection.prototype.consume = function(queue, options, cb) {
  console.log('ZMQ CONSUME');
  console.log("Current 0MQ version is " + zmq.version);

  if(1) {
    var sock = zmq.socket('pull');

    sock.connect('tcp://127.0.0.1:3000');
    console.log('Worker connected to port 3000');

    sock.on('message', function(msg){
      console.log('work: %s', msg.toString());
    });
  }
  
  if (0) {
    // Socket to talk to server
    var subscriber = zmq.socket('sub');

    // Subscribe to zipcode, default is NYC, 10001
    var filter = "10001";
    subscriber.subscribe(filter);

    // process 100 updates
    var total_temp = 0
      , temps      = 0;
    subscriber.on('message', function(data) {
      var pieces      = data.toString().split(" ")
        , zipcode     = parseInt(pieces[0], 10)
        , temperature = parseInt(pieces[1], 10)
        , relhumidity = parseInt(pieces[2], 10);

      console.log(data.toString())

      /*
      temps += 1;
      total_temp += temperature;

      if (temps === 100) {
        console.log([
          "Average temperature for zipcode '",
          filter,
          "' was ",
          (total_temp / temps).toFixed(2),
          " F"].join(""));
        total_temp = 0;
        temps = 0;
      }
        */
    });

    subscriber.connect("tcp://localhost:5556");
  }
}

module.exports = Connection;
