const uuid = require('uuid');

const express = require('express');

const app = express();

const mysql = require('mysql');

const bodyParser = require('body-parser');

const cors = require('cors');

//mqtt

const mqtt = require('mqtt');

const options = {

host: '127.0.0.1',

port: 1883,

protocol: 'mqtt',

username:"vhadmin",

password:"vh12345!",

};

const client = mqtt.connect("mqtt://localhost:1883");

 

client.on("error", (error) => {

console.log("Can't connect" + error);

}

);

 

var optionspub = {

retain:false,

qos:1

};

 

var mqttstr = "schedule,"

 

//mqtt end

 

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




// app.get('/api/v2/smartoffice/speakers/:id/schedules', function(req,res){

// var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';

// db.query(sql, (err, result)=>{

// if(err) throw err;

// if(result.length > 0){
    
//         const value = result[0].scheduledata;
	 
// 	if (value !== null) {

// 		const todoList = JSON.parse(value);

// 		var aJsonArray = new Array();

// 		for(var i = 0; i < todoList.length ;i++){

// 		for(var j = 0; j < todoList[i].todoList.length ;j++){

// 		var aJson = new Object();

// 		aJson.title = todoList[i].todoList[j].title;

// 		aJson.notes = todoList[i].todoList[j].notes;

// 		aJson.time = todoList[i].todoList[j].alarm.time;

// 		aJsonArray.push(aJson);

// 		}

// 		}

// 		var sJson = JSON.stringify(aJsonArray);

//                 console.log(mqttstr.concat(sJson));
// 		client.publish("voiceoffice", mqttstr.concat(sJson), optionspub)


    
//     res.send(aJsonArray);
    

// 	  res.send({

//     schedules: todoListsmq[0].todoList
  
//     });
  

// 	}

	 

// }
// else{
//      client.publish("voiceoffice", mqttstr, optionspub)
//      res.send("{\"schedules\": []}");
// }

// });

// });



app.get('/api/v2/smartoffice/speakers/:id/schedules', function(req,res){

  var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';
  db.query(sql, (err, result)=>{
  if(err) throw err;
  if(result.length > 0){
    const value = result[0].scheduledata;
    if (value !== null) {
      const todoList = JSON.parse(value);
      const todoLists = todoList.filter(item => {
          for(var i = 0; i < item.todoList.length ;i++){
            item.todoList[i].time = item.todoList[i].alarm.time;
            delete item.todoList[i].key;
            delete item.todoList[i].color;
            delete item.todoList[i].alarm;
          }
        return item;
      });
    if(todoLists.length > 0){
  
  
    client.publish("voiceoffice", mqttstr.concat(JSON.stringify(todoLists[0].todoList)), optionspub)
    const todoListmq = JSON.parse(value);
    const todoListsmq = todoListmq.filter(item => {

      for(var i = 0; i < item.todoList.length ;i++){
        var time = item.todoList[i].alarm.time.split('T');
        item.todoList[i].time = time[1].substring(0,5)
        delete item.todoList[i].key;
        delete item.todoList[i].color;
        delete item.todoList[i].alarm;
        item.todoList[i].date = time[0]
        item.todoList[i].schedule = item.todoList[i].title
        delete item.todoList[i].title;
        delete item.todoList[i].notes;
      }
      return item;

    });
  
     
    res.send({
      schedules: todoListsmq[0].todoList
    });
    }
    else
    res.send("fail");
    }	
  
   }else{
       client.publish("voiceoffice", mqttstr, optionspub)
       res.send("{\"schedules\": []}");
   }
  
  });
  
  });
  
 

//get speakers/{id}/schedules/{date} Æ¯Á€ÀÏÀÇ œºÄÉÁìÀ» Á¶ÈžÇÑŽÙ.

