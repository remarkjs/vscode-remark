declare module "npm-module-path" {
	export interface IResolveOptions {
		cache?: string | string[];
		resolveDir?: boolean;
		resolveOnlyByPrefix?: boolean;
	}

	export function resolveOne(toResolve: string, root?: string, options?: IResolveOptions): Promise<string>;
	export function resolveMany(toResolve: string[], root?: string, options?: IResolveOptions): Promise<string[]>;
}
