const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist'),api=require('./server-api.cjs');
http.createServer(async(req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost');if(await api(req,res,url))return}catch{res.writeHead(400);return res.end('Bad request')}
 let name;try{name=decodeURIComponent(url.pathname)}catch{res.writeHead(400);return res.end('Bad request')}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript','json':'application/json','ogg':'audio/ogg','wav':'audio/wav','mp4':'video/mp4','webm':'video/webm'})[path.extname(file).slice(1)]||'application/octet-stream');res.end(data)});
}).listen(4317,'127.0.0.1',()=>console.log('Elleson Studio preview: http://127.0.0.1:4317'));
