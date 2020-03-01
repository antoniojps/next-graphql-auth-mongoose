
import mongooseConnectionMiddleware from './database';

const middlewareHandler = handler => mongooseConnectionMiddleware(handler);

export default middlewareHandler;