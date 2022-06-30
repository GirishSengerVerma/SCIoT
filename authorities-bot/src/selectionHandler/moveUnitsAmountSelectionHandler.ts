import { Composer } from 'telegraf';
import { MoveUnitsContext } from '../types/wizardTypes';
import { nextWizardStep } from '../utils/wizardStep';

export const moveUnitsAmountSelectionHandler = new Composer<MoveUnitsContext>();

moveUnitsAmountSelectionHandler.action('1', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 1;
  const { message_id } = await ctx.reply('Selected 1');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('2', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 2;
  const { message_id } = await ctx.reply('Selected 2');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('3', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 3;
  const { message_id } = await ctx.reply('Selected 3');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('4', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 4;
  const { message_id } = await ctx.reply('Selected 4');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('5', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 5;
  const { message_id } = await ctx.reply('Selected 5');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('6', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 6;
  const { message_id } = await ctx.reply('Selected 6');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('7', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 7;
  const { message_id } = await ctx.reply('Selected 7');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('8', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 8;
  const { message_id } = await ctx.reply('Selected 8');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});

moveUnitsAmountSelectionHandler.action('9', async (ctx) => {
  ctx.scene.session.moveUnitsAmount = 9;
  const { message_id } = await ctx.reply('Selected 9');
  ctx.scene.session.messageIds.push(message_id);
  return nextWizardStep(ctx);
});
