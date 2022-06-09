import time
from threading import Thread

import curses
from typing import Callable, Optional

from prettytable import PrettyTable

from sensor.simulated_sensors import SENSOR_UNIT_REPRESENTATION_MAP, SimulatedSensor, SensorSimulationMode, \
    SensorLocation, SensorSimulationBehavior
from sensor.simulator import Simulator


def init_screen(screen):
    screen.keypad(True)
    curses.noecho()
    curses.cbreak()
    curses.start_color()
    curses.init_pair(1, curses.COLOR_BLUE, curses.COLOR_BLACK)
    curses.init_pair(2, curses.COLOR_BLACK, curses.COLOR_BLUE)
    curses.init_pair(3, curses.COLOR_RED, curses.COLOR_BLACK)


def print_menu(screen, menu_items: list[str], selected_item_index: int, start_x: int = 5, start_y: int = 4):
    for i, item in enumerate(menu_items):
        if not item:
            screen.addstr(start_y + i, start_x, item)
        elif i == selected_item_index:
            screen.addstr(start_y + i, start_x, (' ↩ ' if item.startswith('Back') else ' ◈ ') + item,
                          curses.color_pair(2))
        else:
            screen.addstr(start_y + i, start_x, (' ↩ ' if item.startswith('Back') else ' ◇ ') + item)


def handle_menu_interaction(screen, menu: list[str], selected_item_index: int, on_submit: Callable):
    key = screen.getch()

    if key == curses.KEY_UP:
        if selected_item_index == 0:
            return len(menu) - 1
        else:
            new_selected_item_index = selected_item_index - 1
            if not menu[new_selected_item_index]:  # skip empty line
                new_selected_item_index -= 1
            return new_selected_item_index
    elif key == curses.KEY_DOWN:
        if selected_item_index == len(menu) - 1:
            return 0
        else:
            new_selected_item_index = selected_item_index + 1
            if not menu[new_selected_item_index]:  # skip empty line
                new_selected_item_index += 1
            return new_selected_item_index
    elif key == curses.KEY_ENTER or key in [10, 13]:  # enter key
        return on_submit()
    else:
        return selected_item_index


