/**
 * Created by Kseniya on 2/3/2017.
 */
var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var log4js = require('log4js');
var fs = require('fs');
var fse = require('fs-extra')
var path = require('path');
var execSync = require('sync-exec');
var spec = require('swagger-tools').specs.v2; // Using the latest Swagger 2.x specification
var Slack = require('node-slack');
var pd = require('pretty-data').pd;

pd.step = "    ";

webhookUri = "https://hooks.slack.com/services/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";

slack = new Slack(webhookUri);


log4js.configure({
    appenders: [
        {type: 'console'},
        {type: 'file', filename: 'app.log', category: 'app'}
    ]
});
var logger = log4js.getLogger('app');


router.get('/', function (req, res, next) {

    exec('bash sh/init.sh', function (err, stdout, stderr) {
        logger.error(err)
        logger.error(stdout)
        logger.error(stderr);
    });

    res.send('init started');
});

router.get('/trigger', function (req, res, next) {
    gitPullNextRepo(0);
    res.send('update and validation started');
});

/* GET home page. */
router.post('/', function (req, res, next) {
    var eventType = req.get('X-GitHub-Event');
    if (eventType == 'push') {
        logger.error("Push Received:\n")

        res.send('webhook was received');

        gitPullNextRepo(0);

    } else {
        res.send(eventType + ' was received');
    }
});

var repoNames = ["edi3.github.io", "edi3-api-conformance", "edi3-api-ndr", "edi3-description", "edi3-discovery", 
            "edi3-events", "edi3-finance", "edi3-identity", "edi3-json-ld-ndr", 
            "edi3-model-interchange", "edi3-notary", "edi3-regulatory", "edi3-trade",
            "edi3-transport", "edi3-uml-profile", "edi3-unlocode",
            "edi3-invoice", "edi3-order", "edi3-dictionary", "edi3-codelists"];
var mainRepo = "edi3.github.io"

var baseDir = '/opt/'
 /*var baseDir = 'd://work/aus-tp-github/'*/
function gitPullNextRepo(index) {
    var repoName = repoNames[index];

    require('simple-git')(baseDir + repoName)
        .reset('hard', function () {
            logger.error('Reset repo before pull... ' + repoName);
        })
        .pull(function (err, update) {
            logger.error('repoName ' + repoName + ' was updated')
        })
        .then(function () {
            logger.error(repoName + ' pull done.');
        })
        .fetch(['--tags'], function () {
            logger.error('Fetch tags from remote... ' + repoName);
        })
        .then(function () {
            logger.error('Starting pull... ' + repoName);
        })
        .tags(function (err, tags) {
            tags.all.push("master");
            if(tags.all.length == 0) {
                if (index + 1 < repoNames.length) {
                    logger.error('repoName has no tags - skipping')
                    gitPullNextRepo(index + 1)
                } else {
                    copyFromDocs()
                }
            } else {
                logger.error('about to delete ' + baseDir + '/' + mainRepo + '/specs/' + repoName)
                fse.emptyDirSync(baseDir + mainRepo + '/specs/' + repoName);
                logger.error('about to delete ' + baseDir + 'tags/' + repoName)
                fse.emptyDirSync(baseDir + '/tags/' + repoName);
                checkoutTag(tags, 0, repoName, index)
                logger.error('repoName ' + repoName + ' was updated')
            }
        });
}

function checkoutTag(tags, i, repoName, index) {
    logger.error("Processing tag: %s", tags.all[i]);
    require('simple-git')(baseDir + '/tags/' + repoName)
        .clone('git@github.com:edi3/' + repoName + '.git', tags.all[i], function () {
            logger.error('Cloned ' + repoName + ' into ' + tags.all[i]);
            logger.error('Checking out ' + repoName + ' tag ' + tags.all[i])
            require('simple-git')(baseDir + '/tags/' + repoName + '/' + tags.all[i])
                .checkout(tags.all[i]).then(function () {
                logger.error('Checked out... ' + repoName  + ' tag ' + tags.all[i]);
                logger.error('about to copy ' + baseDir + 'tags/' + repoName + '/' + tags.all[i] + '/docs')
                fse.copySync(baseDir + '/tags/' + repoName + '/' + tags.all[i] + '/docs',
                    baseDir + '/' + mainRepo + '/specs/' + repoName+ '/' + tags.all[i]);
                var exitCode = execSync('cd ' + baseDir + '/' + mainRepo + '/specs/' + repoName+ '/' + tags.all[i] +
                    'bash redoc-cli bundle swagger.yml');

                logger.error("exitCode " + exitCode.status);
                if( i + 1 < tags.all.length) {
                    checkoutTag(tags, i + 1, repoName, index)
                } else {
                    if (index + 1 < repoNames.length) {
                        gitPullNextRepo(index + 1)
                    } else {
                        copyFromDocs()
                    }
                }
            })
        })

}