app.get('/api/v2/smartoffice/speakers/:id/schedules/:date', function(req,res){

var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';

db.query(sql, (err, result)=>{

if(err) throw err;


if(result.length > 0){

	const value = result[0].scheduledata;
						
	if (value !== null) {

		const todoList = JSON.parse(value);

		const todoLists = todoList.filter(item => {

		item.date = item.date.replace( /-/gi, '');

			if (req.params.date === item.date) {

				for(var i = 0; i < item.todoList.length ;i++){

				item.todoList[i].time = item.todoList[i].alarm.time;

				delete item.todoList[i].key;

				delete item.todoList[i].color;

				delete item.todoList[i].alarm;

				}

			return item;

			}else
			return false;

		});

	if(todoLists.length > 0){

	//mqtt send JSON.stringify(todoLists[0].todoList);

	client.publish("voiceoffice", mqttstr.concat(JSON.stringify(todoLists[0].todoList)), optionspub)

	 

	const todoListmq = JSON.parse(value);

	const todoListsmq = todoListmq.filter(item => {

	item.date = item.date.replace( /-/gi, '');

	if (req.params.date === item.date) {

	for(var i = 0; i < item.todoList.length ;i++){

	var time = item.todoList[i].alarm.time.split('T');

	item.todoList[i].time = time[1].substring(0,5)

	delete item.todoList[i].key;

	delete item.todoList[i].color;

	delete item.todoList[i].alarm;

	//delete item.todoList[i].title;

	item.todoList[i].date = time[0]

	item.todoList[i].schedule = item.todoList[i].title

	delete item.todoList[i].title;

	delete item.todoList[i].notes;

	}

	return item;

	}else

	return false;

	});

	 

	res.send({

	schedules: todoListsmq[0].todoList

	});

	 

	 

	}

	else

	res.send("fail");

	}	

 }else{
     client.publish("voiceoffice", mqttstr, optionspub)
     res.send("{\"schedules\": []}");
 }

});

});



//get speakers/{id}/schedules œºÄÉÁìÀ» µî·ÏÇÑŽÙ.

app.post('/api/v2/smartoffice/speakers/:id/schedules', function(req,res){

var hour = req.body.schedule.time.substring(0,2);
var minute = req.body.schedule.time.substring(2,4);
var time = req.body.schedule.date.concat('T',hour,':',minute,':00.000Z');

const creatTodo = {

key: uuid(),

todoList: [

{

key: uuid(),

title: req.body.schedule.schedule,

notes: req.body.schedule.schedule,

alarm: {

time: time,

isOn: false,

createEventAsyncRes:'',

},

color: `rgb(${Math.floor(
Math.random() * Math.floor(256)
)},${Math.floor(Math.random() * Math.floor(256))},${Math.floor(
Math.random() * Math.floor(256)
)})`,

},

]

};

console.log(creatTodo);
 

var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';

db.query(sql, (err, result)=>{

if(err) throw err;

console.log(result);

/* added by KJH */
if(result.length == 0) {
	result.push({'scheduledata' : "[\"dummy\"]"});
}

/* commented by KJH */
//if(result.length > 0){ 
	const value = result[0].scheduledata;

		if (value !== null) {

		todoList = JSON.parse(value);
		
		/* added by KJH */
		todoList = todoList.filter(el => {
		  return el != 'dummy';
		});


		const todoLists = todoList.filter(item => {

		if (req.body.schedule.date === item.date)

		return true;

		else

		return false;

		});

		if(todoLists.length > 0){

		todoLists[0].todoList.push(creatTodo.todoList[0]);

		var data = {scheduledata:JSON.stringify(todoList)};

		var sql = 'INSERT INTO tb_schedule SET ?';

		db.query(sql, data, (err, result)=>{

		if(err) throw err;

		res.send({

		status: 'success',

		});

		});

		}

		else{

		//not exist date...
		console.log('not exist date');

		const creatTodo = {

		key: uuid(),

		date: req.body.schedule.date,

		todoList: [

		{

		key: uuid(),

		title: req.body.schedule.schedule,

		notes: req.body.schedule.schedule,

		alarm: {

		time: time,

		isOn: false,

		createEventAsyncRes: '',

		},

		color: `rgb(${Math.floor(
		Math.random() * Math.floor(256)
		)},${Math.floor(Math.random() * Math.floor(256))},${Math.floor(
		Math.random() * Math.floor(256)
		)})`,

		},

		],

		markedDot: {

		date: 'currentDay',

		dots: [

		{

		key: uuid(),

		color: '#002375',

		selectedDotColor: '#002375',

		},

		],

		},
		};

		 

		todoList.push(creatTodo);		
		var data = {scheduledata:JSON.stringify(todoList)};
		var sql = 'INSERT INTO tb_schedule SET ?';
		db.query(sql, data, (err, result)=>{
		if(err) throw err;
		res.send({
			status: 'success',
		});
		});

		}
		}

/* commented by KJH */
/*
}else{
     client.publish("voiceoffice", mqttstr, optionspub)
     res.send("{\"schedules\": []}");
}*/

});

 

});





