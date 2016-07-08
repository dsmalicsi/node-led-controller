# node-led-controller
A [Node.js](https://nodejs.org/en) application for controlling and programming LED Lights connected to a [NodeMCU](http://nodemcu.com/index_en.html) WiFi chipset.

For quick and easy control access, a web front-end is made available for the user *(port 3000)* which uses [Socket.io](http://socket.io/) as a bridge between the user and the devices for real-time event-based communication.

It is possible that this application can be expanded and may serve as an API for use with other projects once all basic functions are completed.

Internet-of-Things is awesome!

----------
**Functions:**

- Turn on/off power
- Brightness control (dimmer)
- Retrieve status of the device
- Change Color (for RGB LEDs, using hex rgb codes) - *work in progress*
- Change Mode   - *work in progress*
 
----------
**TODO**

- Add function for scanning devices in local network
- Add Remote-network support. Control your devices away from home/office
- Add Security
- Add a database (NoSQL)

----------
**Future Plans**

*I can't tell if I will stay committed on this project, but here are some possibilities that I can think of...*

- Create RESTful API for all functions
- Add support for other WiFi-enabled LED devices that are already available in the market by reverse-engineering
- Possibly integrate this with a larger app for IoT that I might come up with in the future


----------
**Notes**

This app was built on **node v4.4.7**. It should work fine on newer versions.

Installation of node modules are required, please see **package.json** for dependencies.

----------
**License**

[GNU General Public License v3.0](https://github.com/dsmalicsi/node-led-controller/blob/master/LICENSE.md)


    Node-led-controller, A Node.js application for controlling and programming
    LED Lights connected to a NodeMCU WiFi chipset.
    Copyright (C) 2016  Daryll Malicsi

    Node-led-controller is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    
For redistribution/modifications, you need to include a copyright notice, together with a copy of the license, within the code. You must also make the source code available when you release the software. For more information, please read http://www.gnu.org/licenses/quick-guide-gplv3.html