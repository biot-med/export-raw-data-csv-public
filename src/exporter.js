const fs = require('fs');
const { exit } = require('process');

const DataFetcher = require('./data-fetcher');
const DataParser = require('./data-parser');

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

async function app(argv, env) {
	const params = parseArgs(argv, env);
	await getUserInput(params);
	const dataFetcher = new DataFetcher(params);
	const data = await dataFetcher.startFetch(params.dateStart, params.dateEnd, params.deviceId);
	const dataParser = new DataParser(params);
	await dataParser.jsonToCSV(data);
	process.on('exit', async function () {
		console.log('Disconnecting');
		console.log('Goodbye!');
	});
	exit(0);
}

function getUserInput(params) {
	const pr = new Promise((resolve, reject)=> {
		readline.question('Please enter device id (patient id) ', deviceId => {
			if (deviceId) {
				params.deviceId = deviceId
			}
			readline.question('Please enter start date in format MM/DD/YYYY HH:mm ', startDate => {
				if (startDate) {
					params.dateStart = startDate
				}
				readline.question('Please enter end date in format MM/DD/YYYY HH:mm ', endDate => {
					if (endDate) {
						params.dateEnd = endDate
					}
					readline.close();
					resolve();
				});
			});
		});
	});
	return pr;
}

function parseArgs(argv, env) {
	let params = {};
	if (Object.keys(env).length != 0) {
		params.biotBaseUrl = env.BIOT_BASE_URL;
		params.outputDir = env.OUTPUT_DIR;
		params.userName = env.USERNAME;
		params.password = env.PASSWORD;
		params.deviceId = env.PATIENT_ID;
		params.dateStart = env.DATE_START;
		params.dateEnd = env.DATE_END;
		params.attributes = env.ATTRIBUTES;
	}
	let errors = [];
	if (!params.outputDir || !fs.existsSync(params.outputDir)) {
		errors.push(`Please provide path to images folder with param: set value "OUTPUT_DIR" in .env file`);
		isError = true;
	}
	if (errors.length > 0) {
		errors.forEach(e => {
			console.log(e);
		});
		exit(1);
	}
	return params;
}

module.exports = app;