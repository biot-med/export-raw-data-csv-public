const { exit } = require('process');
const _ = require('lodash');
const fs = require("fs");

class DataParser {

	constructor(params) {
		this.params = params
	}

	async jsonToCSV(data) {
		const attributes = data;
		let transformedAttrs = [];
		let names = [];
		for (let i = 0; i < attributes.length; i++){
			names.push('attributeName_' + attributes[i].attributeName);
			const sources = attributes[i]['sources'];
			for (let j = 0; j < sources.length; j++) {
				const measurementSessions = sources[j].measurementSessions
				for (let k=0; k < measurementSessions.length; k++) {
					let measurements = measurementSessions[k].measurements.map(m=> {
						return {
							timestamp: m.timestamp, 
							data: m.data[0], 
							attributeName: attributes[i].attributeName,
							sourceEntityId: sources[j].sourceEntityId,
							sessionId: measurementSessions[k].sessionId
						}
					});
					transformedAttrs = transformedAttrs.concat(measurements)
				}
			}
		}
		transformedAttrs = _.groupBy(transformedAttrs, 'sourceEntityId');
		for (let k of Object.keys(transformedAttrs)) {
			transformedAttrs[k] = _.groupBy(transformedAttrs[k], 'sessionId');
		}
		for (let k of Object.keys(transformedAttrs)) {
			for (let kk of Object.keys(transformedAttrs[k])) {
				transformedAttrs[k][kk] = _.groupBy(transformedAttrs[k][kk], 'timestamp');
			}
		}
		let csvContent = `sources__sourceEntityId,sources__measurementSessions__sessionId,sources__measurementSessions__measurements__timestamp,${names.sort((a, b)=> a.localeCompare(b)).join(',')}\r\n`;
		for (let k of Object.keys(transformedAttrs)) {
			for (let kk of Object.keys(transformedAttrs[k])) {
				for (let kkk of Object.keys(transformedAttrs[k][kk])) {
					let measurements = transformedAttrs[k][kk][kkk]
						.sort((a, b)=> a['attributeName'].localeCompare(b['attributeName']))
						.map(m=>m.data).join(',')
					let row = `${k},${kk},${kkk},${measurements}`;
    				csvContent += row + "\r\n";
				}
			}	
		}
		fs.writeFileSync(this.params.outputDir + '/results.csv', csvContent);


	}
}

module.exports = DataParser;