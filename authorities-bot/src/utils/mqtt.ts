/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as mqtt from 'mqtt';
import { Context } from 'telegraf';
import {
  LOCATION_DISPLAY_NAME_BY_NAME,
  UNIT_TYPE_ICON_BY_NAME,
  WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME,
} from './mappings';
import { addWeatherEvent } from './weatherEvents';

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

export const weatherEventActionTopicName = 'weatherevents/action';

export const mqttClient = mqtt.connect(host, options);

mqttClient.on('error', (err) => {
  console.log('MQTT Client: Connection error: ', err);
  mqttClient.end();
});

mqttClient.on('reconnect', () => {
  console.log('MQTT Client: Reconnecting...');
});

mqttClient.on('connect', () => {
  console.log('MQTT Client: Connected.');
  mqttClient.subscribe(weatherEventActionTopicName + '/+', { qos: 1 });
});

export let mqttListenerActive = false;

export const listenToMQTTMessages = (ctx: Context) => {
  console.log('Registering MQTT Message Listener');
  mqttListenerActive = true;

  // TODO AB Fix message sometimes retrieved multiple times although qos = 1 ??

  mqttClient.on('message', async function (topic, message) {
    try {
      const messageString = message.toString();
      const messageJSON = JSON.parse(messageString);

      if (
        topic.startsWith(weatherEventActionTopicName) &&
        messageJSON.hasOwnProperty('id') &&
        messageJSON.hasOwnProperty('weatherEvent') &&
        messageJSON.hasOwnProperty('type') &&
        messageJSON.hasOwnProperty('location') &&
        messageJSON.hasOwnProperty('moveUnitsType') &&
        messageJSON.hasOwnProperty('moveUnitsAmount') &&
        messageJSON.hasOwnProperty('moveUnitsFromLocation') &&
        messageJSON.hasOwnProperty('moveUnitsToLocation')
      ) {
        const {
          id,
          weatherEvent: { id: weatherEventId, location, type },
          type: actionType,
          location: actionLocation,
          moveUnitsType,
          moveUnitsAmount,
          moveUnitsFromLocation,
          moveUnitsToLocation,
        } = messageJSON;

        console.log('Processing Move Units Request ' + id + '..');

        addWeatherEvent(weatherEventId, location, type);

        if (actionType !== 'COUNTER_MEASURE_MOVE_UNITS_REQUEST') {
          return;
        }

        const weatherEventTypeDisplayName =
          WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME.get(type)!;
        const weatherEventLocationDisplayName =
          LOCATION_DISPLAY_NAME_BY_NAME.get(location)!;
        const unitsTypeIcon = UNIT_TYPE_ICON_BY_NAME.get(moveUnitsType)!;
        const moveUnitsFromLocationDisplayName =
          LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsFromLocation)!;
        const moveUnitsToLocationDisplayName =
          LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsToLocation)!;

        const telegramMessage =
          '🚨🚨🚨\n\nNew Safety & Health Risk due to a\npossible ' +
          weatherEventTypeDisplayName +
          ' at ' +
          weatherEventLocationDisplayName +
          '.\n\n🚨🚨🚨\n\nPlease send    ' +
          moveUnitsAmount +
          '   ' +
          unitsTypeIcon +
          '   from    ' +
          moveUnitsFromLocationDisplayName +
          '   to    ' +
          moveUnitsToLocationDisplayName +
          '.\n\nRespond using /moveunits !';

        await ctx.reply(telegramMessage);
      } else if (
        topic.startsWith(weatherEventActionTopicName) &&
        messageJSON.hasOwnProperty('weatherEvent')
      ) {
        const {
          weatherEvent: { id: weatherEventId, location, type },
        } = messageJSON;

        addWeatherEvent(weatherEventId, location, type);
      }
    } catch (error) {
      console.error('Error processing incoming MQTT message: ', error);
    }
  });
};

export const sendMoveUnitsResponseMessage = (
  weatherEventId: number | undefined,
  moveUnitsType: string,
  moveUnitsAmount: number,
  moveUnitsFromLocation: string,
  moveUnitsToLocation: string
) => {
  const message = {
    ...(weatherEventId && { weatherEventId }),
    type: 'COUNTER_MEASURE_MOVE_UNITS_RESPONSE',
    wasManuallyTaken: true,
    location: moveUnitsToLocation,
    moveUnitsType,
    moveUnitsFromLocation,
    moveUnitsToLocation,
    moveUnitsAmount,
  };
  mqttClient.publish(weatherEventActionTopicName + '/' + moveUnitsToLocation, 
    JSON.stringify(message), {
      qos: 1,
      retain: false,
    }
  );
};
