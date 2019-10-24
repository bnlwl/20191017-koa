import mongo from '../db';
import Router from 'koa-router';

const listSchema = new mongo.Schema({
  name: {type: String},
  age: {type: String}
});
const list = mongo.db.model('list', listSchema);

const router = new Router();

/**
 * 获取列表
 * @param ctx {Object}
 * @returns {Promise<void>}
 */
async function getList(ctx) {
  const query = ctx.request.query;
  const pageNum = Number(query.pageNum) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const data = await list.find({});
  // .limit(pageSize)
  // .skip((pageNum - 1) * pageSize)
  // // .select('name')
  // .exec(function (err, data) {
  //   console.log(err);
  //   console.log(data);
  // });
  // {
  //   limit: pageSize,
  //     skip: (pageNum - 1) * pageSize
  // }
  console.log(data);
  ctx.response.type = 'application/json';
  ctx.body = data
};

/**
 * 模糊查询 名字或者年龄
 * @param ctx {Object} 包含req和res
 * @returns {Promise<void>}
 */
async function searchList(ctx) {
  const searchWord = ctx.params.word;
  const data = await list.find({
    $or: [{age: {$regex: searchWord, $options: 'i'}}, {name: {$regex: searchWord, $options: 'i'}}]
  });
  ctx.response.type = 'application/json';
  ctx.body = data
};

/**
 * 添加
 * @param ctx {Object} 包含req和res
 * @returns {Promise<void>}
 */
async function add(ctx) {
  await list.insert(ctx.request.body);
  ctx.response.type = 'application/json';
  ctx.body = {
    code: 200,
    message: 'OK'
  }
};

/**
 * 删除
 * @param ctx {Object} 包含req和res
 * @returns {Promise<void>}
 */
async function remove(ctx) {
  await list.remove(ctx.request.body);
  ctx.response.type = 'application/json';
  ctx.body = {
    code: 200,
    message: 'OK'
  }
};

/**
 * 修改
 * @param ctx {Object} 包含req和res
 * @returns {Promise<void>}
 */
async function update(ctx) {
  const body = ctx.request.body;
  await list.update({_id: body.id}, {$set: {name: body.name, age: body.age}});
  ctx.response.type = 'application/json';
  ctx.body = {
    code: 200,
    message: 'OK'
  }
};

router.get('/list', getList)
  .get('/list/:word', searchList)
  .post('/list', add)
  .del('/list', remove)
  .put('/list', update);

module.exports = router;
