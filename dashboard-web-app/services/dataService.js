import 'dotenv/config'
import * as mqtt from "mqtt";
import { PrismaClient, Location, SensorMeasure, SensorSimulationBehavior, SensorSimulationMode, UnitType, ActuatorType, WeatherEventActionType, WeatherEventRiskLevel, WeatherEventType } from '@prisma/client';
import { Server } from 'socket.io';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc)

import { assert } from 'console';
import { readFileSync, writeFile } from 'fs';
import { exec } from 'child_process';

let mqttClient;

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
    startDetectWeatherEventsIntervalTask();
    startAuthoritiesUnitAIPlannerIntervalTask();
}

const initialSensorsDataSKP = [
    {
        sensor: {
            instanceId: 'SKP_LIGHT_S',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SKP_LIGHT_S',
            name: 'Light at Stuttgart Killesbergpark',
            location: Location.STUTTGART_KILLESBERG_PARK,
            measure: SensorMeasure.LIGHT,
        },
    },
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
            simulationMode: SensorSimulationMode.LOW,
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
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
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
            simulationMode: SensorSimulationMode.LOW,
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
            instanceId: 'SMES_WATER_LEVEL_S',
            isPhysical: true,
        },
        metadata: {
            instanceId: 'SMES_WATER_LEVEL_S',
            name: 'Water Level at Stuttgart Max Eyth See',
            location: Location.STUTTGART_MAX_EYTH_SEE,
            measure: SensorMeasure.WATER_LEVEL,
            simulationMode: SensorSimulationMode.LOW,
            simulationBehavior: SensorSimulationBehavior.NORMAL_DISTRIBUTED,
        },
    },
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
            simulationMode: SensorSimulationMode.LOW,
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
            simulationMode: SensorSimulationMode.EXTREMELY_LOW,
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
            isPhysical: false,
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
                initialData.push({ location, unitType, timestamp, amount: 3 });
            } else {
                initialData.push({ location, unitType, timestamp, amount: 0 });
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

const weatherEventInstanceTopicPrefix = 'weatherevents/instance';
const weatherEventRiskTopicPrefix = 'weatherevents/risk';
const weatherEventActionTopicPrefix = 'weatherevents/action';

const sensorAddedTopicPrefix = 'sensors/added';
const sensorDeletedTopicPrefix = 'sensors/deleted';
const sensorInstanceTopicPrefix = 'sensors/instance';
const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

const actuatorInstanceTopicPrefix = 'actuators/instance';
const actuatorStatusDataTopicPrefix = 'actuators/statusdata';
const actuatorsMetadataTopicPrefix = 'actuators/metadata';

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

        const isUnitStatusTableEmpty = (await prisma.unitStatus.count()) == 0;

        if (isUnitStatusTableEmpty) {
            await prisma.unitStatus.createMany({
                data: getInitialUnitStatusData(),
            });
        }
    }

    console.log('Data Service: Prisma Client: Done.\n');
}

const SOCKET_REQUEST_CREATE_WEATHER_EVENT_TOPIC = 'requestCreateWeatherEvent';
const SOCKET_REQUEST_DELETE_WEATHER_EVENT_TOPIC = 'requestDeleteWeatherEvent';
const SOCKET_REQUEST_END_WEATHER_EVENT_TOPIC = 'requestEndWeatherEvent';
const SOCKET_REQUEST_HISTORIC_WEATHER_EVENT_DATA_TOPIC = 'requestHistoricWeatherEventData';
const SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC = 'responseHistoricWeatherEventData';
const SOCKET_REQUEST_CHANGE_WEATHER_EVENT_RISK_LEVEL_TOPIC = 'requestChangeWeatherEventRiskLevel';
const SOCKET_REQUEST_MANUALLY_TAKE_WEATHER_EVENT_ACTION_TOPIC = 'requestManuallyTakeWeatherEventAction';

const SOCKET_REQUEST_CREATE_SENSOR_TOPIC = 'requestCreateSensor';
const SOCKET_REQUEST_DELETE_SENSOR_TOPIC = 'requestDeleteSensor';
const SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC = 'requestHistoricSensorData';
const SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC = 'responseHistoricSensorData';

const SOCKET_REQUEST_CREATE_ACTUATOR_TOPIC = 'requestCreateActuator';
const SOCKET_REQUEST_DELETE_ACTUATOR_TOPIC = 'requestDeleteActuator';
const SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC = 'requestHistoricActuatorStatusData';
const SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC = 'responseHistoricActuatorStatusData';
const SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC = 'requestManuallyChangeActuatorStatus';

