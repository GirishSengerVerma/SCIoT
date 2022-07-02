import type { Prisma } from '@prisma/client';

export type ActuatorStatusDataWithRelatedWeatherEventData = Prisma.ActuatorStatusDataGetPayload<{
	include: {
		lastChangedBy: {
			include: {
				weatherEvent: true;
			};
		};
	};
}>;

export type WeatherEventActionWithWeatherEvent = Prisma.WeatherEventActionGetPayload<{
	include: {
		weatherEvent: true;
	};
}>;
