import { series } from 'async';
import { fmtError, NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { name_owner_split_mw } from './middleware';
import { Room } from './models';
import { IRoom } from './models.d'

const slugify: (s: string) => string = require('slugify');

/* tslint:disable:no-var-requires */
const room_schema: JsonSchema = require('./../../test/api/room/schema');

const zip = (a0: any[], a1: any[]) => a0.map((x, i) => [x, a1[i]]);

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq & {user_id: string}, res: restify.Response, next: restify.Next) => {
            const room = new Room();
            room.name = slugify(req.params.name.replace('_', '-'));
            room.owner = req.user_id;

            req.getOrm().typeorm.connection.manager
                .save(room)
                .then((room_obj: IRoom) => {
                    if (room_obj == null) return next(new NotFoundError('Room'));
                    res.json(201, room_obj);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:name_owner`, name_owner_split_mw,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            console.info('room::route::read::', { name: req.params.name, owner: req.params.owner }, ';');
            req.getOrm().typeorm.connection
                .getRepository(Room)
                .findOne({ name: req.params.name, owner: req.params.owner })
                .then((room: Room) => {
                    if (room == null) return next(new NotFoundError('Room'));
                    res.json(200, room);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:name_owner`, has_body, has_auth(),
        mk_valid_body_mw_ignore(room_schema, ['Missing required property']), name_owner_split_mw,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const roomR = req.getOrm().typeorm.connection.getRepository(Room);

            // TODO: Transaction
            series([
                cb =>
                    roomR
                        .update({ name: req.params.name, owner: req['user_id'] }, req.body)
                        .then(() => cb(void 0))
                        .catch(cb),
                cb =>
                    roomR
                        .findOne(req.body)
                        .then(room => {
                            if (room == null) return cb(new NotFoundError('Room'));
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
                .getRepository(Room)
                .remove({ owner: req['user_id'], name: req.params.name } as any)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
