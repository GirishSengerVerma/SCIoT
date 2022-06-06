import os
import sys
from threading import Thread

from cli.cli import CLI
from mqtt.mqtt import MQTTClient
from sensor.simulated_sensors import SimulatedTemperatureSensor, SensorMode, SimulatedWindSensor, \
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

    # Stuttgart Vaihingen Office
    ts1 = SimulatedTemperatureSensor("TS01", "Temperature at Vaihingen Office",
                                     SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.MEDIUM)
    ws1 = SimulatedWindSensor("WS01", "Wind Speed at Vaihingen Office",
                              SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.EXTREMELY_LOW)
    hs1 = SimulatedHumiditySensor("HS01", "Relative Humidity at Vaihingen Office",
                                  SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.LOW)
    ps1 = SimulatedPressureSensor("PS01", "Air pressure at Vaihingen Office",
                                  SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.MEDIUM)
    vs1 = SimulatedVibrationSensor("VS01", "Vibration at Vaihingen Office",
                                   SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.EXTREMELY_LOW)
    co2s1 = SimulatedCO2Sensor("CO2S01", "CO2 at Vaihingen Office",
                               SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.MEDIUM)
    cos1 = SimulatedCOSensor("COS01", "CO at Vaihingen Office",
                             SensorLocation.STUTTGART_VAIHINGEN_OFFICE, SensorMode.LOW)

    # Stuttgart Killesbergpark
    ts2 = SimulatedTemperatureSensor("TS02", "Temperature at Killesbergpark",
                                     SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.LOW)
    ws2 = SimulatedWindSensor("WS02", "Wind Speed at Killesbergpark",
                              SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.MEDIUM)
    hs2 = SimulatedHumiditySensor("HS02", "Relative Humidity at Killesbergpark",
                                  SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.LOW)
    ps2 = SimulatedPressureSensor("PS02", "Air pressure at Killesbergpark",
                                  SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.LOW)
    vs2 = SimulatedVibrationSensor("VS02", "Vibration at Killesbergpark",
                                   SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.LOW)
    co2s2 = SimulatedCO2Sensor("CO2S02", "CO2 at Killesbergpark",
                               SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.EXTREMELY_LOW)
    cos2 = SimulatedCOSensor("COS02", "CO at Killesbergpark",
                             SensorLocation.STUTTGART_KILLESBERG_PARK, SensorMode.EXTREMELY_LOW)

    # Stuttgart Max Eyth See
    ts3 = SimulatedTemperatureSensor("TS03", "Temperature at Max Eyth See",
                                     SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.HIGH)
    ws3 = SimulatedWindSensor("WS03", "Wind Speed at Max Eyth See",
                              SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.HIGH)
    hs3 = SimulatedHumiditySensor("HS01", "Relative Humidity at Max Eyth See",
                                  SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.HIGH)
    ps3 = SimulatedPressureSensor("PS03", "Air pressure at Max Eyth See",
                                  SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.HIGH)
    vs3 = SimulatedVibrationSensor("VS03", "Vibration at Max Eyth See",
                                   SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.LOW)
    co2s3 = SimulatedCO2Sensor("CO2S03", "CO2 at Max Eyth See",
                               SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.EXTREMELY_LOW)
    cos3 = SimulatedCOSensor("COS03", "CO at Max Eyth See",
                             SensorLocation.STUTTGART_MAX_EYTH_SEE, SensorMode.EXTREMELY_LOW)

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
