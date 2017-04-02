var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var _ =require("underscore");
var moment=require("moment");
var express=require("express");

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Exporting Fetch Sheet Module

exports.fetchSheet= function(sheetid,cb){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
        authorize(JSON.parse(content), sheetid,cb, listMajors);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, sheetid,cb, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, sheetid,cb);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Fetch the data of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1psnLyQ1uP120JHnNYY5Pc_2T6bQl3QC6ifskYMnVC2k/edit
 */

function listMajors(auth,sheetid,cb) {
    var sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: sheetid,
        range: 'Sheet1'
    }, function(err, response) {
    if (err) {
        console.log('The API returned an error: ' + err);
        cb(err,null);
        return;
    }
    var rows = response.values;
    var headers=rows[0];

    // Getting header Data types
    var headerType= setinitialHeaders(headers,rows[1]);

    // Fetching content to be converted to json
    var content=rows.splice(1,rows.length);

    // Converting content to json
    var contentData=[];
    content.forEach(function(currentValue,index){
        var obj={};
        headers.forEach(function(headerVal,pos){
            obj[headerVal]=currentValue[pos];
        });
        contentData.push(obj);
    });
    var jsonData={};
    jsonData["dataType"]=headers;
    jsonData["data"]=contentData;
    cb(null,jsonData);

  });
}


// Function to initialize data type of headers

function setinitialHeaders(headers,data){
    var dataType=[];
    headers.forEach(function(currentValue, index){
        var obj={};
        var dateFormat = "DD/MM/YYYY";

        if(_.isFinite(data[index])){
            obj[currentValue]="Integer";
        }else if(_.isNumber(data[index])){
            obj[currentValue]="Decimal";
        }else if(moment(data[index], dateFormat, true).isValid()){
            obj[currentValue]="Date";
        }else{
            obj[currentValue]="String";
        }
        dataType.push(obj);
    });
    return dataType;
}

