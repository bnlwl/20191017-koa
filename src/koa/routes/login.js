import mongo from '../db';
import Router from 'koa-router';

const router = new Router();

const userSchema = new mongo.Schema({username: String, password: String});
const User = mongo.db.model('users', userSchema);

async function registered(ctx) {
  const {username, password} = ctx.request.body;
  if (username === '' || password === '')
    return await ctx.render('log', {mistake: '请完善表单信息'});
  await new Promise((res, rej) => {
    User.find({username}, (err, data) => {
      if (err) return rej;
      if (data.length !== 0) return res('');
      const obj = new User({username, password});
      obj.save((err, data) => {
        if (err) return err;
        return data;
      });
      return res('注册成功');
    }).then(async data => {
      if (data)
        await ctx.render('first', {success: '注册成功'});
      else
        await ctx.render('log', {error: '注册失败,用户名已存在', status: 0});
    }, async data => {
      await ctx.render('log', {error: '注册失败', status: 1});
    });
  });
};

async function login(ctx) {
  const {username, password} = ctx.request.body;
  if (username === '' || password === '')
    return await ctx.render('first', {mistake: '请完善表单信息'});
  await new Promise((res, rej) => {
    User.find({username}, (err, data) => {
      if (err) return rej;
      if (data.length === 0) return rej('用户名不存在');
      if (data[0].password === password) return res();
    })
  }).then(async () => {
    await ctx.render('list');
  }, async data => {
    if (data) await ctx.render('first', {err: '用户名不存在'});
    else await ctx.render('first', {error: '系统异常'});
  })
};

router.post('/login', login)
  .post('/reg', registered);

export default router;
