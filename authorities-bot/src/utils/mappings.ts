export const UNIT_TYPE_NAME_BY_ICON = new Map<string, string>([
  ['🚑', 'AMBULANCE'],
  ['🚓', 'POLICE_CAR'],
  ['🚒', 'FIRE_TRUCK'],
]);

export const UNIT_TYPE_ICON_BY_NAME = new Map<string, '🚑' | '🚓' | '🚒'>([
  ['AMBULANCE', '🚑'],
  ['POLICE_CAR', '🚓'],
  ['FIRE_TRUCK', '🚒'],
]);

export const LOCATION_NAME_BY_ICON = new Map<string, string>([
  ['🧿', 'AUTHORITIES_HUB'],
  ['🌲', 'STUTTGART_KILLESBERG_PARK'],
  ['🏢', 'STUTTGART_VAIHINGEN_OFFICE'],
  ['🚤', 'STUTTGART_MAX_EYTH_SEE'],
]);

export const LOCATION_ICON_BY_NAME = new Map<string, string>([
  ['AUTHORITIES_HUB', '🧿'],
  ['STUTTGART_KILLESBERG_PARK', '🌲'],
  ['STUTTGART_VAIHINGEN_OFFICE', '🏢'],
  ['STUTTGART_MAX_EYTH_SEE', '🚤'],
]);

export const LOCATION_DISPLAY_NAME_BY_NAME = new Map<string, string>([
  ['AUTHORITIES_HUB', '🧿 Hub'],
  ['STUTTGART_KILLESBERG_PARK', '🌲 Killesbergpark'],
  ['STUTTGART_VAIHINGEN_OFFICE', '🏢 Vaihingen Office'],
  ['STUTTGART_MAX_EYTH_SEE', '🚤 Max Eyth See'],
]);

export const LOCATION_DISPLAY_NAME_BY_ICON = new Map<string, string>([
  ['🧿', '🧿 Hub'],
  ['🌲', '🌲 Killesbergpark'],
  ['🏢', '🏢 Vaihingen Office'],
  ['🚤', '🚤 Max Eyth See'],
]);

export const WEATHER_EVENT_TYPE_DISPLAY_NAME_BY_NAME = new Map<string, string>([
  ['STORM', 'Storm'],
  ['HAIL_STORM', 'Hail Storm'],
  ['THUNDER_STORM', 'Thunder Storm'],
  ['FLOOD', 'Flood'],
  ['COLD', 'Cold'],
  ['HEAT', 'Heat'],
  ['WILD_FIRE', 'Wild Fire'],
  ['EARTH_QUAKE', 'Earth Quake'],
  ['BAD_AIR', 'Bad Air'],
]);
