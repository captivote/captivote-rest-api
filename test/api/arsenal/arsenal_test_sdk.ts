import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiJsonSchema from 'chai-json-schema';
import { IncomingMessageError, sanitiseSchema, superEndCb, TCallback } from 'nodejs-utils';
import * as supertest from 'supertest';
import { Response } from 'supertest';

import { IArsenal } from '../../../api/arsenal/models.d';
import * as arsenal_route from '../../../api/arsenal/route';
import * as arsenal_routes from '../../../api/arsenal/routes';
import { User } from '../../../api/user/models';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const arsenal_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class ArsenalTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, arsenal: IArsenal,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (arsenal == null) return callback(new TypeError('`arsenal` argument to `create` must be defined'));

        expect(arsenal_route.create).to.be.an.instanceOf(Function);
        supertest(this.app)
            .post(`/api/arsenal/${arsenal.id}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(arsenal_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public getAll(access_token: string, arsenal: IArsenal,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (arsenal == null) return callback(new TypeError('`arsenal` argument to `getAll` must be defined'));

        expect(arsenal_routes.readAll).to.be.an.instanceOf(Function);
        supertest(this.app)
            .get('/api/arsenals')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.have.property('owner');
                    expect(res.body).to.have.property('arsenals');
                    expect(res.body.arsenals).to.be.instanceOf(Array);
                    res.body.arsenals.map(_arsenal => {
                        expect(_arsenal).to.be.an('object');
                        expect(_arsenal).to.be.jsonSchema(arsenal_schema);
                    });
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public retrieve(access_token: string, arsenal: IArsenal,
                    callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (arsenal == null) return callback(new TypeError('`arsenal` argument to `getAll` must be defined'));

        expect(arsenal_route.read).to.be.an.instanceOf(Function);
        console.info('`/api/arsenal/${arsenal.id}` =', `/api/arsenal/${arsenal.id}`)
        supertest(this.app)
            .get(`/api/arsenal/${arsenal.id}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(arsenal_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public update(access_token: string, initial_arsenal: IArsenal,
                  updated_arsenal: IArsenal, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_arsenal == null)
            return callback(new TypeError('`initial_arsenal` argument to `update` must be defined'));
        else if (updated_arsenal == null)
            return callback(new TypeError('`updated_arsenal` argument to `update` must be defined'));
        else if (initial_arsenal.owner !== updated_arsenal.owner)
            return callback(
                new ReferenceError(`${initial_arsenal.owner} != ${updated_arsenal.owner} (\`owner\`s between arsenals)`)
            );

        expect(arsenal_route.update).to.be.an.instanceOf(Function);
        supertest(this.app)
            .put(`/api/arsenal/${initial_arsenal.id}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_arsenal)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_arsenal).map(
                        attr => expect(updated_arsenal[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(arsenal_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public destroy(access_token: string, arsenal: IArsenal,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (arsenal == null)
            return callback(new TypeError('`arsenal` argument to `destroy` must be defined'));

        expect(arsenal_route.del).to.be.an.instanceOf(Function);
        supertest(this.app)
            .del(`/api/arsenal/${arsenal.id}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.status).to.be.equal(204);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }
}
