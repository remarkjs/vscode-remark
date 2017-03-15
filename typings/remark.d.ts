declare namespace Remark {
	interface IRemarkResult {
		data: any;
		messages: any;
		history: any;
		cwd: string;
		contents: string;
	}

	interface Processor {
		use(plugin: any, opts?: Object): Processor;
		process(content: string): Promise<IRemarkResult>;
	}
}

declare module 'remark' {
	const remark: () => Remark.Processor;
	export = remark;
}
