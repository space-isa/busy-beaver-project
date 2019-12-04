const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var getAuthToken = function(path, callback){
        var request = new XMLHttpRequest();
        var response; 
            request.open('POST', path, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            request.setRequestHeader("Accept", "application/json");
            request.send("grant_type=client_credentials&client_id=v7pwff8fZLOgFsHMIfSVU8U3jWnVt1IM&client_secret=vmWQMA9h2YOf4J6l");
    
            request.onload = function(){
                if (this.readyState==4 && this.status==200){
                    response = JSON.parse(this.responseText);
                    callback(response);
                }
            }
}

var getArrivalTime = function(path, token, callback){
    var request = new XMLHttpRequest();
    var response;
        request.open('GET', path, true);
        request.setRequestHeader('Authorization', 'Bearer ' + token);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        request.setRequestHeader("Accept", "application/json");
        request.send(null);

        request.onreadystatechange = function(){
            if (this.readyState==4 && this.status==200) {
                response = JSON.parse(request.responseText);
                callback(response);
            }
        }
}

var getRouteData = function(path, token, callback){
    var request = new XMLHttpRequest();
    var response;
        request.open('GET', path, true);
        request.setRequestHeader('Authorization', 'Bearer ' + token);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        request.setRequestHeader("Accept", "application/json");
        request.send(null);

        request.onreadystatechange = function(){
            if (this.readyState==4 && this.status==200) {
                response = JSON.parse(request.responseText);
                callback(response);
            }
        }
}

// Callback function to be used by both endpoints
// This way, data from both can be integrated into a single object
// that can be used to display data in the vue component

function myDataCallback(data){
    var routes = [];
    var stops = [];
    var stopID = [];
    var etaStops = [];
    var etaData = []; 

// Discriminating between the two json objects   
    if (data !== 'undefined' && data.data.length > 10){ 
        var eta_data = data;
        for (var i = 0; i < Object.keys(eta_data).length; i++){
            etaStops.push(eta_data.data[i].attribues.arrivals.eta);
            etaData.push(eta_data.data[i].stopID)
        }
        var etaObject = [];
        for (i = 0; i < Object.keys(eta_data).length; i++){
            etaObject[i] = {
                "stopID" : etaStops[i],
                "eta" : etaData[i]
            }
        }
        // The resulting etaObject is undefined 

    } else if (data!== 'undefined' && data.data.length < 10) {
        var route_data = data;
        for (i = 0; i < Object.keys(route_data.data).length; i++){
            routes.push(route_data.data[i].attributes.description.trim());
            for (var j = 0; j < route_data.data[i].attributes.stops.length; j++){
                stopID.push(route_data.data[i].attributes.stops[j].stopID.trim());
                stops.push(route_data.data[i].attributes.stops[j].description.trim());
            }
        }
        var routesObject = [];
        for (i = 0; i < Object.keys(route_data.data).length; i++){
            routesObject[i] = {
                    "route_description" : routes[i],
                    "attribues" : {
                        "stopDescription" : [],
                        "stopID" : [],
                        "eta" : []
                    }
            }
        }
        for (i = 0; i < Object.keys(route_data.data).length; i++){
            for (j = 0; j < Object.keys(route_data.data[i].attributes.stops).length; j++){
                routesObject[i].attribues.stopDescription.push(route_data.data[i].attributes.stops[j].description);
                routesObject[i].attribues.stopID.push(route_data.data[i].attributes.stops[j].stopID);
                routesObject[i].attribues.eta.push('7:00 AM');            
            }
        }
        // Trying to link data from both API endpoints using the stopID 
        // if (routesObject.attribues.stopID == etaObject.stopID) {
        //     routesObject.attribues.eta = etaObject.eta
        // } 
    }
        // Start html code // 
        var txt = "";

        txt += "<table id='table' class= 'table table-sm' align='center' border='1px'>";        
           
        for (i = 0; i < Object.keys(route_data.data).length; i++) {
         txt += "<tr>"
         txt += "<th>" + routesObject[i].route_description + "</th>"
         txt += "<th>" + 'Stop ID' + "</th>"
         txt += "<th>" + 'ETA' + "</th>"
         txt += "</tr>"

         //txt += "<tr>"
            for (j = 0; j < Object.keys(route_data.data[i].attributes.stops).length; j++) {
                 txt += "<td>" + routesObject[i].attribues.stopDescription[j] + "</td>";
                 txt += "<td>" + routesObject[i].attribues.stopID[j] + "</td>";
                 txt += "<td>" + routesObject[i].attribues.eta[j] + "</td>";
                 txt += "</tr>"
         }
     }
     txt += "</table>"   
     document.getElementById('GETroutes_response').innerHTML = txt; // Display in .vue component
    }
    // Callback function to generate token used in API calls 
    function myTokenCallback(response){
        var token; 
        if (response != 'undefined'){ 
            token = response.access_token; 
        }
        getArrivalTime("https://cors-anywhere.herokuapp.com/https://api.oregonstate.edu/v1/beaverbus/arrivals", token, myDataCallback); // myArrivalsCallback);
        getRouteData("https://cors-anywhere.herokuapp.com/https://api.oregonstate.edu/v1/beaverbus/routes", token, myDataCallback); //myRoutesCallback);

    }
    
module.exports.getAuthToken = getAuthToken("https://cors-anywhere.herokuapp.com/https://api.oregonstate.edu/oauth2/token", myTokenCallback);