const SOCKET_REQUEST_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC = 'requestHistoricAuthoritiesUnitStatusData';
const SOCKET_RESPONSE_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC = 'responseHistoricAuthoritiesUnitStatusData';
const SOCKET_REQUEST_MANUALLY_MOVE_AUTHORITIES_UNITS_TOPIC = 'requestManuallyMoveAuthoritiesUnits';

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

        // Send current and past Weather Events and for each: most recent WeatherEventRisk
        {
            prisma.weatherEvent.findMany({
                orderBy: [
                    {
                        location: 'desc',
                    },
                    {
                        type: 'desc',
                    },
                    {
                        start: 'desc',
                    },
                    {
                        end: 'desc',
                    }
                ],
            }).then(weatherEventData => {
                weatherEventData.forEach(async (weatherEvent) => {
                    socket.emit(weatherEventInstanceTopicPrefix, JSON.stringify(weatherEvent));
                    const mostRecentWeatherEventRisk = await prisma.weatherEventRisk.findFirst({
                        where: {
                            weatherEventId: weatherEvent.id,
                        },
                        orderBy: [
                            {
                                start: 'desc',
                            },
                            {
                                end: 'desc',
                            },
                        ],
                    });
                    if (mostRecentWeatherEventRisk) {
                        socket.emit(weatherEventRiskTopicPrefix, JSON.stringify(mostRecentWeatherEventRisk));
                    }
                });
            });
        }

        // Send current Authorities Unit Status
        {
            const locationAndUnitTypesProcessed = new Set([]);

            prisma.unitStatus.findMany({
                orderBy: [
                    {
                        location: 'desc',
                    },
                    {
                        unitType: 'desc',
                    },
                    {
                        timestamp: 'desc',
                    }
                ],
            }).then(unitStatusData => {
                unitStatusData.forEach((unitStatus) => {
                    if (locationAndUnitTypesProcessed.has(unitStatus.location + '_' + unitStatus.unitType)) { // only choose most recent entries for each pair
                        return;
                    }
                    locationAndUnitTypesProcessed.add(unitStatus.location + '_' + unitStatus.unitType);
                    socket.emit(authoritiesUnitStatusTopicPrefix, JSON.stringify(unitStatus));
                });
            });
        }

        // Socket Message Listeners

        socket.on(SOCKET_REQUEST_CREATE_SENSOR_TOPIC, async (message) => {
            try {
                const { instanceId, name, isPhysical, location, measure, simulationMode, simulationBehavior } = JSON.parse(message.toString());
                mqttClient.publish(sensorAddedTopicPrefix, JSON.stringify({ instanceId, name, isPhysical, location, measure, simulationMode, simulationBehavior }), { qos: 2 });
                mqttClient.publish(sensorInstanceTopicPrefix + '/' + location + '/' + measure, JSON.stringify({ instanceId, isPhysical }), { qos: 2 });
                setTimeout(() => {
                    mqttClient.publish(sensorMetadataTopicPrefix + '/' + location + '/' + measure, JSON.stringify({ instanceId, name, location, measure, simulationMode, simulationBehavior }), { qos: 2 }); 
                }, 200);
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Create Actuator Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_DELETE_SENSOR_TOPIC, async (message) => {
            try {
                const { instanceId } = JSON.parse(message.toString());
                mqttClient.publish(sensorDeletedTopicPrefix, JSON.stringify({ instanceId }), { qos: 2 });
                await prisma.sensorTelemetryData.deleteMany({ where: { instanceId } });
                await prisma.sensorMetaData.deleteMany({ where: { instanceId } });
                await prisma.sensor.delete({ where: { instanceId } });
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Delete Sensor Request Socket IO message: ',
                    error
                );
            }
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

        socket.on(SOCKET_REQUEST_CREATE_ACTUATOR_TOPIC, async (message) => {
            try {
                const { instanceId, name, isPhysical, location, type } = JSON.parse(message.toString());
                mqttClient.publish(actuatorInstanceTopicPrefix + '/' + location + '/' + type, JSON.stringify({ instanceId, isPhysical }), { qos: 2 });
                setTimeout(() => {
                    mqttClient.publish(actuatorsMetadataTopicPrefix + '/' + location + '/' + type, JSON.stringify({ instanceId, name, location, type }), { qos: 2 });
                    mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + location + '/' + type, JSON.stringify({ instanceId, enabled: false }), { qos: 2 });
                }, 200);
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Create Actuator Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_DELETE_ACTUATOR_TOPIC, async (message) => {
            try {
                const { instanceId } = JSON.parse(message.toString());
                await prisma.actuatorStatusData.deleteMany({ where: { instanceId } });
                await prisma.actuatorMetaData.deleteMany({ where: { instanceId } });
                await prisma.actuator.delete({ where: { instanceId } });
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Delete Actuator Request Socket IO message: ',
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
                    },
                    orderBy: {
                        timestamp: 'desc'
                    },
                    include: {
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

        socket.on(SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC, async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const enabled = messageJSON['selectedActuatorStatus'];
                const instanceId = messageJSON['instanceId'];
                const location = messageJSON['location'];
                const type = messageJSON['type'];

                if ('weatherEventId' in messageJSON && messageJSON['weatherEventId']) {
                    const weatherEventId = messageJSON['weatherEventId'];

                    let selectedWeatherEventActionType;
                    if (type === ActuatorType.ALARM_LIGHT) {
                        if (enabled) {
                            selectedWeatherEventActionType = WeatherEventActionType.ALERT_LOCALS_BY_LIGHT;
                        } else {
                            selectedWeatherEventActionType = WeatherEventActionType.STOP_ALERT_LOCALS_BY_LIGHT;
                        }
                    } else if (type === ActuatorType.ALARM_SOUND) {
                        if (enabled) {
                            selectedWeatherEventActionType = WeatherEventActionType.ALERT_LOCALS_BY_SOUND;
                        } else {
                            selectedWeatherEventActionType = WeatherEventActionType.STOP_ALERT_LOCALS_BY_SOUND;
                        }
                    } else if (type === ActuatorType.LOCKDOWN) {
                        if (enabled) {
                            selectedWeatherEventActionType = WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION;
                        } else {
                            selectedWeatherEventActionType = WeatherEventActionType.COUNTER_MEASURE_REOPEN_LOCATION;
                        }
                    } else if (type === ActuatorType.WATER_PROTECTION_WALL) {
                        if (enabled) {
                            selectedWeatherEventActionType = WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL;
                        } else {
                            selectedWeatherEventActionType = WeatherEventActionType.COUNTER_MEASURE_DRIVE_DOWN_WATER_PROTECTION_WALL;
                        }
                    } else {
                        return; //invalid type
                    }

                    manuallyTakeWeatherEventAction(JSON.stringify({ type: selectedWeatherEventActionType, location, weatherEventId }));
                } else {
                    mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + location + '/' + type, JSON.stringify({
                        enabled,
                        instanceId,
                    }), { qos: 2 });
                }
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Manually Change Actuator Status Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_CREATE_WEATHER_EVENT_TOPIC, async (message) => {
            try {
                const { location, type, initialRiskLevel } = JSON.parse(message.toString());
                mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + location, JSON.stringify({ location, type, initialRiskLevel }), { qos: 2 });
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming End Weather Event Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_END_WEATHER_EVENT_TOPIC, async (message) => {
            try {
                const { id } = JSON.parse(message.toString());

                const timestamp = dayjs().toISOString();

                const weatherEvent = await prisma.weatherEvent.findUnique({ where: { id } });

                const currentRisk = await prisma.weatherEventRisk.findFirst({
                    where: { weatherEventId: id },
                    orderBy: [{ start: 'desc' }, { end: 'desc' }]
                });
                mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEvent.location, JSON.stringify({
                    ...currentRisk,
                    end: timestamp,
                }), { qos: 2 });

                mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + weatherEvent.location, JSON.stringify({
                    ...weatherEvent,
                    end: timestamp,
                }), { qos: 2 });

                // TODO DWA Also update Actuator Status automatically?
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming End Weather Event Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_DELETE_WEATHER_EVENT_TOPIC, async (message) => {
            try {
                const { id } = JSON.parse(message.toString());
                await prisma.actuatorStatusData.updateMany({ where: { lastChangedBy: { weatherEventId: id } }, data: { weatherEventActionId: null } });
                await prisma.unitStatus.updateMany({ where: { changedBy: { weatherEventId: id } }, data: { weatherEventActionId: null } });
                await prisma.weatherEventRisk.deleteMany({ where: { weatherEventId: id } });
                await prisma.weatherEventAction.deleteMany({ where: { weatherEventId: id } });
                await prisma.weatherEvent.delete({ where: { id } });
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Delete Weather Event Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_HISTORIC_WEATHER_EVENT_DATA_TOPIC, async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const selectedWeatherEventId = messageJSON['selectedWeatherEventId'];
                if (selectedWeatherEventId == null || selectedWeatherEventId < 0 || !(await prisma.weatherEvent.findFirst({ where: { id: selectedWeatherEventId } }))) {
                    socket.emit(SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC, JSON.stringify({ risks: [], actions: [] }));
                    return;
                }

                const allWeatherEventRisks = await prisma.weatherEventRisk.findMany({
                    where: {
                        weatherEventId: selectedWeatherEventId,
                    },
                    orderBy: [
                        {
                            start: 'desc',
                        },
                        {
                            end: 'desc',
                        },
                    ],
                });

                const allWeatherEventActions = await prisma.weatherEventAction.findMany({
                    where: {
                        weatherEventId: selectedWeatherEventId,
                    },
                    orderBy: {
                        timestamp: 'desc',
                    }
                });

                const historicWeatherEventData = {
                    risks: allWeatherEventRisks,
                    actions: allWeatherEventActions,
                };

                socket.emit(SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC, JSON.stringify(historicWeatherEventData));
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Historic Weather Event Data Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_CHANGE_WEATHER_EVENT_RISK_LEVEL_TOPIC, async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const riskLevel = messageJSON['selectedWeatherEventRiskLevel'];
                const weatherEventId = messageJSON['weatherEventId'];
                const location = messageJSON['location'];

                const timestamp = dayjs().toISOString();

                const currentRisk = await prisma.weatherEventRisk.findFirst({
                    where: { weatherEventId },
                    orderBy: [{ start: 'desc' }, { end: 'desc' }]
                });
                mqttClient.publish(weatherEventRiskTopicPrefix + '/' + location, JSON.stringify({
                    ...currentRisk,
                    end: timestamp,
                }), { qos: 2 });

                mqttClient.publish(weatherEventRiskTopicPrefix + '/' + location, JSON.stringify({
                    weatherEventId,
                    riskLevel,
                }), { qos: 2 });

                // TODO DWA Also update Actuator Status automatically?
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Change Weather Event Risk Request Socket IO message: ',
                    error
                );
            }
        });

        const manuallyTakeWeatherEventAction = async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const location = messageJSON['location'];

                mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                    ...messageJSON,
                    wasManuallyTaken: true,
                }), { qos: 2 });
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Manually Take Weather Event Action Request Socket IO message: ',
                    error
                );
            }
        };

        socket.on(SOCKET_REQUEST_MANUALLY_TAKE_WEATHER_EVENT_ACTION_TOPIC, async (message) => {
            manuallyTakeWeatherEventAction(message);
        });

        socket.on(SOCKET_REQUEST_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC, async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const location = messageJSON['location'];
                const unitType = messageJSON['unitType'];

                let historicSelectedAuthoritiesLocationAndUnitTypeData = await prisma.unitStatus.findMany({
                    where: {
                        location,
                        unitType
                    },
                    orderBy: {
                        timestamp: 'desc'
                    },
                    include: {
                        changedBy: {
                            include: {
                                weatherEvent: true
                            },
                        },
                    },
                });

                socket.emit(SOCKET_RESPONSE_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC, JSON.stringify(historicSelectedAuthoritiesLocationAndUnitTypeData));
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Historic Authorities Units Status Data Request Socket IO message: ',
                    error
                );
            }
        });

        socket.on(SOCKET_REQUEST_MANUALLY_MOVE_AUTHORITIES_UNITS_TOPIC, async (message) => {
            try {
                const messageJSON = JSON.parse(message.toString());

                const moveUnitsAmount = messageJSON['moveUnitsAmount'];
                const moveUnitsFromLocation = messageJSON['moveUnitsFromLocation'];
                const moveUnitsToLocation = messageJSON['moveUnitsToLocation'];
                const moveUnitsType = messageJSON['moveUnitsType'];

                if ('weatherEventId' in messageJSON && messageJSON['weatherEventId']) {
                    const weatherEventId = messageJSON['weatherEventId'];
                    const type = WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_RESPONSE;
                    manuallyTakeWeatherEventAction(JSON.stringify({ type, location: moveUnitsFromLocation, weatherEventId, moveUnitsAmount, moveUnitsFromLocation, moveUnitsToLocation, moveUnitsType }));
                } else {
                    const { amount: currentUnitsAmountAtFromLocation } = await prisma.unitStatus.findFirst({
                        where: { location: moveUnitsFromLocation, unitType: moveUnitsType },
                        orderBy: { 'timestamp': 'desc' }
                    });

                    const { amount: currentUnitsAmountAtToLocation } = await prisma.unitStatus.findFirst({
                        where: { location: moveUnitsToLocation, unitType: moveUnitsType },
                        orderBy: { 'timestamp': 'desc' }
                    });

                    mqttClient.publish(authoritiesUnitStatusTopicPrefix + '/' + moveUnitsFromLocation + '/' + moveUnitsType, JSON.stringify({
                        location: moveUnitsFromLocation,
                        unitType: moveUnitsType,
                        amount: currentUnitsAmountAtFromLocation - moveUnitsAmount,
                    }), { qos: 2 });

                    mqttClient.publish(authoritiesUnitStatusTopicPrefix + '/' + moveUnitsToLocation + '/' + moveUnitsType, JSON.stringify({
                        location: moveUnitsToLocation,
                        unitType: moveUnitsType,
                        amount: currentUnitsAmountAtToLocation + moveUnitsAmount,
                    }), { qos: 2 });
                }
            } catch (error) {
                console.error(
                    'Data Service: Error processing incoming Manually Move Authorities Units Request Socket IO message: ',
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

    mqttClient = mqtt.connect(host, options);

    mqttClient.on('error', (err) => {
        console.log('Data Service: MQTT Client: Connection error: ', err);
        mqttClient.end();
    });

    mqttClient.on('reconnect', () => {
        console.log('Data Service: MQTT Client: Reconnecting...');
    });

    mqttClient.on('connect', () => {
        console.log('Data Service: MQTT Client: Connected.');

        mqttClient.subscribe(sensorInstanceTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(sensorTelemetryTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(sensorMetadataTopicPrefix + '/+/+', { qos: 0 });

        mqttClient.subscribe(actuatorInstanceTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(actuatorStatusDataTopicPrefix + '/+/+', { qos: 0 });
        mqttClient.subscribe(actuatorsMetadataTopicPrefix + '/+/+', { qos: 0 });

        mqttClient.subscribe(authoritiesUnitStatusTopicPrefix + '/+/+', { qos: 0 });

        mqttClient.subscribe(weatherEventInstanceTopicPrefix + '/+', { qos: 0 });
        mqttClient.subscribe(weatherEventActionTopicPrefix + '/+', { qos: 0 });
        mqttClient.subscribe(weatherEventRiskTopicPrefix + '/+', { qos: 0 });

        mqttClient.on('offline', () => {
            mqttClient.end(true, () => {
                initializeMQTTClient();
            });
        });
    });

    mqttClient.on('message', async function (topic, message) {
        try {
            const messageJSON = JSON.parse(message.toString());

            const timestamp = dayjs().toISOString();

            if (topic.startsWith(sensorInstanceTopicPrefix)) {
                prisma.sensor.upsert({ create: messageJSON, where: { instanceId: messageJSON.instanceId }, update: { isPhysical: messageJSON.isPhysical } })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(sensorInstanceTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Sensor Instance JSON data using Prisma: ', error));
            } else if (topic.startsWith(sensorTelemetryTopicPrefix)) {
                prisma.sensorTelemetryData.create({ data: messageJSON })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(sensorTelemetryTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Sensor Telemetry JSON data using Prisma: ', error));
            } else if (topic.startsWith(sensorMetadataTopicPrefix)) {
                prisma.sensorMetaData.create({ data: messageJSON })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(sensorMetadataTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Sensor MetaData JSON data using Prisma: ', error));
            } else if (topic.startsWith(actuatorInstanceTopicPrefix)) {
                prisma.actuator.upsert({
                    create: messageJSON,
                    where: {
                        instanceId: messageJSON.instanceId
                    },
                    update: { isPhysical: messageJSON.isPhysical }
                })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(actuatorInstanceTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Actuator Instance JSON data using Prisma: ', error));
            } else if (topic.startsWith(actuatorStatusDataTopicPrefix)) {
                prisma.actuatorStatusData.create({ data: messageJSON })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(actuatorStatusDataTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Actuator Status JSON data using Prisma: ', error));
            } else if (topic.startsWith(actuatorsMetadataTopicPrefix)) {
                prisma.actuatorMetaData.create({ data: messageJSON })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(actuatorsMetadataTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Actuator MetaData JSON data using Prisma: ', error));
            } else if (topic.startsWith(authoritiesUnitStatusTopicPrefix)) {
                prisma.unitStatus.create({ data: messageJSON })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(authoritiesUnitStatusTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting new Unit Status JSON data using Prisma: ', error));
            } else if (topic.startsWith(weatherEventInstanceTopicPrefix)) {
                var weatherEvent = { ...messageJSON };
                if ('copyWithId' in weatherEvent) {
                    return; // not needed here anymore
                }

                if ('initialRiskLevel' in weatherEvent) {
                    delete weatherEvent.initialRiskLevel;
                }

                prisma.weatherEvent.upsert({ create: weatherEvent, update: { end: weatherEvent.end }, where: { location_type_start: { location: weatherEvent.location, type: weatherEvent.type, start: weatherEvent.start ?? timestamp } } })
                    .then(async (data) => {
                        currentWebsocketConnections.forEach(socket => socket.emit(weatherEventInstanceTopicPrefix, JSON.stringify(data)));

                        mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + weatherEvent['location'], JSON.stringify({ ...data, copyWithId: true }), { qos: 2 });

                        const weatherEventId = data.id;
                        const weatherEventType = data.type;
                        const location = data.location;

                        if ('initialRiskLevel' in messageJSON && messageJSON['initialRiskLevel']) {
                            const initialRiskLevel = messageJSON['initialRiskLevel'];

                            mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEvent['location'], JSON.stringify({ weatherEventId, riskLevel: initialRiskLevel }));

                            if (initialRiskLevel === WeatherEventRiskLevel.HIGH || initialRiskLevel === WeatherEventRiskLevel.EXTREME) {
                                console.log('Enabling Alarm Light at', location, 'due to creation of ', weatherEvent);
                                mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                    type: WeatherEventActionType.ALERT_LOCALS_BY_LIGHT,
                                    location,
                                    wasManuallyTaken: false,
                                    weatherEventId,
                                }), { qos: 2 });

                                console.log('Enabling Alarm Sound at', location, 'due to creation of ', weatherEvent);
                                mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                    type: WeatherEventActionType.ALERT_LOCALS_BY_SOUND,
                                    location,
                                    wasManuallyTaken: false,
                                    weatherEventId,
                                }), { qos: 2 });

                                if (weatherEventType === WeatherEventType.FLOOD) {
                                    console.log('Driving up Water Protection Wall at', location, 'due to creation of', weatherEvent);
                                    mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                        type: WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL,
                                        location,
                                        wasManuallyTaken: false,
                                        weatherEventId,
                                    }), { qos: 2 });
                                }

                                if (initialRiskLevel === WeatherEventRiskLevel.EXTREME) {
                                    console.log('Enabling Lockdown at', location, 'due to creation of ', weatherEvent);
                                    mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                        type: WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION,
                                        location,
                                        wasManuallyTaken: false,
                                        weatherEventId,
                                    }), { qos: 2 });
                                }
                            }
                        }
                    })
                    .catch(error => console.error('Data Service: Error persisting Weather Event Instance JSON data using Prisma: ', error));
            } else if (topic.startsWith(weatherEventRiskTopicPrefix)) {
                prisma.weatherEventRisk.upsert({ create: messageJSON, update: { end: messageJSON.end }, where: { weatherEventId_start: { weatherEventId: messageJSON.weatherEventId, start: messageJSON.start || timestamp } } })
                    .then(data => currentWebsocketConnections.forEach(socket => socket.emit(weatherEventRiskTopicPrefix, JSON.stringify(data))))
                    .catch(error => console.error('Data Service: Error persisting Weather Event Risk JSON data using Prisma: ', error));
            } else if (topic.startsWith(weatherEventActionTopicPrefix)) {
                const weatherEventAction = messageJSON;

                const { id: weatherEventActionId } = await prisma.weatherEventAction.create({ data: weatherEventAction })
                    .then(data => {
                        currentWebsocketConnections.forEach(socket => socket.emit(weatherEventActionTopicPrefix, JSON.stringify(data)));
                        return data;
                    })
                    .catch(error => console.error('Data Service: Error persisting Weather Event Action JSON data using Prisma: ', error));

                if (weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION || weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_REOPEN_LOCATION) {
                    const enabled = weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION;

                    prisma.actuatorMetaData.findMany({
                        select: { instanceId: true },
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.LOCKDOWN,
                        },
                        distinct: ['instanceId']
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled,
                                weatherEventActionId: weatherEventActionId,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location + '/' + ActuatorType.LOCKDOWN, JSON.stringify(newActuatorStatus)), { qos: 2 }); // will be persisted and sent via websosket when received in listener above
                    });
                } else if (weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL || weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_DRIVE_DOWN_WATER_PROTECTION_WALL) {
                    const enabled = weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL;

                    prisma.actuatorMetaData.findMany({
                        select: { instanceId: true },
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.WATER_PROTECTION_WALL,
                        },
                        distinct: ['instanceId']
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled,
                                weatherEventActionId: weatherEventActionId,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location + '/' + ActuatorType.WATER_PROTECTION_WALL, JSON.stringify(newActuatorStatus)), { qos: 2 });   // will be persisted and sent via websosket when received in listener above
                    });
                } else if (weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_LIGHT || weatherEventAction.type === WeatherEventActionType.STOP_ALERT_LOCALS_BY_LIGHT) {
                    const enabled = weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_LIGHT;
                    prisma.actuatorMetaData.findMany({
                        select: { instanceId: true },
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.ALARM_LIGHT,
                        },
                        distinct: ['instanceId']
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled,
                                weatherEventActionId: weatherEventActionId,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location + '/' + ActuatorType.ALARM_LIGHT, JSON.stringify(newActuatorStatus)), { qos: 2 });   // will be persisted and sent via websosket when received in listener above
                    });
                } else if (weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_SOUND || weatherEventAction.type === WeatherEventActionType.STOP_ALERT_LOCALS_BY_SOUND) {
                    const enabled = weatherEventAction.type === WeatherEventActionType.ALERT_LOCALS_BY_SOUND;
                    prisma.actuatorMetaData.findMany({
                        select: { instanceId: true },
                        where: {
                            location: weatherEventAction.location,
                            type: ActuatorType.ALARM_SOUND,
                        },
                        distinct: ['instanceId']
                    }).then(result => {
                        const newActuatorStatusData = result.map(item => {
                            return {
                                instanceId: item.instanceId,
                                timestamp,
                                enabled,
                                weatherEventActionId: weatherEventActionId,
                            };
                        });
                        newActuatorStatusData.forEach(newActuatorStatus => mqttClient.publish(actuatorStatusDataTopicPrefix + '/' + weatherEventAction.location + '/' + ActuatorType.ALARM_SOUND, JSON.stringify(newActuatorStatus)), { qos: 2 });   // will be persisted and sent via websosket when received in listener above
                    });
                } else if (weatherEventAction.type === WeatherEventActionType.PLANNING_INCREASE_RISK_LEVEL) {
                    const currentWeatherEventRisk = await prisma.weatherEventRisk.findFirst({
                        where: {
                            weatherEventId: weatherEventAction.weatherEventId,
                        },
                        orderBy: {
                            timestamp: 'desc',
                        }
                    });

                    let newWeatherEventRiskLevel = undefined;
                    if (currentWeatherEventRisk) {
                        if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.LOW) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.MEDIUM;
                        } else if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.MEDIUM) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.HIGH;
                        } else if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.HIGH) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.EXTREME;
                        } else if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.EXTREME) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.EXTREME;
                        }
                    } else {
                        newWeatherEventRiskLevel = WeatherEventRiskLevel.MEDIUM;
                    }

                    const newWeatherEventRisk = {
                        weatherEventId: weatherEventAction.weatherEventId,
                        riskLevel: newWeatherEventRiskLevel,
                    };

                    const updatedCurrentWeatherEventRisk = await prisma.weatherEventRisk.update({ where: { id: currentWeatherEventRisk.id }, data: { end: timestamp } });
                    currentWebsocketConnections.forEach(socket => socket.emit(weatherEventRiskTopicPrefix, JSON.stringify(updatedCurrentWeatherEventRisk)));

                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEventAction.location, JSON.stringify(newWeatherEventRisk), { qos: 2 });  // will be persisted and sent via websosket when received in listener above
                } else if (weatherEventAction.type === WeatherEventActionType.PLANNING_DECREASE_RISK_LEVEL) {
                    const currentWeatherEventRisk = await prisma.weatherEventRisk.findFirst({
                        where: {
                            weatherEventId: weatherEventAction.weatherEventId,
                        },
                        orderBy: [
                            {
                                start: 'desc',
                            },
                            {
                                end: 'desc',
                            },
                        ],
                    });

                    const updatedCurrentWeatherEventRisk = await prisma.weatherEventRisk.update({ where: { id: currentWeatherEventRisk.id }, data: { end: timestamp } });
                    currentWebsocketConnections.forEach(socket => socket.emit(weatherEventRiskTopicPrefix, JSON.stringify(updatedCurrentWeatherEventRisk)));

                    let newWeatherEventRiskLevel = undefined;
                    if (currentWeatherEventRisk) {
                        if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.LOW) {
                            const weatherEvent = await prisma.weatherEvent.findFirst({ where: { id: currentWeatherEventRisk.weatherEventId } });
                            const newWeatherEvent = { ...weatherEvent, end: timestamp };
                            mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + weatherEventAction.location, JSON.stringify(newWeatherEvent), { qos: 2 });  // will be persisted and sent via websosket when received in listener above
                            return;
                        } else if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.MEDIUM) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.LOW;
                        } else if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.HIGH) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.MEDIUM;
                        } else if (currentWeatherEventRisk.riskLevel === WeatherEventRiskLevel.EXTREME) {
                            newWeatherEventRiskLevel = WeatherEventRiskLevel.HIGH;
                        }
                    } else {
                        newWeatherEventRiskLevel = WeatherEventRiskLevel.LOW;
                    }

                    const newWeatherEventRisk = {
                        weatherEventId: weatherEventAction.weatherEventId,
                        riskLevel: newWeatherEventRiskLevel,
                    };

                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEventAction.location, JSON.stringify(newWeatherEventRisk), { qos: 2 });  // will be persisted and sent via websosket when received in listener above
                } else if (weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_RESPONSE) {
                    const { amount: moveUnitsFromLocationOldUnitsAmount } = await prisma.unitStatus.findFirst({
                        select: { amount: true },
                        where: { unitType: weatherEventAction.moveUnitsType, location: weatherEventAction.moveUnitsFromLocation },
                        orderBy: { timestamp: 'desc' }
                    });
                    const { amount: moveUnitsToLocationOldUnitsAmount } = await prisma.unitStatus.findFirst({
                        select: { amount: true },
                        where: { unitType: weatherEventAction.moveUnitsType, location: weatherEventAction.moveUnitsToLocation },
                        orderBy: { timestamp: 'desc' }
                    });

                    const newMoveFromLocationUnitStatusData = {
                        unitType: weatherEventAction.moveUnitsType,
                        location: weatherEventAction.moveUnitsFromLocation,
                        amount: moveUnitsFromLocationOldUnitsAmount - weatherEventAction.moveUnitsAmount,
                        weatherEventActionId: weatherEventActionId,
                    };
                    const newMoveToLocationUnitStatusData = {
                        unitType: weatherEventAction.moveUnitsType,
                        location: weatherEventAction.moveUnitsToLocation,
                        amount: moveUnitsToLocationOldUnitsAmount + weatherEventAction.moveUnitsAmount,
                        weatherEventActionId: weatherEventActionId,
                    };

                    mqttClient.publish(authoritiesUnitStatusTopicPrefix + '/' + weatherEventAction.moveUnitsFromLocation + '/' + weatherEventAction.moveUnitsType, JSON.stringify(newMoveFromLocationUnitStatusData), { qos: 2 });  // will be persisted and sent via websosket when received in listener above
                    mqttClient.publish(authoritiesUnitStatusTopicPrefix + '/' + weatherEventAction.moveUnitsToLocation + '/' + weatherEventAction.moveUnitsType, JSON.stringify(newMoveToLocationUnitStatusData), { qos: 2 });  // will be persisted and sent via websosket when received in listener above
                }
            }
        } catch (error) {
            console.error('Data Service: Error processing incoming MQTT message: ', error);
        }
    });
}

