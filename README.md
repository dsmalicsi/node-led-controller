# node-led-controller
A [Node.js](https://nodejs.org/en) application for controlling and programming LED Lights connected to a [NodeMCU](http://nodemcu.com/index_en.html) WiFi chipset.

For quick and easy control access, a web front-end is made available for the user *(port 3000)* which uses [Socket.io](http://socket.io/) as a bridge between the user and the devices for real-time event-based communication.

It is possible that this application can be expanded and may serve as an API for use with other projects once all basic functions are completed.


----------
**Functions:**

 - Turn on/off power
 - Brightness control (dimmer)
 - Retrieve status of the device
 - Change Color (for RGB LEDs, using hex rgb codes) - *work in progress*
 - Change Mode   - *work in progress*
 
 ----------
 **TODO**

- Add function for scanning devices
 
 ----------
 **Future Plans**
 *I can't tell if I will stay committed on this project, but here are some possibilities that I can think of...*
 
 - Create RESTful API for all functions
 - Add support for other devices that are already available in the market by reverse-engineering
 - 

 ----------
 **Notes**
 This app was built on **node v4.4.7**. It should work fine on newer versions.
 Installation of node modules are required, please see **package.json** for dependencies.