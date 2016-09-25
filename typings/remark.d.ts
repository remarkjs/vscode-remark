declare namespace Remark {
	interface Processor {
		use(plugin: any, opts?: Object): Processor;
		process(content: string, options: any, callback: (err: Error, file: any) => void): void;
	}
}

declare module 'remark' {
	const remark: () => Remark.Processor;
	export = remark;
}
