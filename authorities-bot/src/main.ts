/* eslint-disable @typescript-eslint/no-non-null-assertion */

import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
import { Markup, Scenes, Telegraf, session, Composer } from 'telegraf';
import { WizardContext } from 'telegraf/typings/scenes';

const UNIT_TYPE_NAME_BY_ICON = new Map<string, string>([
  ['🚑', 'AMBULANCE'],
  ['🚓', 'POLICE_CAR'],
  ['🚒', 'FIRE_TRUCK'],
]);

const UNIT_TYPE_ICON_BY_NAME = new Map<string, string>([
  ['AMBULANCE', '🚑'],
  ['POLICE_CAR', '🚓'],
  ['FIRE_TRUCK', '🚒'],
]);

const LOCATION_NAME_BY_ICON = new Map<string, string>([
  ['🌲', 'STUTTGART_KILLESBERG_PARK'],
  ['🏢', 'STUTTGART_VAIHINGEN_OFFICE'],
  ['🚤', 'STUTTGART_MAX_EYTH_SEE'],
  ['🧿', 'AUTHORITIES_HUB'],
]);

const LOCATION_ICON_BY_NAME = new Map<string, string>([
  ['STUTTGART_KILLESBERG_PARK', '🌲'],
  ['STUTTGART_VAIHINGEN_OFFICE', '🏢'],
  ['STUTTGART_MAX_EYTH_SEE', '🚤'],
  ['AUTHORITIES_HUB', '🧿'],
]);

if (!process.env.DATABASE_URL) {
  throw 'DATABASE_URL Environment Variable is not set!';
}

const connectionString: string = process.env.DATABASE_URL;
const client = new Client({ connectionString });
await client.connect();

try {
  const res = await client.query('SELECT * FROM "UnitStatus"');
  // TODO AB Store it and check on each moveUnits reponse!
  console.log(res.rows);
} catch (e) {
  if (e instanceof Error) {
    console.log(e.stack);
  }
} finally {
  client.end();
}

// TODO AB Listen to MQTT unit request messages and display those here

// TODO AB Fix: you can currently click on a previous step action again to get to the next step

const moveUnits = async (
  ctx: WizardContext,
  moveUnitsAmount: number,
  moveUnitsType: string,
  moveUnitsFromLocation: string,
  moveUnitsToLocation: string
): Promise<void> => {
  const displayMessage =
    moveUnitsAmount +
    ' units of type ' +
    UNIT_TYPE_ICON_BY_NAME.get(moveUnitsType) +
    ' moved from ' +
    LOCATION_ICON_BY_NAME.get(moveUnitsFromLocation) +
    ' to ' +
    LOCATION_ICON_BY_NAME.get(moveUnitsToLocation);

  // TODO AB Send MQTT message that will be processed by DWA

  ctx.reply('Confirmed: ' + displayMessage);
};

// TODO AB Fix reading replies from Markup.inlineKeyboard and storing them in state

