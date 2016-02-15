# ADSB Radar for NodeJS

## Description

This is a small NodeJS / IOJs application server than can be run on Raspberry PI or small computer.

This program is written with AngularJs and Bootstrap as a technology showcase and web socket architecture.

## Features

- [x] Realtime display plane location when using RTL-SDR and dump1090 RTL1090 or any SBS receiver
- [x] VirtualRadar compatible, complete your receiver output with web virtualradar station
- [x] Coverage map of your antenna
- [x] History of all planes around you
- [ ] Statistics of planes in your area
- [x] Display planes per color to know which one are realtime or lost
- [x] Dynamic Filter with keyword for all planes
- [x] Display selected plane track with altitude color variation
- [x] Track plane and description Features
- [ ] Filter planes inside current view
- [ ] Sharing server support


## How to install

Simply git clone this repository.

<pre><code> ~$ git clone https://github.com/fcrohas/node-radar.git </pre></code>

Then do in node-radar folder :

<pre><code> ~$ npm install </pre></code>

## Setup

Node Radar can accept multiple receiver backend at same time
You can setup the config file in config directory that match your NODE_ENV environment variable.

Optionaly if you want to see plane silhouette, you can can your directory SilhouettesLogos from [SBS Resources](http://www.kinetic.co.uk/resourcesdownloads.php) to public/img/SilhouettesLogos

### Parameters

#### HTTP Server

The NodeJS server configuration

| Parameter | Description |
|---|---|
| port | The NodeJS listening port |


#### Proxy

If you are behind a proxy server

| Parameter | Description |
|---|---|
| enable | Boolean to enable proxy support |
| host | Proxy server IP address |
| port | Proxy listening port |
| BasicAuth.enable | Boolean to ennable proxy authentication |
| BasicAuth.login | Proxy User |
| BasicAuth.password | Proxy password |


#### Receivers

This will describe the configuration receiver station JSON array

| Parameter | Description |
|---|---|
| Enable | Boolean state of this receiver |
| Host | IP address |
| Port | Listening port |
| Url | If Type is not LIVE then the Http base url to JSON output |
| Name | A friendly receiver name |
| Latitude | The receiver geo position |
| Longitude | The receiver geo position |
| Refresh | The refresh time interval, not use for LIVE type |

#### Planes

This is the plane management configuration :

| Parameter | Description |
|---|---|
| quality.[status].seen | Plane status is considered good if data are receveived in this time interval |
| quality.[status].color | Plane status good color |
| memory.timeout_client | After this time in seconds, the plane will be erased from browser memory |
| memory.timeout_server| After this time in seconds, the plane will be erased from server memory |
| refresh_time | Refresh interval to check for plane status change |
