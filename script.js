'use strict';

import { timeline } from "motion";

const body = document.querySelector('body');
const section = document.querySelector('section');
const loader = document.getElementById('preloader');
const geoAlert = document.querySelector('.geo-alert-window__text');
const userLocation = document.querySelector('.location');
const uvIndex = document.querySelector('.uf-index-number');
const uvMessage = document.querySelector('.message');
const btn = document.querySelector('.btn-instructions');
const subtext = document.querySelector('.subtext');
const loading = document.getElementById('loading-text')

// Handling loader

const showLoader = function() {
    loader.classList.add('show')
}

const hideLoader = function() {
    loader.classList.remove('show')
}

btn.addEventListener('click', function() {
    subtext.classList.toggle('show');
    if(subtext.classList.contains('show')) {
        btn.textContent = 'Hide instructions'
    } else {
        btn.textContent = 'Show instructions'
    }
})

// Loading text animation

const splitText = loading.textContent.split('');
loading.textContent = '';
for(let i = 0; i < splitText.length; i++) {
    loading.innerHTML += `<span class="letter-${i}">` + splitText[i] + "</span>";
};

let arr = [];

for(let i = 0; i < splitText.length; i++) {
    arr.push([`span.letter-${i}`,{ y: [10, 0], opacity: [0,1] },{ at: `-0.2`}])
}
console.log(arr)

timeline(arr, { duration: 2, repeat: Infinity });

// Acessing data

const getPosition = function() {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const data = pos.coords;
                resolve(data);
            },
            err => {
                // console.log(err);
                geoAlert.classList.add('show')
                loading.classList.add('hide')
                reject(err.message)
            });
})
};

const getGeo = function() {
    getPosition().then((data) => {
        return fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${data.latitude}&lon=${data.longitude}&type=postcode&format=json&apiKey=79fd5e5683f24d898ab6ef4711d03475`) 
    }).then((response) => {
        if (!response.ok) throw new Error (`${response.status} Too many requests in 1 sec. Try again later`)
        return response.json();
    }).then((dataCountry) => {
        console.log(dataCountry)
        userLocation.textContent = `${dataCountry.results[0].city}, ${dataCountry.results[0].country}`
    }).catch((err) => console.error(`${err}`))
}

const showConditions = function(data) {
    const curWeather = data.current;
    if(Math.trunc(curWeather.uvi) < 2) {
        uvMessage.textContent = `The UV Index is low. SPF is not needed`
    } else if (Math.trunc(curWeather.uvi) > 1 && Math.trunc(curWeather.uvi) < 5) {
        uvMessage.textContent = `UV Index is not that high but you still better use SPF`
    } else if (Math.trunc(curWeather.uvi) >= 5 && Math.trunc(curWeather.uvi) < 8) {
        uvMessage.textContent = `UV Index is high. Use SPF! ☀️`
    } else if (Math.trunc(curWeather.uvi) > 7) {
        uvMessage.textContent = `Don't go outside 🔥`
    }

    if(curWeather.weather[0].main === 'Clear') {
        body.style.backgroundColor = '#0058ca';
    } else if(curWeather.weather[0].main === 'Thunderstorm' || curWeather.weather[0].main === 'Rain' || curWeather.weather[0].main === 'Drizzle' || curWeather.weather[0].main === 'Clouds') {
        body.style.backgroundColor = '#6d6875';
    } else if (curWeather.weather[0].main === 'Snow') {
        body.style.backgroundColor = '#e9ecef';
    } else {
        body.style.backgroundColor = '#403d39'
    }

    console.log(data)
}

const getWeather = function() {
    getPosition().then((data) => {
        return fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${data.latitude}&lon=${data.longitude}&appid=dc843af1a5087ca2ceb29fb4af4fea36`)
    }).then((response) => {
        if (!response.ok) throw new Error (`${response.status} Too many requests in 1 sec. Try again later`)
        return response.json();
    }).then((dataUVI) => {
        hideLoader()
        section.classList.add('animate')
        uvIndex.textContent = `${Math.trunc(dataUVI.current.uvi)}`
        showConditions(dataUVI)
    }).catch((err) => console.error(`${err}`))
}

const getPage = async function() {
    try {
        const data = await Promise.all([
            getGeo(),
            getWeather()
        ])
    } catch(err) {
        console.log(err)
    }
};

getPage();