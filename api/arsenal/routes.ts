import { NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { Arsenal } from './models';

/* tslint:disable:no-var-requires */
const arsenal_schema: JsonSchema = require('./../../test/api/arsenal/schema');

export const readAll = (app: restify.Server, namespace: string = ''): void => {
    console.info(`routes::read::${namespace}s`);
    app.get(`${namespace}s`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Arsenal)
                .find()
                .then((arsenals: Arsenal[]) => {
                    if (arsenals == null || !arsenals.length) return next(new NotFoundError('Arsenal'));
                    res.json({ arsenals });
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
