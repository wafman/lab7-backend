'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.static('./public'));

app.get('/', (request, response) => {
  response.send('server works');
});

function GEOloc(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}


function Forecast(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}

function handleError() {
  return { 'status': 500, 'responseText': 'Sorry, something went wrong' };
}

app.get('/location', (request, response) => {
  try {
    const queryData = request.query.data;
    let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;
    superagent.get(geocodeURL)
      .end((err, res) => {
        console.log(res.body);
        const location = new GEOloc(queryData, res.body);
        response.send(location);
      });
    // const data = require('./data/geo.json');
    // // console.log(data.address_component);
    // let city = new GEOloc(request.query.data, data.results[0].formatted_address, data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
    // response.send(city);
  } catch (error) {
    response.send(handleError);
  }

});


app.get('/weather', (request, response) => {
  
  try {
    const data = require('./data/darksky.json');
    let daily = Object.entries(data)[6];
    let dailyData = daily[1].data;//hourly day forecast
    let myForecast = dailyData.map( element => {
      let date = new Date(element.time * 1000).toDateString();
      let temp = new Forecast(element.summary, date);
      return temp;
    });
    // let myForecast = [];
    // dailyData.forEach(element => {
    //   let date = new Date(element.time * 1000).toDateString();
    //   let temp = new Forecast(element.summary, date);
    //   myForecast.push(temp);
    // });
    console.log(myForecast);
    response.send(myForecast);

    // return myForecast;
  } catch (error) {
    response.send(handleError);
  }



});


app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
