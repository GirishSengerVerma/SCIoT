import 'dotenv/config'
import * as mqtt from "mqtt";
import { PrismaClient, SensorLocation, SensorMeasure } from '@prisma/client';

import fs from 'fs';

const host = 'mqtts://Tobias-PC:8883/';
const mqttClientId = 'dashboard-web-app-mqtt-server';
const caCertificateFilePath = 'ca.crt';

const options = {
    mqttClientId,
    ca: fs.readFileSync(caCertificateFilePath),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
}

const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

const prisma = new PrismaClient();

// Needs to be in sync with data in Sensor Simulator program
const sensorLocationsToSimulate = [
    SensorLocation.STUTTGART_KILLESBERG_PARK,
    SensorLocation.STUTTGART_MAX_EYTH_SEE,
    SensorLocation.STUTTGART_VAIHINGEN_OFFICE
]

// Needs to be in sync with data in Sensor Simulator program
const sensorMeasuresToSimulate = [
    SensorMeasure.TEMPERATURE,
    SensorMeasure.WIND_SPEED,
    SensorMeasure.HUMIDITY,
    SensorMeasure.PRESSURE,
    SensorMeasure.VIBRATION,
    SensorMeasure.CO,
    SensorMeasure.CO2,
]

export const persistDataServicePlugin = {
    name: 'persistDataService',
    configureServer(server) {
        console.log('Starting Development Server Persist Data Service..\n');
        initializePersistDataService(); 
    },
}

export const initializePersistDataService = async () => {
    await initializePrisma();
    initializeMQTTClient();
}

const initializePrisma = async () => {
    console.log('Prisma Client: Initializing Sensor Data..');

    const sensorData = [];

    // Simulated Sensors
    for(const location of sensorLocationsToSimulate) {
        for(const measure of sensorMeasuresToSimulate) {
            const instanceId = location.split('_').map(part => part[0]).join('') + '_' + measure + '_S';
            sensorData.push({
                instanceId,
                isPhysical: false,
            });
        }
    }

    // Physical Sensors
    // TODO DWA Add physical sensor data!

    for(const sensor of sensorData) {
        await prisma.sensor.upsert({
            create: sensor,
            update: {},
            where: {
                'instanceId': sensor.instanceId,
            }
        });
    }

    console.log('Prisma Client: Done.\n');
}

const initializeMQTTClient = () => {
    console.log('MQTT Client: Connecting to MQTT broker over secure MQTT connection..');

    const mqttClient = mqtt.connect(host, options);
    
    mqttClient.on('error', (err) => {
        console.log('MQTT Client: Connection error: ', err);
        mqttClient.end();
    })

    mqttClient.on('reconnect', () => {
        console.log('MQTT Client: Reconnecting...');
    })

    mqttClient.on('connect', () => {
        console.log('MQTT Client: Connected as ' + mqttClientId);
        
        mqttClient.subscribe(sensorTelemetryTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(sensorMetadataTopicPrefix + '/+/+', { qos: 0 });
        // TODO DWA Add for weather events, actuators, ...
    })

    mqttClient.on('message', function (topic, message) {
        const messageJSON = JSON.parse(message.toString());
        
        if(topic.startsWith(sensorTelemetryTopicPrefix)) {
            prisma.sensorTelemetryData.create({ data: messageJSON }).then(data => data);
        } else if (topic.startsWith(sensorMetadataTopicPrefix)) {
            prisma.sensorMetaData.create({ data: messageJSON }).then(data => data);
        }
        // TODO DWA Add for weather events, actuators, ...
    });
}
