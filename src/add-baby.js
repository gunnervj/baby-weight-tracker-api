const uuid = require('uuid');
const util = require('./util');
const moment = require('moment');
const dynamoDBServerless = require('serverless-dynamodb-client');

const dynamoDB = dynamoDBServerless.doc;
const userBabyTableName = process.env.USER_BABY_TABLE_NAME;

exports.handler = async (event, context) => {
    try {
        let baby = JSON.parse(event.body);
        if (util.isDOBInvalid(baby.dob)) {
            return util.constructError(101, 400, 'Invalid Date of Birth(Baby should not be older than a year)');
        } else if (util.isBabyNameInValid(baby.baby_name)) {
            return util.constructError(102, 400, 'Invalid Baby Name)');
        } else if (util.isGenderInvalidFormat(baby.gender)) {
            return util.constructError(103, 400, 'Invalid Gender');
        }

        const item = {
            user_id: util.getUserId(event),
            baby_id: uuid.v4(),
            baby_name: baby.baby_name,
            gender: baby.gender,
            dob: baby.dob,
            created_at: moment().toISOString(),
            weight_chart: {}
        };
        await dynamoDB.put({
            TableName: userBabyTableName,
            Item: item
        }).promise();
        headers = util.getResponseHeaders();
        headers.baby_id = item.baby_id;
        return {
            statusCode: 201,
            headers: headers,
            body: JSON.stringify(util.contructBabyResponseBody(item))
        };

    } catch (error) {
        console.log('Error Occured ', error);
        return util.constructError(104, 500, 'Something went wrong. Try later. If problem persist contact support.');
    }
};