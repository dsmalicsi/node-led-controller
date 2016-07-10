/* Copyright (C) 2016 Daryll Malicsi,
   LICENSE at https://github.com/dsmalicsi/node-led-controller/blob/master/LICENSE.md
*/

var net = require('net');
var utils = require('./utils');
var patterns = require('./patterns');
var express = require('express');
var morgan = require('morgan')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dateFormat = require('dateformat');
var _ = require('lodash');
var sleep = require('sleep');

require('log-timestamp')(() => '[' + dateFormat(new Date(), "mm/dd/yy h:MM:ss") + ']  %s');

//==== WEB FRONT END 
console.log("Initializing...");

// web logger
morgan.format('logdate', () => dateFormat(new Date(), "mm/dd/yy h:MM:ss"));
app.use(morgan('[:logdate]  :remote-addr :remote-user :method :url HTTP/:http-version :status - :res[content-length] - :response-time ms'));

// Express should use public folder for serving 
// the front-end files
app.use(express.static('public'));


// possible routes
app.post('/commands', (req, res) => {
    command = req.body.command
    value = req.body.value

    res.json('POST request to the homepage');
});

http.listen(3000, () => {
    console.log('Web Server listening on port 3000');
});

//==== SOCKET.IO EVENTS

io.on('connection', (socket) => {
    console.log('User connected', socket.handshake.address);

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.handshake.address);

    });

    socket.on('hold', (command) => {
        
        val = command.value;
        dev = command.device;
        
        clt = findClient(dev);
        clt.hold = val;
        
        if (!val) {
            sleep.usleep(70000)
            checkState(clt)
        }
        
    })

    socket.on('command', (command) => {

        cmd = command.cmd;
        val = command.value;
        dev = command.device;
        clt = findClient(dev);

        //console.log(cmd, val, dev, socket.handshake.address);

        switch (cmd) {

        case "power":
            if (val == "on") {
                turnOn(clt, (data) => {
                    console.log(data)
                })
            } else if (val == "off") {
                turnOff(clt, (data) => {
                    console.log(data)
                })
            }
            console.log("Changed Power")
            break;
        case "brightness":
            //send brightness command here
            r = utils.percentToByte(val)
            g = utils.percentToByte(val)
            b = utils.percentToByte(val)

            changeRgb(clt, r, g, b)
            
            console.log("Changed brightness",val,"%")
            break;
        case "rgb":
            //send rgb command here
           
            var rgbarr =/([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})/g.exec(val)
            r = rgbarr[1]
            g = rgbarr[2]
            b = rgbarr[3]
            
            changeRgb(clt, r, g, b)
            
            console.log("Changed RGB", r, g, b)
            break;
        default:
            console.log("Invalid command")
            break;

        }

    });

});


//== CLIENT FOR CONNECTING TO DEVICES

//hardcode IP for now. Should be directly from Scanner
//var devices = ['192.168.1.50','192.168.1.51','192.168.1.52']
var devices = ['192.168.1.50']
var clients = []

//make loop of devices to store all client instances in array