const moveUnitsResponseWizard: Scenes.WizardScene<WizardContext> =
  new Scenes.WizardScene(
    'MOVE_UNITS_RESPONSE_WIZARD',
    async (ctx) => {
      console.log('Step 1');
      ctx.reply(
        'Choose type of units to move:',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '🚑 Ambulance',
            UNIT_TYPE_NAME_BY_ICON.get('🚑')!
          ),
          Markup.button.callback(
            '🚓 Police Car',
            UNIT_TYPE_NAME_BY_ICON.get('🚓')!
          ),
          Markup.button.callback(
            '🚒 Fire Truck',
            UNIT_TYPE_NAME_BY_ICON.get('🚒')!
          ),
        ])
      );
      return ctx.wizard.next();
    },
    moveUnitsTypeSelectionHandler,
    async (ctx) => {
      console.log('Step 2');
      if (ctx.message && 'text' in ctx.message) {
        console.log(ctx.message.text);
        ctx.state.moveUnitsType = ctx.message.text;
      }
      console.log(ctx.state);
      ctx.reply(
        'Choose number of units to move:',
        Markup.inlineKeyboard([
          Markup.button.callback('1', '1'),
          Markup.button.callback('2', '2'),
          Markup.button.callback('3', '3'),
          Markup.button.callback('4', '4'),
          Markup.button.callback('5', '5'),
          Markup.button.callback('6', '6'),
          Markup.button.callback('7', '7'),
          Markup.button.callback('8', '8'),
          Markup.button.callback('9', '9'),
        ])
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      console.log('Step 3');
      if (ctx.message && 'text' in ctx.message) {
        console.log(ctx.message.text);
        ctx.state.moveUnitsAmount = parseInt(ctx.message.text);
      }
      console.log(ctx.state);
      ctx.reply(
        'Choose location to move units FROM:',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '🌲 Killesbergpark',
            LOCATION_NAME_BY_ICON.get('🌲')!
          ),
          Markup.button.callback(
            '🏢 Vaihingen Office',
            LOCATION_NAME_BY_ICON.get('🏢')!
          ),
          Markup.button.callback(
            '🚤 Max Eyth See',
            LOCATION_NAME_BY_ICON.get('🚤')!
          ),
          Markup.button.callback('🧿 Hub', LOCATION_NAME_BY_ICON.get('🧿')!),
        ])
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      console.log('Step 4');
      if (ctx.message && 'text' in ctx.message) {
        console.log(ctx.message.text);
        ctx.state.moveUnitsFromLocation = parseInt(ctx.message.text);
      }
      console.log(ctx.state);
      ctx.reply(
        'Choose location to move units TO:',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '🌲 Killesbergpark',
            LOCATION_NAME_BY_ICON.get('🌲')!
          ),
          Markup.button.callback(
            '🏢 Vaihingen Office',
            LOCATION_NAME_BY_ICON.get('🏢')!
          ),
          Markup.button.callback(
            '🚤 Max Eyth See',
            LOCATION_NAME_BY_ICON.get('🚤')!
          ),
          Markup.button.callback('🧿 Hub', LOCATION_NAME_BY_ICON.get('🧿')!),
        ])
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      console.log('Step 5');
      if (ctx.message && 'text' in ctx.message) {
        console.log(ctx.message.text);
        await moveUnits(
          ctx,
          ctx.state.moveUnitsAmount,
          ctx.state.moveUnitsType,
          ctx.state.moveUnitsFromLocation,
          ctx.state.moveUnitsToLocation
        );
      }
      return ctx.scene.leave();
    }
  );

const moveUnitsResponseStage = new Scenes.Stage([moveUnitsResponseWizard]);

// Initialize Bot

const bot: Telegraf<WizardContext> = new Telegraf(
  process.env.TELEGRAM_BOT_API_TOKEN as string
);

bot.use(session());
bot.use(moveUnitsResponseStage.middleware());
bot.launch();

// Implement Bot handlers

bot.start((ctx) => {
  ctx.reply('Welcome to the 🚑🚓🚒 Authorities Bot 🚑🚒🚓');
});

bot.help((ctx) => {
  ctx.reply('/start : receive a greeting');
  ctx.reply(
    '/moveunits [<Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>] : respond that a certain number of units was moved from one location to another'
  );
  ctx.reply('/status : see status of where all units are currently stationed');
});

bot.command('moveunits', async (ctx) => {
  if (
    ctx.message &&
    ctx.message.text &&
    ctx.message.text.split(' ').length === 5
  ) {
    // Direct Command Mode
    const args = ctx.message.text.split(' ');
    if (!Boolean(parseInt(args[1]))) {
      ctx.reply('First argument (Amount) must be an integer!');
      ctx.reply(
        'Syntax: /moveunits [<Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>]'
      );
      return;
    }
    if (!['🚑', '🚓', '🚒'].includes(args[2])) {
      ctx.reply('Second argument (Type) must be a valid unit type (🚑|🚓|🚒)!');
      ctx.reply(
        'Syntax: /moveunits [<Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>]'
      );
      return;
    }
    if (!['🌲', '🏢', '🚤'].includes(args[3])) {
      ctx.reply('Third argument (From) must be a valid location (🌲|🏢|🚤)!');
      ctx.reply(
        'Syntax: /moveunits [<Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>]'
      );
      return;
    }
    if (!['🌲', '🏢', '🚤'].includes(args[4])) {
      ctx.reply('Fourth argument (To) must be a valid location (🌲|🏢|🚤)!');
      ctx.reply(
        'Syntax: /moveunits [<Amount> <Type:🚑|🚓|🚒> <From:🌲|🏢|🚤> <To:🌲|🏢|🚤>]'
      );
      return;
    }
    await moveUnits(
      ctx,
      parseInt(args[1]),
      UNIT_TYPE_NAME_BY_ICON.get(args[2])!,
      LOCATION_NAME_BY_ICON.get(args[3])!,
      LOCATION_NAME_BY_ICON.get(args[4])!
    );
    return;
  }

  // Interactive Mode
  ctx.scene.enter('MOVE_UNITS_RESPONSE_WIZARD');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
