
import * as express from "express";
import * as bodyParser from 'body-parser';
import * as winston from 'winston';
import { MySqlConnection, MySqlConnectionPool, ApplicationContext, BaseService, BaseRepository, Connection, BaseController } from 'ts-spring';
import { createNamespace } from 'cls-hooked';
(winston as any).level = 'debug';
winston.add(new winston.transports.Console({
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp(),
		winston.format.printf((info) => {
			const {timestamp, level, message, ...args} = info;
			return `${timestamp} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
		  })
		)
	})
);

console.debug = winston.debug;
console.info = winston.info;
console.error = winston.error;
console.warn = winston.warn;


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
const service = new FooService();
class FooController extends BaseController<Foo, FooKey, FooService>{
	protected getService(): FooService {
		return service;
	}
}
const controller = new FooController();



const config = {
	host     : 'localhost',
	user     : 'root',
	password : '1234'
};

async function main(): Promise<void> {

	const conn: Connection = await MySqlConnection.getConnection(config);
	await conn.execute('drop schema if exists test');
	await conn.execute('create schema test');
	await conn.execute('use test');
	let result = await conn.execute('create table foo (id int, name varchar(45), primary key(id));');
	result = await conn.execute("insert into foo(id, name) values(1, 'a')");
	result = await conn.execute("insert into foo(id, name) values(2, 'b')");
	result = await conn.execute("select * from foo");

	(config as any).database = 'test';
	const session = createNamespace('clsSession');
	const pool = new MySqlConnectionPool(config);
	const context = new ApplicationContext({
		cls: session,
		pool: pool
	});	
    ApplicationContext.DEFAULT = context; 

	const app = express();
	const port = 3000;
	
	
	
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	
	app.get( "/foo", ( req, res ) => {
		controller.defaultFindAll(req, res);
	} );
	app.get( "/foo/:id", ( req, res ) => {
		controller.defaultFindById(req, res, {id: parseInt(req.params.id)});
	} );
	
    app.listen( port, () => {
		console.log( `server started at http://localhost:${port}` );
	} );
}

main();