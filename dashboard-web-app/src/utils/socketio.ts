import { io } from 'socket.io-client';

import { actuatorMetaData, actuators, actuatorStatusData } from '$root/stores/actuatorStores';
import type {
	Actuator,
	ActuatorStatusData,
	ActuatorMetaData,
	Sensor,
	SensorMetaData,
	SensorTelemetryData,
	UnitStatus,
	WeatherEvent,
	WeatherEventRisk
} from '@prisma/client';
import { sensors, liveSensorData, sensorMetaData } from '$root/stores/sensorStores';
import { authoritiesUnitStatus } from '$root/stores/authoritiesStores';
import { currentWeatherEventRisk, weatherEvents } from '$root/stores/weatherEventStores';
import { get } from 'svelte/store';

const weatherEventInstanceTopicPrefix = 'weatherevents/instance';
const weatherEventRiskTopicPrefix = 'weatherevents/risk';
export const weatherEventActionTopicPrefix = 'weatherevents/action';

const actuatorInstanceTopicPrefix = 'actuators/instance';
const actuatorStatusTopicPrefix = 'actuators/statusdata';
const actuatorMetadataTopicPrefix = 'actuators/metadata';

const sensorInstanceTopicPrefix = 'sensors/instance';
const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

const authoritiesUnitStatusTopicPrefix = 'authorities/unitstatus';

export const SOCKET_REQUEST_HISTORIC_WEATHER_EVENT_DATA_TOPIC = 'requestHistoricWeatherEventData';
export const SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC = 'responseHistoricWeatherEventData';
export const SOCKET_REQUEST_CHANGE_WEATHER_EVENT_RISK_LEVEL_TOPIC = 'requestChangeWeatherEventRiskLevel';
export const SOCKET_REQUEST_MANUALLY_TAKE_WEATHER_EVENT_ACTION_TOPIC = 'requestManuallyTakeWeatherEventAction';

export const SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC = 'requestHistoricSensorData';
export const SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC = 'responseHistoricSensorData';

export const SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC = 'requestHistoricActuatorStatusData';
export const SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC = 'responseHistoricActuatorStatusData';
export const SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC = 'requestManuallyChangeActuatorStatus';

export const SOCKET_REQUEST_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC = 'requestHistoricAuthoritiesUnitStatusData';
export const SOCKET_RESPONSE_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC = 'responseHistoricAuthoritiesUnitStatusData';
export const SOCKET_REQUEST_MANUALLY_MOVE_AUTHORITIES_UNITS_TOPIC = 'requestManuallyMoveAuthoritiesUnits';

export const socket = io();

socket.on(weatherEventInstanceTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		weatherEvents.add(messageJSON as WeatherEvent);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Weather Event Instance Socket IO message: ',
			error
		);
	}
});

socket.on(weatherEventRiskTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		currentWeatherEventRisk.addValue(messageJSON as WeatherEventRisk);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Weather Event Risk Socket IO message: ',
			error
		);
	}
});

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

socket.on(authoritiesUnitStatusTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		authoritiesUnitStatus.setStatus(messageJSON as UnitStatus);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Authorities UnitStatus Socket IO message: ',
			error
		);
	}
});
