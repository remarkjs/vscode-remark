'use strict';

import * as fs from 'fs';

export function fileRead(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, file) => {
			if (err) {
				return reject(err);
			}

			resolve(file.toString());
		});
	});
}
