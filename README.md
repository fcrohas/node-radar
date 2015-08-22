# ADSB Radar for Node JS

## Description

This is a small NodeJS / IOJs application server than can be run on Raspberry PI or small computer.

This program is written with AngularJs and Bootstrap as a technology and web socket test architecture.

##Features

* Realtime display plane location when using RTL-SDR and dump1090 RTL1090 or any SBS receiver
* VirtualRadar compatible, complete your receiver output with web virtualradar station
* Coverage map of your antenna
* History of all plane around you
* Statistics of planne in your area
* Display plane per color to know which one are realtime or lost
* Dynamic Filter with keyword all planes
* Display selected plane track with altitude color variation



## How to install

Simply git clone this repository.

Then do in current folder :

<pre><code> npm install </pre></code>

## Setup

Node Radar can accept multiple receiver backend at same time
You can setup the config file in config directory that match your NODE_ENV environment variable.

### Parameters

HttpServer -> Port -> your nodejs listening port

#### Receivers

This will describe a receiver station

- Enable : receive information ?
- Host : receiver ip address or hostname
- Port : receiver listening port
- Url : if http receiver, url to json output
- Name : the site description
- Latitude,Longitude : the receiver geo position
- Refresh : the refresh time when json output
