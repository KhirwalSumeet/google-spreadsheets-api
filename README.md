Fetch Google Sheets Api
========================

This is a standalone program to fetch data from spreadsheets using google sheets api.

```
npm install
npm start
```

## Api End-points

### /data/sheet/<YOUR SHEET ID>

This api is used to fetch data from excel having following assumptions :

1. Data is always tabular and all the columns are filled
2. Table has a header
3. Table can have any number of rows and columns(basically size is dynamic)
4. Spreadsheet is always public(globally)
5. The dataTypes are restricted to String, Number, Decimal, Date

Here is an example of a Google Spreadsheet.
https://docs.google.com/spreadsheets/d/1kw7CagEqxefbeyVfl5hDC0iR3zBoXmKEFERHiNATzZ0
and here is the id:1kw7CagEqxefbeyVfl5hDC0iR3zBoXmKEFERHiNATzZ0

Sample Output :

Sample Output in JSON(This is only a subset of rows from the above sample spreadsheet)

{
	"dataType": {
		"Student Name": "String",
		"Gender": "String",
		"Class Level": "String",
		"Home State": "String",
		"Major": "String",
		"Extracurricular Activity": "String"
	},
	"data": [{
		"Student Name": "Alexandra",
		"Gender": "Female",
		"Class Level": "4. Senior",
		"Home State": "CA",
		"Major": "English",
		"Extracurricular Activity": "Drama Club"
		}, {
		"Student Name": "Andrew",
		"Gender": "Male",
		"Class Level": "1. Freshman",
		"Home State": "SD",
		"Major": "Math",
		"Extracurricular Activity": "Lacrosse"
		}, {
		"Student Name": "Anna",
		"Gender": "Female",
		"Class Level": "1. Freshman",
		"Home State": "NC",
		"Major": "English",
		"Extracurricular Activity": "Basketball"
		}, {
		"Student Name": "Will",
		"Gender": "Male",
		"Class Level": "4. Senior",
		"Home State": "FL",
		"Major": "Math",
		"Extracurricular Activity": "Debate"
	}]
}

### Error Codes

- 404 : Sheet not FOund
- 504 : Error in Network connection

### For Production

Used npm package 'forever' to restart app incase any error is thrown.
To install forever in your computer , use following command :

```
sudo npm install -g forever
```

Note : Google v4 api uses request module. If you are working behind a proxy network then follow the following steps:

Got to node_modules/request/lib/querystring.js and make changes in function Querystring ( Line 3 or Line 4 ).
Add following code lines at beginning of function :

request.proxy='<YOUR PROXY URL>';

Note : I had included client_Secret.json. But for first time you have to download your own api key using step 1 in the following link : https://developers.google.com/sheets/api/quickstart/nodejs