const startDetectWeatherEventsIntervalTask = async () => {
    const detectWeatherEvents = async () => {
        const sensorTelemetryData = {};
        const actuatorStatusData = {};
        const weatherEventRisks = {};

        for (let location of Object.values(Location)) {
            const isOutside = location !== Location.STUTTGART_VAIHINGEN_OFFICE;

            //console.log('Detecting Weather Events at', location, isOutside ? '(outside)' : '(inside)');

            const sensorTelemetryDataAtLocation = {};

            const temperatureSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.TEMPERATURE);
            const coSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.CO);
            const co2SensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.CO2);
            const humiditySensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.HUMIDITY);
            const pressureSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.PRESSURE);
            const vibrationSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.VIBRATION);
            const waterLevelSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.WATER_LEVEL);
            const windSpeedSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.WIND_SPEED);
            const lightSensorData = await getCurrentSensorTelemetryDataAtLocation(sensorTelemetryDataAtLocation, location, SensorMeasure.LIGHT);

            const actuatorStatusDataAtLocation = {};

            const protectionWallStatusData = await getCurrentActuatorStatusDataAtLocation(actuatorStatusDataAtLocation, location, ActuatorType.WATER_PROTECTION_WALL);
            const alarmLightStatusData = await getCurrentActuatorStatusDataAtLocation(actuatorStatusDataAtLocation, location, ActuatorType.ALARM_LIGHT);
            const alarmSoundStatusData = await getCurrentActuatorStatusDataAtLocation(actuatorStatusDataAtLocation, location, ActuatorType.ALARM_SOUND);
            const lockdownStatusData = await getCurrentActuatorStatusDataAtLocation(actuatorStatusDataAtLocation, location, ActuatorType.LOCKDOWN);

            const weatherEventRisksAtLocation = {};

            if (waterLevelSensorData) {
                if (waterLevelSensorData.value >= 1 && waterLevelSensorData.value < 2) {
                    weatherEventRisksAtLocation[WeatherEventType.FLOOD] = WeatherEventRiskLevel.LOW;
                } else if (waterLevelSensorData.value >= 2 && waterLevelSensorData.value < 3) {
                    weatherEventRisksAtLocation[WeatherEventType.FLOOD] = WeatherEventRiskLevel.MEDIUM;
                } else if (waterLevelSensorData.value >= 3 && waterLevelSensorData.value < 4) {
                    weatherEventRisksAtLocation[WeatherEventType.FLOOD] = WeatherEventRiskLevel.HIGH;
                } else if (waterLevelSensorData.value >= 4) {
                    weatherEventRisksAtLocation[WeatherEventType.FLOOD] = WeatherEventRiskLevel.EXTREME; 
                }
            }

            if (temperatureSensorData) {
                if (temperatureSensorData.value <= 1) {
                    weatherEventRisksAtLocation[WeatherEventType.COLD] = WeatherEventRiskLevel.MEDIUM;
                } else if (temperatureSensorData.value >= 30 && temperatureSensorData.value < 100) {
                    weatherEventRisksAtLocation[WeatherEventType.HEAT] = WeatherEventRiskLevel.LOW;
                } else if (temperatureSensorData.value >= 37 && temperatureSensorData.value <= 100) {
                    if (isOutside) {
                        if (humiditySensorData && humiditySensorData.value < 30) {
                            weatherEventRisksAtLocation[WeatherEventType.WILD_FIRE] = WeatherEventRiskLevel.HIGH;
                        } else {
                            weatherEventRisksAtLocation[WeatherEventType.WILD_FIRE] = WeatherEventRiskLevel.MEDIUM;
                        }
                    } else {
                        if (temperatureSensorData.value > 50) {
                            weatherEventRisksAtLocation[WeatherEventType.HEAT] = WeatherEventRiskLevel.HIGH;
                        } else {
                            weatherEventRisksAtLocation[WeatherEventType.HEAT] = WeatherEventRiskLevel.MEDIUM;
                        }
                    }
                } else if (temperatureSensorData.value > 100) {
                    if (isOutside) {
                        weatherEventRisksAtLocation[WeatherEventType.WILD_FIRE] = WeatherEventRiskLevel.EXTREME;
                    } else {
                        weatherEventRisksAtLocation[WeatherEventType.HEAT] = WeatherEventRiskLevel.EXTREME;
                    }
                }
            }

            if (windSpeedSensorData) {
                if (windSpeedSensorData.value >= 12 && windSpeedSensorData.value < 74) {
                    if (pressureSensorData && pressureSensorData.value < 990) {
                        if (temperatureSensorData && temperatureSensorData.value <= 1) {
                            weatherEventRisksAtLocation[WeatherEventType.HAIL_STORM] = WeatherEventRiskLevel.HIGH;
                        } else if (lightSensorData && lightSensorData.value > 70) {
                            weatherEventRisksAtLocation[WeatherEventType.THUNDER_STORM] = WeatherEventRiskLevel.HIGH;
                        } else {
                            weatherEventRisksAtLocation[WeatherEventType.STORM] = WeatherEventRiskLevel.HIGH;
                        }
                    } else {
                        if (temperatureSensorData && temperatureSensorData.value <= 1) {
                            weatherEventRisksAtLocation[WeatherEventType.HAIL_STORM] = WeatherEventRiskLevel.MEDIUM;
                        } else if (lightSensorData && lightSensorData.value > 70) {
                            weatherEventRisksAtLocation[WeatherEventType.THUNDER_STORM] = WeatherEventRiskLevel.MEDIUM;
                        } else {
                            weatherEventRisksAtLocation[WeatherEventType.STORM] = WeatherEventRiskLevel.MEDIUM;
                        }
                    }
                } else if (windSpeedSensorData.value >= 74) {
                    if (temperatureSensorData && temperatureSensorData.value <= 1) {
                        weatherEventRisksAtLocation[WeatherEventType.HAIL_STORM] = WeatherEventRiskLevel.EXTREME;
                    } else if (lightSensorData && lightSensorData.value > 70) {
                        weatherEventRisksAtLocation[WeatherEventType.THUNDER_STORM] = WeatherEventRiskLevel.EXTREME;
                    } else {
                        weatherEventRisksAtLocation[WeatherEventType.STORM] = WeatherEventRiskLevel.EXTREME;
                    }
                }
            }

            if (vibrationSensorData) {
                if (vibrationSensorData.value >= 2 && vibrationSensorData.value < 3) {
                    weatherEventRisksAtLocation[WeatherEventType.EARTH_QUAKE] = WeatherEventRiskLevel.LOW;
                } else if (vibrationSensorData.value >= 3 && vibrationSensorData.value < 4) {
                    weatherEventRisksAtLocation[WeatherEventType.EARTH_QUAKE] = WeatherEventRiskLevel.MEDIUM;
                } else if (vibrationSensorData.value >= 4 && vibrationSensorData.value < 5) {
                    weatherEventRisksAtLocation[WeatherEventType.EARTH_QUAKE] = WeatherEventRiskLevel.HIGH;
                } else if (vibrationSensorData.value >= 5 && vibrationSensorData.value < 6) {
                    weatherEventRisksAtLocation[WeatherEventType.EARTH_QUAKE] = WeatherEventRiskLevel.EXTREME;
                }
            }

            if (co2SensorData) {
                if (co2SensorData.value >= 800 && co2SensorData.value < 1400) {
                    updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.MEDIUM);
                } else if (co2SensorData.value >= 1400 && co2SensorData.value < 30000) {
                    updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.HIGH);
                } else if (co2SensorData.value >= 30000) {
                    if (isOutside) {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.WILD_FIRE, WeatherEventRiskLevel.EXTREME);
                    } else {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.EXTREME);
                    }
                }
            }

            if (coSensorData) {
                if (isOutside) {
                    if (coSensorData.value >= 100 && coSensorData.value < 200) {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.LOW);
                    } else if (coSensorData >= 300) {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.WILD_FIRE, WeatherEventRiskLevel.HIGH);
                    }
                } else {
                    if (coSensorData.value >= 10 && coSensorData.value < 100) {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.MEDIUM);
                    } else if (coSensorData.value >= 100 && coSensorData.value < 300) {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.HIGH);
                    } else if (coSensorData.value >= 300) {
                        updateRiskIfHigher(weatherEventRisksAtLocation, WeatherEventType.BAD_AIR, WeatherEventRiskLevel.EXTREME);
                    }
                }
            }

            const weatherEventTypesAtLocation = Object.keys(weatherEventRisksAtLocation);
            let newWeatherEventTypesAtLocation = weatherEventTypesAtLocation;

            const timestamp = dayjs().toISOString();

            const currentWeatherEventsAtLocation = await prisma.weatherEvent.findMany({
                where: {
                    location,
                    end: null,
                }
            });

            for (let weatherEvent of currentWeatherEventsAtLocation) {
                const weatherEventId = weatherEvent.id;

                if (!weatherEventTypesAtLocation.includes(weatherEvent.type)) {
                    // End current weather event that does not exist anymore

                    console.log('- Ending weather event', weatherEvent);

                    const currentRisk = await prisma.weatherEventRisk.findFirst({
                        where: { weatherEventId },
                        orderBy: [{ start: 'desc' }, { end: 'desc' }]
                    });
                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + weatherEvent.location, JSON.stringify({
                        ...currentRisk,
                        end: timestamp,
                    }), { qos: 2 });

                    mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + weatherEvent.location, JSON.stringify({
                        ...weatherEvent,
                        end: timestamp,
                    }), { qos: 2 });

                    // if there is no high or extreme risk event at this location anymore, disable alarm light and sound again
                    if (!Object.values(weatherEventRisksAtLocation).some(r => r === WeatherEventRiskLevel.HIGH || r === WeatherEventRiskLevel.EXTREME)) {
                        if (alarmLightStatusData && alarmLightStatusData.enabled) {
                            console.log('Disabling Alarm Light again at', location, 'due to end of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.STOP_ALERT_LOCALS_BY_LIGHT,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                        if (alarmSoundStatusData && alarmSoundStatusData.enabled) {
                            console.log('Disabling Alarm Sound again at', location, 'due to end of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.STOP_ALERT_LOCALS_BY_SOUND,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                    }

                    // if there is no extreme risk event at this location anymore, disable lockdown again
                    if (!Object.values(weatherEventRisksAtLocation).some(r => r === WeatherEventRiskLevel.EXTREME) && lockdownStatusData && lockdownStatusData.enabled) {
                        console.log('Disabling Lockdown again at', location, 'due to end of', weatherEvent);
                        mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                            type: WeatherEventActionType.COUNTER_MEASURE_REOPEN_LOCATION,
                            location,
                            wasManuallyTaken: false,
                            weatherEventId,
                        }), { qos: 2 });
                    }

                    // if there is no more >= high risk for flood at location and protection wall is up, drive it down again
                    if (weatherEvent.type === WeatherEventType.FLOOD
                        && protectionWallStatusData && protectionWallStatusData.enabled
                        && (!weatherEventRisksAtLocation[WeatherEventType.FLOOD]
                            || weatherEventRisksAtLocation[WeatherEventType.FLOOD] === WeatherEventRiskLevel.LOW
                            || weatherEventRisksAtLocation[WeatherEventType.FLOOD] == WeatherEventRiskLevel.MEDIUM)) {
                        console.log('Driving down Water Protection Wall again at', location, 'due to end of', weatherEvent);
                        mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                            type: WeatherEventActionType.COUNTER_MEASURE_DRIVE_DOWN_WATER_PROTECTION_WALL,
                            location,
                            wasManuallyTaken: false,
                            weatherEventId,
                        }), { qos: 2 });
                    }

                } else {
                    // Update existing weather event that still exists by updating current risk and creating new risk

                    const newRiskLevel = weatherEventRisksAtLocation[weatherEvent.type];

                    newWeatherEventTypesAtLocation = newWeatherEventTypesAtLocation.filter(t => t !== weatherEvent.type);

                    const currentRisk = await prisma.weatherEventRisk.findFirst({
                        where: { weatherEventId },
                        orderBy: [{ start: 'desc' }, { end: 'desc' }]
                    });

                    if (currentRisk.riskLevel === newRiskLevel) {
                        //console.log('- Not updating weather event because it stayed the same', weatherEvent, newRiskLevel);
                        continue;
                    }

                    console.log('- Updating weather event risk ', weatherEvent, newRiskLevel);

                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + location, JSON.stringify({
                        ...currentRisk,
                        end: timestamp,
                    }), { qos: 2 });

                    mqttClient.publish(weatherEventRiskTopicPrefix + '/' + location, JSON.stringify({
                        weatherEventId,
                        riskLevel: newRiskLevel,
                    }), { qos: 2 });

                    if (newRiskLevel === WeatherEventRiskLevel.HIGH || newRiskLevel === WeatherEventRiskLevel.EXTREME) {
                        if (alarmLightStatusData && !alarmLightStatusData.enabled) {
                            console.log('Enabling Alarm Light at', location, 'due to update of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.ALERT_LOCALS_BY_LIGHT,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                        if (alarmSoundStatusData && !alarmSoundStatusData.enabled) {
                            console.log('Enabling Alarm Sound at', location, 'due to update of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.ALERT_LOCALS_BY_SOUND,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                        if (weatherEvent.type === WeatherEventType.FLOOD && protectionWallStatusData && !protectionWallStatusData.enabled) {
                            console.log('Driving up Water Protection Wall at', location, 'due to update of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                        if (newRiskLevel === WeatherEventRiskLevel.EXTREME && lockdownStatusData && !lockdownStatusData.enabled) {
                            console.log('Enabling Lockdown at', location, 'due to update of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.COUNTER_MEASURE_LOCK_DOWN_LOCATION,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                    } else {
                        if (!Object.values(weatherEventRisksAtLocation).some(r => r === WeatherEventRiskLevel.HIGH || r === WeatherEventRiskLevel.EXTREME)) {
                            if (alarmLightStatusData && alarmLightStatusData.enabled) {
                                console.log('Disabling Alarm Light again at', location, 'due to update of', weatherEvent);
                                mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                    type: WeatherEventActionType.STOP_ALERT_LOCALS_BY_LIGHT,
                                    location,
                                    wasManuallyTaken: false,
                                    weatherEventId,
                                }), { qos: 2 });
                            }
                            if (alarmSoundStatusData && alarmSoundStatusData.enabled) {
                                console.log('Disabling Alarm Sound again at', location, 'due to update of', weatherEvent);
                                mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                    type: WeatherEventActionType.STOP_ALERT_LOCALS_BY_SOUND,
                                    location,
                                    wasManuallyTaken: false,
                                    weatherEventId,
                                }), { qos: 2 });
                            }
                        }

                        // if there is no more extreme risk and lockdown is enabled, reopen location
                        if (!Object.values(weatherEventRisksAtLocation).some(r => r === WeatherEventRiskLevel.EXTREME) && lockdownStatusData && lockdownStatusData.enabled) {
                            console.log('Disabling Lockdown again at', location, 'due to update of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.COUNTER_MEASURE_REOPEN_LOCATION,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }

                        // if there is no more >= high risk for flood at location and protection wall is up, drive it down again
                        if (weatherEvent.type === WeatherEventType.FLOOD
                            && protectionWallStatusData && protectionWallStatusData.enabled
                            && (!weatherEventRisksAtLocation[WeatherEventType.FLOOD]
                                || weatherEventRisksAtLocation[WeatherEventType.FLOOD] === WeatherEventRiskLevel.LOW
                                || weatherEventRisksAtLocation[WeatherEventType.FLOOD] == WeatherEventRiskLevel.MEDIUM)) {
                            console.log('Driving down Water Protection Wall again at', location, 'due to update of', weatherEvent);
                            mqttClient.publish(weatherEventActionTopicPrefix + '/' + location, JSON.stringify({
                                type: WeatherEventActionType.COUNTER_MEASURE_DRIVE_DOWN_WATER_PROTECTION_WALL,
                                location,
                                wasManuallyTaken: false,
                                weatherEventId,
                            }), { qos: 2 });
                        }
                    }
                }
            }

            for (let type of newWeatherEventTypesAtLocation) {
                // Create new weather events at this location
                const initialRiskLevel = weatherEventRisksAtLocation[type];
                console.log('- Creating weather event of type', type, 'with risk', initialRiskLevel);
                mqttClient.publish(weatherEventInstanceTopicPrefix + '/' + location, JSON.stringify({ location, type, initialRiskLevel }), { qos: 2 });
            }

            sensorTelemetryData[location] = sensorTelemetryDataAtLocation;
            actuatorStatusData[location] = actuatorStatusDataAtLocation;
            weatherEventRisks[location] = weatherEventRisksAtLocation;
        }
    };

    setInterval(detectWeatherEvents, 5000); // every ~ 5 seconds
};

