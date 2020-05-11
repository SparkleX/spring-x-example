
import * as express from "express";
import * as bodyParser from 'body-parser';

import "reflect-metadata";
import { inject, Container, postConstruct } from 'inversify';
import { provide ,buildProviderModule } from 'inversify-binding-decorators';
import { InversifyExpressServer, httpGet, controller } from 'inversify-express-utils';

import { initSqlJs, ApplicationContext, BaseService, BaseRepository, txTransaction, SqlJsConnectionPool, Connection, txAutoCommit } from 'ts-spring';
import { createNamespace } from 'cls-hooked';

interface FooKey {
    id: number;
}
interface Foo {
    id: number;
    data : string;
}
@provide(FooRepository)
class FooRepository extends BaseRepository<Foo, FooKey> {
	protected getTableName(): string {
		return "foo";
	}  
}
@provide(FooService)
class FooService extends BaseService<Foo, FooKey, FooRepository>{
	@inject(FooRepository)
    repo: FooRepository

	getRepository(): FooRepository {
		return this.repo;
	}
}

@controller("/foo")
class FooController{
    @inject(FooService)
    service: FooService;
    @httpGet("/")
    private async index(req: express.Request, res: express.Response): Promise<void> {
        var data = await txTransaction(()=>this.service.findAll()) ;
        res.status(200).json(data);
    }
}
let container = new Container({ skipBaseClassChecks: true });
container.load(buildProviderModule());

let server = new InversifyExpressServer(container);
server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});

let app = server.build();

async function main(): Promise<void> {
	var SQL = await initSqlJs();
	const session = createNamespace('clsSession');
	const pool = new SqlJsConnectionPool(SQL);
	const context = new ApplicationContext({
		cls: session,
		pool: pool
	});	
    ApplicationContext.DEFAULT = context;    
	await txTransaction(async() =>{
		const conn: Connection = await context.getConnection();
		let result = await conn.execute('create table foo (id integer primary key, name);');
		console.debug(result);
        result = await conn.execute("insert into foo(id, name) values(1, 'a')");
        result = await conn.execute("insert into foo(id, name) values(2, 'b')");
		result = await conn.execute("select * from foo");
	});    
    app.listen(3000);
    console.debug('server running on port : 3000');
}

main();