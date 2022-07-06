/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { WeatherEventActionWithWeatherEvent } from '$root/types/additionalPrismaTypes';
import { WeatherEventActionType } from '@prisma/client';
import { enumValueToString } from '$root/utils/enumUtil';
import { locationIconMap } from '$root/utils/locationUtils';
import { unitTypeIconMap } from '$root/utils/unitTypeUtils';

export const formatWeatherEventAction = (
	weatherEventAction: WeatherEventActionWithWeatherEvent,
	includeEvent: boolean,
	includeEventLocation: boolean,
	useFullNames: boolean
) => {
	let formattedWeatherEventAction = '';

	if (includeEvent && weatherEventAction.weatherEvent) {
		formattedWeatherEventAction +=
			'Due to ' + enumValueToString(weatherEventAction.weatherEvent.type);
		if (includeEventLocation) {
			formattedWeatherEventAction +=
				' at ' +
				locationIconMap[weatherEventAction.weatherEvent.location] +
				(useFullNames ? ' ' + enumValueToString(weatherEventAction.weatherEvent.location) : '');
		}
		formattedWeatherEventAction += ': ';
	}

	if (weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_REQUEST) {
		formattedWeatherEventAction +=
			'Request: Move ' +
			weatherEventAction.moveUnitsAmount +
			' ' +
			unitTypeIconMap[weatherEventAction.moveUnitsType!] +
			(useFullNames ? ' ' + enumValueToString(weatherEventAction.moveUnitsType!) : '') +
			' from ' +
			locationIconMap[weatherEventAction.moveUnitsFromLocation!] +
			(useFullNames ? ' ' + enumValueToString(weatherEventAction.moveUnitsFromLocation!) : '') +
			' to ' +
			locationIconMap[weatherEventAction.moveUnitsToLocation!] +
			(useFullNames ? ' ' + enumValueToString(weatherEventAction.moveUnitsToLocation!) : '');
	} else if (
		weatherEventAction.type === WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_RESPONSE
	) {
		formattedWeatherEventAction +=
			'Moved ' +
			weatherEventAction.moveUnitsAmount +
			' ' +
			unitTypeIconMap[weatherEventAction.moveUnitsType!] +
			(useFullNames ? ' ' + enumValueToString(weatherEventAction.moveUnitsType!) : '') +
			' from ' +
			locationIconMap[weatherEventAction.moveUnitsFromLocation!] +
			(useFullNames ? ' ' + enumValueToString(weatherEventAction.moveUnitsFromLocation!) : '') +
			' to ' +
			locationIconMap[weatherEventAction.moveUnitsToLocation!] +
			(useFullNames ? ' ' + enumValueToString(weatherEventAction.moveUnitsToLocation!) : '');
	} else {
		formattedWeatherEventAction +=
			(weatherEventAction.wasManuallyTaken ? 'Manually ' : 'Automatically ') +
			enumValueToString(weatherEventAction.type);
	}

	return formattedWeatherEventAction;
};
