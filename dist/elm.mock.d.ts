import { App, Elm } from '.';
interface AppInit {
    incoming: string[];
    outgoing: string[];
}
interface ModuleInit extends AppInit {
    path: string[];
}
declare const AppAccessor: unique symbol;
declare function createMock(moduleArgs: ModuleInit[]): Elm;
export { ModuleInit, AppAccessor, App };
export default createMock;
