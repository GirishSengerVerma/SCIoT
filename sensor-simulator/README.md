# SCIoT SS22 Group 30 Sensor Simulator

## Setup

- Extract the contents of the encrypted `.env.zip` archive using the repository master encryption password and make sure you extract the `.env` file directly (i.e. the file is located directly inside this directory and not in a seperate folder).
- Open this folder as a PyCharm project.
- Make sure that a valid Python 3.9 environment is configured or create a new (virtual) environment.
- If you are NOT on Windows, install the required dependencies for the `psycopg2` library as follows:
  ```
  sudo apt install python3-dev libpq-dev
  ```
- Then install the required packages listed in `requirements.txt` inside the Python 3.9 virtual environment. This can e.g. be done by opening the
`requirements.txt` in PyCharm and clicking on the install button in the top right corner.
- In PyCharm, make sure you have selected the run configuration
`Sensor Simulator (main.py)` or if it does not exist create a new run configuration for the `main.py` file and make sure the box 
`Emulate terminal in output console` is ticked.

## Run

Then start the program using the `Sensor Simulator (main.py)` run configuration and input the credentials for the MQTT broker in the interactive terminal. You should now see the main menu that can be interacted with using the arrow keys and the enter key.
