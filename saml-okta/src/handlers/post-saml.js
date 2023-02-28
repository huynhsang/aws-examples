const xml2js = require('xml2js');
const jwt = require('jsonwebtoken');

const getAttributeValue = (key, attributes) => {
    const attribute = attributes.find(attr => attr['$'].Name === key);
    if (!attribute) {
        return null;
    }
    return attribute['saml2:AttributeValue'][0]._;
}

// Format could be different, verify the SAML output of your ADFS
const extractUserInfo = samlObject => {
    const response = samlObject['saml2p:Response'];
    const assertion = response['saml2:Assertion'][0];
    console.log("assertion");
    console.log(assertion);
    const attributeStatement = assertion['saml2:AttributeStatement'][0];
    console.log("attributeStatement");
    console.log(attributeStatement);
    const attributes = attributeStatement['saml2:Attribute'];
    console.log("attributes");
    console.log(attributes);

    const email = getAttributeValue('email', attributes);
    const userName = getAttributeValue('cn', attributes);

    // Here we can have the logic on determining the role
    const role = 'User';

    return {
        email,
        userName,
        role,
    };
};

module.exports.handler = async (event, context) => {
    console.log('Starting SAML parsing...\n');
    console.log(event.body);
    const arr = event.body.split('&RelayState=');
    const samlResponse = unescape(arr[0].replace('SAMLResponse=', ''));
    const samlBuffer = Buffer.from(samlResponse, 'base64').toString('ascii');
    const samlObject = await xml2js.parseStringPromise(samlBuffer);
    console.log(samlObject);

    try {
        const userInfo = extractUserInfo(samlObject);

        const token = jwt.sign(userInfo, 'jwt_secret', {
            expiresIn: 3600,
        });

        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify({
                "accessToken": encodeURIComponent(token)
            })
        };
    } catch(error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'An error occured!',
        };
    }
};