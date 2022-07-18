/* eslint-disable @typescript-eslint/no-non-null-assertion */

import 'dotenv/config';
import { moveUnits } from './actions/moveUnitsResponse';
import {
  LOCATION_NAME_BY_ICON,
  UNIT_TYPE_NAME_BY_ICON,
  UNIT_TYPE_ICON_BY_NAME,
  LOCATION_DISPLAY_NAME_BY_NAME,
  WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME,
  LOCATION_ICON_BY_NAME,
} from './utils/mappings';
import { MoveUnitsContext } from './types/wizardTypes';
import { moveUnitsResponseWizard } from './wizards/moveUnitsResponseWizard';
import { Scenes, session, Telegraf } from 'telegraf';
import { hasUnitStatus, getUnitStatus } from './utils/unitStatus';
import {
  listenToMQTTMessages,
  weatherEventActionTopicName,
  mqttClient,
  mqttListenerActive,
  weatherEventInstanceTopicName,
  weatherEventRiskTopicName,
} from './utils/mqtt';
import {
  addWeatherEvent,
  getWeatherEventLocationById,
  getWeatherEventTypeById,
  hasWeatherEventWithId,
  weatherEventIds,
} from './utils/weatherEvents';

const moveUnitsResponseStage = new Scenes.Stage<MoveUnitsContext>([
  moveUnitsResponseWizard,
]);

// Initialize Bot

const bot: Telegraf<MoveUnitsContext> = new Telegraf(
  process.env.TELEGRAM_BOT_API_TOKEN as string
);

bot.use(session());
bot.use(moveUnitsResponseStage.middleware());
bot.launch();

// Implement Bot handlers

bot.start((ctx) => {
  ctx.reply('Welcome to the 🚑🚓🚒 Authorities Bot 🚑🚒🚓');
  if (!mqttListenerActive) {
    listenToMQTTMessages(ctx);
  }
});

bot.help(async (ctx) => {
  await ctx.reply(
    'Help Menu:\n\n' +
      '/start : receive a greeting\n' +
      '/moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>] : respond that for a certain weather event a certain number of units was moved from one location to another\n' +
      '/status : see status of where all units are currently stationed\n' +
      '/events : see overview of current weather events'
  );
});

bot.command('status', async (ctx) => {
  let currentStatus = 'Current Units Status:\n';

  for (const location of LOCATION_NAME_BY_ICON.values()) {
    let locationStatus = '';

    for (const unitType of UNIT_TYPE_NAME_BY_ICON.values()) {
      if (!hasUnitStatus(location, unitType)) {
        continue;
      }
      const unitTypeIcon = UNIT_TYPE_ICON_BY_NAME.get(unitType)!;
      const amount = getUnitStatus(location, unitType);
      locationStatus += amount + ' x ' + unitTypeIcon + '     ';
    }

    currentStatus +=
      '\n' +
      locationStatus +
      '     at      ' +
      LOCATION_DISPLAY_NAME_BY_NAME.get(location)!;
  }

  await ctx.reply(currentStatus);
});

bot.command('events', async (ctx) => {
  let currentStatus = 'Current Weather Events:\n';

  if (weatherEventIds.size === 0) {
    currentStatus += '🚫 None';
  } else {
    for (const weatherEventId of weatherEventIds) {
      currentStatus +=
        '\n' +
        weatherEventId +
        ': Possible ' +
        WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME.get(
          getWeatherEventTypeById(weatherEventId)!
        )! +
        ' at ' +
        LOCATION_DISPLAY_NAME_BY_NAME.get(
          getWeatherEventLocationById(weatherEventId)!
        )!;
    }
  }

  await ctx.reply(currentStatus);
});

