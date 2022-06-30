import { Composer } from 'telegraf';
import { LOCATION_NAME_BY_ICON } from '../utils/mappings';
import { MoveUnitsContext } from '../types/wizardTypes';
import { nextWizardStep } from '../utils/wizardStep';

export const moveUnitsFromLocationSelectionHandler =
  new Composer<MoveUnitsContext>();

moveUnitsFromLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🧿')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsFromLocation = LOCATION_NAME_BY_ICON.get('🧿')!;
    const { message_id } = await ctx.reply('Selected 🧿');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsFromLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🌲')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsFromLocation = LOCATION_NAME_BY_ICON.get('🌲')!;
    const { message_id } = await ctx.reply('Selected 🌲');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsFromLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🏢')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsFromLocation = LOCATION_NAME_BY_ICON.get('🏢')!;
    const { message_id } = await ctx.reply('Selected 🏢');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsFromLocationSelectionHandler.action(
  LOCATION_NAME_BY_ICON.get('🚤')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsFromLocation = LOCATION_NAME_BY_ICON.get('🚤')!;
    const { message_id } = await ctx.reply('Selected 🚤');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);
