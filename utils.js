var patterns = require('./patterns');

var max_delay = 0x1f;

exports.checkMode = function(ww_level, pattern) {
    mode = "unknown"
    if (pattern == 0x61 || pattern == 0x62) {
        if (ww_level != 0)
            mode = "ww"
        else
            mode = "color"
    }   
    else if (pattern == 0x60)
        mode = "custom"
    else if (patterns.validPresetPattern(pattern))
        mode = "preset"
        
    return mode
}

exports.calcSpeed = function (delay) {
    delay = delay - 1;
    if (delay > (max_delay - 1) ) {
        delay = max_delay - 1
    } 
    if (delay < 0) {
        delay = 0
    }
    inv_speed = parseInt((delay * 100)/(max_delay)-1)
    speed = 100 - inv_speed
    
    return speed
}
 