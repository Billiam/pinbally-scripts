# PinballY Scripts

|script|description|requires [vpsid support](https://github.com/mjrgh/PinballY/pull/221)?|VPX Version|
|---|---|---|---|
|[3d-launch.js](#3d-launchjs)|Adds a "Play - 3d" launch option|No|10.8+|
|[vps-link.js](#vps-linkjs)|Add "Open spreadsheet" game setup menu item|yes|10.7+|
|[vpc-weekly.js](#vpc-weeklyjs)|Add a filter and spreadsheet link list for Virtual Pinball Chat weekly competition tables|yes|10.7+|

## 3d-launch.js

![Game launch menu with both "Play" and "Play - 3D" options](https://github.com/Billiam/pinbally-scripts/assets/242008/ca55b190-b5c3-41ba-8016-f85ba257b590)

Adds a "Play - 3D" option to the game launch menu. When used, Visual Pinball will be launched with the `-Ini` commandline argument, pointing to `%appdata%\VPinballX\VpinballX.3d.ini` by default.

This script doesn't do anything 3d-related, and assumes that your `VPinballX.ini` will be configured to enable your desired 3d settings.

You can use a different filename by adding `3dLaunchIni=myCustomConfig.ini` in PinballY's settings.txt, or use by using a full
path to the ini file, ex: `3dLaunchIni=C:\Users\Me\Games\myCustomConfig.ini`.

Requires Visual Pinball X 10.8 beta or later, as earlier versions do not support the `-Ini` commandline argument.

## vps-link.js

Shows an `Open spreadsheet` menu item in the game setup menu that opens the correct [spreadsheet](https://virtual-pinball-spreadsheet.web.app/) page (if the game has a vpsid saved).

![game setup menu with the "Open Spreadsheet" currently selected](https://github.com/Billiam/pinbally-scripts/assets/242008/f085292e-3324-4aa7-a30b-cf528e6f3ef0)

## vpc-weekly.js

Add a filter to show a sorted list of the [Virtual Pinball Chat](https://virtualpinballchat.com/#/weekly-rankings/competition-corner) weekly competition tables, and add menu with links to the [spreadsheet](https://virtual-pinball-spreadsheet.web.app/).

Filter list:

![Filter list with "Find VPC Weekly Tables" and "VPC Weekly Competition" menu items](https://github.com/Billiam/pinbally-scripts/assets/242008/2bd8b85b-379f-4e56-98f1-6af5927cc170)

Spreadsheet list:

![Menu with the current and previous weekly competition tables, showing the start date and table name](https://github.com/Billiam/pinbally-scripts/assets/242008/55b3a9b5-27ed-47cf-a9c3-a463b41022fa)
