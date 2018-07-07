import { series } from 'async';
import { fmtError, NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { name_owner_split_mw } from './middleware';
import { Arsenal } from './models';

const slugify: (s: string) => string = require('slugify');

/* tslint:disable:no-var-requires */
const arsenal_schema: JsonSchema = require('./../../test/api/arsenal/schema');

const zip = (a0: any[], a1: any[]) => a0.map((x, i) => [x, a1[i]]);

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const arsenal = new Arsenal();
            arsenal.owner = req['user_id'];

            req.getOrm().typeorm.connection.manager
                .save(arsenal)
                .then((arsenal_obj: Arsenal) => {
                    if (arsenal_obj == null) return next(new NotFoundError('Arsenal'));
                    res.json(201, arsenal_obj);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:name_owner`, name_owner_split_mw,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Arsenal)
                .findOne({ id: req.params.name, owner: req.params.owner })
                .then((arsenal: Arsenal) => {
                    if (arsenal == null) return next(new NotFoundError('Arsenal'));
                    res.json(200, arsenal);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:name_owner`, has_body, has_auth(),
        mk_valid_body_mw_ignore(arsenal_schema, ['Missing required property']), name_owner_split_mw,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const arsenalR = req.getOrm().typeorm.connection.getRepository(Arsenal);

            // TODO: Transaction
            series([
                cb =>
                    arsenalR
                        .update({ id: req.params.name, owner: req['user_id'] }, req.body)
                        .then(() => cb(void 0))
                        .catch(cb),
                cb =>
                    arsenalR
                        .findOne(req.body)
                        .then(arsenal => {
                            if (arsenal == null) return cb(new NotFoundError('Arsenal'));
                            return cb();
                        })
                        .catch(cb)
            ], error => {
                if (error != null) return next(fmtError(error));
                res.json(200, req.body);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Arsenal)
                .remove({ owner: req['user_id'], name: req.params.name } as any)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
