# MQTT Broker (Mosquitto)

## Install 
Install the Eclipse Mosquitto MQTT Broker on your OS as described in 
[Eclipse Mosquitto](https://mosquitto.org/download/)
Make sure that the install directory is contained in the PATH environment variable, if not,
manually add it to the path. You can check if the installation was successful by running the command 
`mosquitto -h` in a terminal.

## Configure Firewall
Make sure that the fireall on your OS allows incoming traffic on the following ports used for MQTT transport:
- 8883
- 9883

## Server Key
Make sure that the `server.key` file is placed inside the `certs` directory. Also note that due to using TLS host checking,
the server certificate can only be used by Tobias-PC. If you want to run the server on another machine, generate a new server
certificate and key for this machine as described in [Generate new Server Key](https://mosquitto.org/man/mosquitto-tls-7.html).
You can test if everything works by executing the following command
``
mosquitto_pub -h <Common Name, e.g. Tobias-PC> -t test/topic -p 8883 --cafile ca_certs/ca.crt -m message -u mqtt -P <MQTT Password>
``

## Run the broker
To run the MQTT Broker, execute the start script in this folder (`start.bat` on Windows, `start.sh` on Linux & Mac).