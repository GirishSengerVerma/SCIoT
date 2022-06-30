import { Context, Scenes } from 'telegraf';

export interface MoveUnitsWizardSession extends Scenes.WizardSessionData {
  weatherEventId: number | undefined;
  moveUnitsType: string;
  moveUnitsAmount: number;
  moveUnitsFromLocation: string;
  moveUnitsToLocation: string;
  messageIds: Array<number>;
}

export interface MoveUnitsContext extends Context {
  // myContextProp: string
  scene: Scenes.SceneContextScene<MoveUnitsContext, MoveUnitsWizardSession>;
  wizard: Scenes.WizardContextWizard<MoveUnitsContext>;
}
