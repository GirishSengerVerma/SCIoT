import 'dotenv/config'
import * as mqtt from "mqtt";
import { PrismaClient, Location, SensorMeasure, SensorSimulationBehavior, SensorSimulationMode, UnitType, ActuatorType, WeatherEventActionType, WeatherEventRiskLevel } from '@prisma/client';
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

const timestamp = dayjs().toISOString();

const initialActuatorsDataSKP = [
    {
        actuator: {
            instanceId: 'SKP_SOUND_A',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SKP_SOUND_A',
            name: 'Alarm Sound at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            type: ActuatorType.ALARM_SOUND,
        },
        status: {
            instanceId: 'SKP_SOUND_A',
            enabled: false,
            timestamp,
        },
    },
    {
        actuator: {
            instanceId: 'SKP_LIGHT_A',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SKP_LIGHT_A',
            name: 'Alarm Light at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            type: ActuatorType.ALARM_LIGHT,
        },
        status: {
            instanceId: 'SKP_LIGHT_A',
            enabled: false,
            timestamp,
        },
    },
    {
        actuator: {
            instanceId: 'SKP_LOCKDOWN_A',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SKP_LOCKDOWN_A',
            name: 'Lockdown at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            type: ActuatorType.LOCKDOWN,
        },
        status: {
            instanceId: 'SKP_LOCKDOWN_A',
            enabled: false,
            timestamp,
        },
    },
];

const initialActuatorsDataSVO = [
    {
        actuator: {
            instanceId: 'SVO_LIGHT_A',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SVO_LIGHT_A',
            name: 'Alarm Light at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            type: ActuatorType.ALARM_LIGHT,
        },
        status: {
            instanceId: 'SVO_LIGHT_A',
            enabled: false,
            timestamp,
        },
    },
    {
        actuator: {
            instanceId: 'SVO_LOCKDOWN_A',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SVO_LOCKDOWN_A',
            name: 'Lockdown at Stuttgart Vaihingen Office',
            location: Location.STUTTGART_VAIHINGEN_OFFICE,
            type: ActuatorType.LOCKDOWN,
        },
        status: {
            instanceId: 'SVO_LOCKDOWN_A',
            enabled: false,
            timestamp,
        },
    },
];

const initialActuatorsDataSMES = [
    {
        actuator: {
            instanceId: 'SMES_LIGHT_A',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SMES_LIGHT_A',
            name: 'Alarm Light at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            type: ActuatorType.ALARM_LIGHT,
        },
        status: {
            instanceId: 'SMES_LIGHT_A',
            enabled: false,
            timestamp,
        },
    },
    {
        actuator: {
            instanceId: 'SMES_WATER_PROTECTION_WALL_A',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SMES_WATER_PROTECTION_WALL_A',
            name: 'Water Protection Wall at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            type: ActuatorType.WATER_PROTECTION_WALL,
        },
        status: {
            instanceId: 'SMES_WATER_PROTECTION_WALL_A',
            enabled: false,
            timestamp,
        },
    },
    {
        actuator: {
            instanceId: 'SMES_LOCKDOWN_A',
            isPhysical: false,
        },
        metadata: {
            instanceId: 'SMES_LOCKDOWN_A',
            name: 'Lockdown at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            type: ActuatorType.LOCKDOWN,
        },
        status: {
            instanceId: 'SMES_LOCKDOWN_A',
            enabled: false,
            timestamp,
        },
    },
];

const initialActuatorsData = initialActuatorsDataSKP.concat(initialActuatorsDataSVO).concat(initialActuatorsDataSMES);

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

const sensorInstanceTopicPrefix = 'sensors/instance';
const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

const actuatorInstanceTopicPrefix = 'actuators/instance';
const actuatorStatusDataTopicPrefix = 'actuators/statusdata';
const actuatorsMetadataTopicPrefix = 'actuators/metadata';

const weatherEventInstanceTopicPrefix = 'weatherevents/instance';
const weatherEventRiskTopicPrefix = 'weatherevents/risk';
const weatherEventActionTopicPrefix = 'weatherevents/action';

const authoritiesUnitStatusTopicPrefix = 'authorities/unitstatus';

const prisma = new PrismaClient();

