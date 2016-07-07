var net = require('net');
var client = new net.Socket();
var utils = require('./utils');
var patterns = require('./patterns');

client.setEncoding("hex");

    //hardcode IP for now
client.connect(5577, '192.168.1.18', function () {
    console.log('Connected to gateway successfully!');
    checkState(client)
});

client.on('connect', function () {

})

client.on('data', function (data) {
    console.log('DATA: ' + data, data.length/2);
    var res = read(data, data.length)
    var res_len = data.length / 2
    switch (res_len) {
    case 0:
        console.log("RX: Lights Off")
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
        console.log("RX: Check State \n=================================")
        
		power_state = res[2]
		power_str = "Unknown power state"

		if (power_state == 0x23)
        {
            client.is_on = true
            power_str = "ON"
        }
        else if (power_state == 0x24) {
            client.is_on = false
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
			mode_str = "Color: {" + "R:" + red + " G:" + green + " B:" + blue+"}" 
        }
		else if (mode == "ww"){
         mode_str = "Warm White: %" //byteToPercent(ww_level))
        }
		else if (mode == "preset"){
			pattern_str = patterns.getPatternName(pattern)
			mode_str = pattern_str + " (Speed "+speed+"%)"
        }
		else if (mode == "custom"){
			mode_str = "Custom pattern (Speed "+speed+"%)"
        }
		else {
			mode_str = "Unknown mode 0x"///
        }
            
		if (pattern == 0x62){
			mode_str += " (tmp)"
		    client.state_str = power_str + " ["+mode_str+"]"
        }
            
        console.log("POWER:", power_str, "PTRN:", pattern.toString(16), "WW:", ww_level, "\nMODE:", mode_str, "\nDELAY:", delay, "\n=================================")
        break;
    default:
        console.log(res)
        console.log("Unknown response", res_len)
        break;
    }
//    client.destroy(); // kill client after server's response
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

