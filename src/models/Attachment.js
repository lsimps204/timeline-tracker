import axios from '../axios.js'

/* The below import is also used in a Node.js context, so relies on module.exports and thus must be required */
let mergeAuthHeaders = require('../AuthHeaders.js')

class Attachment {
	static create(attachment) {
		let body = mergeAuthHeaders(attachment)
		return axios.put('TimelineEventAttachment/Create', body)
	}

	static delete(attachment) {
		let body = mergeAuthHeaders(attachment)
		return axios.put('TimelineEventAttachment/Delete', body)
	}

	static editTitle(attachment) {
		let body = mergeAuthHeaders(attachment)
		return axios.put('TimelineEventAttachment/EditTitle', body)
	}

	static getUploadLink(attachmentId) {
		//add attachment id
		return axios.get('TimelineEventAttachment/GenerateUploadPresignedUrl', 
			{headers: {'AttachmentId': attachmentId}}
		)
	}

	static getDownloadLink(attachmentId) {
		return axios.get('TimelineEventAttachment/GenerateGetPresignedUrl',
			{headers: {'AttachmentId': attachmentId}})
	}

	static upload(url, file) {
		return axios.put(url, file)
	}

	static download(url) {
		return axios({
			url: url,
			method: "GET",
		})
	}
}


export default Attachment