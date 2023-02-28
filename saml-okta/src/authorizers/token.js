const jwt = require('jsonwebtoken');
const {promisify} = require('util');

const verifyAsync = promisify(jwt.verify);

const generatePolicy = (effect, resource, token) => {
    const decoded = token && jwt.decode(token);
    return ({
        principalId: decoded ? decoded.userName : 'unauthorized-user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: effect,
                    Action: 'execute-api:Invoke',
                    Resource: resource,
                },
            ],
        },
        context: decoded,
    });
};

module.exports.authorizer = async (event, context, callback) => {
    // for example : Bearer xxx.yyy.zzz
    const authHeaderValue = event.authorizationToken;
    let token = null;
    let effect = 'Deny';

    if (authHeaderValue && authHeaderValue.startsWith('Bearer')) {
        //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
        const parts = authHeaderValue.split(' ');
        if (parts.length === 2) {
            try {
                token = parts[1];
                await verifyAsync(token, 'jwt_secret');
                effect = 'Allow';
            } catch (error) {
                console.error(error);
            }
        }
    }

    return callback(null, generatePolicy(effect, event.methodArn, token));
};