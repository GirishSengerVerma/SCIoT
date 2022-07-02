import 'dotenv/config'
import * as mqtt from "mqtt";
import { PrismaClient, Location, SensorMeasure, SensorSimulationBehavior, SensorSimulationMode, UnitType } from '@prisma/client';
import { Server } from 'socket.io';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc)

import { assert } from 'console';

export const dataServicePlugin = {
    name: 'dataService',
    configureServer(server) {
        console.log('Starting Development Server Data Service..\n');
        initializeDataService(server.httpServer);
    },
}

export const initializeDataService = async (server) => {
    await initializePrisma();
    const io = new Server(server);
    initializeMQTTClient(io);
    initializeWebsocketServer(io);
}

const initialSensorsDataSKP = [
    {
        sensor: {
            instanceId: 'SKP_TEMPERATURE_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_TEMPERATURE_S',
            name: 'Temperature at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.TEMPERATURE,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SKP_WIND_SPEED_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_WIND_SPEED_S',
            name: 'Wind Speed at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.WIND_SPEED,
            simulationMode: SensorSimulationMode.MEDIUM,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SKP_HUMIDITY_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_HUMIDITY_S',
            name: 'Humidity at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.HUMIDITY,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SKP_PRESSURE_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_PRESSURE_S',
            name: 'Pressure at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.PRESSURE,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SKP_VIBRATION_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_VIBRATION_S',
            name: 'Vibration at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.VIBRATION,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SKP_CO2_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_CO2_S',
            name: 'CO2 at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.CO2,
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SKP_CO_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_CO_S',
            name: 'CO at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.CO,
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
];

const initialSensorsDataSVO = [
    {
        sensor: {
            instanceId: 'SVO_TEMPERATURE_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_TEMPERATURE_S',
            name: 'Temperature at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.TEMPERATURE,
            simulationMode: SensorSimulationMode.MEDIUM,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SVO_WIND_SPEED_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_WIND_SPEED_S',
            name: 'Wind Speed at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.WIND_SPEED,
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SVO_HUMIDITY_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_HUMIDITY_S',
            name: 'Humidity at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.HUMIDITY,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SVO_PRESSURE_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_PRESSURE_S',
            name: 'Pressure at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.PRESSURE,
            simulationMode: SensorSimulationMode.MEDIUM,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SVO_VIBRATION_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_VIBRATION_S',
            name: 'Vibration at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.VIBRATION,
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SVO_CO2_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_CO2_S',
            name: 'CO2 at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.CO2,
            simulationMode: SensorSimulationMode.MEDIUM,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SVO_CO_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_CO_S',
            name: 'CO at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            measure: SensorMeasure.CO,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
];

const initialSensorsDataSMES = [
    {
        sensor: {
            instanceId: 'SMES_TEMPERATURE_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_TEMPERATURE_S',
            name: 'Temperature at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.TEMPERATURE,
            simulationMode: SensorSimulationMode.HIGH,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SMES_WIND_SPEED_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_WIND_SPEED_S',
            name: 'Wind Speed at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.WIND_SPEED,
            simulationMode: SensorSimulationMode.HIGH,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SMES_HUMIDITY_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_HUMIDITY_S',
            name: 'Humidity at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.HUMIDITY,
            simulationMode: SensorSimulationMode.HIGH,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SMES_PRESSURE_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_PRESSURE_S',
            name: 'Pressure at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.PRESSURE,
            simulationMode: SensorSimulationMode.HIGH,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SMES_VIBRATION_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_VIBRATION_S',
            name: 'Vibration at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.VIBRATION,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SMES_CO2_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_CO2_S',
            name: 'CO2 at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.CO2,
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
    {
        sensor: {
            instanceId: 'SMES_CO_S',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_CO_S',
            name: 'CO at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.CO,
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
];

const initialSensorsData = initialSensorsDataSKP.concat(initialSensorsDataSVO).concat(initialSensorsDataSMES);

const getInitialUnitStatusData = () => {
    const initialData = [];
    for (let location of Object.values(Location)) {
        for (let unitType of Object.values(UnitType)) {
            if (location === Location.AUTHORITIES_HUB) {
                initialData.push({ location, unitType, amount: 3 });
            } else {
                initialData.push({ location, unitType, amount: 0 });
            }
        }
    }
    return initialData;
};

const host = process.env.MQTT_HOST;

const options = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
}

const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

const prisma = new PrismaClient();

const initializePrisma = async () => {
    console.log('Data Service: Prisma Client: Initializing Sensor Data..');

    const isSensorsTableEmpty = (await prisma.sensor.count()) == 0;

    if (isSensorsTableEmpty) {
        const createSensorsResult = await prisma.sensor.createMany({
            data: initialSensorsData.map(e => e.sensor),
        });
        console.log('Data Service: Prisma Client: Created ' + createSensorsResult.count + ' sensors.');
        assert(createSensorsResult.count == initialSensorsData.length);
    }

    const isSensorMetaDataTableEmpty = (await prisma.sensorMetaData.count()) == 0;

    if (isSensorMetaDataTableEmpty) {
        const createSensorMetaDataResult = await prisma.sensorMetaData.createMany({
            data: initialSensorsData.map(e => e.metadata),
        });
        console.log('Data Service: Prisma Client: Created initial metadata for ' + createSensorMetaDataResult.count + ' sensors.');
        assert(createSensorMetaDataResult.count == initialSensorsData.length);
    }

    console.log('Data Service: Prisma Client: Initializing Units Data..');
    for (let unitStatus of getInitialUnitStatusData()) {
        await prisma.unitStatus.upsert({
            create: unitStatus,
            update: {},
            where: {
                unitType_location: {
                    location: unitStatus.location,
                    unitType: unitStatus.unitType,
                },
            },
        });
    }

    console.log('Data Service: Prisma Client: Done.\n');
}

const SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC = 'requestHistoricSensorData';
const SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC = 'responseHistoricSensorData';

let currentWebsocketConnections = [];

const initializeWebsocketServer = (io) => {
    io.on('connection', (socket) => {
        currentWebsocketConnections.push(socket);

        // Send current MetaData and TelemetryData for all Sensors
        prisma.sensor.findMany({ select: { instanceId: true } }).then((sensors) => {
            sensors.forEach(async (sensor) => {
                const sensorMetaData = await prisma.sensorMetaData.findFirst({
                    where: {
                        instanceId: sensor.instanceId
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                });
                if (sensorMetaData) {
                    socket.emit(sensorMetadataTopicPrefix, JSON.stringify(sensorMetaData));
                }

                const sensorTelemetryData = await prisma.sensorTelemetryData.findFirst({
                    where: {
                        instanceId: sensor.instanceId
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                });
                if (sensorTelemetryData) {
                    socket.emit(sensorTelemetryTopicPrefix, JSON.stringify(sensorTelemetryData));
                }
            });
        });

        socket.on(SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC, (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const sensorLocation = messageJSON['sensorLocation'];
                const sensorDataPeriod = messageJSON['sensorDataPeriod'];

                if (sensorDataPeriod === 'LIVE_DATA') {
                    console.error(
                        'Data Service: Request for Historic Sensor Data although Data Period is Live Data'
                    );
                    return;
                }

                let timestampFilterGte;
                if (sensorDataPeriod === 'LAST_HOUR') {
                    timestampFilterGte = dayjs().subtract(1, 'hour');
                } else if (sensorDataPeriod === 'LAST_DAY') {
                    timestampFilterGte = dayjs().subtract(1, 'day');
                } else if (sensorDataPeriod === 'LAST_WEEK') {
                    timestampFilterGte = dayjs().subtract(1, 'week');
                } else if (sensorDataPeriod === 'LAST_MONTH') {
                    timestampFilterGte = dayjs().subtract(1, 'month');
                }

                prisma.sensor.findMany({ select: { instanceId: true } }).then(async (sensors) => {
                    const historicSensorData = {};

                    for (let sensor of sensors) {
                        const sensorMetaData = await prisma.sensorMetaData.findFirst({
                            where: {
                                instanceId: sensor.instanceId
                            },
                            orderBy: {
                                timestamp: 'desc'
                            }
                        });

                        if (sensorMetaData.location !== sensorLocation) {
                            continue;
                        }

                        historicSensorData[sensorMetaData.instanceId] = {
                            metaData: {},
                            telemetryData: []
                        }

                        historicSensorData[sensorMetaData.instanceId]['metaData'] = sensorMetaData;

                        const sensorTelemetryDataList = await prisma.sensorTelemetryData.findMany({
                            where: {
                                instanceId: sensor.instanceId,
                                timestamp: {
                                    gte: timestampFilterGte.toDate(),
                                }
                            },
                            orderBy: {
                                timestamp: 'asc'
                            }
                        });
                        historicSensorData[sensorMetaData.instanceId]['telemetryData'] = sensorTelemetryDataList;
                    }

                    socket.emit(SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC, JSON.stringify(historicSensorData));
                });

            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Historic Sensor Data Request Socket IO message: ',
                    error
                );
            }
        });

        socket.conn.on("close", (_) => {
            currentWebsocketConnections = currentWebsocketConnections.filter(con => con !== socket);
        });
    });

    console.log('Data Service: Initialized Websocket Server.');
};

const initializeMQTTClient = async () => {
    console.log('Data Service: MQTT Client: Connecting to MQTT broker over secure MQTT connection..');

    const mqttClient = mqtt.connect(host, options);

    mqttClient.on('error', (err) => {
        console.log('Data Service: MQTT Client: Connection error: ', err);
        mqttClient.end();
    })

    mqttClient.on('reconnect', () => {
        console.log('Data Service: MQTT Client: Reconnecting...');
    })

    mqttClient.on('connect', () => {
        console.log('Data Service: MQTT Client: Connected.');

        mqttClient.subscribe(sensorTelemetryTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(sensorMetadataTopicPrefix + '/+/+', { qos: 0 });
        // TODO DWA Add for weather events, actuators, ...
    })

    mqttClient.on('message', function (topic, message) {
        try {
            const messageJSON = JSON.parse(message.toString());

            if (topic.startsWith(sensorTelemetryTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(sensorTelemetryTopicPrefix, JSON.stringify(messageJSON)));
                prisma.sensorTelemetryData.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting JSON data using Prisma: ', error));
            } else if (topic.startsWith(sensorMetadataTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(sensorMetadataTopicPrefix, JSON.stringify(messageJSON)));
                prisma.sensorMetaData.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting JSON data using Prisma: ', error));
            }
            // TODO DWA Add for weather events, actuators, ...   
        } catch (error) {
            console.error('Data Service: Error processing incoming MQTT message: ', error);
        }
    });
}