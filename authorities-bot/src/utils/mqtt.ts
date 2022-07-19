/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as mqtt from 'mqtt';
import { Context } from 'telegraf';
import {
  LOCATION_DISPLAY_NAME_BY_NAME,
  UNIT_TYPE_ICON_BY_NAME,
  WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME,
} from './mappings';
import { setUnitStatus } from './unitStatus';
import {
  addWeatherEvent,
  getWeatherEventLocationById,
  getWeatherEventTypeById,
} from './weatherEvents';

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

export const weatherEventInstanceTopicName = 'weatherevents/instance';
export const weatherEventRiskTopicName = 'weatherevents/risk';
export const weatherEventActionTopicName = 'weatherevents/action';

const authoritiesUnitStatusTopicPrefix = 'authorities/unitstatus';

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
  mqttClient.subscribe(weatherEventInstanceTopicName + '/+', { qos: 0 });
  mqttClient.subscribe(weatherEventActionTopicName + '/+', { qos: 0 });
  mqttClient.subscribe(authoritiesUnitStatusTopicPrefix + '/+/+', { qos: 0 });
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

      console.log(topic, JSON.stringify(messageJSON));

      if (
        topic.startsWith(weatherEventInstanceTopicName) &&
        messageJSON.hasOwnProperty('id') &&
        messageJSON.hasOwnProperty('type') &&
        messageJSON.hasOwnProperty('location')
      ) {
        const { id, location, type } = messageJSON;
        addWeatherEvent(id, location, type);
      } else if (
        topic.startsWith(weatherEventActionTopicName) &&
        messageJSON.hasOwnProperty('type') &&
        messageJSON.hasOwnProperty('location') &&
        messageJSON.hasOwnProperty('moveUnitsType') &&
        messageJSON.hasOwnProperty('moveUnitsAmount') &&
        messageJSON.hasOwnProperty('moveUnitsFromLocation') &&
        messageJSON.hasOwnProperty('moveUnitsToLocation')
      ) {
        const {
          type: actionType,
          location: actionLocation,
          moveUnitsType,
          moveUnitsAmount,
          moveUnitsFromLocation,
          moveUnitsToLocation,
        } = messageJSON;

        if (actionType !== 'COUNTER_MEASURE_MOVE_UNITS_REQUEST') {
          return;
        }

        console.log('Processing Move Units Request..');

        if (messageJSON.hasOwnProperty('weatherEventId')) {
          const weatherEventId = messageJSON['weatherEventId'];

          const location = getWeatherEventLocationById(weatherEventId)!;
          const type = getWeatherEventTypeById(weatherEventId)!;

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
            '🚨🚨🚨 New Safety & Health Risk due to a\npossible ' +
            weatherEventTypeDisplayName +
            ' at ' +
            weatherEventLocationDisplayName +
            '.\n\nPlease send    ' +
            moveUnitsAmount +
            '   ' +
            unitsTypeIcon +
            '   from    ' +
            moveUnitsFromLocationDisplayName +
            '   to    ' +
            moveUnitsToLocationDisplayName +
            '.\n\nRespond using "/moveunits ' +
            weatherEventId +
            '" !';

          await ctx.reply(telegramMessage);
        } else {
          const unitsTypeIcon = UNIT_TYPE_ICON_BY_NAME.get(moveUnitsType)!;
          const moveUnitsFromLocationDisplayName =
            LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsFromLocation)!;
          const moveUnitsToLocationDisplayName =
            LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsToLocation)!;

          const telegramMessage =
            '🔔🔔🔔 Unit no longer needs to be on duty.\n\nPlease send    ' +
            moveUnitsAmount +
            '   ' +
            unitsTypeIcon +
            '   from    ' +
            moveUnitsFromLocationDisplayName +
            '   back to    ' +
            moveUnitsToLocationDisplayName +
            '.\n\nRespond using "/moveunits" !';

          await ctx.reply(telegramMessage);
        }
      } else if (
        topic.startsWith(weatherEventActionTopicName) &&
        messageJSON.hasOwnProperty('weatherEvent')
      ) {
        const {
          weatherEvent: { id: weatherEventId, location, type },
        } = messageJSON;

        addWeatherEvent(weatherEventId, location, type);
      } else if (topic.startsWith(authoritiesUnitStatusTopicPrefix)) {
        const { unitType, location, amount } = messageJSON;
        console.log('New unit status', location, unitType, amount);
        setUnitStatus(location, unitType, amount);

        const unitsTypeIcon = UNIT_TYPE_ICON_BY_NAME.get(unitType)!;
        const locationDisplayName =
          LOCATION_DISPLAY_NAME_BY_NAME.get(location)!;

        const telegramMessage =
          'ℹ️ New Number of ' +
          unitsTypeIcon +
          ' at ' +
          locationDisplayName +
          ' is ' +
          amount +
          '.';
        await ctx.reply(telegramMessage);
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
  mqttClient.publish(
    weatherEventActionTopicName + '/' + moveUnitsToLocation,
    JSON.stringify(message),
    { qos: 2 }
  );
};
