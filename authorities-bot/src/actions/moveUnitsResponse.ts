/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  UNIT_TYPE_ICON_BY_NAME,
  LOCATION_DISPLAY_NAME_BY_NAME,
} from '../utils/mappings';
import { MoveUnitsContext } from '../types/wizardTypes';
import { getUnitStatus, setUnitStatus } from '../utils/unitStatus';
import { sendMoveUnitsResponseMessage } from '../middlewares/mqtt';

export const moveUnits = async (
  ctx: MoveUnitsContext,
  weatherEventId: number,
  moveUnitsAmount: number,
  moveUnitsType: string,
  moveUnitsFromLocation: string,
  moveUnitsToLocation: string,
  fromWizard: boolean
): Promise<void> => {
  if (fromWizard) {
    for (const messageId of ctx.scene.session.messageIds) {
      await ctx.deleteMessage(messageId);
    }
  }

  if (getUnitStatus(moveUnitsFromLocation, moveUnitsType) < moveUnitsAmount) {
    await ctx.reply(
      'Error: Too few units of type ' +
        UNIT_TYPE_ICON_BY_NAME.get(moveUnitsType)! +
        ' are currently stationed in ' +
        LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsFromLocation)! +
        '!\n\n' +
        'Run /status to see the current status of positioned units.'
    );
    return;
  }

  setUnitStatus(
    moveUnitsFromLocation,
    moveUnitsType,
    getUnitStatus(moveUnitsFromLocation, moveUnitsType) - moveUnitsAmount
  );
  setUnitStatus(
    moveUnitsToLocation,
    moveUnitsType,
    getUnitStatus(moveUnitsToLocation, moveUnitsType) + moveUnitsAmount
  );

  const displayMessage =
    moveUnitsAmount +
    ' units of type ' +
    UNIT_TYPE_ICON_BY_NAME.get(moveUnitsType)! +
    ' moved from ' +
    LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsFromLocation)! +
    ' to ' +
    LOCATION_DISPLAY_NAME_BY_NAME.get(moveUnitsToLocation)!;

  sendMoveUnitsResponseMessage(
    weatherEventId,
    moveUnitsType,
    moveUnitsAmount,
    moveUnitsFromLocation,
    moveUnitsToLocation
  );

  ctx.reply(
    'Confirmed:\n' +
      displayMessage +
      '\n\n' +
      'Run /status to see the new status of positioned units.'
  );
};
