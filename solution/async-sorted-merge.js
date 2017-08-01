'use strict'

const _ = require('lodash');

class Log {
	constructor(logSource) {
		this.logSource = logSource;
		this.entry;
	}

	next() {
		const gettingEntry = this.logSource.popAsync();
		gettingEntry.then((entry) => this.entry = entry);
		return gettingEntry;
	}
}

module.exports = async (logSources, printer) => {
	let logs = logSources.map((logSource) => new Log(logSource));
	let firstLogEntries = logs.map((log) => log.next());

	await Promise.all(firstLogEntries);
	logs.sort((logA, logB) => logA.entry.date - logB.entry.date);

	while(logs.length > 0) {
		const activeLog = logs.shift();
		printer.print(activeLog.entry);

		const nextEntry = await activeLog.next();
		if (nextEntry) {
			const index = _.sortedIndexBy(logs, activeLog, (log) => log.entry.date);
			logs.splice(index, 0, activeLog);
		}
	}

	printer.done();
};
