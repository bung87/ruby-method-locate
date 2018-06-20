'use strict';


const positionalise = require('./lib/positionalise'),
    parse = require('./lib/parse'),
    fs = require('fs');

const flatten = (object, prefix = '') =>
    Object.keys(object).reduce(
        (prev, element) =>
        object[element] &&
        typeof object[element] === 'object' &&
        !Array.isArray(object[element]) ? { ...prev,
            ...flatten(object[element], `${prefix}${element}.`)
        } : { ...prev,
            ...{
                [`${prefix}${element}`]: object[element]
            }
        }, {},
    );

exports.parseFile = function(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err) return reject(err);
            const stringData = data.toString();
            let result = parse(stringData);
            if (!result) return resolve();
            delete result.end;
            if (Object.keys(result).length) {
                resolve(positionalise(stringData, result));
            } else resolve();
        });
    });
};

exports.parse = function(stringData) {
    return positionalise(stringData, parse(stringData));
};

exports.parseNoEnd = function(stringData) {
    let r = parse(stringData);
    delete r.end;
    return r;
};

exports.parseQualifiedNames = function(stringData) {
    let r = exports.parseNoEnd(stringData);
    return Object.keys(flatten(r))
    .map(v => v.replace(/\.posn$/, ""))
    .map(v => v.replace(/\bmodule\W/, ""))
    .map(v => v.replace(/\Wclass\W/, "::"))
    .map(v => v.replace(/class\W/, ""))
    .map(v => v.replace(/\.\method\b\./, "#"));
};