const initializePrisma = async () => {
    {
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
    }

    {
        console.log('Data Service: Prisma Client: Initializing Actuators Data..');

        const isActuatorsTableEmpty = (await prisma.actuator.count()) == 0;

        if (isActuatorsTableEmpty) {
            const createActuatorsResult = await prisma.actuator.createMany({
                data: initialActuatorsData.map(e => e.actuator),
            });
            console.log('Data Service: Prisma Client: Created ' + createActuatorsResult.count + ' actuators.');
            assert(createActuatorsResult.count == initialActuatorsData.length);
        }

        const isActuatorMetaDataTableEmpty = (await prisma.actuatorMetaData.count()) == 0;

        if (isActuatorMetaDataTableEmpty) {
            const createActuatorMetaDataResult = await prisma.actuatorMetaData.createMany({
                data: initialActuatorsData.map(e => e.metadata),
            });
            console.log('Data Service: Prisma Client: Created initial metadata for ' + createActuatorMetaDataResult.count + ' actuators.');
            assert(createActuatorMetaDataResult.count == initialActuatorsData.length);
        }

        const isActuatorStatusDataTableEmpty = (await prisma.actuatorStatusData.count()) == 0;

        if (isActuatorStatusDataTableEmpty) {
            const createActuatorStatusDataResult = await prisma.actuatorStatusData.createMany({
                data: initialActuatorsData.map(e => e.status),
            });
            console.log('Data Service: Prisma Client: Created initial status data for ' + createActuatorStatusDataResult.count + ' actuators.');
            assert(createActuatorStatusDataResult.count == initialActuatorsData.length);
        }
    }

    {
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
    }

    console.log('Data Service: Prisma Client: Done.\n');
}

const SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC = 'requestHistoricSensorData';
const SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC = 'responseHistoricSensorData';

const SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC = 'requestHistoricActuatorStatusData';
const SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC = 'responseHistoricActuatorStatusData';

let currentWebsocketConnections = [];

