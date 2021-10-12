// Referenced objects have a key and id
// Every object of the same class has the same key, and every object has its own id
// This allows them to remain consistent when TypeScript can't be used
// For example, we can use these symbols for conversion into level data
export interface Referenced {
    readonly key: Symbol;
    readonly id: Symbol;
}

// Event emitters
// I'm not sure if this is the extent of the interface
export interface EventEmitter {
    emit: (event: string|Symbol, ...params: any) => void;
    on: (event: string|Symbol, callback: (...args: any)=>any, ...params: any) => void;
    removeListener: (event: string|Symbol, cb: (...args: any)=>any, context?: any) => any;
}