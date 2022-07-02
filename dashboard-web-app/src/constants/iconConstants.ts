import { SensorMeasure } from '@prisma/client';

export const ICON_COMMON_EVENT = 'common/cloud-lightning';
export const ICON_COMMON_LOCATION = 'common/map-pin';
export const ICON_COMMON_SENSOR = 'common/radio';
export const ICON_COMMON_ACTUATOR = 'common/git-pull-request';
export const ICON_COMMON_AUTHORITY = 'common/shield';
export const ICON_COMMON_SOCIAL_MEDIA = 'common/globe';
export const ICON_COMMON_THEME_SWITCH = 'common/moon';
export const ICON_COMMON_SETTINGS = 'common/settings';

export const ICON_DROPDOWN_CHEVRON_UP = 'dropdown/chevron-up';
export const ICON_DROPDOWN_CHEVRON_DOWN = 'dropdown/chevron-down';

export const ICON_BUTTON_ADD = 'button/plus';

export const ICON_DATA_PERIOD_LIVE_DATA = 'dataPeriod/live-data';
export const ICON_DATA_PERIOD_HISTORIC_DATA = 'dataPeriod/historic-data';

export const ICON_SENSORS_TEMPERATURE = 'sensors/thermometer';
export const ICON_SENSORS_PRESSURE = 'sensors/pressure';
export const ICON_SENSORS_CO2 = 'sensors/co2-cloud';
export const ICON_SENSORS_CO = 'sensors/co-cloud';
export const ICON_SENSORS_HUMIDITY = 'sensors/droplet';
export const ICON_SENSORS_WIND_SPEED = 'sensors/wind';
export const ICON_SENSORS_VIBRATION = 'sensors/activity';
export const ICON_SENSORS_WATER_LEVEL = 'sensors/water-level';
export const ICON_SENSORS_SOUND = 'sensors/mic';

export const ICON_SENSORS_BY_NAME: Map<string, string> = new Map<string, string>([
	['TEMPERATURE', ICON_SENSORS_TEMPERATURE],
	['PRESSURE', ICON_SENSORS_PRESSURE],
	['CO2', ICON_SENSORS_CO2],
	['CO', ICON_SENSORS_CO],
	['HUMIDITY', ICON_SENSORS_HUMIDITY],
	['WIND_SPEED', ICON_SENSORS_WIND_SPEED],
	['VIBRATION', ICON_SENSORS_VIBRATION],
	['WATER_LEVEL', ICON_SENSORS_WATER_LEVEL],
	['SOUND', ICON_SENSORS_SOUND]
]);

export const ICON_ACTUATORS_ALARM_LIGHT = 'actuators/alarm-light';
export const ICON_ACTUATORS_ALARM_SOUND = 'actuators/alarm-sound';
export const ICON_ACTUATORS_LOCKDOWN = 'actuators/lock';
export const ICON_ACTUATORS_WATER_PROTECTION_WALL = 'actuators/wall';

export const ICON_ACTUATORS_BY_NAME: Map<string, string> = new Map<string, string>([
	['ALARM_LIGHT', ICON_ACTUATORS_ALARM_LIGHT],
	['ALARM_SOUND', ICON_ACTUATORS_ALARM_SOUND],
	['LOCKDOWN', ICON_ACTUATORS_LOCKDOWN],
	['WATER_PROTECTION_WALL', ICON_ACTUATORS_WATER_PROTECTION_WALL]
]);
