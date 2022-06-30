import { Scenes, Markup } from 'telegraf';
import {
  UNIT_TYPE_NAME_BY_ICON,
  LOCATION_NAME_BY_ICON,
  LOCATION_DISPLAY_NAME_BY_ICON,
} from '../utils/mappings';
import { moveUnitsTypeSelectionHandler } from '../selectionHandler/moveUnitsTypeSelectionHandler';
import { MoveUnitsContext } from '../types/wizardTypes';
import { moveUnits } from '../actions/moveUnitsResponse';
import { moveUnitsAmountSelectionHandler } from '../selectionHandler/moveUnitsAmountSelectionHandler';
import { moveUnitsFromLocationSelectionHandler } from '../selectionHandler/moveUnitsFromLocationSelectionHandler';
import { moveUnitsToLocationSelectionHandler } from '../selectionHandler/moveUnitsToLocationSelectionHandler';

export const moveUnitsResponseWizard = new Scenes.WizardScene<MoveUnitsContext>(
  'MOVE_UNITS_RESPONSE_WIZARD',
  async (ctx) => {
    ctx.scene.session.messageIds = [];
    const { message_id } = await ctx.reply(
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
    ctx.scene.session.messageIds.push(message_id);
    return ctx.wizard.next();
  },
  moveUnitsTypeSelectionHandler,
  async (ctx) => {
    const { message_id } = await ctx.reply(
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
    ctx.scene.session.messageIds.push(message_id);
    return ctx.wizard.next();
  },
  moveUnitsAmountSelectionHandler,
  async (ctx) => {
    const { message_id } = await ctx.reply(
      'Choose location to move units FROM:',
      Markup.inlineKeyboard([
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🧿')!,
          LOCATION_NAME_BY_ICON.get('🧿')!
        ),
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🌲')!,
          LOCATION_NAME_BY_ICON.get('🌲')!
        ),
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🏢')!,
          LOCATION_NAME_BY_ICON.get('🏢')!
        ),
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🚤')!,
          LOCATION_NAME_BY_ICON.get('🚤')!
        ),
      ])
    );
    ctx.scene.session.messageIds.push(message_id);
    return ctx.wizard.next();
  },
  moveUnitsFromLocationSelectionHandler,
  async (ctx) => {
    const { message_id } = await ctx.reply(
      'Choose location to move units TO:',
      Markup.inlineKeyboard([
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🧿')!,
          LOCATION_NAME_BY_ICON.get('🧿')!
        ),
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🌲')!,
          LOCATION_NAME_BY_ICON.get('🌲')!
        ),
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🏢')!,
          LOCATION_NAME_BY_ICON.get('🏢')!
        ),
        Markup.button.callback(
          LOCATION_DISPLAY_NAME_BY_ICON.get('🚤')!,
          LOCATION_NAME_BY_ICON.get('🚤')!
        ),
      ])
    );
    ctx.scene.session.messageIds.push(message_id);
    return ctx.wizard.next();
  },
  moveUnitsToLocationSelectionHandler,
  async (ctx) => {
    await moveUnits(
      ctx,
      ctx.scene.session.weatherEventId,
      ctx.scene.session.moveUnitsAmount,
      ctx.scene.session.moveUnitsType,
      ctx.scene.session.moveUnitsFromLocation,
      ctx.scene.session.moveUnitsToLocation,
      true
    );
    return ctx.scene.leave();
  }
);