bot.command('moveunits', async (ctx) => {
  if (
    ctx.message &&
    ctx.message.text &&
    ctx.message.text.split(' ').length === 6
  ) {
    // Direct Command Mode
    const args = ctx.message.text.split(' ');
    if (!/\d/.test(args[1])) {
      ctx.reply(
        'First argument (WeatherEventId) must be an integer!\n\n' +
          'Syntax: /moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🧿|🌲|🏢|🚤> <To:🧿|🌲|🏢|🚤>]'
      );
      return;
    }
    if (!/\d/.test(args[2])) {
      ctx.reply(
        'Second argument (Amount) must be an integer!\n\n' +
          'Syntax: /moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🧿|🌲|🏢|🚤> <To:🧿|🌲|🏢|🚤>]'
      );
      return;
    }
    if (!['🚑', '🚓', '🚒'].includes(args[3])) {
      ctx.reply(
        'Third argument (Type) must be a valid unit type (🚑|🚓|🚒)!\n\n' +
          'Syntax: /moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🧿|🌲|🏢|🚤> <To:🧿|🌲|🏢|🚤>]'
      );
      return;
    }
    if (!['🧿', '🌲', '🏢', '🚤'].includes(args[4])) {
      ctx.reply(
        'Fourth argument (From) must be a valid location (🧿|🌲|🏢|🚤)!\n\n' +
          'Syntax: /moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:|🧿🌲|🏢|🚤> <To:🧿|🌲|🏢|🚤>]'
      );
      return;
    }
    if (!['🧿', '🌲', '🏢', '🚤'].includes(args[5])) {
      ctx.reply(
        'Fifth argument (To) must be a valid location (🧿|🌲|🏢|🚤)!\n\n' +
          'Syntax: /moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🧿|🌲|🏢|🚤> <To:🧿|🌲|🏢|🚤>]'
      );
      return;
    }

    const weatherEventId = parseInt(args[1]);
    if (!hasWeatherEventWithId(weatherEventId)) {
      ctx.reply(
        'There is no weather event with the given id (' +
          weatherEventId +
          ')!\n\n' +
          'Run /events to see an overview of current weather events.'
      );
      return;
    }

    const moveUnitsAmount = parseInt(args[2]);
    const moveUnitsType = UNIT_TYPE_NAME_BY_ICON.get(args[3])!;
    const moveUnitsFromLocation = LOCATION_NAME_BY_ICON.get(args[4])!;
    const moveUnitsToLocation = LOCATION_NAME_BY_ICON.get(args[5])!;
    const fromWizard = false;

    await moveUnits(
      ctx,
      weatherEventId,
      moveUnitsAmount,
      moveUnitsType,
      moveUnitsFromLocation,
      moveUnitsToLocation,
      fromWizard
    );
    return;
  }

  let weatherEventId = undefined;

  if (
    ctx.message &&
    ctx.message.text &&
    ctx.message.text.split(' ').length > 1
  ) {
    const args = ctx.message.text.split(' ');

    if (!/\d/.test(args[1])) {
      ctx.reply(
        'If specified, first argument (WeatherEventId) must be an integer!\n\n' +
          'Syntax: /moveunits [<WeatherEventId>]'
      );
      return;
    }

    weatherEventId = parseInt(args[1]);
    if (!hasWeatherEventWithId(weatherEventId)) {
      ctx.reply(
        'There is no weather event with the given id (' +
          weatherEventId +
          ')!\n\n' +
          'Run /events to see an overview of current weather events.'
      );
      return;
    }
  }

  // Interactive Mode
  ctx.scene.enter('MOVE_UNITS_RESPONSE_WIZARD');
  ctx.scene.session.weatherEventId = weatherEventId;
});

const randomFromMapKeys = (mapping: Map<string, string>): string => {
  const keys = Array.from(mapping.keys());
  return randomFromArray(keys);
};

const randomFromArray = (array: Array<string>): string => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Used for simulating an incoming move units request
bot.command('testrequest', async (_) => {
  const weatherEventId =
    Math.max(...[...weatherEventIds.values()].concat([0])) + 1;
  const weatherEventType = randomFromMapKeys(
    WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME
  );
  const weatherEventLocation = randomFromMapKeys(LOCATION_DISPLAY_NAME_BY_NAME);

  const weatherEventInstanceMessage = {
    id: weatherEventId,
    type: weatherEventType,
    location: weatherEventLocation,
  };

  addWeatherEvent(weatherEventId, weatherEventLocation, weatherEventType);

  mqttClient.publish(
    weatherEventInstanceTopicName + '/' + weatherEventLocation,
    JSON.stringify(weatherEventInstanceMessage),
    { qos: 0 }
  );

  setTimeout(() => {
    const weatherEventRiskMessage = {
      weatherEventId,
      riskLevel: randomFromArray(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']),
    };

    mqttClient.publish(
      weatherEventRiskTopicName + '/' + weatherEventLocation,
      JSON.stringify(weatherEventRiskMessage),
      { qos: 0 }
    );

    const moveUnitsType = randomFromMapKeys(UNIT_TYPE_ICON_BY_NAME);
    let moveUnitsFromLocation = randomFromMapKeys(LOCATION_ICON_BY_NAME);
    while (getUnitStatus(moveUnitsFromLocation, moveUnitsType) === 0) {
      moveUnitsFromLocation = randomFromMapKeys(LOCATION_ICON_BY_NAME);
    }
    const moveUnitsToLocation = randomFromMapKeys(LOCATION_ICON_BY_NAME);
    const moveUnitsAmount = randomIntFromInterval(
      1,
      getUnitStatus(moveUnitsFromLocation, moveUnitsType)
    );

    const weatherEventActionRequestUnitsMessage = {
      weatherEventId,
      type: 'COUNTER_MEASURE_MOVE_UNITS_REQUEST',
      location: weatherEventLocation,
      moveUnitsType,
      moveUnitsAmount,
      moveUnitsFromLocation,
      moveUnitsToLocation,
    };

    mqttClient.publish(
      weatherEventActionTopicName + '/' + moveUnitsToLocation,
      JSON.stringify(weatherEventActionRequestUnitsMessage),
      { qos: 0 }
    );
  }, 500);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
