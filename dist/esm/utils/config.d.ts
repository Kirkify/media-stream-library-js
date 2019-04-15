export interface IConfigObject {
    [key: string]: any;
}
/**
 * Flat merge of objects, ignoring undefined override values.
 * @param  {Object} template The object with default values
 * @param  {Object} override The object with override values.
 * @return {Object}          The template object with override merged in.
 */
export declare const merge: <T extends IConfigObject>(template: T, override: T) => T;
