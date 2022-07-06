import { UnitType } from '@prisma/client';

export const unitTypeIconMap = {
	[UnitType.AMBULANCE]: '🚑',
	[UnitType.POLICE_CAR]: '🚓',
	[UnitType.FIRE_TRUCK]: '🚒'
};

export const getColorByUnitType = (unitType: UnitType) => {
	if (unitType === UnitType.AMBULANCE) {
		return 'bg-yellow-200';
	} else if (unitType === UnitType.FIRE_TRUCK) {
		return 'bg-red-200';
	} else if (unitType === UnitType.POLICE_CAR) {
		return 'bg-blue-200';
	} else {
		return '';
	}
};