class CLI:
    def __init__(self, simulator: Simulator, on_exit: Optional[Callable] = None):
        self.simulator = simulator
        self.on_exit = on_exit
        self.is_loop_active = False

    def ensure_terminal_size(inner_fn: Callable):
        def wrapper(screen_to_update):
            try:
                inner_fn(screen_to_update)
            except:
                screen_to_update.erase()
                screen_to_update.border(0)
                screen_to_update.addstr(1, 5, 'TERMINAL WINDOW TOO SMALL',
                                        curses.color_pair(3) | curses.A_UNDERLINE)
                screen_to_update.addstr(2, 5, 'Please increase the size of the terminal!', curses.color_pair(3))
                screen_to_update.refresh()

        return wrapper

    def exit_screen(self, screen):
        self.is_loop_active = False
        curses.nocbreak()
        screen.keypad(False)
        curses.echo()
        curses.endwin()
        if self.on_exit:
            self.on_exit()

    def enter_main_menu(self):
        def ui(screen):
            selected_item_index = 0
            menu = ['Monitor current sensor values', 'Change the mode & behavior of a specific sensor', 'Exit']

            init_screen(screen)

            @CLI.ensure_terminal_size
            def update(_):
                screen.erase()
                screen.border(0)
                screen.addstr(2, 5, 'SENSOR SIMULATOR: Main Menu',
                              curses.A_BOLD | curses.A_UNDERLINE | curses.color_pair(1))
                print_menu(screen, menu, selected_item_index)
                screen.refresh()

            def on_submit():
                self.is_loop_active = False
                if selected_item_index == 0:
                    self.enter_monitor_menu()
                elif selected_item_index == 1:
                    self.enter_change_sensor_mode_and_behavior_select_menu()
                elif selected_item_index == 2:
                    self.exit_screen(screen)

            self.is_loop_active = True

            while self.is_loop_active:
                update(screen)
                selected_item_index = handle_menu_interaction(screen, menu, selected_item_index, on_submit)

        curses.wrapper(ui)

    def enter_monitor_menu(self):
        def ui(screen):
            init_screen(screen)

            sensor_table = PrettyTable()
            sensor_table.field_names = ['ID', 'Name', 'Location', 'Mode', 'Behavior', 'Measure', 'Value', 'Unit']
            sensor_table_height = 3 + len(SensorLocation) + len(self.simulator.sensors) + 1

            update_thread_running = True

            # TODO Allow changing sensor mode & behavior directly by selecting table row

            def update(screen_to_update):
                @CLI.ensure_terminal_size
                def update_step(_):
                    screen_to_update.erase()
                    screen_to_update.border(0)
                    screen_to_update.addstr(2, 5, 'SENSOR SIMULATOR: Monitor Sensor Data',
                                            curses.A_BOLD | curses.A_UNDERLINE | curses.color_pair(1))

                    sensor_table.clear_rows()
                    for location in SensorLocation:
                        sensors_at_location = self.simulator.get_sensors_at_location_sorted(location)
                        sensor_table.add_rows([[sensor.instance_id, sensor.name, sensor.location.name,
                                                sensor.mode.name, sensor.behavior.name, sensor.measure.name,
                                                sensor.current_value, SENSOR_UNIT_REPRESENTATION_MAP[sensor.unit]]
                                               for sensor in sensors_at_location])
                        sensor_table.add_row(['—' * x for x in [6, 35, 25, 13, 13, 12, 20, 18]])

                    i = 0
                    for sensor_table_line in sensor_table.get_string().splitlines():
                        screen_to_update.addstr(4 + i, 5, sensor_table_line)
                        i += 1

                    screen_to_update.addstr(4 + sensor_table_height + 1, 5, ' ↩ Back to Main Menu',
                                            curses.color_pair(2))

                    screen_to_update.refresh()

                    time.sleep(self.simulator.interval / 1000.0)

                while update_thread_running:
                    update_step(screen_to_update)

            update_ui_thread = Thread(target=update, args=(screen,))
            update_ui_thread.start()

            while True:
                key = screen.getch()

                if key == curses.KEY_ENTER or key in [10, 13]:  # enter key
                    update_thread_running = False
                    update_ui_thread.join()
                    self.enter_main_menu()
                    break

        curses.wrapper(ui)

    def enter_change_sensor_mode_and_behavior_select_menu(self):
        def ui(screen):
            selected_item_index = 0

            menu = []
            for location in SensorLocation:
                sensors_at_location = self.simulator.get_sensors_at_location_sorted(location)
                menu += [sensor.__str__() for sensor in sensors_at_location]
                menu += ['']
            menu += ['Back to Main Menu']

            init_screen(screen)

            @CLI.ensure_terminal_size
            def update(_):
                screen.erase()
                screen.border(0)
                screen.addstr(2, 5, 'SENSOR SIMULATOR: Select Sensor to change Mode & Behavior for',
                              curses.A_BOLD | curses.A_UNDERLINE | curses.color_pair(1))
                print_menu(screen, menu, selected_item_index)
                screen.refresh()

            def on_submit():
                self.is_loop_active = False
                if selected_item_index == len(menu) - 1:  # Back
                    self.enter_main_menu()
                else:  # Sensor selected
                    selected_sensor = next(filter(lambda sensor: sensor.__str__() == menu[selected_item_index],
                                                  self.simulator.sensors))
                    self.enter_change_sensor_mode_and_behavior_edit_menu(selected_sensor)

            self.is_loop_active = True

            while self.is_loop_active:
                update(screen)
                selected_item_index = handle_menu_interaction(screen, menu, selected_item_index, on_submit)

        curses.wrapper(ui)

    def enter_change_sensor_mode_and_behavior_edit_menu(self, sensor: SimulatedSensor):
        def ui(screen):
            selected_item_index = 0

            menu = []
            for mode in SensorSimulationMode:
                for behavior in SensorSimulationBehavior:
                    menu.append(mode.name + ' (' + behavior.name + ')')
                menu.append('')
            menu += ['', 'Back to Sensor Selection']

            confirm_menu = ['Yes', 'No']

            init_screen(screen)

            new_mode_to_confirm: Optional[SensorSimulationMode] = None
            new_behavior_to_confirm: Optional[SensorSimulationBehavior] = None

            @CLI.ensure_terminal_size
            def update(_):
                screen.erase()
                screen.border(0)
                screen.addstr(2, 5, 'SENSOR SIMULATOR: Change Sensor Mode & Behavior',
                              curses.A_BOLD | curses.A_UNDERLINE | curses.color_pair(1))
                screen.addstr(4, 5, 'Selected Sensor: ' + sensor.__str__())
                if new_mode_to_confirm:
                    screen.addstr(6, 5,
                                  'Change the mode & behavior to ' + new_mode_to_confirm.name
                                  + ' (' + new_behavior_to_confirm.name + ') ?')
                    print_menu(screen, confirm_menu, selected_item_index, start_y=7)
                else:
                    print_menu(screen, menu, selected_item_index, start_y=6)
                screen.refresh()

            def on_submit():
                nonlocal new_mode_to_confirm
                nonlocal new_behavior_to_confirm
                nonlocal selected_item_index

                if new_mode_to_confirm:
                    if selected_item_index == 0:  # Accept mode & behavior change
                        sensor.change_mode(new_mode_to_confirm)
                        sensor.change_behavior(new_behavior_to_confirm)
                        self.simulator.mqtt_client.client.publish(sensor.get_metadata_mqtt_topic_name(),
                                                                  sensor.get_metadata_mqtt_message())
                        self.enter_main_menu()
                        return 0
                    elif selected_item_index == 1:  # Reject mode & behavior change
                        new_mode_to_confirm = None
                        new_behavior_to_confirm = None
                        return 0
                else:
                    if selected_item_index == len(menu) - 1:  # Back
                        self.is_loop_active = False
                        self.enter_change_sensor_mode_and_behavior_select_menu()
                        return 0
                    else:  # New sensor mode & behavior selected
                        selected_item = menu[selected_item_index]
                        new_mode_to_confirm = next(
                            filter(
                                lambda m: m.name.lower() == selected_item.split(' ')[0].lower(),
                                SensorSimulationMode
                            )
                        )
                        new_behavior_to_confirm = next(
                            filter(
                                lambda b:
                                    b.name.lower() == selected_item.split(' ')[1]
                                    .replace('(', '').replace(')', '').lower(),
                                SensorSimulationBehavior
                            )
                        )
                        return 1

            self.is_loop_active = True

            while self.is_loop_active:
                update(screen)
                selected_item_index = handle_menu_interaction(screen, confirm_menu if new_mode_to_confirm else menu,
                                                              selected_item_index, on_submit)

        curses.wrapper(ui)
