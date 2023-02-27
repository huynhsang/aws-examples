exports.samlAuthHandler = async (event, context, callback) => {
	callback(null, {
		location: 'https://d-95677f1bdc.awsapps.com/start'
	})
}