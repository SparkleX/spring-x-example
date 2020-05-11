
import * as express from "express";
import * as bodyParser from 'body-parser';

import { initSqlJs, ApplicationContext, BaseService, BaseRepository, txTransaction, SqlJsConnectionPool, Connection } from 'ts-spring';
import { createNamespace } from 'cls-hooked';

interface FooKey {
    id: number;
}
interface Foo {
    id: number;
    data : string;
}
class FooRepository extends BaseRepository<Foo, FooKey> {
	protected getTableName(): string {
		return "foo";
	}  
}

class FooService extends BaseService<Foo, FooKey, FooRepository>{
	constructor() {
		super();
		this.repo = new FooRepository();
	}
	
    repo: FooRepository

	getRepository(): FooRepository {
		return this.repo;
	}
}

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

	const app = express();
	const port = 3000;
	
	const service = new FooService();
	
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	
	app.get( "/foo", async ( req, res ) => {
		var data = await txTransaction(()=>service.findAll()) ;
		res.send(data);
	} );
	
    app.listen( port, () => {
		console.log( `server started at http://localhost:${ port }` );
	} );
}

main();