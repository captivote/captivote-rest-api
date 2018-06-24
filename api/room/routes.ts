import { NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { Room } from './models';

/* tslint:disable:no-var-requires */
const room_schema: JsonSchema = require('./../../test/api/room/schema');

export const readAll = (app: restify.Server, namespace: string = ''): void => {
    console.info(`routes::read::${namespace}s`);
    app.get(`${namespace}s`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Room)
                .find()
                .then((rooms: Room[]) => {
                    if (rooms == null || !rooms.length) return next(new NotFoundError('Room'));
                    res.json({ rooms });
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
