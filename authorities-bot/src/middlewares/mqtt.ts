import * as mqtt from 'mqtt';
import { Context } from 'telegraf';

if (!process.env.MQTT_HOST) {
  throw 'MQTT_HOST Environment Variable is not set!';
}

if (!process.env.MQTT_USERNAME) {
  throw 'MQTT_USERNAME Environment Variable is not set!';
}

if (!process.env.MQTT_PASSWORD) {
  throw 'MQTT_PASSWORD Environment Variable is not set!';
}

const host = process.env.MQTT_HOST;

const options = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

console.log(
  'MQTT Client: Connecting to MQTT broker over secure MQTT connection..'
);

export const moveUnitsRequestTopicName = 'authorities/moveunits/request';
export const moveUnitsResponseTopicName = 'authorities/moveunits/response';

const mqttClient = mqtt.connect(host, options);

mqttClient.on('error', (err) => {
  console.log('MQTT Client: Connection error: ', err);
  mqttClient.end();
});

mqttClient.on('reconnect', () => {
  console.log('MQTT Client: Reconnecting...');
});

mqttClient.on('connect', () => {
  console.log('MQTT Client: Connected.');

  mqttClient.subscribe(moveUnitsRequestTopicName, { qos: 0 });
});

export const listenToMQTTMessages = (
  ctx: Context,
  next: () => Promise<void>
) => {
  mqttClient.on('message', async function (topic, message) {
    try {
      const messageJSON = JSON.parse(message.toString());

      if (
        topic.startsWith(moveUnitsRequestTopicName) &&
        messageJSON.hasOwnProperty('weatherEvent') &&
        messageJSON.hasOwnProperty('moveUnitsType') &&
        messageJSON.hasOwnProperty('moveUnitsAmount') &&
        messageJSON.hasOwnProperty('moveUnitsFromLocation') &&
        messageJSON.hasOwnProperty('moveUnitsToLocation')
      ) {
        const {
          weatherEvent: { id, location, type },
          moveUnitsType,
          moveUnitsAmount,
          moveUnitsFromLocation,
          moveUnitsToLocation,
        } = messageJSON;

        await ctx.reply('🚨 New Move Units Request: 🚨\n\n'); // TODO AB Build full message

        // TODO AB Send telegram message and store weatherEventId
      }
    } catch (error) {
      console.error('Error processing incoming MQTT message: ', error);
    }

    next();
  });
};

export const sendMoveUnitsResponseMessage = (
  weatherEventId: number,
  moveUnitsType: string,
  moveUnitsAmount: number,
  moveUnitsFromLocation: string,
  moveUnitsToLocation: string
) => {
  const message = {
    type: 'COUNTER_MEASURE_MOVE_UNITS_RESPONSE',
    weatherEventId,
    wasManuallyTaken: true,
    moveUnitsType,
    moveUnitsFromLocation,
    moveUnitsToLocation,
    moveUnitsAmount,
  };
  mqttClient.publish(moveUnitsResponseTopicName, JSON.stringify(message));
};
