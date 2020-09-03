const util = require('./util');
const dynamoDBServerless = require('serverless-dynamodb-client');

const dynamoDB = dynamoDBServerless.doc;
const userBabyTableName = process.env.USER_BABY_TABLE_NAME;


exports.handler = async (event) => {
    try {
        
        if (!event.pathParameters.baby_id) {
            return util.constructError(106, 400, 'Select a baby to update.');
        }

        var params = {
            TableName: userBabyTableName,
            Key: {
                user_id : util.getUserId(event),
                baby_id: event.pathParameters.baby_id
            }
        }
        await dynamoDB.delete(params).promise();
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({})
        };
    } catch (error) {
        console.log('Error Occured ', error);
        return util.constructError(104, 500, 'Something went wrong. Try later. If problem persist contact support.');
    }
};