const pddlSolverFileName = "../ai-planner/enhsp20-0.9.4/enhsp.jar";
const pddlDomainFileName = "../ai-planner/PDDL/domain.pddl";
const pddlProblemTemplateFileContent = readFileSync("../ai-planner/PDDL/problem_template.pddl").toString();
const pddlSearchStrategy = "WAStar"; 

let previousPddlPlan = "";

const startAuthoritiesUnitAIPlannerIntervalTask = async () => {
    const runAIPlanner = async () => {
        const timestamp = dayjs().toISOString();

        const generateProblemFileContent = async () => {
            // Locations with Predicates
            const locations = Object.values(Location).map(l => l.toLowerCase()).join(" ");
            const hub = "\n        (is-hub " + Location.AUTHORITIES_HUB.toLowerCase() + ")";

            // Units with Predicates

            const unitsAtLocations = await getCurrentUnitStatusData();

            let units = "";
            let unitTypes = "";
            let unitPositions = "";

            let goalUnitsPerformedActions = "";

            let totalUnitsAmount = 0;
            let unitsAtHub = 0;

            for (const unitType of Object.values(UnitType)) {
                let unitId = 1;

                let unitTypeName = unitType.toLowerCase();

                for (const location of Object.values(Location)) {
                    for (let i = 0; i < unitsAtLocations[unitType][location]; i++) {
                        const unitName = unitType.toLowerCase() + "-" + unitId;
                        units += (units.length > 0 ? " " : "") + unitName;
                        unitTypes += "\n        (is-" + unitTypeName.replace("_", "-") + " " + unitName + ")";
                        unitPositions += "\n        (is-unit-at " + unitName + " " + location.toLowerCase() + ")";
                        goalUnitsPerformedActions += "\n            (unit-performed-action " + unitName + ")";
                        unitId++;

                        totalUnitsAmount++; 
                        if (location === Location.AUTHORITIES_HUB) {
                            unitsAtHub++;
                        }
                    }
                }
            }

            unitPositions += "\n        (= (units-at-hub) " + unitsAtHub + ")";

            // Weather Events with Predicates

            const weatherEventTypes = Object.values(WeatherEventType).map(w => w.toLowerCase()).join(" ");
            let weatherEvents = "";

            let metricToMinimize = "";
            let weatherEventsAmount = 0;

            for (const location of Object.values(Location)) {
                weatherEvents += "\n\n        ;    - at " + location.toLowerCase();

                let needsUnitsOfTypesAtLocation = new Set();

                const weatherEventWithCurrentRisksAtLocationData = await prisma.weatherEvent.findMany({
                    where: {
                        location,
                        end: null
                    },
                    orderBy: {
                        start: 'desc'
                    },
                    include: {
                        WeatherEventRisk: {
                            orderBy: {
                                start: 'desc'
                            },
                            take: 1,
                        }
                    }
                });

                for (let weatherEventData of weatherEventWithCurrentRisksAtLocationData) {
                    const weatherEventType = weatherEventData.type;

                    const currentRiskLevel = weatherEventData['WeatherEventRisk'][0].riskLevel;
                    const currentRiskLevelNumeric = convertRiskLevelToNumber(currentRiskLevel);

                    weatherEvents += "\n        (is-weather-event-at " + weatherEventType.toLowerCase() + " " + location.toLowerCase() + ")";
                    weatherEvents += "\n        (= (current-risk " + weatherEventType.toLowerCase() + " " + location.toLowerCase() + ") " + currentRiskLevelNumeric + ")";

                    if (weatherEventsAmount === 0) {
                        metricToMinimize = "\n        (current-risk " + weatherEventType.toLowerCase() + " " + location.toLowerCase() + ")";
                    } else {
                        metricToMinimize = "\n        (+ " + metricToMinimize + " (current-risk " + weatherEventType.toLowerCase() + " " + location.toLowerCase() + ") )";
                    }
                    weatherEventsAmount++;

                    if (currentRiskLevel !== WeatherEventRiskLevel.HIGH && currentRiskLevel !== WeatherEventRiskLevel.EXTREME) {
                        continue;
                    }

                    if (weatherEventType === WeatherEventType.BAD_AIR
                        || weatherEventType === WeatherEventType.FLOOD) {
                        needsUnitsOfTypesAtLocation.add(UnitType.POLICE_CAR.toLowerCase());
                        needsUnitsOfTypesAtLocation.add(UnitType.FIRE_TRUCK.toLowerCase());
                        needsUnitsOfTypesAtLocation.add(UnitType.AMBULANCE.toLowerCase());
                    } else if (weatherEventType === WeatherEventType.COLD
                        || weatherEventType === WeatherEventType.HEAT) {
                        needsUnitsOfTypesAtLocation.add(UnitType.POLICE_CAR.toLowerCase());
                        needsUnitsOfTypesAtLocation.add(UnitType.AMBULANCE.toLowerCase());
                    } else if (weatherEventType === WeatherEventType.EARTH_QUAKE
                        || weatherEventType === WeatherEventType.HAIL_STORM
                        || weatherEventType === WeatherEventType.STORM
                        || weatherEventType === WeatherEventType.THUNDER_STORM
                        || weatherEventType === WeatherEventType.WILD_FIRE) {
                        needsUnitsOfTypesAtLocation.add(UnitType.POLICE_CAR.toLowerCase());
                        needsUnitsOfTypesAtLocation.add(UnitType.FIRE_TRUCK.toLowerCase());
                    }
                }

                for (let unitType of [...needsUnitsOfTypesAtLocation].sort()) {
                    weatherEvents += "\n        (needs-" + unitType.replace("_", "-") + "-at " + location.toLowerCase() + ")";
                }
            }

            // Metric to minimize
            if (weatherEventsAmount === 0) {
                metricToMinimize = "\n        (units-at-hub)";
            } else {
                metricToMinimize = "\n        (+ (* " + totalUnitsAmount + " " + metricToMinimize + " ) (units-at-hub)\n        )";
            }

            return pddlProblemTemplateFileContent
                .replace("{{units}}", units)
                .replace("{{locations}}", locations)
                .replace("{{weatherEventTypes}}", weatherEventTypes)
                .replace("{{hub}}", hub)
                .replace("{{unitTypes}}", unitTypes)
                .replace("{{unitPositions}}", unitPositions)
                .replace("{{weatherEvents}}", weatherEvents)
                .replace("{{goalUnitsPerformedActions}}", goalUnitsPerformedActions)
                .replace("{{metricToMinimize}}", metricToMinimize);
        };

        const pddlProblemFileContent = await generateProblemFileContent();
        const pddlProblemFileName = '../ai-planner/PDDL/generated/problem_' + timestamp.replaceAll(':', '-') + '.pddl';

        writeFile(pddlProblemFileName, pddlProblemFileContent, async (err) => {
            if (err) {
                console.error('Error saving generated PDDL problem file as ' + pddlProblemFileName, err)
            } else {
                console.log('AI Planner: Generated current problem file. Saved as', pddlProblemFileName);

                console.log('AI Planner: Executing ENHSP PDDL solver on domain and current problem file..');

                exec('java -jar ' + pddlSolverFileName + ' -o ' + pddlDomainFileName + ' -f ' + pddlProblemFileName + ' -s ' + pddlSearchStrategy, async (err, stdout, stderr) => {
                    if (err) {
                        console.log('AI Planner: Error executing ENHSP PDDL solver:', err, stderr);
                        return;
                    }

                    if (stdout.includes('Found Plan:')) {
                        const plan = stdout.split('Found Plan:')[1].split('Plan-Length:')[0].trim();
                       
                        console.log('AI Planner: Found plan:\n', plan);

                        const pddlSolutionPlanFileName = '../ai-planner/PDDL/generated/solution_plan_' + timestamp.replaceAll(':', '-') + '.txt';
                        await writeFile(pddlSolutionPlanFileName, plan, async (err) => {
                            if (err) {
                                console.error('Error saving PDDL solution plan ' + plan + ' file as ' + pddlSolutionPlanFileName, err)
                            } else {
                                console.log('AI Planner: Saved plan as', pddlSolutionPlanFileName);
                            }
                        });

                        if(previousPddlPlan === plan) {
                            console.log('      -> No changes, do nothing');
                            return;
                        }

                        previousPddlPlan = plan;

                        const moveUnitsRequests = [];

                        for(let line of plan.split(/\r?\n/)) {
                            const actionParts = line.split(": ")[1].replace("(", "").replace(")", "").split(" ");
                            const actionName = actionParts[0];
                            
                            let moveUnitsType, moveUnitsFromLocation, moveUnitsToLocation, weatherEventId = undefined;

                            if(actionName === 'return-to-hub') {
                                moveUnitsType = actionParts[1].split("-")[0].toUpperCase();
                                moveUnitsFromLocation = actionParts[2].toUpperCase();
                                moveUnitsToLocation = actionParts[3].toUpperCase();
                            } else if(actionName === 'move-to-event-location') {
                                moveUnitsType = actionParts[1].split("-")[0].toUpperCase();
                                moveUnitsFromLocation = actionParts[2].toUpperCase();
                                moveUnitsToLocation = actionParts[3].toUpperCase();
                                
                                const weatherEventType = actionParts[4].toUpperCase();
                                const weatherEvent = await prisma.weatherEvent.findFirst({ 
                                    where: { type: weatherEventType, end: null, location: moveUnitsToLocation },  
                                    orderBy: { start: 'desc' } 
                                });
                                weatherEventId = weatherEvent.id;
                            } else {
                                continue;
                            }            
                            
                            const currentEntry = moveUnitsRequests.find(r => 
                                r['moveUnitsType'] === moveUnitsType 
                                && r['moveUnitsFromLocation'] === moveUnitsFromLocation
                                && r['moveUnitsToLocation'] === moveUnitsToLocation
                                && r['weatherEventId'] === weatherEventId
                            );

                            if(currentEntry) {
                                currentEntry['moveUnitsAmount'] += 1;
                            } else {
                                moveUnitsRequests.push({
                                    moveUnitsType,
                                    moveUnitsFromLocation,
                                    moveUnitsToLocation,
                                    weatherEventId,
                                    moveUnitsAmount: 1,
                                });
                            }
                        }

                        console.log("AI Planner: Executing plan..");

                        for(let moveUnitsRequest of moveUnitsRequests) {
                            const existingRequestsAndResponses = await prisma.weatherEventAction.findMany({
                                where: { 
                                    weatherEventId: moveUnitsRequest.weatherEventId, 
                                    moveUnitsFromLocation: moveUnitsRequest.moveUnitsFromLocation,
                                    moveUnitsToLocation: moveUnitsRequest.moveUnitsToLocation,
                                    moveUnitsAmount: moveUnitsRequest.moveUnitsAmount,
                                    timestamp: {
                                        gte: dayjs().subtract(3, 'minute').toDate(),
                                    } 
                                },
                                orderBy: {
                                    timestamp: 'desc'
                                }
                            });

                            let shouldCreateNewRequest = true;
                            if(moveUnitsRequest.weatherEventId) {
                                for(let requestOrResponse of existingRequestsAndResponses) {
                                    if(requestOrResponse.type === WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_RESPONSE) {
                                        // same request exists but it was already responsed -> this one is a new request
                                        shouldCreateNewRequest = true;
                                        break;
                                    } else if(requestOrResponse.type === WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_REQUEST) {
                                        // same request exists unresponded -> no need for new request
                                        shouldCreateNewRequest = false;
                                        break; 
                                    }
                                } 
                            }

                            if(shouldCreateNewRequest) {
                                console.log("AI Planner: Creating new move units request..");
                                mqttClient.publish(weatherEventActionTopicPrefix + '/' + moveUnitsRequest.moveUnitsToLocation, JSON.stringify({
                                    ...moveUnitsRequest,
                                    type: WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_REQUEST,
                                    location: moveUnitsRequest.moveUnitsToLocation,
                                    wasManuallyTaken: false,
                                }), { qos: 2 });
                            }
                        }
                    } else {
                        console.log('AI Planner: No plan was found.');
                    }
                });
            }
        });
    };

    setInterval(runAIPlanner, 32000); // every ~ 32 seconds
};

