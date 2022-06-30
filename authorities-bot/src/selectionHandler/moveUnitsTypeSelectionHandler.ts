/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Composer } from 'telegraf';
import { UNIT_TYPE_NAME_BY_ICON } from '../utils/mappings';
import { MoveUnitsContext } from '../types/wizardTypes';
import { nextWizardStep } from '../utils/wizardStep';

export const moveUnitsTypeSelectionHandler = new Composer<MoveUnitsContext>();

moveUnitsTypeSelectionHandler.action(
  UNIT_TYPE_NAME_BY_ICON.get('🚑')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsType = UNIT_TYPE_NAME_BY_ICON.get('🚑')!;
    const { message_id } = await ctx.reply('Selected 🚑');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsTypeSelectionHandler.action(
  UNIT_TYPE_NAME_BY_ICON.get('🚓')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsType = UNIT_TYPE_NAME_BY_ICON.get('🚓')!;
    const { message_id } = await ctx.reply('Selected 🚓');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);

moveUnitsTypeSelectionHandler.action(
  UNIT_TYPE_NAME_BY_ICON.get('🚒')!,
  async (ctx) => {
    ctx.scene.session.moveUnitsType = UNIT_TYPE_NAME_BY_ICON.get('🚒')!;
    const { message_id } = await ctx.reply('Selected 🚒');
    ctx.scene.session.messageIds.push(message_id);
    return nextWizardStep(ctx);
  }
);
