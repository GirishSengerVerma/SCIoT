#  <img src="/screenshots/Logo.svg" width="600px" alt="A Smart Early Detection and Alert System for Severe Weather Events"/>
> SCIoT SS22 Group 30 Project Repository
<img src="/screenshots/Banner.png" alt="Banner image showing our different applications and physical locations"/>

## Setup

Extract the encrypted `passwords.zip` archive using the repository master encryption password to get a `.txt` file containing
all relevant credentials. Note that the archive MUST be extracted inplace (i.e. no new folder is created).

## Run

To run the final application system, perform the following steps:

1. Make sure the MQTT Remote Broker Server is up and running.

2. Make sure the PostgreSQL Remote Database Server is up and running.

3. Navigate to the `dashboard-web-app` directory and follow the steps described
in the `README.md` file there to setup and start the Dashboard Web App (DWA).

4. Navigate to the `authorities-bot` directory and follow the steps described
in the `README.md` file there to setup and start the Authorities Units Notification
and Response Bot.

5. Navigate to the `arduino` directory, configure the WiFi connection in the souce code,
flash the programs onto the Arduino devices and start up the devices.

6. Navigate to the `sensor-simulator` directory and follow the steps described
in the `README.md` file there to setup and start the Sensor Simulator program.

## Made With
<p align="center">
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
<img src="https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white" alt="Arduino"/>
<img src="https://img.shields.io/static/v1?label=&message=Eclipse+Mosquitto&color=%23fa831b&style=for-the-badge&logo=Eclipse+Mosquitto&logoColor=%233C5280" alt="Eclipse Mosquitto"/>
<img src="https://img.shields.io/static/v1?label=&message=PDDL&color=%23a2f054&style=for-the-badge" alt="PDDL"/>
<img src="https://img.shields.io/badge/json-5E5C5C?style=for-the-badge&logo=json&logoColor=white" alt="Json"/>
<img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue" alt="Python"/>
<img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript"/>
<img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="Javascript"/>
<img src="https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00" alt="Svelte"/>
<img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=Svelte&logoColor=white" alt="Sveltekit"/>
<img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma"/>
<img src="https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white" alt="Socket.IO"/>
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
<img src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"/>
<img src="https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E" alt="Prettier"/>
<img src="https://img.shields.io/static/v1?label=&message=ApexCharts&color=%23389dfc&style=for-the-badge" alt="ApexCharts"/>
</p>

## License [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
This project is licensed under the MIT license. More information can be found in the `LICENSE.md` file.
