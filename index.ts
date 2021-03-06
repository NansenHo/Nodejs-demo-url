import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs'; // TypeScript 用 * 号来引入，这样更加严谨
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');
let cacheAge = 3600 * 24 * 365;

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const {method, url: path, headers} = request;
    const {pathname, search} = url.parse(path);

    if (method !== 'GET') {
        response.statusCode = 405;
        response.end();
        return
    }
    // 静态服务器是不能接受 POST 请求的

    let filename = pathname.substr(1); // 去掉 pathname 的 / 就得到了 filename
    if (filename === '') {
        filename = 'index.html'
    }
    fs.readFile(p.resolve(publicDir, filename), (error, data) => {
        if (error) {
            console.log(error);
            if (error.errno === -4058 || error.errno === -2) {
                response.statusCode = 404;
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data);
                })
            } else {
                response.statusCode = 500;
                response.end('服务器繁忙，请稍后重试');
            }
        } else {
            // 返回文件内容
            response.setHeader('Cache-Control', `public, max-age=${cacheAge}`) // 会把要请求到的文件保存下来
            response.end(data.toString());
        }
    });
});

server.listen(8888);