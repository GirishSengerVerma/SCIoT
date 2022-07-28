# SCIoT SS22 Group 30 Project Repository

## Setup

Extract the encrypted `passwords.zip` archive using the repository master encryption password to get a `.txt` file containing
all relevant credentials. Note that the archive MUST be extracted inplace (i.e. no new folder is created).

## Run

To run the final application system, perform the following steps:

1. Make sure the MQTT Remote Broker Server is up and running.

2. Make sure the PostgreSQL Remote Database Server is up and running.

3. Navigate to the `dashboard-web-app` directory and follow the steps described
in the `README.md` file there to setup and start the Dashboard Web App (DWA).

4. Navigate to the `authorities-bot` directory and follow the steps described
in the `README.md` file there to setup and start the Authorities Units Notification
and Response Bot.

5. Navigate to the `arduino` directory, configure the WiFi connection in the souce code,
flash the programs onto the Arduino devices and start up the devices.

6. Navigate to the `sensor-simulator` directory and follow the steps described
in the `README.md` file there to setup and start the Sensor Simulator program.
