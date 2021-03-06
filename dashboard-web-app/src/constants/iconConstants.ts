export const ICON_COMMON_EVENT = 'common/cloud-lightning';
export const ICON_COMMON_LOCATION = 'common/map-pin';
export const ICON_COMMON_SENSOR = 'common/radio';
export const ICON_COMMON_ACTUATOR = 'common/git-pull-request';
export const ICON_COMMON_AUTHORITY = 'common/shield';
export const ICON_COMMON_SOCIAL_MEDIA = 'common/globe';
export const ICON_COMMON_THEME_SWITCH = 'common/moon';
export const ICON_COMMON_SETTINGS = 'common/settings';
export const ICON_COMMON_HASH = 'common/hash';
export const ICON_COMMON_CLOSE = 'common/close';

export const ICON_DROPDOWN_CHEVRON_UP = 'dropdown/chevron-up';
export const ICON_DROPDOWN_CHEVRON_DOWN = 'dropdown/chevron-down';

export const ICON_BUTTON_ADD = 'button/plus';
export const ICON_BUTTON_SAVE = 'button/save';
export const ICON_BUTTON_DELETE = 'button/delete';
export const ICON_BUTTON_END = 'button/end';

export const ICON_DATA_PERIOD_LIVE_DATA = 'dataPeriod/live-data';
export const ICON_DATA_PERIOD_HISTORIC_DATA = 'dataPeriod/historic-data';

export const ICON_WEATHER_EVENTS_STORM = 'weatherevents/storm';
export const ICON_WEATHER_EVENTS_HAIL_STORM = 'weatherevents/hail-storm';
export const ICON_WEATHER_EVENTS_THUNDER_STORM = 'weatherevents/thunder-storm';
export const ICON_WEATHER_EVENTS_FLOOD = 'weatherevents/flood';
export const ICON_WEATHER_EVENTS_COLD = 'weatherevents/cold';
export const ICON_WEATHER_EVENTS_HEAT = 'weatherevents/heat';
export const ICON_WEATHER_EVENTS_WILD_FIRE = 'weatherevents/wild-fire';
export const ICON_WEATHER_EVENTS_EARTH_QUAKE = 'weatherevents/earth-quake';
export const ICON_WEATHER_EVENTS_BAD_AIR = 'weatherevents/bad-air';

export const ICON_WEATHER_EVENTS_BY_NAME: Map<string, string> = new Map<string, string>([
	['STORM', ICON_WEATHER_EVENTS_STORM],
	['HAIL_STORM', ICON_WEATHER_EVENTS_HAIL_STORM],
	['THUNDER_STORM', ICON_WEATHER_EVENTS_THUNDER_STORM],
	['FLOOD', ICON_WEATHER_EVENTS_FLOOD],
	['COLD', ICON_WEATHER_EVENTS_COLD],
	['HEAT', ICON_WEATHER_EVENTS_HEAT],
	['WILD_FIRE', ICON_WEATHER_EVENTS_WILD_FIRE],
	['EARTH_QUAKE', ICON_WEATHER_EVENTS_EARTH_QUAKE],
	['BAD_AIR', ICON_WEATHER_EVENTS_BAD_AIR]
]);

export const ICON_WEATHER_EVENTS_TYPE = 'weatherevents/type';
export const ICON_WEATHER_EVENTS_RISK_LEVEL = 'weatherevents/risk-level';
export const ICON_WEATHER_EVENTS_ACTION = 'weatherevents/action';

export const ICON_SENSORS_TEMPERATURE = 'sensors/thermometer';
export const ICON_SENSORS_PRESSURE = 'sensors/pressure';
export const ICON_SENSORS_CO2 = 'sensors/co2-cloud';
export const ICON_SENSORS_CO = 'sensors/co-cloud';
export const ICON_SENSORS_HUMIDITY = 'sensors/droplet';
export const ICON_SENSORS_WIND_SPEED = 'sensors/wind';
export const ICON_SENSORS_VIBRATION = 'sensors/activity';
export const ICON_SENSORS_WATER_LEVEL = 'sensors/water-level';
export const ICON_SENSORS_LIGHT = 'sensors/light';

export const ICON_SENSORS_BY_NAME: Map<string, string> = new Map<string, string>([
	['TEMPERATURE', ICON_SENSORS_TEMPERATURE],
	['PRESSURE', ICON_SENSORS_PRESSURE],
	['CO2', ICON_SENSORS_CO2],
	['CO', ICON_SENSORS_CO],
	['HUMIDITY', ICON_SENSORS_HUMIDITY],
	['WIND_SPEED', ICON_SENSORS_WIND_SPEED],
	['VIBRATION', ICON_SENSORS_VIBRATION],
	['WATER_LEVEL', ICON_SENSORS_WATER_LEVEL],
	['LIGHT', ICON_SENSORS_LIGHT]
]);

export const ICON_SENSORS_SIMULATED = 'sensors/simulated';
export const ICON_SENSORS_MEASURE = 'sensors/measure';

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

export const ICON_ACTUATOR_STATUS = 'actuators/status';
export const ICON_ACTUATORS_WEATHER_EVENT = 'actuators/weather-event';
export const ICON_ACTUATORS_SIMULATED = 'actuators/simulated';
export const ICON_ACTUATORS_TYPE = 'actuators/type';

export const ICON_AUTHORITIES_UNIT_TYPE_POLICE_CAR = 'authorities/police-car';
export const ICON_AUTHORITIES_UNIT_TYPE_FIRE_TRUCK = 'authorities/fire-truck';
export const ICON_AUTHORITIES_UNIT_TYPE_AMBULANCE = 'authorities/ambulance';

export const ICON_AUTHORITIES_UNIT_TYPE_BY_NAME: Map<string, string> = new Map<string, string>([
	['POLICE_CAR', ICON_AUTHORITIES_UNIT_TYPE_POLICE_CAR],
	['FIRE_TRUCK', ICON_AUTHORITIES_UNIT_TYPE_FIRE_TRUCK],
	['AMBULANCE', ICON_AUTHORITIES_UNIT_TYPE_AMBULANCE]
]);

export const ICON_AUTHORITIES_MOVE = 'authorities/move';
