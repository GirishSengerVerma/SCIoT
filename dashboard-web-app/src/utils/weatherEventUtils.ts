import type { WeatherEventActionWithWeatherEvent } from '$root/types/additionalPrismaTypes';
import { enumValueToString } from './enumUtil';

export const formatWeatherEventAction = (
	weatherEventAction: WeatherEventActionWithWeatherEvent,
	includeEvent: boolean,
	includeEventLocation: boolean
) => {
	let formattedWeatherEventAction = '';

	if (includeEvent && weatherEventAction.weatherEvent) {
		formattedWeatherEventAction +=
			'Due to ' + enumValueToString(weatherEventAction.weatherEvent.type);
		if (includeEventLocation) {
			formattedWeatherEventAction +=
				' at ' + enumValueToString(weatherEventAction.weatherEvent.location);
		}
		formattedWeatherEventAction += ': ';
	}

	formattedWeatherEventAction +=
		(weatherEventAction.wasManuallyTaken ? 'Manually ' : 'Automatically ') +
		enumValueToString(weatherEventAction.type);

	return formattedWeatherEventAction;
};
