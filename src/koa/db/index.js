import mongoose from 'mongoose';
import config from '../config';

const db = mongoose.createConnection(config.db, {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

db.on('open', () => {
  console.log(`数据库连接成功 地址:${config.db}`)
});

db.on('error', () => {
  console.log(`数据库连接失败 地址:${config.db}`)
});

export default {Schema, db};