const initializeWebsocketServer = (io) => {
    io.on('connection', (socket) => {
        currentWebsocketConnections.push(socket);

        // Sensors: Send newest data
        prisma.sensor.findMany({ select: { instanceId: true } }).then((sensors) => {
            sensors.forEach(async (sensor) => {
                socket.emit(sensorInstanceTopicPrefix, JSON.stringify(sensor));

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

        // Actuators: Send newest data
        prisma.actuator.findMany({ select: { instanceId: true, isPhysical: true } }).then((actuators) => {
            actuators.forEach(async (actuator) => {
                socket.emit(actuatorInstanceTopicPrefix, JSON.stringify(actuator));

                const actuatorMetaData = await prisma.actuatorMetaData.findFirst({
                    where: {
                        instanceId: actuator.instanceId
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                });
                if (actuatorMetaData) {
                    socket.emit(actuatorsMetadataTopicPrefix, JSON.stringify(actuatorMetaData));
                }

                const actuatorStatusData = await prisma.actuatorStatusData.findFirst({
                    where: {
                        instanceId: actuator.instanceId
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                });
                if (actuatorStatusData) {
                    socket.emit(actuatorStatusDataTopicPrefix, JSON.stringify(actuatorStatusData));
                }
            });
        });

        // TODO DWA Send current Weather Events and for each: current WeatherEventRisk and possibly also action(s) ?

        // Send current Authorities Unit Status
        
        const locationAndUnitTypesProcessed = new Set([]);

        prisma.unitStatus.findMany({
            include: {
                lastChangedBy: {
                    include: {
                        weatherEvent: true,
                    },
                },
            },
            orderBy: [
                {
                    location: 'desc', 
                },
                {
                    unitType: 'desc',
                },
            ],
        }).then(unitStatusData => {
            unitStatusData.forEach((unitStatus) => {
                if(locationAndUnitTypesProcessed.has(unitStatus.location + '_' + unitStatus.unitType)) { // only choose most recent entries for each pair
                    return;
                }
                locationAndUnitTypesProcessed.add(unitStatus.location + '_' + unitStatus.unitType);
                socket.emit(authoritiesUnitStatusTopicPrefix, unitStatus);
            });
        });

        socket.on(SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC, (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const selectedLocation = messageJSON['selectedLocation'];
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

                        if (sensorMetaData.location !== selectedLocation) {
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

        socket.on(SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC, async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const selectedActuatorInstanceId = messageJSON['selectedActuatorInstanceId'];

                let historicSelectedActuatorStatusData = await prisma.actuatorStatusData.findMany({
                    where: {
                        instanceId: selectedActuatorInstanceId,
                    }, include: {
                        lastChangedBy: {
                            include: {
                                weatherEvent: true
                            },
                        },
                    },
                });

                socket.emit(SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC, JSON.stringify(historicSelectedActuatorStatusData));
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Historic Actuator Status Data Request Socket IO message: ',
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

        mqttClient.subscribe(sensorInstanceTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(sensorTelemetryTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(sensorMetadataTopicPrefix + '/+/+', { qos: 0 });

        mqttClient.subscribe(actuatorInstanceTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(actuatorStatusDataTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(actuatorsMetadataTopicPrefix + '/+/+', { qos: 0 });

        mqttClient.subscribe(weatherEventInstanceTopicPrefix + '/+', { qos: 0 });
        mqttClient.subscribe(weatherEventActionTopicPrefix + '/+', { qos: 0 });
        mqttClient.subscribe(weatherEventRiskTopicPrefix + '/+', { qos: 0 });
    })

    mqttClient.on('message', async function (topic, message) {
        try {
            const messageJSON = JSON.parse(message.toString());

            const timestamp = dayjs().toISOString();

             if (topic.startsWith(sensorInstanceTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(sensorInstanceTopicPrefix, JSON.stringify(messageJSON)));
                prisma.sensor.upsert({ create: messageJSON, where: { instanceId: messageJSON.instanceId }})
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Sensor Instance JSON data using Prisma: ', error));
            } else if (topic.startsWith(sensorTelemetryTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(sensorTelemetryTopicPrefix, JSON.stringify(messageJSON)));
                prisma.sensorTelemetryData.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Sensor Telemetry JSON data using Prisma: ', error));
            } else if (topic.startsWith(sensorMetadataTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(sensorMetadataTopicPrefix, JSON.stringify(messageJSON)));
                prisma.sensorMetaData.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Sensor MetaData JSON data using Prisma: ', error));
            }else if (topic.startsWith(actuatorInstanceTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(actuatorInstanceTopicPrefix, JSON.stringify(messageJSON)));
                prisma.actuator.upsert({ 
                    create: messageJSON, 
                    where: { 
                        instanceId: messageJSON.instanceId 
                    }
                })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Actuator Instance JSON data using Prisma: ', error));
            } else if (topic.startsWith(actuatorStatusDataTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(actuatorStatusDataTopicPrefix, JSON.stringify(messageJSON)));
                prisma.actuatorStatusData.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Actuator Status JSON data using Prisma: ', error));
            } else if (topic.startsWith(actuatorsMetadataTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(actuatorsMetadataTopicPrefix, JSON.stringify(messageJSON)));
                prisma.actuatorMetaData.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Actuator MetaData JSON data using Prisma: ', error));
            } else if (topic.startsWith(weatherEventInstanceTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(weatherEventInstanceTopicPrefix, JSON.stringify(messageJSON)));
                prisma.weatherEvent.upsert({ create: messageJSON, update: { end: messageJSON.end }, where: { id: messageJSON.id } })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Weather Event Instance JSON data using Prisma: ', error));
            } else if (topic.startsWith(weatherEventRiskTopicPrefix)) {
                currentWebsocketConnections.forEach(socket => socket.emit(weatherEventRiskTopicPrefix, JSON.stringify(messageJSON)));
                prisma.weatherEventRisk.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Weather Event Risk JSON data using Prisma: ', error));
            } else if(topic.startsWith(weatherEventActionTopicPrefix)) {
                const weatherEventAction = JSON.stringify(messageJSON);

                currentWebsocketConnections.forEach(socket => socket.emit(weatherEventActionTopicPrefix, weatherEventAction));
                
                prisma.weatherEventAction.create({ data: messageJSON })
                    .then(data => data)
                    .catch(error => console.error('Data Service: Error persisting Weather Event Action JSON data using Prisma: ', error));

                if(weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_DEVICE_NOTIFICATION) {
                    // TODO Implement!
                } else if(weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION || weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_REOPEN_LOCATION) {
                    const enabled = weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION;

                    prisma.actuatorMetaData.findMany({ 
                        select: { instanceId: true }, 
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.LOCKDOWN,
                        }
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled,
                                weatherEventActionId: weatherEventAction.id,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location, newActuatorStatus)); // will be persisted and sent via websosket when received in listener above
                    });
                } else if(weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL || weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_DRIVE_DOWN_WATER_PROTECTION_WALL) {
                    const enabled = weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL;

                    prisma.actuatorMetaData.findMany({ 
                        select: { instanceId: true }, 
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.WATER_PROTECTION_WALL,
                        }
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled,
                                weatherEventActionId: weatherEventAction.id,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location, newActuatorStatus));   // will be persisted and sent via websosket when received in listener above
                    });
                } else if(weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_LIGHT) {
                    prisma.actuatorMetaData.findMany({ 
                        select: { instanceId: true }, 
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.ALARM_LIGHT,
                        }
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled: true,
                                weatherEventActionId: weatherEventAction.id,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location, newActuatorStatus));   // will be persisted and sent via websosket when received in listener above
                    });
                } else if(weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_SOUND) {
                    prisma.actuatorMetaData.findMany({ 
                        select: { instanceId: true }, 
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.ALARM_SOUND,
                        }
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled: true,
                                weatherEventActionId: weatherEventAction.id,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location, newActuatorStatus));   // will be persisted and sent via websosket when received in listener above
                    });
                } else if(weatherEventAction.type === WeatherEventActionType.PLANNING_INCREASE_RISK_LEVEL) {
                    const currentWeatherEventRisk = await prisma.weatherEventRisk.findFirst({ 
                        where: { 
                            weatherEventId: weatherEventAction.weatherEventId,
                        },
                        orderBy: {
                            timestamp: 'desc',
                        }
                    });

                    let newWeatherEventRiskLevel = undefined;
                    if(currentWeatherEventRisk) {
                        if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.LOW) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.MEDIUM;
                        } else if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.MEDIUM) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.HIGH;
                        } else if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.HIGH) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.EXTREME;
                        } else if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.EXTREME) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.EXTREME;
                        }
                    } else {
                        newWeatherEventRiskLevel = WeatherEventRiskLevel.MEDIUM;
                    }

                    const newWeatherEventRisk = {
                        weatherEventId: weatherEventAction.weatherEventId,
                        riskLevel: newWeatherEventRiskLevel,
                    };

                    await prisma.weatherEventRisk.update({ where: { id: currentWeatherEventRisk.id }, data: { end: timestamp } });
                    
                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEventAction.location, newWeatherEventRisk);  // will be persisted and sent via websosket when received in listener above
                } else if(weatherEventAction.type === WeatherEventActionType.PLANNING_DECREASE_RISK_LEVEL) {
                    const currentWeatherEventRisk = await prisma.weatherEventRisk.findFirst({ 
                        where: { 
                            weatherEventId: weatherEventAction.weatherEventId,
                        },
                        orderBy: {
                            timestamp: 'desc',
                        }
                    });

                    await prisma.weatherEventRisk.update({ where: { id: currentWeatherEventRisk.id }, data: { end: timestamp } });

                    let newWeatherEventRiskLevel = undefined;
                    if(currentWeatherEventRisk) {
                        if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.LOW) {
                            const weatherEvent = await prisma.weatherEvent.findFirst({ where: { id: currentWeatherEventRisk.weatherEventId } });
                            const newWeatherEvent = { ...weatherEvent, end: timestamp };
                            mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + weatherEventAction.location, newWeatherEvent);  // will be persisted and sent via websosket when received in listener above
                            return;
                        } else if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.MEDIUM) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.LOW;
                        } else if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.HIGH) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.MEDIUM;
                        } else if(currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.EXTREME) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.HIGH;
                        }
                    } else {
                        newWeatherEventRiskLevel = WeatherEventRiskLevel.LOW;
                    }

                    const newWeatherEventRisk = {
                        weatherEventId: weatherEventAction.weatherEventId,
                        riskLevel: newWeatherEventRiskLevel,
                    };

                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEventAction.location, newWeatherEventRisk);  // will be persisted and sent via websosket when received in listener above
                } else if(weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_RESPONSE) {
                    await prisma.unitStatus.update( where: {}, data: {  } );

                    // TODO DWA Update Number of Units at from and to Location
                    // TODO DWA Emit authoritiesUnitStatus message via Socket Message
                }
            }  
        } catch (error) {
            console.error('Data Service: Error processing incoming MQTT message: ', error);
        }
    });
}