/* eslint-disable @typescript-eslint/no-non-null-assertion */

import 'dotenv/config';
import { moveUnits } from './actions/moveUnitsResponse';
import {
  LOCATION_NAME_BY_ICON,
  UNIT_TYPE_NAME_BY_ICON,
  UNIT_TYPE_ICON_BY_NAME,
  LOCATION_DISPLAY_NAME_BY_NAME,
} from './utils/mappings';
import { MoveUnitsContext } from './types/wizardTypes';
import { moveUnitsResponseWizard } from './wizards/moveUnitsResponseWizard';
import { Scenes, session, Telegraf } from 'telegraf';
import { hasUnitStatus, getUnitStatus } from './utils/unitStatus';
import { listenToMQTTMessages } from './middlewares/mqtt';

// TODO AB Listen to MQTT unit request messages and display those here

const moveUnitsResponseStage = new Scenes.Stage<MoveUnitsContext>([
  moveUnitsResponseWizard,
]);

// Initialize Bot

const bot: Telegraf<MoveUnitsContext> = new Telegraf(
  process.env.TELEGRAM_BOT_API_TOKEN as string
);

bot.use(session());
bot.use(moveUnitsResponseStage.middleware());
bot.use(listenToMQTTMessages);
bot.launch();

// Implement Bot handlers

bot.start((ctx) => {
  ctx.reply('Welcome to the 🚑🚓🚒 Authorities Bot 🚑🚒🚓');
});

bot.help(async (ctx) => {
  await ctx.reply(
    'Help Menu:\n\n' +
      '/start : receive a greeting\n' +
      '/moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>] : respond that for a certain weather event a certain number of units was moved from one location to another\n' +
      '/status : see status of where all units are currently stationed'
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

bot.command('moveunits', async (ctx) => {
  if (
    ctx.message &&
    ctx.message.text &&
    ctx.message.text.split(' ').length === 6
  ) {
    // Direct Command Mode
    const args = ctx.message.text.split(' ');
    if (!Boolean(parseInt(args[1]))) {
      ctx.reply(
        'First argument (WeatherEventId) must be an integer!\n\n' +
          'Syntax: /moveunits [<WeatherEventId> <Amount> <Type:🚑|🚓|🚒> <From:🧿|🌲|🏢|🚤> <To:🧿|🌲|🏢|🚤>]'
      );
      return;
    }
    if (!Boolean(parseInt(args[2]))) {
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
    // TODO AB Check if it is an id for an existing weather event for which we previously got a move units request

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

  // Interactive Mode
  ctx.scene.enter('MOVE_UNITS_RESPONSE_WIZARD');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
