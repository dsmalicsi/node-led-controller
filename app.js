var net = require('net');
var stream = require('stream');
var reduce = require('reduce');
var client = new net.Socket();

client.setEncoding("hex")

    //hardcode IP for now
client.connect(5577, '192.168.1.18', function () {
    console.log('Connected to gateway successfully!');
    checkState(client)
});

client.on('connect', function () {
    console.log("on connect")
})

client.on('data', function (data) {
    console.log('Received: ' + data, data.length);
    var res = read(data, data.length)
    var res_len = data.length / 2
    switch (res_len) {
    case 0:
        console.log("Turned Off Lights")
        break;
    case 14: //Check State
        console.log("Check State")
        break;
    default:
        console.log(res)
        console.log("Unknown response")
        break;
    }
    client.destroy(); // kill client after server's response
});

client.on('close', function () {
    console.log('Connection closed');
});

function checkState(client) {
    var msg = [0x81, 0x8a, 0x8b];
    send(client, msg)
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

function send(client, msg) {
    var crc = sum(msg)
    msg.push(crc)
    console.log(msg)
    console.log(crc.toString(16))
    client.write(new Buffer(msg))
}

function sum(arr) {
    var result = 0
        , n = arr.length || 0;
    while (n--) {
        result += Number(arr[n]);
    }
    return result;
}