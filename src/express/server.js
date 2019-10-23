const express = require('express'); //  node框架
const _static = require('express-static');//  静态文件
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const consolidate = require('consolidate');
const mysql = require('mysql');
const common = require('./libs/common.js');

//  连接池
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'blog'
});

const server = express();
server.listen(3002);

//  解析cookie
server.use(cookieParser('abcdefghijklmnopqrtsuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'));

//  使用session
const keys = [];
for (let i = 0; i < 10; i++) keys.push(`keys_${Math.random()}`);
server.use(cookieSession({
    name: 'zns_session',
    keys,
    maxAge: 20 * 3600 * 1000
}));

//  post数据
server.use(bodyParser.urlencoded({extended: false}));
server.use(multer({dest: './data'}).any());

//  配置模板引擎
// server.use(express.static(__dirname + '/template'));
server.set('view engine', 'html'); //   输出
server.set('views', './template');    //  模板文件位置
server.engine('html', consolidate.ejs); //  用那种引擎

//  接收用户请求
//  banner 数据请求 并存在response
server.get('/', (req, res, next) => {
    db.query('SELECT * FROM banner_table', function (err, data) {
        if (err) {
            res.status(500).send('database error').end();
        } else {
            res.banners = data;
            next();
        }
    });
});
//  article文章列表请求。 只取数据库的id title summary 。并存在response
server.get('/', function (req, res, next) {
    db.query('SELECT ID,title,summary FROM article_table', function (err, data) {
        if (err) {
            res.status(500).send('database error').end();
        } else {
            res.articles = data;
            next();
        }
    });
});

//  统一返回数据
server.get('/', (req, res) => {
    res.render('index.ejs', {
        banners: res.banners,
        articles: res.articles
    });
});

//  处理文章页面
server.get('/article', (req, res) => {
    if (req.query.id) {
        if (req.query.act == 'like') {
            db.query(`UPDATE article_table SET n_like=n_like+1 WHERE ID=${req.query.id}`, (err, data) => {
                if (err) {
                    res.status(500).send('服务器错误').end();
                } else {
                    db.query(`SELECT * FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
                        if (err) {
                            res.status(500).send('database error').end();
                        } else {
                            if (!data.length) {
                                res.status(404).send('数据为空').end();
                            } else {
                                const articleData = data[0];
                                articleData.sDate = common.time2date(articleData.post_time);
                                res.render('article.ejs', {articleData});
                            }
                        }
                    })
                }
            })
        } else {
            db.query(`SELECT * FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
                if (err) {
                    res.status(500).send('database error').end();
                } else {
                    if (!data.length) {
                        res.status(404).send('数据为空').end();
                    } else {
                        const articleData = data[0];
                        articleData.sDate = common.time2date(articleData.post_time);
                        res.render('article.ejs', {articleData});
                    }
                }
            })
        }
    } else {
        res.status(404).send('不存在').end();
    }
});

//  static数据
server.use(_static('./data'));
// 连接
// const db = mysql.createConnection({
//     host: 'localhost', //服务器名称
//     user: 'root', //用户名
//     password: '132456',//密码
//     database: 'msh'//哪个库
// });

//查询
//参数：sql语句 , 回调
// 4大查询语句 --- 增、删、改、查
//      增 INSERT
//      INSERT INTO 表(字段列表 ``) VALUES(值列表 '')
//例：INSERT INTO `user_table` (`ID`,`username`,`password`) VALUES(0,'msh1','123456')
//      删 DELETE
//      改 UPDATE
//      查 SELECT
//      SELECT 什么 FROM 表
//例：SELECT * FROM `user_table`
//
// db.query('SELECT * FROM `user_table`', (err, data) => {
//     if (err) console.log(err);
//     // else console.log(data);
// });
