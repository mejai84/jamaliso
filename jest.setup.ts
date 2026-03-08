import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
if (typeof global.Request === 'undefined') {
    global.Request = class Request { } as any;
    global.Response = class Response { } as any;
    global.fetch = jest.fn() as any;
}
