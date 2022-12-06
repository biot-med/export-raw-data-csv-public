const axios = require('axios');
const { exit } = require('process');

const GET_MEASUREMENTS = 'measurement/v1/measurements/raw?flatRequest=';
const LOGIN = 'ums/v2/users/login';

class DataFetcher {

	constructor(params) {
		this.headers = {
			Authorization: ''
		}
		this.params = params;
	}

	async startFetch(startDate, endDate, deviceId) {
		console.log('Start fetching process');
		await this.loginBioT();
		try {
			const url = this.params.biotBaseUrl + GET_MEASUREMENTS;
			const query = {
				patientId: deviceId,
				startTime: new Date(startDate).toISOString(),
				endTime: new Date(endDate).toISOString()
			}
			const { data, status } = await axios.get(url + JSON.stringify(query), { headers: this.headers });
			if (status !== 200 && data.data.length > 0) {
				console.log('Measurements not found');
				exit(0);
			}

			return data.attributes;
		}
		catch (e) {
			console.log(e.message);
			if (e.status === 404) {
				console.log('Parient not found');
			}
			else if (e.status === 401) {
				console.log('Anuthorized');
			}
			exit(0);
		}
	}

	async loginBioT() {
		try {
			const url = this.params.biotBaseUrl + LOGIN;
			const body = {
				username: this.params.userName,
  				password: this.params.password
			}
			const { data, status } = await axios.post(url, body);
			if (data && data.accessJwt && data.accessJwt.token) {
				this.headers = {Authorization: 'Bearer ' + data.accessJwt.token};
				console.log('Login success ');
			}
		}
		catch(e) {
			console.log(e.message);
			console.log(e.response.data);
		}
	}
}

module.exports = DataFetcher;