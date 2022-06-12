import os
import sys
from threading import Thread

from cli.cli import CLI
from mqtt.mqtt import MQTTClient
from sensor.simulated_sensors import SimulatedTemperatureSensor, SensorSimulationMode, SimulatedWindSensor, \
    SimulatedHumiditySensor, \
    SimulatedPressureSensor, SimulatedVibrationSensor, SimulatedCO2Sensor, SimulatedCOSensor, SensorLocation
from sensor.simulator import Simulator

UPDATE_INTERVAL_IN_MS = 300

if __name__ == '__main__':
    # Setup MQTT Client
    mqtt_username = input('Enter MQTT Username:')
    mqtt_password = input('Enter MQTT Password:')
    mqtt_client = MQTTClient(mqtt_username, mqtt_password)
    mqtt_client_thread = Thread(target=mqtt_client.loop)
    mqtt_client_thread.start()

    # TODO SESI Directly dirive instance ids from given sensor type and data!

    # Stuttgart Vaihingen Office
    ts1 = SimulatedTemperatureSensor("SVO_TEMPERATURE_S", "Temperature at Vaihingen Office",
                                     SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.MEDIUM)
    ws1 = SimulatedWindSensor("SVO_WIND_SPEED_S", "Wind Speed at Vaihingen Office",
                              SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.EXTREMELY_LOW)
    hs1 = SimulatedHumiditySensor("SVO_HUMIDITY_S", "Relative Humidity at Vaihingen Office",
                                  SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.LOW)
    ps1 = SimulatedPressureSensor("SVO_PRESSURE_S", "Air pressure at Vaihingen Office",
                                  SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.MEDIUM)
    vs1 = SimulatedVibrationSensor("SVO_VIBRATION_S", "Vibration at Vaihingen Office",
                                   SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.EXTREMELY_LOW)
    co2s1 = SimulatedCO2Sensor("SVO_CO2_S", "CO2 at Vaihingen Office",
                               SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.MEDIUM)
    cos1 = SimulatedCOSensor("SVO_CO_S", "CO at Vaihingen Office",
                             SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorSimulationMode.LOW)

    # Stuttgart Killesbergpark
    ts2 = SimulatedTemperatureSensor("SKP_TEMPERATURE_S", "Temperature at Killesbergpark",
                                     SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.LOW)
    ws2 = SimulatedWindSensor("SKP_WIND_SPEED_S", "Wind Speed at Killesbergpark",
                              SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.MEDIUM)
    hs2 = SimulatedHumiditySensor("SKP_HUMIDITY_S", "Relative Humidity at Killesbergpark",
                                  SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.LOW)
    ps2 = SimulatedPressureSensor("SKP_PRESSURE_S", "Air pressure at Killesbergpark",
                                  SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.LOW)
    vs2 = SimulatedVibrationSensor("SKP_VIBRATION_S", "Vibration at Killesbergpark",
                                   SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.LOW)
    co2s2 = SimulatedCO2Sensor("SKP_CO2_S", "CO2 at Killesbergpark",
                               SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.EXTREMELY_LOW)
    cos2 = SimulatedCOSensor("SKP_CO_S", "CO at Killesbergpark",
                             SensorLocation.STUTTGART_KILLESBERG_PARK, SensorSimulationMode.EXTREMELY_LOW)

    # Stuttgart Max Eyth See
    ts3 = SimulatedTemperatureSensor("SMES_TEMPERATURE_S", "Temperature at Max Eyth See",
                                     SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.HIGH)
    ws3 = SimulatedWindSensor("SMES_WIND_SPEED_S", "Wind Speed at Max Eyth See",
                              SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.HIGH)
    hs3 = SimulatedHumiditySensor("SMES_HUMIDITY_S", "Relative Humidity at Max Eyth See",
                                  SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.HIGH)
    ps3 = SimulatedPressureSensor("SMES_PRESSURE_S", "Air pressure at Max Eyth See",
                                  SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.HIGH)
    vs3 = SimulatedVibrationSensor("SMES_VIBRATION_S", "Vibration at Max Eyth See",
                                   SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.LOW)
    co2s3 = SimulatedCO2Sensor("SMES_CO2_S", "CO2 at Max Eyth See",
                               SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.EXTREMELY_LOW)
    cos3 = SimulatedCOSensor("SMES_CO_S", "CO at Max Eyth See",
                             SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorSimulationMode.EXTREMELY_LOW)

    # Initialize the simulator
    simulator = Simulator(UPDATE_INTERVAL_IN_MS, mqtt_client)

    # Add sensors

    simulator.add_sensor(ts1)
    simulator.add_sensor(ws1)
    simulator.add_sensor(hs1)
    simulator.add_sensor(ps1)
    simulator.add_sensor(vs1)
    simulator.add_sensor(co2s1)
    simulator.add_sensor(cos1)

    simulator.add_sensor(ts2)
    simulator.add_sensor(ws2)
    simulator.add_sensor(hs2)
    simulator.add_sensor(ps2)
    simulator.add_sensor(vs2)
    simulator.add_sensor(co2s2)
    simulator.add_sensor(cos2)

    simulator.add_sensor(ts3)
    simulator.add_sensor(ws3)
    simulator.add_sensor(hs3)
    simulator.add_sensor(ps3)
    simulator.add_sensor(vs3)
    simulator.add_sensor(co2s3)
    simulator.add_sensor(cos3)

    # Announce sensors by sending metadata MQTT message
    simulator.announce_sensors()

    # Add callback listener for incoming MQTT messages to simulator
    mqtt_client.add_listener(simulator.on_mqtt_message)

    # Run CLI in seperate thread
    def on_exit():
        simulator.stop()
        mqtt_client.disconnect()
        if os.name == 'posix':
            os.system('clear')
        else:
            os.system('cls')
        print('Goodbye.')
        quit()
    cli = CLI(simulator, on_exit)
    cli_thread = Thread(target=cli.enter_main_menu)
    cli_thread.start()

    # Start simulation
    simulator.start()
