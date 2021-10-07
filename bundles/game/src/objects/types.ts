// Referenced objects have a key and id
// Every object of the same class has the same key, and every object has its own id
// This allows them to remain consistent when TypeScript can't be used
// For example, we can use these symbols for conversion into level data
export interface Referenced {
    readonly key: Symbol;
    readonly id: Symbol;
}