for (var i in devices) {
    
    console.log(i)
    clients[i] = new net.Socket();
    
    clients[i].setEncoding("hex");
    clients[i].setKeepAlive(true, 5000);
    clients[i].ip = devices[i]
    clients[i].is_on = false
    clients[i].hold = false
    console.log('Connecting to device (' + devices[i] + ')...');

    clients[i].connect(5577, devices[i]);

    clients[i].on('connect', function (err) {
        console.log('Connected to ' + this.ip + '!');
        
        checkState(this, null)
        setInterval(() => {checkState(this, null)}, 10000)
        
    })

    clients[i].on('data', function (data) {
        //console.log('RX:', data.replace(/(.{1,2})/g, '$1 '), "[" + data.length / 2 + "]");
        var res = read(data, data.length)
        var res_len = data.length / 2

        //Translate Operations
        switch (res_len) {
        case 0:
            console.log("OP: Lights Off")
            break;
        case 1:
            if (res[0] == 0x30) {
                if (!this.hold) {
                    console.log("RX: Light State Changed, checking...")
                    sleep.usleep(70000)
                    checkState(this)
                }
                else {
                    //console.log("RX: Skip Check State")
                }

            } else {
                console.lg("RX: Unknown State Changed")
            }

            break;
        case 14: //Check State
            console.log("OP: Check State")

            power_state = res[2]
            power_str = "Unknown power state"

            if (power_state == 0x23) {
                this.is_on = true
                power_str = "ON"
            } else if (power_state == 0x24) {
                this.is_on = false
                power_str = "OFF"
            }

            pattern = res[3]
            ww_level = res[9]
            mode = utils.checkMode(ww_level, pattern)
            delay = res[5]
            speed = utils.calcSpeed(delay)

            //		

            if (mode == "color") {
                red = res[6]
                green = res[7]
                blue = res[8]
                    //			color_str
                mode_str = "Color: {" + "R:" + red + " G:" + green + " B:" + blue + "}"
            } else if (mode == "ww") {
                mode_str = "Warm White: " + utils.byteToPercent(ww_level) + "%"
            } else if (mode == "preset") {
                pattern_str = patterns.getPatternName(pattern)
                mode_str = pattern_str + " (Speed " + speed + "%)"
            } else if (mode == "custom") {
                mode_str = "Custom pattern (Speed " + speed + "%)"
            } else {
                mode_str = "Unknown mode 0x" ///
            }

            if (pattern == 0x62) {
                mode_str += " (tmp)"
                clients[i].state_str = power_str + " [" + mode_str + "]"
            }
            console.log("=================================")
            console.log("POWER:", power_str, "PTRN:", pattern.toString(16), "WW:", ww_level)
            console.log("MODE:", mode_str)
            console.log("DELAY:", delay)
            console.log("=================================")
            break;
        default:
            console.log(res)
            console.log("Unknown response", res_len)
            break;
        }
        //    client.destroy(); // kill client after server's response
    });

    clients[i].on('error', (err) => {
        console.log('Error', err);
    });
    clients[i].on('close', function () {
        console.log('Connection closed', this.ip);
    });

}

//search clients array using lodash
function findClient(ip) {
    index = _.findIndex(clients, ['ip', ip]);
    return clients[index]
}


function checkState(client, callback) {
    var msg = [0x81, 0x8a, 0x8b];
    send(client, msg, (data) => {

       callback = data;

    })
    
    return true;
}

function turnOn(client, callback) {

    var msg = [0x71, 0x23, 0x0F]
    if (client.is_on == true) {
        console.log("already turned on!")
    } else {
        send(client, msg, (data) => {

            callback = null;
        })
    }
}

function turnOff(client, callback) {
    var msg = [0x71, 0x24, 0x0F]
    if (client.is_on == false) {
        console.log("already turned off!")
    } else {
        send(client, msg, (data) => {

            callback = data

        })
    }
}

function changeRgb(client, r, g, b) {
    var msg = [0x31, r, g, b, 0x00, 0xf0, 0x0f]

    send(client, msg, (data) => {
        //console.log(data)
    })
}


function read(response, pkt_length) {
    rx = []
    for (i = 0; i < pkt_length; i++) {
        if ((i - 1) % 2) {
            rx.push(parseInt((response[i] + response[i + 1]), 16))
        }
    }
    return rx
}

function send(client, msg, callback) {
    var crc = sum(msg)
    msg.push(crc)
    //console.log("TX:", msg, "0x" + crc.toString(16).replace(/^[0-9]/g, ''))
    client.write(new Buffer(msg), (err, data) => {

        if (!err) {
            callback = {
                success: true,
                message: "Command Sent!"
            }
        } else {
            callback = {
                success: false,
                message: "Command Failed!"
            }
        }
    })
}

function sum(arr) {
    var result = 0,
        n = arr.length || 0;
    while (n--) {
        result += Number(arr[n]);
    }
    return result;
}