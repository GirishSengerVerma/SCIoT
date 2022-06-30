import { Composer } from 'telegraf';
import { LOCATION_NAME_BY_ICON } from '../utils/mappings';
import { MoveUnitsContext } from '../types/wizardTypes';
import { nextWizardStep } from '../utils/wizardStep';

export const moveUnitsToLocationSelectionHandler =
  new Composer<MoveUnitsContext>();

moveUnitsToLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🧿')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsToLocation = LOCATION_NAME_BY_ICON.get('🧿')!;
    const { message_id } = await ctx.reply('Selected 🧿');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsToLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🌲')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsToLocation = LOCATION_NAME_BY_ICON.get('🌲')!;
    const { message_id } = await ctx.reply('Selected 🌲');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsToLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🏢')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsToLocation = LOCATION_NAME_BY_ICON.get('🏢')!;
    const { message_id } = await ctx.reply('Selected 🏢');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsToLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🚤')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsToLocation = LOCATION_NAME_BY_ICON.get('🚤')!;
    const { message_id } = await ctx.reply('Selected 🚤');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);