const convertRiskLevelToNumber = (riskLevel) => {
    if (riskLevel === WeatherEventRiskLevel.LOW) {
        return 1;
    } else if (riskLevel === WeatherEventRiskLevel.MEDIUM) {
        return 2;
    } else if (riskLevel === WeatherEventRiskLevel.HIGH) {
        return 3;
    } else if (riskLevel === WeatherEventRiskLevel.EXTREME) {
        return 4;
    } else {
        return 0;
    }
}

const updateRiskIfHigher = (weatherEventRisks, weatherEventType, newRisk) => {
    let shouldUpdate = (!weatherEventRisks[weatherEventType])
        || (weatherEventRisks[weatherEventType] === WeatherEventRiskLevel.LOW && newRisk !== WeatherEventRiskLevel.LOW)
        || (weatherEventRisks[weatherEventType] === WeatherEventRiskLevel.MEDIUM && newRisk !== WeatherEventRiskLevel.LOW && newRisk !== WeatherEventRiskLevel.MEDIUM)
        || (weatherEventRisks[weatherEventType] === WeatherEventRiskLevel.HIGH && newRisk === WeatherEventRiskLevel.EXTREME);

    if (shouldUpdate) {
        weatherEventRisks[weatherEventType] = newRisk;
    }
};

const getCurrentUnitStatusData = async () => {
    const locationAndUnitTypesProcessed = new Set([]);

    const data = await prisma.unitStatus.findMany({
        orderBy: [
            {
                location: 'desc',
            },
            {
                unitType: 'desc',
            },
            {
                timestamp: 'desc',
            }
        ],
    });

    const unitsAtLocations = {};

    data.forEach((unitStatus) => {
        if (locationAndUnitTypesProcessed.has(unitStatus.location + '_' + unitStatus.unitType)) { // only choose most recent entries for each pair
            return;
        }
        locationAndUnitTypesProcessed.add(unitStatus.location + '_' + unitStatus.unitType);

        if (!unitsAtLocations[unitStatus.unitType]) {
            unitsAtLocations[unitStatus.unitType] = {};
        }
        unitsAtLocations[unitStatus.unitType][unitStatus.location] = unitStatus.amount;
    });

    return unitsAtLocations;
};

const getCurrentSensorTelemetryDataAtLocation = async (sensorTelemetryDataAtLocation, location, measure) => {
    const telemetryData = await prisma.sensorTelemetryData.findFirst({
        where: {
            sensor: {
                SensorMetaData: {
                    some: {
                        location,
                        measure
                    }
                }
            }
        },
        orderBy: {
            'timestamp': 'desc'
        }
    });
    sensorTelemetryDataAtLocation[measure] = telemetryData;
    return telemetryData;
}

const getCurrentActuatorStatusDataAtLocation = async (actuatorStatusDataAtLocation, location, type) => {
    const statusData = await prisma.actuatorStatusData.findFirst({
        where: {
            actuator: {
                ActuatorMetaData: {
                    some: {
                        location,
                        type
                    }
                }
            }
        },
        orderBy: {
            'timestamp': 'desc'
        }
    });
    actuatorStatusDataAtLocation[type] = statusData;
    return statusData;
}