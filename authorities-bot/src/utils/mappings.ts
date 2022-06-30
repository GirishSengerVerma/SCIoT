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
  ['STUTTGART_MAX_EYTH_SEE', '🚤 May Eyth See'],
]);

export const LOCATION_DISPLAY_NAME_BY_ICON = new Map<string, string>([
  ['🧿', '🧿 Hub'],
  ['🌲', '🌲 Killesbergpark'],
  ['🏢', '🏢 Vaihingen Office'],
  ['🚤', '🚤 May Eyth See'],
]);