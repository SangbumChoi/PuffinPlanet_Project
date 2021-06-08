const fetch = require("node-fetch");

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

async function getPuffData () {
  try{
    let response = await fetch(
      'https://clairynet-dev.com/graphql',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            getTodayIndoorAtmLogs(sectionId: "5f4ef3f0706250145618bb7f"){
              measurements{
                logtime
                temp
                humid
                pm25
                co2
                voc
              }
            }
          }`
        })
      }
    );
    // console.log(result);
    let result = await response.json();
    var ret = result.data.getTodayIndoorAtmLogs.measurements.last();
    return ret;
  }
  catch(err){
    console.log(err);
    return null;
  }
}

async function getVentLevelData () {
  try{
    let response = await fetch(
      'https://clairynet-dev.com/graphql',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            getTodayErvLogs(ervId: "5f3355fabf556f3fc5479f52"){
              from
              to
              actions{
                logtime
                fanspeed
                vspIn
                vspOut
                ventLevel
              }
            }
          }`
        })
      }
    );
    let result = await response.json();;
    var ret = result.data.getTodayErvLogs.actions.last();
    return ret.ventLevel;
  }
  catch(err){
    console.log(err);
    return null;
  }
}

async function getOutsideWeather() {
  try{
    let response = await fetch(
      'https://clairynet-dev.com/graphql',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            getTodayOutdoorAtmLogs(locationId: "5f3355fabf556f3fc5479f52"){
              measurements{
                logtime
                temp
                humid
                pm25
              }
            }
          }`
        })
      }
    );
    let result = await response.json();;
    var ret = result.data.getTodayOutdoorAtmLogs.measurements.last();
    return ret;
  }
  catch(err){
    console.log(err);
    return null;
  }
}


module.exports = {
    getPuffData,
    getVentLevelData,
    getOutsideWeather
}

