declare module 'remap-istanbul' {
	namespace RemapIstanbul {
		export interface Options {
			fail?: boolean;
			check?: CheckOptions;
			reportOpts?: {};
			reports?: {};
		}

		export interface CheckOptions {
			global?: Thresholds;
			each?: EachThresholds;
		}

		export interface Thresholds {
			statements: Number;
			branches: Number;
			lines: Number;
			functions: Number;
			excludes: string[];
		}

		export interface EachThresholds extends Thresholds {
			overrides?: {};
		}
	}

	export default class {
		/**
		  * The basic API for utilising remap-istanbul
		  * @param {Array|string} sources The sources that could be consumed and remapped.
		  *		For muliple sources to be combined together, provide
		  *		an array of strings.
		  * @param  {Object} reports An object where each key is the report type required and the value
		  *		is the destination for the report.
		  * @param {Object} reportOptions? An object containing the report options.
		  * @return {Promise} A promise that will resolve when all the reports are written.
		  */
		public remap(sources: [], reports: object, reportOptions: RemapIstanbul.Options): any;
	}
}
