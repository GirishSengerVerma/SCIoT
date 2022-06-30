// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nextWizardStep = (ctx: any) => {
  ctx.wizard.next();
  if (typeof ctx.wizard.step === 'function') {
    (ctx.wizard.step as CallableFunction)(ctx);
  }
};
