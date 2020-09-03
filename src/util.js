const moment = require('moment');

const getResponseHeaders = () => {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        "Access-Control-Allow-Credentials": true
    };
};

const getUserId = (event) => {
    return event.requestContext.identity.cognitoIdentityId;
};

const constructError = (errorCode, httpCode, errorMessage) => {
    let error = {
        statusCode: httpCode,
        headers: getResponseHeaders(),
        body: JSON.stringify({
            errorCode: errorCode,
            errorMessage: errorMessage
        })
    };

    return error;
};


const contructBabyResponseBody = (baby) => {
    let body = {
        "baby_id": baby.baby_id,
    }
    if (baby.baby_name) {
        body.baby_name = baby.baby_name;
    }
        
    if (baby.gender) {
        body.gender = baby.gender;
    }
    
    if (baby.dob) {
        body.dob = baby.dob;
    }
    return body
};

const isDOBInvalid = (dob) => {
    return dob === undefined ||
            dob === '' ||
            !moment(dob, 'DD-MM-YYYY').isValid() ||
            moment(dob, 'DD-MM-YYYY').isBefore(moment().subtract(1, "years"));
};

const isDOBInvalidFormat = (dob) => {
    if (dob !== undefined && dob !== '' ) {
        return !moment(dob, 'DD-MM-YYYY').isValid() ||  moment(dob, 'DD-MM-YYYY').isBefore(moment().subtract(1, "years"));
    }
};

const isBabyWeightInValid = (weight) => {
    return weight == null || weight == undefined
                || !Number.isFinite(weight) ||
                weight < 0 || weight > 20;
};

const isRecordDateInvalid = (date, dob) => {
    if (date === undefined ||
        date === '' ||
        !moment(date, 'DD-MM-YYYY').isValid()) {
        return true;
    } else if (!moment(date, 'DD-MM-YYYY').isBetween(moment(dob, 'DD-MM-YYYY'), moment(),undefined, '[]')) {
        return true;
    }
};

const isBabyNameInValid = (baby_name) => {
    return baby_name === undefined || baby_name.trim().length === 0;
};

const isGenderInValid = (gender) => {
    console.log(gender)
    return gender === undefined ||
            gender.trim().length === 0 ||
            (gender.toUpperCase() !== 'M' && gender.toUpperCase() !== 'F');
};

const isGenderInvalidFormat = (gender) => {
    if (gender !== undefined && gender !== '' ) {
        return gender.toUpperCase() !== 'M' && gender.toUpperCase() !== 'F';
    }
};


module.exports = {
    getResponseHeaders,
    getUserId,
    constructError,
    isDOBInvalid,
    isDOBInvalidFormat,
    isBabyNameInValid,
    isGenderInValid,
    isGenderInvalidFormat,
    contructBabyResponseBody,
    isRecordDateInvalid,
    isBabyWeightInValid
};