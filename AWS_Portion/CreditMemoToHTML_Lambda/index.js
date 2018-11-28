'use strict';

const setup = require('./starter-kit/setup');
//create the attachment here
var nforce = require('nforce');

var org = nforce.createConnection({
	clientId: 'XXXXXXXXXX',
	clientSecret: 'XXXXXXXXXX',
	redirectUri: 'XXXXXXXXXX',
	apiVersion: 'v42.0', // optional, defaults to current salesforce API version
	environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
	mode: 'multi', // optional, 'single' or 'multi' user mode, multi default,
	username: 'XXXXXXXXXX',
	password: 'XXXXXXXXXX'
});

function _asyncToGenerator(fn) {
	return function () {
		var gen = fn.apply(this, arguments);
		return new Promise(function (resolve, reject) {
			function step(key, arg) {
				try {
					var info = gen[key](arg);
					var value = info.value;
				} catch (error) {
					reject(error);
					return;
				}
				if (info.done) {
					resolve(value);
				} else {
					return Promise.resolve(value).then(function (value) {
						step('next', value);
					}, function (err) {
						step('throw', err);
					});
				}
			}
			return step('next');
		});
	};
}

function getDateTimeAsString() {
	var date = new Date();
	var timestamp = date.getTime();
	return timestamp.toString();
}

exports.handler = (() => {
	var _ref = _asyncToGenerator(function* (event, context, callback) {
		context.callbackWaitsForEmptyEventLoop = false;
		const browser = yield setup.getBrowser();
		try {
			const result = yield exports.run(browser);
			callback(null, result);
		} catch (e) {
			callback(e);
		}
	});

	return function (_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();
exports.run = (browser => {
	let _ref2 = _asyncToGenerator(function* (browser) {
		//these parameters can be passed in to lambda via events
		var event = {
			cmURL: "XXXXXXXXXX",
			usernameIn: "XXXXXXXXXX",
			passwordIn: "XXXXXXXXXX",
			instanceIn: "XXXXXXXXXX",
			parentIdIn: "XXXXXXXXXX"
		};
		console.log(event.cmURL);
		console.log(event.usernameIn);
		console.log(event.passwordIn);
		console.log(event.instanceIn);
		console.log(event.parentIdIn);

		var cmURL = event.cmURL == null ? 'XXXXXXXXXX' : event.cmURL;
		var usernameIn = event.usernameIn == null ? 'XXXXXXXXXX' : event.usernameIn;
		var passwordIn = event.passwordIn == null ? 'XXXXXXXXXX' : event.passwordIn;
		var instanceIn = event.instanceIn == null ? 'XXXXXXXXXX' : event.instanceIn;
		var parentIdIn = event.parentIdIn == null ? 'XXXXXXXXXX' : event.parentIdIn;

		if (browser === undefined) {
			console.log('browser is undefined!!!!');
		}

		const loginPage = yield browser.newPage();
		const ua = browser.userAgent();
		yield loginPage.goto(event.instanceIn);
		yield loginPage.waitForSelector('#Login');

		// Login
		yield loginPage.type('#username', event.usernameIn);
		yield loginPage.type('#password', event.passwordIn);
		yield loginPage.evaluate(() => {
			document.getElementById('Login').click();
		});
		yield loginPage.waitForNavigation();
		yield loginPage.waitFor(7000);

		console.log('logged in');
		console.log('navigated to the credit memo page');
		console.log('waiting 200 seconds for the credit memo page to load');

		const page = yield browser.newPage();

		yield page.goto(event.cmURL, {
			waitUntil: ['domcontentloaded', 'networkidle0'],
			timeout: 3000000
		});

		yield page.waitFor(200000);
	    //yield page.waitFor('col-xs-12 small cursor-pointer');
		console.log('pressing the view all button');
		yield loginPage.evaluate(() => {
		  let elements = document.getElementsByClassName('col-xs-12 small cursor-pointer');
		  for (let element of elements){
			  element.click();
		  }
	    });

		//const screenshot = yield page.screenshot();
		let pageHTML = yield page.content();
		let base64data = new Buffer(pageHTML).toString('base64');

		// multi user mode
		return new Promise(function (resolve, reject) {
			org.authenticate({
				username: 'XXXXXXXXXX',
				password: 'XXXXXXXXXX'
			}, function (err, resp) {
				// store the oauth object for this user
				if (!err) {
					var oauth;
					oauth = resp;
					console.log('response is ' + JSON.stringify(resp));

					console.log('Creating attachment');
					var att = nforce.createSObject('Attachment', {
						Name: 'Lambda html CM file' + getDateTimeAsString(),
						Description: 'This is a poc document',
						ParentId: event.parentIdIn,
						attachment: {
							fileName: 'creditmemo.html',
							body: pageHTML
						}
					});

					console.log('inserting object');

					org.insert({
						sobject: att,
						oauth: oauth
					}, function (err, resp) {
						if (!err) {
							console.log('[OK] attached!');
							console.log('It worked!');
						} else {
							console.log('It did not work!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
							console.log(err);
							console.log(oauth);
							console.log(org);
						}
					});

					console.log('created html attachment');
					browser.close();
					console.log('resolving promise');
					Promise.resolve('Success').then();
					console.log('promise fulfilled');
					return 'as promised';
				} else {
					console.log('there was an error authenticating');
					console.error(err);
					return err;
				}
			});
		});

		return 'done but should not be';
	});

	return function (_x4) {
		console.log('this function has been accessed');
		return _ref2.apply(this, arguments);
	};
})();