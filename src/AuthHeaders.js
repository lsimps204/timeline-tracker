/* Define authorization headers for PUT/DELETE requests, etc. */
const authHeaders = {
	'TenantId': '17',
    'AuthToken': 'REDACTED',
}

/* Ensures the request object to be merged with the authHeaders doesn't contain keys with the same name */
function validMerge(body) {
	let keys = Object.keys(body);
	return !keys.includes('AuthToken') && !keys.includes('TenantId'); //double check w/ test
}

/* Merge the above auth-headers with the body of the request */
function merge(body) {
	if (validMerge(body)) {
		return Object.assign(body, authHeaders);
	}

	// Return exception
}

/* Export merge function */
module.exports = merge