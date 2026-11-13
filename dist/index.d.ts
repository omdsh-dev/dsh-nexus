import { Context } from "@deepseek-ai/cordis";
//#region src/index.d.ts
declare const inject: string[];
declare function apply(ctx: Context): Promise<void>;
//#endregion
export { apply, inject };