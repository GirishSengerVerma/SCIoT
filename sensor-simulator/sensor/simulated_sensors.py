import json
from datetime import datetime
from enum import Enum
from abc import ABC, abstractmethod
from typing import Callable

from scipy.stats import truncnorm


class SensorLocation(Enum):
    STUTTGART_VAIHINGEN_OFFICE = 1
    STUTTGART_KILLESBERG_PARK = 2
    STUTTGART_MAX_EYTH_SEE = 3


class SensorMeasure(Enum):
    TEMPERATURE = 1
    WIND_SPEED = 2
    HUMIDITY = 3
    PRESSURE = 4
    VIBRATION = 5
    CO = 6
    CO2 = 7
    SOUND = 8


SENSOR_MEASURE_COLOR_MAP = {
    SensorMeasure.TEMPERATURE: 'firebrick',
    SensorMeasure.WIND_SPEED: 'orange',
    SensorMeasure.HUMIDITY: 'cornflowerblue',
    SensorMeasure.PRESSURE: 'hotpink',
    SensorMeasure.VIBRATION: 'saddlebrown',
    SensorMeasure.CO2: 'grey',
    SensorMeasure.CO: 'black',
    SensorMeasure.SOUND: 'green'
}


class SensorUnit(Enum):
    DEGREES_CELSIUS = 1
    KILOMETERS_PER_HOUR = 2
    PERCENTAGE = 3
    HPA = 4
    RICHTER_MAGNITUDE = 5
    PPM = 6
    DB = 7


SENSOR_UNIT_REPRESENTATION_MAP = {
    SensorUnit.DEGREES_CELSIUS: '°C',
    SensorUnit.KILOMETERS_PER_HOUR: 'km/h',
    SensorUnit.PERCENTAGE: '%',
    SensorUnit.HPA: 'hPa',
    SensorUnit.RICHTER_MAGNITUDE: 'Richter magnitude',
    SensorUnit.PPM: 'ppm',
    SensorUnit.DB: 'dB'
}


class SensorSimulationMode(Enum):
    EXTREMELY_LOW = 1
    LOW = 2
    MEDIUM = 3
    HIGH = 4
    EXTREMELY_HIGH = 5


class SensorSimulationBehavior(Enum):
    NORMAL_DISTRIBUTED = 1
    INCREASING = 2
    DECREASING = 3


def truncnorm_value(min_value: float, max_value: float, mean: float, sd: float) -> float:
    """ Generate a random temperature value based on a truncated normal distribution based on the given parameters."""
    # TODO Smoothly transition from old value to next value using delta time
    return truncnorm.rvs((min_value - mean) / sd,
                                 (max_value - mean) / sd, 
                                 loc=mean, scale=sd)


def quadratic_ease_in_out(time: float) -> float:
    """ Generate a value between 0 and 1 over time based on a quadratic ease in out function."""
    # Source: https://starbeamrainbowlabs.com/blog/article.php?article=posts/132-Easy-Ease-In-Out.html
    return (2.0 * time * time) \
        if time < 0.5 \
        else (-1.0 + (4.0 - 2.0 * time) * time)


def generate_new_sensor_value(time: float, min_value: float, max_value: float, mean: float,
                              sd: float, behavior: SensorSimulationBehavior) -> float:
    """ Generate a random temperature value where the distribution depends on the current simulation mode."""
    if behavior == SensorSimulationBehavior.NORMAL_DISTRIBUTED:
        return truncnorm_value(min_value, max_value, mean, sd)
    elif behavior == SensorSimulationBehavior.INCREASING:
        # Use an increasing quadratic ease in out function based on the given parameters for min, max
        return min_value + quadratic_ease_in_out(time) * (max_value - min_value)
    elif behavior == SensorSimulationBehavior.DECREASING:
        # Use a decreasing quadratic ease in out function based on the given parameters for min, max
        return max_value - quadratic_ease_in_out(time) * (max_value - min_value)
    else:
        raise ValueError("Unexpected simulation behavior: " + behavior.name)


