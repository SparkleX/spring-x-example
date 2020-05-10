"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var FooService_1, _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
require("reflect-metadata");
const inversify_1 = require("inversify");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
const inversify_express_utils_1 = require("inversify-express-utils");
const ts_spring_1 = require("ts-spring");
const cls_hooked_1 = require("cls-hooked");
//@provide(FooRepository)
class FooRepository extends ts_spring_1.BaseRepository {
    constructor() {
        super();
        this.init();
    }
    initTableName() {
        return "foo";
    }
}
let FooService = FooService_1 = class FooService extends ts_spring_1.BaseService {
    constructor() {
        super();
        this.init();
    }
    initRepo() {
        return new FooRepository();
    }
};
FooService = FooService_1 = __decorate([
    inversify_binding_decorators_1.provide(FooService_1),
    __metadata("design:paramtypes", [])
], FooService);
let FooController = class FooController {
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = yield ts_spring_1.txTransaction(() => this.service.findAll());
            res.status(200).json(data);
        });
    }
};
__decorate([
    inversify_1.inject(FooService),
    __metadata("design:type", FooService)
], FooController.prototype, "service", void 0);
__decorate([
    inversify_express_utils_1.httpGet("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express !== "undefined" && express.Request) === "function" ? _a : Object, typeof (_b = typeof express !== "undefined" && express.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], FooController.prototype, "index", null);
FooController = __decorate([
    inversify_express_utils_1.controller("/foo")
], FooController);
let container = new inversify_1.Container({ skipBaseClassChecks: true });
container.load(inversify_binding_decorators_1.buildProviderModule());
let server = new inversify_express_utils_1.InversifyExpressServer(container);
server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});
let app = server.build();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var SQL = yield ts_spring_1.initSqlJs();
        const session = cls_hooked_1.createNamespace('clsSession');
        const pool = new ts_spring_1.SqlJsConnectionPool(SQL);
        const context = new ts_spring_1.ApplicationContext({
            cls: session,
            pool: pool
        });
        ts_spring_1.ApplicationContext.DEFAULT = context;
        yield ts_spring_1.txTransaction(() => __awaiter(this, void 0, void 0, function* () {
            const conn = yield context.getConnection();
            let result = yield conn.execute('create table foo (id integer primary key, name);');
            console.debug(result);
            result = yield conn.execute("insert into foo(id, name) values(1, 'a')");
            result = yield conn.execute("select * from foo");
        }));
        app.listen(3000);
        console.debug('server running on port : 3000');
    });
}
main();
//# sourceMappingURL=main.js.map