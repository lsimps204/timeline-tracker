import Axios from 'axios'

/* Base axios instance */
const axios = Axios.create({
	//baseURL: 'http://127.0.0.1:5000',
	baseURL: 'REDACTED - API NO LONGER OPERATIONAL',
	headers: {
		'TenantId': '17',
		'AuthToken': 'REDACTED'
	},
	// timeout?
});

export default axios;