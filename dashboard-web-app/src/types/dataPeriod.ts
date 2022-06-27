// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const DataPeriod = {
    LIVE_DATA: 'LIVE_DATA',
    LAST_HOUR: 'LAST_HOUR',
    LAST_DAY: 'LAST_DAY',
    LAST_WEEK: 'LAST_WEEK',
    LAST_MONTH: 'LAST_MONTH'
};
  
export type DataPeriod = (typeof DataPeriod)[keyof typeof DataPeriod];