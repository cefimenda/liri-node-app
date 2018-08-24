require("dotenv").config();
var keys = require('./keys');
var youSearch = require('youtube-search');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require('fs');
var inquirer = require("inquirer");

//___________________________Youtube_________________________
//Using Youtube instead of twitter
//Setting up youtube constructor... Not really necessary but just trying to make it parallel to the twitter instructions 
function Youtube(key) {
    this.opts = {
        maxResults: 1,
        key: key
    };
    this.search = function (input) {
        youSearch(input, this.opts, function (err, results) {
            if (err) return console.log(err);
            for (var i in results) {
                var result = results[i]
                console.log("Here is a video titled: " + result.title + "\nLink: " + result.link + "\n")
                logThis("Here is a video titled: " + result.title + "\nLink: " + result.link + "\n")
                logThis("\n________________________________________________________________\n")
            }
        })
    }
}
var youtube = new Youtube(keys.youtube)

//___________________________Spotify_________________________

var spotify = new Spotify(keys.spotify);

function spotifyIt(song) {
    spotify
        .search({ type: 'track', query: song })
        .then(function (response) {
            var track = response.tracks.items[0];
            var songInfo = ["Here is what I found for the song " + track.name];
            songInfo.push('Track: ' + track.name);
            songInfo.push('Artist: ' + track.artists[0].name);
            songInfo.push('Album: ' + track.album.name);
            songInfo.push('Preview Link: ' + track.preview_url);
            console.log(songInfo.join('\n'));
            logThis(songInfo.join('\n'));
            logThis("\n________________________________________________________________\n");
        })
        .catch(function (err) {
            console.log(err);
        });
}
//___________________________OMDB_________________________
var omdbParam = {
    apikey: keys.OMDB
}
var movie = [];

var ombdURL = "http://www.omdbapi.com/?";

function requestMovie(title) {
    var t = title || "Mr.Nobody";
    omdbParam.t = t;
    request(ombdURL + "apikey=" + omdbParam.apikey + "&t=" + omdbParam.t, function (error, response, body) {
        if (error) {
            console.log(error);
        } else if (response && response.statusCode === 200) {
            var data = JSON.parse(body);
            if (!data.Title) {
                console.log("Sorry, I couldn't find this movie...");
                return
            } else {
                console.log("\nHere is some information I found about the movie " + data.Title + ":\n");
            }
            movie.push("Title: " + data.Title);
            movie.push("Year: " + data.Year);
            if (data.Ratings) {
                movie.push("IMDB Rating: " + data.Ratings[0].Value);
                movie.push("Rotten Tomatoes Rating: " + data.Ratings[1].Value);
            }
            movie.push("Country: " + data.Country);
            movie.push("Language: " + data.Language);
            movie.push("Plot: " + data.Plot);
            movie.push("Actors: " + data.Actors);
            movie.push("________________________________________________");
            console.log(movie.join("\n"));
            logThis(movie.join("\n"));
            logThis("\n________________________________________________________________\n");
        }
    })
}
//___________________________FS_________________________
function logThis(data) {
    fs.appendFile("log.txt", data, function (err) {
        if (err) {
            return console.log(err);
        }
    });

}
var readFromFile = new Promise(function (resolve, reject) {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error)
        }
        fileData = data.split(',');
        resolve(data.split(','));
    })
})

//___________________________User Interaction_________________________
function commands(userInput) {
    var userAction = userInput[0];
    logThis(userInput + "\n");
    if (userAction === "search-youtube") {
        var searchInput = userInput.slice(1).join(' ') || "husky says I love you";
        youtube.search(searchInput);
    }
    else if (userAction === "spotify-this-song") {
        var searchInput = userInput.slice(1).join(' ') || "The Sign Ace of Base";
        spotifyIt(searchInput);
    }
    else if (userAction === "movie-this") {
        var movieTitle = userInput.slice(1).join(' ');
        requestMovie(movieTitle);
    }
    else if (userAction === "do-what-it-says") {
        readFromFile.then(function (data) {
            commands(data);
        })
    }
    else if (!userAction) {
        inquirer.prompt({
            type: "list",
            message: "What would you like me to do?",
            name: "action",
            choices: ["search-youtube", "spotify-this-song", "movie-this", "do-what-it-says"]
        }).then(function (response) {
            var action = [response.action];
            if (response.action === "search-youtube") {
                inquirer.prompt([
                    {
                        type: "input",
                        message: "What would you like me to search on youtube?",
                        name: "searchInput"
                    }
                    ,
                    {
                        type: "input",
                        message: "How many results would you like to retrieve?",
                        name: "resultCount"
                    }
                ]).then(function (response) {
                    youtube.opts.maxResults = response.resultCount
                    youtube.search(response.searchInput)
                })
            }
            if (response.action === "movie-this") {
                inquirer.prompt({
                    type: "input",
                    message: "What movie would you like to get information about?",
                    name: "searchInput"
                }).then(function (response) {
                    action.push(response.searchInput);
                    commands(action);
                })
            }
            if (response.action === "spotify-this-song") {
                inquirer.prompt({
                    type: "input",
                    message: "What song would you like to Spotify?",
                    name: "searchInput"
                }).then(function (response) {
                    action.push(response.searchInput);
                    commands(action);
                })
            }
            if (response.action === "do-what-it-says") {
                commands(action);
            }
        })
    }
    else {
        console.log("I am not familiar with that command, please try again - or just run node liri.js to view all command options");
    }
}
var userInput = process.argv.slice(2);
commands(userInput);