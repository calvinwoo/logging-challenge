'use strict'

const _ = require('lodash');

class Log {
	constructor(logSource) {
		this.logSource = logSource;
		this.entry;
	}

	next() {
		this.entry = this.logSource.pop();
		return this.entry;
	}
}

module.exports = (logSources, printer) => {
	let logs = logSources.map((logSource) => new Log(logSource));
	logs.forEach((log) => log.next());
	logs.sort((logA, logB) => logA.entry.date - logB.entry.date);

	while (logs.length > 0) {
		const activeLog = logs.shift();
		printer.print(activeLog.entry);

		const newEntry = activeLog.next();
		if (newEntry) {
			activeLog.entry = newEntry;
			const index = _.sortedIndexBy(logs, activeLog, (log) => log.entry.date);
			logs.splice(index, 0, activeLog);
		}
	}

	printer.done();
};