class SimulatedSensor(ABC):
    """ Abstract definition of a simulated sensor.

        The sensor must have an instance id, a name, a measure, a unit and a location.
        The sensor provides a function to sense the current value that must be implemented by the concrete class.
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 measure: SensorMeasure, unit: SensorUnit,
                 initial_mode: SensorSimulationMode, initial_behavior: SensorSimulationBehavior,
                 time_step: float = 0.01):
        self.instance_id = instance_id
        self.name = name
        self.location = location
        self.measure = measure
        self.unit = unit
        self.mode = initial_mode
        self.behavior = initial_behavior
        self.current_value = 0.0
        self.time = 0.0
        self.time_step = time_step

    def __str__(self):
        return "{} ({}): Sensing {} in {} at {}. Current mode: {}. Current behavior: {}." \
            .format(self.instance_id, self.name, self.measure.name, self.unit.name,
                    self.location.name, self.mode.name, self.behavior.name)

    def __repr__(self):
        return "{} ({}): Sensing {} in {} at {}. Current mode: {}. Current behavior: {}. Current value: {}." \
            .format(self.instance_id, self.name, self.measure.name, self.unit.name,
                    self.location.name, self.mode.name, self.behavior.name, self.current_value)

    def update_current_value_after_sensing(fn: Callable) -> Callable:
        def wrapper(self):
            sensed_value = fn(self)
            self.current_value = sensed_value
            self.time = min(1.0, self.time + self.time_step)
            return sensed_value

        return wrapper

    @abstractmethod
    def sense(self) -> float:
        raise NotImplementedError

    def change_mode(self, new_mode_to_confirm: SensorSimulationMode):
        self.mode = new_mode_to_confirm
        self.time = 0.0  # reset time for increasing & decreasing behavior

    def change_behavior(self, new_behavior_to_confirm: SensorSimulationBehavior):
        self.behavior = new_behavior_to_confirm
        self.time = 0.0  # reset time for increasing & decreasing behavior

    def get_telemetry_data_mqtt_topic_name(self) -> str:
        return 'sensors/telemetry/{}/{}'.format(self.location.name.lower(), self.measure.name.lower())

    def get_telemetry_data_mqtt_message(self) -> str:
        return json.dumps({
            "instance_id": self.instance_id,
            "timestamp": datetime.now().strftime("%d-%m-%YT%H:%M:%S"),
            "unit": self.unit.name.lower(),
            "value": self.current_value
        })

    def get_metadata_mqtt_topic_name(self) -> str:
        return 'sensors/metadata/{}/{}'.format(self.location.name.lower(), self.measure.name.lower(), self.instance_id)

    def get_metadata_mqtt_message(self) -> str:
        return json.dumps({
            "instance_id": self.instance_id,
            "timestamp": datetime.now().strftime("%d-%m-%YT%H:%M:%S"),
            "name": self.name,
            "location": self.location.name.lower(),
            "simulationMode": self.mode.name.lower(),
            "simulationBehavior": self.behavior.name.lower()
        })


class SimulatedTemperatureSensor(SimulatedSensor):
    """ Concrete definition of a simulated temperature sensor.

        The sensed temperature in °C is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.MEDIUM,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.TEMPERATURE, SensorUnit.DEGREES_CELSIUS,
                         initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # indicates snow/ ice
            return generate_new_sensor_value(time=self.time,
                                             min_value=-5.0, max_value=3.0,
                                             mean=1.0, sd=2.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:
            return generate_new_sensor_value(time=self.time,
                                             min_value=4.0, max_value=11.0,
                                             mean=6.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:
            return generate_new_sensor_value(time=self.time,
                                             min_value=12.0, max_value=24.0,
                                             mean=15.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:
            return generate_new_sensor_value(time=self.time,
                                             min_value=25.0, max_value=37.0,
                                             mean=30.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:  # indicates wild fire
            return generate_new_sensor_value(time=self.time,
                                             min_value=300.0, max_value=1000.0,
                                             mean=450.0, sd=50.0,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)


class SimulatedWindSensor(SimulatedSensor):
    """ Concrete definition of a simulated wind sensor.

        The sensed wind speed in km/h is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
        The parameters are based on the Beaufort-Scale
        (e.g. see https://www.dwd.de/DE/service/lexikon/Functions/glossar.html?lv2=100310&lv3=100390)
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.LOW,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.WIND_SPEED, SensorUnit.KILOMETERS_PER_HOUR,
                         initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # no drastic effects
            return generate_new_sensor_value(time=self.time,
                                             min_value=0.0, max_value=3.0,
                                             mean=1.0, sd=1.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:
            return generate_new_sensor_value(time=self.time,
                                             min_value=4.0, max_value=11.0,
                                             mean=8.0, sd=2.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:
            return generate_new_sensor_value(time=self.time,
                                             min_value=12.0, max_value=28.0,
                                             mean=22.0, sd=5.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:
            return generate_new_sensor_value(time=self.time,
                                             min_value=29.0, max_value=74.0,
                                             mean=45.0, sd=5.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:  # may indicate strong (snow) storm or hurricane
            return generate_new_sensor_value(time=self.time,
                                             min_value=75.0, max_value=130.0,
                                             mean=90.0, sd=20.0,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)


class SimulatedHumiditySensor(SimulatedSensor):
    """ Concrete definition of a simulated humidity sensor.

        The sensed humidity in % is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.MEDIUM,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.HUMIDITY, SensorUnit.PERCENTAGE,
                         initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # high risk for wild fire
            return generate_new_sensor_value(time=self.time,
                                             min_value=15.0, max_value=30.0,
                                             mean=20.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:
            return generate_new_sensor_value(time=self.time,
                                             min_value=30.0, max_value=40.0,
                                             mean=35.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:
            return generate_new_sensor_value(time=self.time,
                                             min_value=40.0, max_value=60.0,
                                             mean=50.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:
            return generate_new_sensor_value(time=self.time,
                                             min_value=60.0, max_value=75.0,
                                             mean=65.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:
            # inside buildings: health risk, outside: may indicate hurricane
            return generate_new_sensor_value(time=self.time,
                                             min_value=75.0, max_value=100.0,
                                             mean=86.0, sd=6.0,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)


class SimulatedPressureSensor(SimulatedSensor):
    """ Concrete definition of a simulated pressure sensor.

        The sensed pressure in hPa is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
        For the values chosen, see e.g.
            https://www.outdoor-magazin.com/klettern/trocken-bleiben-mehr-uebers-wetter-wissen/
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.MEDIUM,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.PRESSURE, SensorUnit.HPA,
                         initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # indicates storm or even hurricane
            return generate_new_sensor_value(time=self.time,
                                             min_value=940.0, max_value=990.0,
                                             mean=965.0, sd=2.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:  # indicates clouds building up, may lead to rain or snow or storm
            return generate_new_sensor_value(time=self.time,
                                             min_value=990.0, max_value=1005.0,
                                             mean=1000.0, sd=2.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:  # indicates normal weather
            return generate_new_sensor_value(time=self.time,
                                             min_value=1010.0, max_value=1016.0,
                                             mean=1013.0, sd=1.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:
            return generate_new_sensor_value(time=self.time,
                                             min_value=1017.0, max_value=1030.0,
                                             mean=1020.0, sd=2.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:  # indicates good weather (no clouds, sunny)
            return generate_new_sensor_value(time=self.time,
                                             min_value=1030.0, max_value=1060.0,
                                             mean=1035.0, sd=2.0,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)


class SimulatedVibrationSensor(SimulatedSensor):
    """ Concrete definition of a simulated vibration sensor.

        The sensed vibration in Richter-magnitude is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
        For the values chosen, see e.g.
        https://www.aktion-deutschland-hilft.de/de/fachthemen/natur-humanitaere-katastrophen/erdbeben/richterskala-ab-staerke-5-wird-es-gefaehrlich/
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.EXTREMELY_LOW,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.VIBRATION,
                         SensorUnit.RICHTER_MAGNITUDE, initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # no noticeable vibration
            return generate_new_sensor_value(time=self.time,
                                             min_value=0.0, max_value=2.0,
                                             mean=0.0, sd=0.5,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:  # not noticeable but measurable
            return generate_new_sensor_value(time=self.time,
                                             min_value=2.0, max_value=3.0,
                                             mean=2.0, sd=0.5,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:  # noticeable vibration
            return generate_new_sensor_value(time=self.time,
                                             min_value=3.0, max_value=4.0,
                                             mean=3.0, sd=0.5,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:  # moderate earth quake
            return generate_new_sensor_value(time=self.time,
                                             min_value=4.0, max_value=5.0,
                                             mean=4.0, sd=0.5,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:  # strong earth quake
            return generate_new_sensor_value(time=self.time,
                                             min_value=5.0, max_value=7.5,
                                             mean=6.0, sd=0.5,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)


class SimulatedCO2Sensor(SimulatedSensor):
    """ Concrete definition of a simulated CO2 sensor.

        The sensed absolute CO2 level in ppm is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
        For the values chosen, see e.g.
        https://www.umweltbundesamt.de/sites/default/files/medien/pdfs/kohlendioxid_2008.pdf
        https://sichereswissen.info/richtiges-lueften-co2-konzentration-als-anhaltspunkt/
        https://www.engineeringtoolbox.com/co2-comfort-level-d_1024.html
        https://www.ffb.kit.edu/download/CD-FFB_IMK_Ber._Nr._137_Gaskonzentration_waehrend_eines_Flashovers.pdf
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.LOW,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.CO2, SensorUnit.PPM,
                         initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # normal value outside of buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=300.0, max_value=500.0,
                                             mean=400.0, sd=60.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:  # good air quality inside buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=500.0, max_value=800.0,
                                             mean=700.0, sd=100.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:  # medium air quality inside buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=800.0, max_value=1400.0,
                                             mean=1100.0, sd=100.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:  # low air quality inside buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=1400.0, max_value=2000.0,
                                             mean=1600.0, sd=100.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:  # indicates fire
            return generate_new_sensor_value(time=self.time,
                                             min_value=30000.0, max_value=100000.0,
                                             mean=50000.0, sd=15000.0,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)


class SimulatedCOSensor(SimulatedSensor):
    """ Concrete definition of a simulated CO sensor.

        The sensed absolute CO level in ppm is simulated using a truncated normal distribution. The parameters
        of this distribution (min, max, mean, standard deviation) differ based on the current sensor mode.
        For the values chosen, see e.g.
        https://sync.einsatzleiterwiki.de/doku.php?id=cbrn:chemisch:klasse_2:stoffe:kohlenmonoxid
        https://www.eielectronics.de/wissen/kohlenmonoxid
        https://www.air-q.com/messwerte/kohlenmonoxid
        https://de.wikipedia.org/wiki/Kohlenstoffmonoxid
    """

    def __init__(self, instance_id: str, name: str, location: SensorLocation,
                 initial_mode: SensorSimulationMode = SensorSimulationMode.LOW,
                 initial_behavior: SensorSimulationBehavior = SensorSimulationBehavior.NORMAL_DISTRIBUTED):
        super().__init__(instance_id, name, location, SensorMeasure.CO, SensorUnit.PPM,
                         initial_mode, initial_behavior)

    @SimulatedSensor.update_current_value_after_sensing
    def sense(self) -> float:
        if self.mode is SensorSimulationMode.EXTREMELY_LOW:  # good air quality, normal outside of buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=0.0, max_value=5.0,
                                             mean=3.0, sd=3.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.LOW:  # good air quality inside buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=5.0, max_value=10.0,
                                             mean=7.0, sd=4.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.MEDIUM:  # buildings with fireplace/ smokers/ .. or some work places
            return generate_new_sensor_value(time=self.time,
                                             min_value=10.0, max_value=30.0,
                                             mean=20.0, sd=7.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.HIGH:  # normal on streets, danger to health inside buildings
            return generate_new_sensor_value(time=self.time,
                                             min_value=100.0, max_value=200.0,
                                             mean=150.0, sd=40.0,
                                             behavior=self.behavior)
        elif self.mode is SensorSimulationMode.EXTREMELY_HIGH:  # indicates fire/ gas leak
            return generate_new_sensor_value(time=self.time,
                                             min_value=300.0, max_value=3000.0,
                                             mean=500.0, sd=200.0,
                                             behavior=self.behavior)
        else:
            raise RuntimeError("Unexpected sensor mode: " + self.mode.name)

# TODO Implement simulated sensors for
#       SOUND