function copyFromDocs(/*index*/) {
    /*var repoName = repoNames[index];

    logger.error('about to copy ' + baseDir + repoNames[0] + '/specs/' + repoName)
    fse.copySync(baseDir + repoName + '/docs',
        baseDir + repoNames[0] + '/specs/' + repoName);

    if (index + 1 < repoNames.length) {

        copyFromDocs(index + 1)

    } else {*/

/*
        processAPI();
*/

        var exitCode = execSync('bash sh/jekyll-build.sh'
            + ' -t ' + 'edi3.github.io');

        logger.error("exitCode " + exitCode.status);
        if (exitCode.status != 0){
            var message = {
                channel: "#api-monitoring",
                username: "swagger",
                text: "Jekyll build failed.",
                attachments: [{
                    "fallback": "Jekyll build failed.",
                    "color": "danger",
                    "fields": [{
                        "title": "Jekyll build failed.",
                        "value": "Please check the build logs.",
                        "short": false
                    }]
                }]
            };
             slack.send(message);
        } else {
            logger.error("Jekyll build is finished. Commit and push changes.", "Jekyll build is finished. Commit and push changes.");

            require('simple-git')(baseDir + mainRepo)
                .then(function () {
                    logger.error('Starting push... ' +mainRepo);
                })
                .addConfig('user.name', 'Specification Generator')
                .addConfig('user.email', 'specs.generator@edi3.org')
                .add(baseDir + mainRepo + '/specs/*')
                .commit("update specifications pages")
                .pull('origin', 'master', '--rebase')
                .push(['-u', 'origin', 'master'], function () {
                    logger.error("Push is finished");
            });
        }
/*
    }
*/
}

function processAPI() {
    for (var i = 1; i < repoNames.length; i++) {
        var repoName = repoNames[i];
        var baseFrom = baseDir + repoName + '/docs/';
        logger.error(baseFrom)
        var copyTo = baseDir + 'edi3.github.io/_data/'
        var copyToForAgilo = baseDir + 'edi3.github.io/specs/'
        var docs = fs.readdirSync(baseFrom);
        for (var j = 0; j < docs.length; j++) {
            var version = docs[j];
            var baseFromPath = path.join(baseFrom, version);
            var stat = fs.statSync(baseFromPath)

            if (stat.isFile())
                logger.error("'%s' is a file.", baseFromPath);
            else if (stat.isDirectory()) {
                logger.error("'%s' is a directory.", baseFromPath);

                var copyFrom = baseFromPath;
                var files = fs.readdirSync(copyFrom);
/* 
                for (var k = 0; k < files.length; k++) {
                    var file = files[k];
                    if (file == "swagger.yaml") {
                        var fromPath = path.join(copyFrom, file);
                        var fromPathJSON = path.join(copyFrom, "swagger.json");
                        logger.error('yaml2json ' + fromPath + ' > ' + fromPathJSON)
                        var t = execSync('yaml2json ' + fromPath + ' > ' + fromPathJSON);
                        // Make one pass and make the file complete
                        var fileName = repoName + "_" + version.replace(/\./g, '-') + "_" + file;
                        logger.error(fileName);
                        var toPath = path.join(copyTo, fileName);

                        var stat = fs.statSync(fromPath);
                        if (stat.isFile())
                            logger.error("'%s' is a file.", fromPath);
                        else if (stat.isDirectory())
                            logger.error("'%s' is a directory.", fromPath);

                        var document = JSON.parse(fs.readFileSync(fromPathJSON));

                        logger.error("validating " + fromPathJSON);

                        spec.validate(document, (function (repo) {
                            return function (err, result) {

                                if (err) {
                                    throw err;
                                }

                                if (typeof result !== 'undefined') {
                                    var splitPath = fromPath.split(path.sep);
                                    var url = 'https://github.com/edi3/' + repo + '/blob/master/docs/' + splitPath[splitPath.length - 2] + '/swagger.yaml';
                                    var message = {
                                        channel: "#api-monitoring",
                                        username: "swagger",
                                        text: repo + ": Swagger document is not valid: <" + url + "|swagger.yaml>",
                                        attachments: []
                                    };
                                    if (result.errors.length > 0) {
                                        var fields = [];
                                        for (var i = 0; i < result.errors.length; i++) {
                                            logger.error(result.errors[i]);
                                            var err = result.errors[i];
                                            fields.push({
                                                "title": "#/" + err.path.join('/'),
                                                "value": err.message,
                                                "short": false
                                            });
                                        }
                                        var attachments = [
                                            {
                                                "fallback": "Swagger document is not valid",
                                                "pretext": "Errors:",
                                                "color": "danger",
                                                "fields": fields
                                            }
                                        ]
                                        message.attachments = attachments;

                                        slack.send(message, function (err, response) {
                                            console.log(response);
                                        });
                                    }
                                    if (result.warnings.length > 0) {
                                        var fields = [];
                                        for (var i = 0; i < result.warnings.length; i++) {
                                            logger.error(result.warnings[i]);
                                            var warn = result.warnings[i];
                                            fields.push({
                                                "title": "#/" + warn.path.join('/'),
                                                "value": warn.message,
                                                "short": false
                                            });
                                        }
                                        var attachments = [
                                            {
                                                "fallback": "Swagger document is not valid",
                                                "pretext": "Warnings:",
                                                "color": "warning",
                                                "fields": fields
                                            }
                                        ]
                                        message.attachments = attachments;

                                        slack.send(message, function (err, response) {
                                            console.log(response);
                                        });
                                    }

                                } else {
                                    logger.error('Swagger document is valid');
                                }
                            }
                        })(repoName));
                    }
                } */
            }
        }
    }
}

function processJSON(res) {
    for (i in res) {
        if (!!res[i] && typeof(res[i]) == "object") {
            if (!!res[i]["example"] && typeof(res[i]["example"]) == "object") {
                var example = res[i]["example"];
                res[i]["example"] = {"application/json":pd.json(example)};
            } else {
                processJSON(res[i])
            }
        }
    }
    return res;
}

module.exports = router;
