/* Copyright (C) 2016 Daryll Malicsi,
   LICENSE at https://github.com/dsmalicsi/node-led-controller/blob/master/LICENSE.md
*/

var patterns = require('./patterns');

var max_delay = 0x1f;

exports.checkMode = (ww_level, pattern) => {
    mode = "unknown"
    if (pattern == 0x61 || pattern == 0x62) {
        if (ww_level != 0)
            mode = "ww"
        else
            mode = "color"
    } else if (pattern == 0x60)
        mode = "custom"
    else if (patterns.validPresetPattern(pattern))
        mode = "preset"
    return mode
}

exports.calcSpeed = (delay) => {
    delay = delay - 1;
    if (delay > (max_delay - 1)) {
        delay = max_delay - 1
    }
    if (delay < 0) {
        delay = 0
    }
    inv_speed = parseInt((delay * 100) / (max_delay) - 1)
    speed = 100 - inv_speed

    return speed
}

exports.byteToPercent = (value) => {
    if (value > 255)
        value = 255
    if (value < 0)
        value = 0
    return Math.round(parseInt((value * 100) / 255))
}

exports.percentToByte = (value) => {
    if (value > 100)
        value = 100
    if (value < 0)
        value = 0
    return Math.round(parseInt((value * 255) / 100))
}