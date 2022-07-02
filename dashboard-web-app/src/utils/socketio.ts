import { io } from 'socket.io-client';

export const SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC = 'requestHistoricSensorData';
export const SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC = 'responseHistoricSensorData';

export const socket = io();
