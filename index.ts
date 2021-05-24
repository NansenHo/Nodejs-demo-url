import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs'; // TypeScript 用 * 号来引入，这样更加严谨
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const {method, url: path, headers} = request;
    const {pathname, search} = url.parse(path);

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
            response.end(data.toString());
        }
    });
});

server.listen(8888);