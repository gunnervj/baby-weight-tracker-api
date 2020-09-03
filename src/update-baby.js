const util = require('./util');
const moment = require('moment');
const dynamoDBServerless = require('serverless-dynamodb-client');

const dynamoDB = dynamoDBServerless.doc;
const userBabyTableName = process.env.USER_BABY_TABLE_NAME;


exports.handler = async (event, context) => {
    try {
        const request = JSON.parse(event.body);
        
        if (util.isDOBInvalidFormat(request.dob)) {
            return util.constructError(101, 400, 'Invalid Date of Birth(Baby should not be older than a year)');
        }  else if (util.isGenderInvalidFormat(request.gender)) {
            return util.constructError(103, 400, 'Invalid Gender');
        }

        if (!event.pathParameters.baby_id) {
            return util.constructError(106, 400, 'Select a baby to update.');
        }

        const update_query = {
            TableName: userBabyTableName,
            Key: {
                user_id: util.getUserId(event),
                baby_id: event.pathParameters.baby_id
            },
            UpdateExpression: 'SET baby_name = :baby_name, gender = :gender, dob = :dob , updated_at = :updated_at',
            ExpressionAttributeValues: {
                ":baby_name" : request.baby_name || null,
                ":gender" : request.gender || null,
                ":dob" : request.dob || null,
                ":updated_at" : moment().toISOString()
            },
            ReturnValues: "ALL_NEW"
        };

        var updated_baby = await dynamoDB.update(update_query).promise();
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(util.contructBabyResponseBody(updated_baby.Attributes))
        };
    } catch (error) {
        console.log('Error Occured ', error);
        return util.constructError(104, 500, 'Something went wrong. Try later. If problem persist contact support.');
    }

};
