/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { WeatherEventActionWithWeatherEvent } from '$root/types/additionalPrismaTypes';
import { WeatherEventActionType, WeatherEventRiskLevel, type WeatherEvent } from '@prisma/client';
import { enumValueToString } from '$root/utils/enumUtil';
import { locationIconMap } from '$root/utils/locationUtils';
import { unitTypeIconMap } from '$root/utils/unitTypeUtils';

export const formatWeatherEvent = (weatherEvent: WeatherEvent, includeEventLocation: boolean, useFullNames: boolean) => {
	let formattedWeatherEvent = enumValueToString(weatherEvent.type);
	if (includeEventLocation) {
		formattedWeatherEvent +=
			' at ' +
			locationIconMap[weatherEvent.location] +
			(useFullNames ? ' ' + enumValueToString(weatherEvent.location) : '');
	}
	return formattedWeatherEvent;
};

export const formatWeatherEventAction = (
	weatherEventAction: WeatherEventActionWithWeatherEvent,
	includeEvent: boolean,
	includeEventLocation: boolean,
	useFullNames: boolean
) => {
	let formattedWeatherEventAction = '';

	if (includeEvent && weatherEventAction.weatherEvent) {
		formattedWeatherEventAction += 'Due to ' + formatWeatherEvent(weatherEventAction.weatherEvent, includeEventLocation, useFullNames) + ': ';
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

export const getWeatherEventRiskLevelColor = (weatherEventRiskLevel: WeatherEventRiskLevel) => {
	if (weatherEventRiskLevel === WeatherEventRiskLevel.LOW) {
		return "bg-green-300";
	} else if (weatherEventRiskLevel === WeatherEventRiskLevel.MEDIUM) {
		return "bg-yellow-300";
	} else if (weatherEventRiskLevel === WeatherEventRiskLevel.HIGH) {
		return "bg-orange-300";
	} else if (weatherEventRiskLevel === WeatherEventRiskLevel.EXTREME) {
		return "bg-red-300";
	} else {
		return "";
	}
};

export const weatherEventRiskLevelIconMap = {
	[WeatherEventRiskLevel.LOW]: '🟢',
	[WeatherEventRiskLevel.MEDIUM]: '🟡',
	[WeatherEventRiskLevel.HIGH]: '🟠',
	[WeatherEventRiskLevel.EXTREME]: '🔴',
};
