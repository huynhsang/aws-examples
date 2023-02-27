const fs = require('fs');
const {SAML} = require('passport-saml');

const createRequest = event => ({
    query: {
        RelayState: event.queryStringParameters.returnUrl,
    },
});

module.exports.handler = async (event, context, callback) => {
    console.log('Logging in...');

    const samlParser = new SAML({
        entryPoint: process.env.SAML_IDP_URL || 'https://portal.sso.ap-northeast-1.amazonaws.com/saml/assertion/NDQzNjAwNzU1MTQ4X2lucy1jNTlhYWIyNmMzZGZjZGI1',
        // callbackUrl: process.env.SAML_CALLBACK_URL,
        path: '/saml/auth',
        // issuer: event.headers.Host + event.requestContext.path,
        issuer: 'saml-test',
        cert: process.env.SAML_CERT || fs.readFileSync('./awsssocert.pem', 'utf8')
        // audience: process.env.SAML_CALLBACK_URL,
        // providerName: 'AWS SAML Lambda Example',
    });
    const url = await samlParser.getAuthorizeUrlAsync(createRequest(event));

    const response = {
        statusCode: 301,
        headers: {
            Location: url,
        }
    };

    callback(null, response);
};