//get speakers/{id}/schedules/date remove date and time
app.delete('/api/v2/smartoffice/speakers/:id/schedules/:date/:time', function (req, res) {
    var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        const value = result[0].scheduledata;
        var deleteyn = 0;
        if (value !== null) {
            const todoList = JSON.parse(value);
            const todoLists = todoList.filter(item => {
                var date = item.date.replace(/-/gi, '');
                if (req.params.date === date) {
                    if(item.todoList.length == 1){
                       deleteyn = 1;
                       return false;
                    }else{

                        for (var i = 0; i < item.todoList.length; i++) {

                                var todoListtime = item.todoList[i].alarm.time;
                                var finddate = todoListtime.replace(/-/gi, '').replace(/:/gi, '');
                                var comparedate = req.params.date.concat('T', req.params.time);
                                if (finddate.indexOf(comparedate) != -1) {
                                    ++deleteyn;
                                    delete item.todoList.splice(i,1);
                                }
                        }
                      
                        return item
                    }
                }else{
                    return true;
                }

            });

  

            if (todoLists.length > 0 && deleteyn > 0) {
                var data = { scheduledata: JSON.stringify(todoLists) };
                var sql = 'INSERT INTO tb_schedule SET ?';
                db.query(sql, data, (err, result) => {
                    if (err) throw err;
 		    client.publish("voiceoffice", mqttstr, optionspub)
                    res.send({
                        schedule: { deleted: deleteyn }
                    });
                });
            }
            else {
                client.publish("voiceoffice", mqttstr, optionspub)
                res.send({
                    schedule:
                        { deleted: 0 }
                });

            }

        }

    });

});



//get speakers/{id}/schedules/date remove only date

app.delete('/api/v2/smartoffice/speakers/:id/schedules/:date', function (req, res) {

    var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';

    db.query(sql, (err, result) => {

        if (err) throw err;

        const value = result[0].scheduledata;

        var deleteyn = 0;

        if (value !== null) {
            const todoList = JSON.parse(value);
            const todoLists = todoList.filter(item => {
                var date = item.date.replace(/-/gi, '');
                if (req.params.date === date) {
                       deleteyn = 1;
                       return false;
                }else{
                    return true;
                }

            });


            if (todoLists.length > 0 && deleteyn > 0) {
                var data = { scheduledata: JSON.stringify(todoLists) };
                var sql = 'INSERT INTO tb_schedule SET ?';
                db.query(sql, data, (err, result) => {
                    if (err) throw err;
                    client.publish("voiceoffice", mqttstr, optionspub)
                    res.send({
                        schedule: { deleted: 1 }
                    });
                });
            }

            else {
                client.publish("voiceoffice", mqttstr, optionspub)
                res.send({
                    schedule:{ deleted: 0 }
                });

            }

        }

    });

});



 

app.listen(3210, ()=>{

console.log('Server port 3210')

});
