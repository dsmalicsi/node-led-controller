var _ = require("lodash");

var patternNames = {
    "37": "seven_color_cross_fade",
    "38": "red_gradual_change",
    "39": "green_gradual_change",
    "40": "blue_gradual_change",
    "41": "yellow_gradual_change",
    "42": "cyan_gradual_change",
    "43": "purple_gradual_change",
    "44": "white_gradual_change",
    "45": "red_green_cross_fade",
    "46": "red_blue_cross_fade",
    "47": "green_blue_cross_fade",
    "48": "seven_color_strobe_flash",
    "49": "red_strobe_flash",
    "50": "green_strobe_flash",
    "51": "blue_stobe_flash",
    "52": "yellow_strobe_flash",
    "53": "cyan_strobe_flash",
    "54": "purple_strobe_flash",
    "55": "white_strobe_flash",
    "56": "seven_color_jumping"
}

exports.validPresetPattern = function (pattern) {

    if (pattern < 0x25 || pattern > 0x38)
        return false
    else
        return true
}

exports.getPatternName = function (pattern) {

    console.log(patternNames[pattern].replace(/_/g, " ").toLowerCase().replace(/\b\w/g, function (txt) { return txt.toUpperCase(); }))

}