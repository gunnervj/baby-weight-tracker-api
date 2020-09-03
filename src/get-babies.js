const AWS = require('aws-sdk');
const util = require('./util');
const dynamoDBServerless = require('serverless-dynamodb-client');

const dynamoDB = dynamoDBServerless.doc;
const userBabyTableName = process.env.USER_BABY_TABLE_NAME;

exports.handler = async (event) => {
    try {
        const get_query = {
            TableName: userBabyTableName,
            KeyConditionExpression: 'user_id = :v1',
            ExpressionAttributeValues: {
                ":v1": util.getUserId(event)
            },
            ProjectionExpression: "baby_id, gender, weight_chart, dob, baby_name"
        }
    
        var response = await dynamoDB.query(get_query).promise();
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify( { "babies": response.Items })
        };
    } catch(error) {
        console.log('Error Occured ', error);
        return util.constructError(104, 500, 'Something went wrong. Try later. If problem persist contact support.');
    }

};