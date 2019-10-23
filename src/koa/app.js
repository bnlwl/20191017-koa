import Koa from 'koa';
import cors from 'koa2-cors';
import bodyParser from 'koa-bodyparser';
import config from './config';
import listRouter from './routes/list';
import loginRouter from './routes/login';

const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(listRouter.routes());
app.use(loginRouter.routes());

app.listen(config.port);

console.log(`server started at port ${config.port}...`);
