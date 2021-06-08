const weatherExample = {
    "coord": {
      "lon": -122.08,
      "lat": 37.39
    },
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ],
    "base": "stations",
    "main": {
      "temp": 282.55,
      "feels_like": 281.86,
      "temp_min": 280.37,
      "temp_max": 284.26,
      "pressure": 1023,
      "humidity": 100
    },
    "visibility": 16093,
    "wind": {
      "speed": 1.5,
      "deg": 350
    },
    "clouds": {
      "all": 1
    },
    "dt": 1560350645,
    "sys": {
      "type": 1,
      "id": 5122,
      "message": 0.0139,
      "country": "US",
      "sunrise": 1560343627,
      "sunset": 1560396563
    },
    "timezone": -25200,
    "id": 420006353,
    "name": "Mountain View",
    "cod": 200
}  

const APIKEY = '0f01c8681c49fabf70ec7845477e28e2'
const url = `http://api.openweathermap.org/data/2.5/weather?q=seoul&appid=${APIKEY}`

const sun_ = ['Atmosphere', 'Clear', 'Clouds']
const rain_ = ['Thunderstorm', 'Drizzle', 'Rain']
const snow_ = ['Snow']

const dust_crieteria = 35
const temp_criteria = 20

async function getWeather () {
    let response = await fetch(url)
    let result = await response.json()
    var temp = result.main.temp
    var humidity = result.main.humidity
    var weather = result.weather[0].main
    var dust = Math.random()*70 // To Do : Get dust concentration
    
    // picture selection logic 
    var picWeather = (sun_.includes(weather)) ? 'sun' : (snow_.includes(weather) ? 'snow' : 'rain')
    picWeather = (dust < dust_crieteria) ? picWeather : picWeather + '_dust';
    var picWindow = (dust < dust_crieteria) ? 'window_open' : 'window_close'
    var picTemp = (temp < temp_criteria + 273) ? 'cold' : 'hot'
    var picIsUmbrella = (picWeather == 'rain')
    var picIsMask = true

    var picture = [picWeather, picWindow, picTemp, picIsUmbrella, picIsMask]
    //

    return picture
}

module.exports = {
    getWeather
}
