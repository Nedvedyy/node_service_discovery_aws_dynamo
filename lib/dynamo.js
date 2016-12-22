/**
 * Created by nedved on 22/12/16.
 */

'use strict';

var AWS = require("aws-sdk");

var docClient = new AWS.DynamoDB.DocumentClient();
var service_table = "TBL_SERVICES";

module.exports = {
    /**
     *
     * @param {object} aws     {
                                region: "us-west-2",
                                endpoint: "http://dynamodb.ap-southeast-1.amazonaws.com"
                               }
     */
    connect: function(aws) {
        AWS.config.update(aws);
    },
    /**
     * Get the value
     *
     * @param {string}  name        The name of the service.
     * @param {object}  options     Extra options like host, port and version.
     */
    get: function(name, options) {

    },
    /**
     * Sets the properties for the service name provided as parameter.
     *
     * @param {string}  name        The name of the service.
     * @param {object}  options     Extra options like host, port and version.
     */
    set: function(name, options) {

    },
    /**
     * Retrieves the properties for the service name and the version provided.
     *
     * @param {string}  name        The name of the service.
     * @param {string}  version     The version of the service.
     */
    get: function(name, version) {
        var deferred = Q.defer();

        var majorVersion, minorVersion;

        if(version) {
            var splittedVersion = version.split('.');

            majorVersion = splittedVersion[0];
            minorVersion = splittedVersion[1] || 'x';
        }

        // Build up the params
        var params = {
            TableName: 'dds',
            KeyConditionExpression: '#name=:name',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': name
            },
            ScanIndexForward: false
        };

        if(version) {
            // If the version exists,
            if(minorVersion === 'x') {
                // If the minor version is set to `x`, we should calculate the highest version number with the correct minor version
                params.KeyConditionExpression += ' AND versionId BETWEEN :minVersion AND :maxVersion';
                params.ExpressionAttributeValues[':minVersion'] = utils.calcVersionId(majorVersion);
                params.ExpressionAttributeValues[':maxVersion'] = utils.calcVersionId(majorVersion, 1);
            }
            else {
                // If minor version is not set to `x`, we should return the record with the exact version number
                params.KeyConditionExpression += ' AND versionId = :versionId';
                params.ExpressionAttributeValues[':versionId'] = utils.calcVersionId(version);
            }
        }

        // Retrieve the item
        this._dynamodb.query(params, function(err, data) {
            if(err) {
                // Reject if an error occurred
                return deferred.reject(err);
            }

            if(data.Items.length === 0) {
                // If no Items where found, throw an error
                throw new Error('No service found with version ' + version);
            }

            // Resolve the item if everything went succesfully
            deferred.resolve(data.Items[0]);
        });

        // Return the promise
        return deferred.promise;
    }
};



var year = 2015;
var title = "The Big New Movie";

var params = {
    TableName:service_table,
    Item:{
        "year": year,
        "title": title,
        "info":{
            "plot": "Nothing happens at all.",
            "rating": 0
        }
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});