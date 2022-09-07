# LORA data to Google Chart
Using Google cloud functions to publish [LORA](https://en.wikipedia.org/wiki/LoRa) data to a firestore database and also offer the data over a second cloud function to be visualized in a chart. Data is recoreded with a LORA module and sent to the things network and there forwared to a the Google Cloud Function.

## Dataflow
1. Recodring data with a [Arduino MKRWAN 1310](https://www.arduino.cc/en/Guide/MKRWAN1310) LORA modul and sending over [TTN network](https://www.thethingsnetwork.org/)
2. Using TTN [HTTP integration](hhttps://www.thethingsindustries.com/docs) to forward TTN data to my Google [Cloud Function](https://console.cloud.google.com/functions/list?project=bikecounter)
3. Google Cloud Function pushes data from TTN to a firestore database.
4. Using a second Google Cloud Function to offer an API which can be used with [Google Chart API](https://developers.google.com/chart/interactive/docs).
5. Display data in a HTML page with chart served over github pages

The repo contains all the code from the steps above.

## Debug and access firestore data

It is possible to develop run and debug cloud functions on your local computer by using the emulator which executes your functions locally.

Accessing and modify your firestore data can be done with node.js and key-xy.json file (generated at console.cloud.google.com). See how-to at https://cloud.google.com/firestore/docs/quickstart-servers#firestore_setup_dataset_pt2-nodejs

Or modifie one of the examples from: https://github.com/firebase/snippets-node/blob/e3cca757ca378a21542f40927715eac67c2b86cf/firestore/main/index.js