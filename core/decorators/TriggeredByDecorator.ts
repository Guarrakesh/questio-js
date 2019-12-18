export function TriggeredBy(triggers: string[]) {
    return function(constructor: Function) {
        Object.defineProperty(constructor.prototype, 'triggers', {
            value: triggers,
            writable: false
        });
    }
}
