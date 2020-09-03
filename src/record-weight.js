const util = require('./util');
const moment = require('moment');
const dynamoDBServerless = require('serverless-dynamodb-client');

const dynamoDB = dynamoDBServerless.doc;
const userBabyTableName = process.env.USER_BABY_TABLE_NAME;

exports.handler = async (event) => {
    try {
        if (!event.pathParameters.baby_id) {
            return util.constructError(106, 400, 'Select a baby to record weight.');
        }
    
        const request = JSON.parse(event.body);
    
        const get_baby_query = {
            TableName: userBabyTableName,
            Key: {
                user_id: util.getUserId(event),
                baby_id: event.pathParameters.baby_id
            },
            ProjectionExpression: "baby_id, gender, dob, baby_name"
        };

        var response = await dynamoDB.get(get_baby_query).promise();
        
        if (!response.Item) {
            return util.constructError(107, 404, 'Baby not found');
        }

        if (util.isRecordDateInvalid(request.date, response.Item.dob)) {
            return util.constructError(108, 400, "Date should be between baby's date of birth and current date");
        }

        if (util.isBabyWeightInValid(request.weight)) {
            return util.constructError(109, 400, "Invalid baby weight.");
        }

        const baby_weight = {
            date:  moment(request.date, 'DD-MM-YYYY').format(),
            weight: parseFloat(request.weight.toFixed(1))
        };
      
        const update_query = {
            TableName: userBabyTableName,
            Key: {
                user_id: util.getUserId(event),
                baby_id: event.pathParameters.baby_id
            },
            UpdateExpression:'SET #weightchart.#datekey = :babyweight',
            ExpressionAttributeNames: {
            '#datekey': String(baby_weight.date) ,
            '#weightchart': 'weight_chart'
            },
            ExpressionAttributeValues: {
              ':babyweight': baby_weight.weight
            },
            ReturnValues: "ALL_NEW"
        };
    
        var updated_baby = await dynamoDB.update(update_query).promise();
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(util.contructBabyResponseBody(updated_baby.Attributes))
        };
    } catch(error) {
        console.log('Error Occured ', error);
        return util.constructError(104, 500, 'Something went wrong. Try later. If problem persist contact support.');
    }
};