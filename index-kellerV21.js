/**
 * Google cloud function for graph data preparation
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
moment.locale('de');


admin.initializeApp();
const database = admin.firestore();
let chartData = {};
let sums = new Map();
let currentTimeFromData;

function resetData() {
    chartData.cols = [
        { "id": "time", "label": "Zeit", "pattern": "", "type": "date" },
        { "id": "event", "label": "Event", "pattern": "", "type": "number" }];
    chartData.rows = [];
}

function doRespond(statusCode, responseString, response, asJson) {
    response.statusCode = statusCode;
    response.setHeader('Access-Control-Allow-Origin', "*");
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    if (asJson) {
        response.setHeader("Content-Type", "application/json");
    } else {
        response.setHeader("Content-Type", "text/html");
    }
    response.send(responseString);
}

exports.printGraphData = functions.https.onRequest((request, response) => {

    resetData();
    //queryTime must be in format 2020-03-22 for march, 22
    let queryTime = request.query.q;
    let collection = request.query.collection;
    const countersRef = database.collection(collection);
    let now = new Date();
    let start = moment(now).startOf('month').format("YYYY-MM-DD");
    let end = moment(now).endOf('month').format("YYYY-MM-DD");
    let lastDayOfMonth = parseInt(moment(now).endOf('month').format("DD"));
    if (queryTime) {
        start = moment(new Date(queryTime)).startOf('month').format("YYYY-MM-DD");
        end = moment(new Date(queryTime)).endOf('month').format("YYYY-MM-DD");
        lastDayOfMonth = parseInt(moment(new Date(queryTime)).endOf('month').format("DD"));
    }
    let query = countersRef
        .where('timestamp', '>=', start)
        .where('timestamp', '<=', end + "T23:59:59")
        .orderBy("timestamp", "asc").get()
        .then(snapshot => {
            if (snapshot.empty) {
                doRespond(404, "<h1>No matching documents.</h1>", response);
            }

            snapshot.forEach(doc => {
                let data = doc.data();
                let date = new Date(Date.parse(data.timestamp));
                let year = moment(date).format("YYYY");
                let month = date.getMonth();
                let day = moment(date).format("DD");
                let hour = moment(date).format("H");
                let minute = moment(date).format("m");
                let event = data.event;
                let row = `{"c":[{"v":"Date(${year},${month},${day},${hour},${minute})","f":null},{"v":${event},"f":null}]}`;
                if (parseInt(event) > 5 || collection == "relayIsPowered") { //filter 0 values of temp. and humid. but not relais 
                    chartData.rows.push(JSON.parse(row));
                }
            });

            doRespond(200, JSON.stringify(chartData), response, true);
        })
        .catch(err => {
            doRespond(500, "<h1>Error getting documents</h1>", response);
        });

});