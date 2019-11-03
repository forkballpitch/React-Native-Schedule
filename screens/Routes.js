const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1234',
    database : 'smartoffice'
});

db.connect();

app.get('/data', function(req,res){
var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';
db.query(sql, (err, result)=>{
    if(err) throw err;
    res.send(result);
});
});

app.post('/createtask', function(req, res){
    var data = {scheduledata:req.body.scheduledata};
    var sql = 'INSERT INTO tb_schedule SET ?';
    db.query(sql, data, (err, result)=>{
    if(err) throw err;
    res.send({
        status: 'success',
	});
});
});

app.listen(3210, ()=>{
    console.log('Server port 3210')
});