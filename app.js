/* Copyright (C) 2016 Daryll Malicsi,
   LICENSE at https://github.com/dsmalicsi/node-led-controller/blob/master/LICENSE.md
*/

var net = require('net');
var client = new net.Socket();
var utils = require('./utils');
var patterns = require('./patterns');
var express = require('express');
var morgan = require('morgan')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dateFormat = require('dateformat');

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

    socket.on('command', (command) => {
        console.log(command.cmd, command.value, command.device, socket.handshake.address);
        switch (command.cmd) {

        case "brightness":
            //send brightness command here
            console.log("Changed brightness")
            break;
        default:
            console.log("Invalid command")
            break;

        }

    });

});


//== CLIENT FOR CONNECTING TO DEVICES
client.setEncoding("hex");
client.setKeepAlive(true, 30000);
//hardcode IP for now
var ip = '192.168.1.50'

client.connect(5577, ip, () => {
    this.ip = ip
    this.is_on = false
    console.log('Connecting to device (' + this.ip + ')...');

});

client.on('connect', () => {
    console.log('Connected to ' + this.ip + '!');
    checkState(client, (data) => {
        console.log(data)
    })

})

client.on('data', (data) => {
    console.log('RX:', data.replace(/(.{1,2})/g, '$1 '), "[" + data.length / 2 + "]");
    var res = read(data, data.length)
    var res_len = data.length / 2

    //Translate Operations
    switch (res_len) {
    case 0:
        console.log("OP: Lights Off")
        break;
    case 1:
        if (res[0] == 0x30) {
            console.log("RX: Light State Changed, checking...")
            setTimeout(checkState(client), 1000)
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
            mode_str = "Warm White: %" //byteToPercent(ww_level))
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
            client.state_str = power_str + " [" + mode_str + "]"
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

client.on('error', (err) => {
    console.log('Error', err);
});
client.on('close', () => {
    console.log('Connection closed');
});

function checkState(client, callback) {
    var msg = [0x81, 0x8a, 0x8b];
    send(client, msg, (data) => {

        callback = null;

    })
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

            callback = null

        })
    }
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
    console.log("TX:", msg, "0x" + crc.toString(16).replace(/^[0-9]/g, ''))
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