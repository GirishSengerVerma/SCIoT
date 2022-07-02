import { io } from 'socket.io-client';

import { actuatorMetaData, actuators, actuatorStatusData } from '$root/stores/actuatorStores';
import type {
	Actuator,
	ActuatorStatusData,
	ActuatorMetaData,
	Sensor,
	SensorMetaData,
	SensorTelemetryData
} from '@prisma/client';
import { sensors, liveSensorData, sensorMetaData } from '$root/stores/sensorStores';

const actuatorInstanceTopicPrefix = 'actuators/instance';
const actuatorStatusTopicPrefix = 'actuators/statusdata';
const actuatorMetadataTopicPrefix = 'actuators/metadata';

const sensorInstanceTopicPrefix = 'sensors/instance';
const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

export const SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC = 'requestHistoricSensorData';
export const SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC = 'responseHistoricSensorData';

export const SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC =
	'requestHistoricActuatorStatusData';
export const SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC =
	'responseHistoricActuatorStatusData';

export const socket = io();

socket.on(sensorInstanceTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		sensors.add(messageJSON as Sensor);
	} catch (error) {
		console.error('Web App: Error processing incoming Sensor Instance Socket IO message: ', error);
	}
});

socket.on(sensorTelemetryTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		liveSensorData.addValue(messageJSON as SensorTelemetryData);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Sensor Telemetry Data Socket IO message: ',
			error
		);
	}
});

socket.on(sensorMetadataTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		sensorMetaData.addValue(messageJSON as SensorMetaData);
	} catch (error) {
		console.error('Web App: Error processing incoming Sensor MetaData Socket IO message: ', error);
	}
});

socket.on(actuatorInstanceTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		actuators.add(messageJSON as Actuator);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Actuator Instance Socket IO message: ',
			error
		);
	}
});

socket.on(actuatorStatusTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		actuatorStatusData.addValue(messageJSON as ActuatorStatusData);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Actuator Status Data Socket IO message: ',
			error
		);
	}
});

socket.on(actuatorMetadataTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		actuatorMetaData.addValue(messageJSON as ActuatorMetaData);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Actuator MetaData Socket IO message: ',
			error
		);
	}
});
