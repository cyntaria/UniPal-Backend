const bcrypt = require('bcryptjs');

exports.multipleColumnSet = (object) => {
    if (typeof object !== 'object') {
        throw new Error('Invalid input');
    }

    const keys = Object.keys(object);
    const values = Object.values(object);

    const columnSet = keys.map(key => `${key} = ?`).join(', ');

    return {
        columnSet,
        values
    };
};

exports.combineStudentPreferences = (student) => {
    const {
        hobby_1, hobby_2, hobby_3,
        interest_1, interest_2, interest_3,
        ...stud
    } = student;

    const noHobbies = hobby_1 == null && hobby_2 == null && hobby_3 == null;
    const noInterests = interest_1 == null && interest_2 == null && interest_3 == null;
    const hobbies = noHobbies ? null : [ hobby_1, hobby_2, hobby_3 ];
    const interests = noInterests ? null : [ interest_1, interest_2, interest_3 ];
    
    return { ...stud, hobbies, interests };
};

exports.parseTime = (time) => {
    let times = time.split(":");
    let hours = times[0];
    if (hours.length === 1) hours = `0${hours}`; // pad leading 0
    return `${hours}:${times[1]}:${times[2]}`;
};

exports.round = (value, precision) => {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
};

exports.truncateDecimal = (value, precision) => {
    // if whole number, return as is
    if (value % 1 === 0) return parseFloat(value);
    let values = (value + '').split(".");

    // if int part only
    if (precision === 0) return parseInt(values[0], 10);

    // truncate the decimal part
    let truncDecimal = values[1].slice(0, precision);
    return parseFloat(`${values[0]}.${truncDecimal}`);
};

exports.multipleFilterSet = (object) => {
    if (typeof object !== 'object') {
        throw new Error('Invalid input');
    }

    const keys = Object.keys(object);
    const values = Object.values(object);

    const filterSet = keys.map(key => `${key} = ?`).join(' AND ');

    return {
        filterSet,
        filterValues: values
    };
};

exports.hashPassword = async(password) => {
    if (password) {
        return await bcrypt.hash(password, 8);
    }
};

exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.yearRegex = new RegExp(/^(19[5-9]\d|20[0-4]\d|2050)$/);
exports.ERPRegex = new RegExp(/^[0-9]{5}$/);
exports.ClassERPRegex = new RegExp(/^([0-9]{4}|[0-9]{5})$|^$/);
exports.CourseCodeRegex = new RegExp(/^[A-Z]{3}[0-9]{3}$/);
exports.OTPRegex = new RegExp(/^[0-9]{4}$/);
exports.timeRegex = new RegExp(/^(?:0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/);
exports.datetimeRegex = new RegExp(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/);