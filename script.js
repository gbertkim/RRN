'use strict'
//////////All things maps

const authKey = config.AUTH_KEY;
const secretKey = config.GOOGLE_API;
let imageFinal = [];
let locationInfo = [];
let markers = [];
let imageId;
let map;

let STORE = [{
    date: 'May 3, 2019',
    venue: "High Watt",
    location: {lat: 36.1530, lng: -86.7806},
    link: 'https://www.eventbrite.com/e/run-river-north-tickets-55663808951?aff=aff0bandsintown&appId=wf_ubzr.ehaevireabegu.pbz&comeFrom=242&artist_event_id=100802634'
    },{
    date: 'May 4, 2019',
    venue: "Neighborhood Theatre",
    location: {lat: 35.2474, lng: -80.804},
    link: 'https://www.ticketfly.com/purchase/event/1825144/tfly?utm_medium=%5BLjava.lang.String%3B%4057891044&skinName=tfly'
    },{
    date: 'May 7, 2019',
    venue: "Union Stage",
    location: {lat: 38.8787,lng: -77.0241},
    link: 'https://www.ticketfly.com/purchase/event/1823442/tfly?utm_medium=%5BLjava.lang.String%3B%406d48ffee&skinName=tfly'
}];



function initMap() {
    // add map with center and zoom
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.8283, lng: -98.5795}, 
        zoom: 4
    });
}


function drop() {
    // On the click of the drop button in html run this function
   
    // Icon URLS
    // One object
    let flag = {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    } 
    let green = {
        url: 'https://www.google.com/mapfiles/arrow.png',
    }
    let rrn = {
        url: 'https://i.ibb.co/wpX8d1r/Webp-net-resizeimage-1.png',
    }

    // Clear any previous markers
    clearMarkers();
    pastLocations(flag);
    setTimeout(function(){
        currentLocation(rrn);
    }, 250);
    setTimeout(function(){
        futureLocations(green);
        addListeners();

        // gives all images the id of "markerLayer" that can be called on CSS
        let myoverlay = new google.maps.OverlayView();
        myoverlay.draw = function() {
            this.getPanes().markerLayer.id='markerLayer';
        };
        myoverlay.setMap(map);

        //function for flight path    
        var flightPath = new google.maps.Polyline({
            path: locationInfo,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        flightPath.setMap(map);
    }, 500);
    console.log(locationInfo);



    //Creates a way to target each marker
    function addListeners(){
        for (let i = 0; i<markers.length; i++){
            markers[i].addListener('click', function(){
                let thisTitle = Number(this.title);
                $('#markerLayer img').eq(thisTitle).parent().addClass("bounce").siblings().removeClass("bounce");
                $(`#markerLayer img[src='https://i.ibb.co/wpX8d1r/Webp-net-resizeimage-1.png']`).css('animation','none');
                imageId = thisTitle;
                console.log(thisTitle);
                uploadPicture(imageId);
            });
        }
    }
}
// Create markers for past dates
function pastLocations(icon){
    for (let i = 0; i < imageFinal.length-1; i++) {
        addMarker(imageFinal[i].location, icon);
        locationInfo.push(imageFinal[i].location);
    }
}

// Create markers for where they last were
 function currentLocation(icon){
    addMarker(imageFinal[imageFinal.length-1].location, icon)
    locationInfo.push(imageFinal[imageFinal.length-1].location);
}

// Create markers for future tour dates
function futureLocations(icon){
    for (let i =0; i < STORE.length; i++){
        addMarker(STORE[i].location, icon);
        locationInfo.push(STORE[i].location);
    }
}


function uploadPicture(num){
    $('#imageRight').attr('src',`${imageFinal[num].url}`)
}

// Template for making markers
function addMarker(coords, icon){ 
    markers.push(new google.maps.Marker({
            position: coords,
            map: map,
            icon: icon,
            title: markers.length.toString(),
            optimized: false
    }));
    console.log(markers.length.toString());
}


// Function to clear previous markers
function clearMarkers(){
    for (let i=0; i<markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    locationInfo = [];
}



// GET request to instagram 
function instagramAPI(){
    const instagramURL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';
    const url = instagramURL + authKey;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
        $('#errorMessage').text(`Something went wrong: ${err.message}`);
        });
}

// Filter the results from GET request
function displayResults(responseJson){
    // Filter reponse from instagram to responses with the correct hashtag
    let filtered = responseJson.data.filter(function(image){
        return image.tags == 'faketour2019';
    });
    console.log(filtered);
    // Sort responses by date
    filtered.sort(function(a,b){
        return a.caption.created_time - b.caption.created_time;
    });
    // Create an array with only needed information
    for (let i=0; i<filtered.length; i++){
        imageFinal[i] = {
            url: filtered[i].images.standard_resolution.url,
            time: filtered[i].caption.created_time,
            text: filtered[i].caption.text,
            location: {
                lat: filtered[i].location.latitude,
                lng: filtered[i].location.longitude
            }
        };
    }
    console.log(imageFinal);
    // Call map making function
    initMap();
}

///////////Form Load
function loadForm(){
    $('#quizStart').on('click', '#drop', function(){
        console.log("Searching Instagram API");
        drop();    
    });
}

 // Appended on javascript side to hide key
function appendKeys(){
    $('body').append(`
    <script async defer src=https://maps.googleapis.com/maps/api/js?key=${secretKey}>
    </script>`
    );
}

instagramAPI();

appendKeys();
loadForm();

// animation to drop pin in order
// set last pin a different color
// set a line that follows
// change picture on hover