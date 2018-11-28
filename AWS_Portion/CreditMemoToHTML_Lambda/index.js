'use strict';
var jsforce = require('jsforce');
let userobj = {
    userId: 'XXXXXXXXX',
    traits: {
        email: 'XXXXXXXXX',
        name: 'XXXXXXXXX',
        plan: 'free',
        createdAt: 1427391725,
        last_seen_at: Math.floor(new Date() / 1000)
    }
};
// connection and login must be done here for jsforce or will not work in Lambda
var conn = new jsforce.Connection({
    oauth2: {
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl: 'XXXXXXXXX',
        clientId: 'XXXXXXXXX',
        clientSecret: 'XXXXXXXXX',
        redirectUri: 'XXXXXXXXX'
    },
    instanceUrl: 'XXXXXXXXX'
});
conn.login('XXXXXXXXX', 'XXXXXXXXX', function (err, userInfo) {
    if (err) {
        return console.error(err);
    }
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    // logged in user property
    console.log('User ID: ' + userInfo.id);
    console.log('Org ID: ' + userInfo.organizationId);
    let contactobj = {
        Name: userobj.traits.name,
        UserId__c: userobj.userId,
        AccountNumber: userobj.userId,
        Email__c: userobj.traits.email,
        Plan__c: userobj.traits.plan,
        Signup__c: userobj.traits.createdAt
    };
});
const setup = require('./starter-kit/setup');

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
exports.run = (() => {
    let _ref2 = _asyncToGenerator(function* (browser) {
        //these parameters can be passed in to lambda via events
        var event = {
            cmURL: "XXXXXXXXX",
            usernameIn: "XXXXXXXXX",
            passwordIn: "XXXXXXXXX",
            instanceIn: "XXXXXXXXX",
            parentIdIn: "XXXXXXXXX" };
        console.log(event.cmURL);
        console.log(event.usernameIn);
        console.log(event.passwordIn);
        console.log(event.instanceIn);
        console.log(event.parentIdIn);

        var cmURL = event.cmURL == null ? 'XXXXXXXXX' : event.cmURL;
        var usernameIn = event.usernameIn == null ? 'XXXXXXXXX' : event.usernameIn;
        var passwordIn = event.passwordIn == null ? 'XXXXXXXXX' : event.passwordIn;
        var instanceIn = event.instanceIn == null ? 'XXXXXXXXX' : event.instanceIn;
        var parentIdIn = event.parentIdIn == null ? 'XXXXXXXXX' : event.parentIdIn;

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

        const screenshot = yield page.screenshot();
        let HTML = yield page.content();

        if (!conn) {
            console.log('connection was never established');
        } else {
            console.log('connection was established');
        }

        let base64dataString = new Buffer('this is Amanda').toString('base64');
        // Single record creation
        conn.sobject("Attachment").create({
            ParentId: event.parentIdIn,
            Name: 'Lambda odd file del ' + getDateTimeAsString(),
            Body: base64dataString,
            ContentType: 'text/plain'
        }, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err, ret);
            }
            console.log("Created record id : " + ret.id);
            // ...
        });

        let base64data = new Buffer(HTML).toString('base64');
        // Single record creation
        conn.sobject("Attachment").create({
            ParentId: event.parentIdIn,
            Name: 'Lambda html CM file' + getDateTimeAsString(),
            Body: base64data,
            ContentType: 'application/html'
        }, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err, ret);
            }
            console.log("Created record id : " + ret.id);
            // ...
        });

        let base64dataImage = new Buffer(screenshot).toString('base64');
        // Single record creation
        conn.sobject("Attachment").create({
            ParentId: event.parentIdIn,
            Name: 'Lambda CM screenshot file ' + getDateTimeAsString(),
            Body: base64dataImage,
            ContentType: 'image/jpeg'
        }, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err, ret);
            }
            console.log("Created record id : " + ret.id);
            // ...
        });

        console.log('created attachments');

        //end where you put your code
        conn.logout(function (err) {
            if (err) {
                return console.error(err);
            }
            // now the session has been expired.
        });

        yield page.setCookie({
            name: 'name',
            value: 'cookieValue'
        });
        //console.log((yield page.cookies()));
        yield page.close();
        browser.close();
        return 'done';
    });

    return function (_x4) {
        return _ref2.apply(this, arguments);
    };
})();