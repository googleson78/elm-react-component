/// <reference types="react" />
interface Elm {
    Elm: ElmStep;
}
interface ElmStep {
    [key: string]: ElmStep | ElmModule | undefined;
}
interface ElmModule {
    init(args: ElmInitArgs): App;
}
interface Options {
    /** the name of the elm module, shouldn't be necessary */
    path?: string[];
}
interface App {
    ports: {
        [key: string]: {
            subscribe?(fn: (data: any) => void): void;
            unsubscribe?(fn: (data: any) => void): void;
            send?(data: any): void;
        };
    };
}
interface ElmInitArgs {
    node: HTMLDivElement;
    flags: Object;
}
declare function wrap<Props extends {} = {}>(elm: Elm, opts?: Options): (props: Props) => JSX.Element;
export { Elm, ElmStep, ElmModule, App, ElmInitArgs, };
export default wrap;
