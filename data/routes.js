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

client.on("connect", () => {	
	console.log("connected ~:> "+ client.connected);
	client.subscribe("voiceoffice");
});

var optionspub = {
	retain:false,
	qos:1
};

/* for Mirror Main UI Today Schedule */
const setTodaySchedule = function () {

    var format = new Date();

    var year = format.getFullYear();
    var month = format.getMonth() + 1;
    if(month<10) month = '0' + month;
    var date = format.getDate();
    if(date<10) date = '0' + date;
    var date = year + "" +  month + "" +  date;


    console.log(date);

	var sql = 'SELECT scheduledata FROM tb_schedule order by id desc LIMIT 1';
	db.query(sql, (err, result)=>{
	if(err) throw err;
	if(result.length > 0){
		const value = result[0].scheduledata;						
		if (value !== null) {
			const todoList = JSON.parse(value);
			const todoLists = todoList.filter(item => {
			item.date = item.date.replace( /-/gi, '');
				if (date === item.date) {
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
		console.log("setschedule,".concat(JSON.stringify(todoLists[0].todoList)));
		client.publish("voiceoffice", "setschedule,".concat(JSON.stringify(todoLists[0].todoList)), optionspub)

		const todoListmq = JSON.parse(value);
		const todoListsmq = todoListmq.filter(item => {
		item.date = item.date.replace( /-/gi, '');
		if (date === item.date) {
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
		}else

		return false;

		});

		}
		}	
	 }else{
	     client.publish("voiceoffice", "setschedule,", optionspub)
	     res.send("{\"schedules\": []}");
	 }

	});

}

client.on('message', (topic, message, packet) => {
	if(message.indexOf("getschedule") != -1) {
		console.log('getSchedule !');
		setTodaySchedule();
	}
});


var mqttstr = "schedule,"
//mqtt end
app.use(bodyParser.json());
app.use(cors());

 
const db = mysql.createConnection({
	host : 'localhost',
	user : 'vhadmin',
	password : 'vh12345!',
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

	setTodaySchedule();

	res.send({
		status: 'success',
	});
});
});


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
	if(time[1] != undefined){
		item.todoList[i].time = time[1].substring(0,5)
		delete item.todoList[i].key;
		delete item.todoList[i].color;
		delete item.todoList[i].alarm;
		item.todoList[i].date = time[0]
		item.todoList[i].schedule = item.todoList[i].title
		delete item.todoList[i].title;
		delete item.todoList[i].notes;
	}
      }
      return item;

    });
  
     
    res.send({
      schedules: todoListsmq[0].todoList
    });
    }
    else
     res.send("{\"schedules\": []}");
    }	
  
   }else{
       client.publish("voiceoffice", mqttstr, optionspub)
       res.send("{\"schedules\": []}");
   }
  
  });
  
  });
  
 

//get speakers/{id}/schedules/{date} 
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
        console.log(mqttstr.concat(JSON.stringify(todoLists[0].todoList)));
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
	 res.send("{\"schedules\": []}");
	}	
 }else{
     client.publish("voiceoffice", mqttstr, optionspub)
     res.send("{\"schedules\": []}");
 }

});

});



//get speakers/{id}/schedules
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
		setTodaySchedule();
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
		    setTodaySchedule();
                    res.send({
                        schedule: { deleted: deleteyn }
                    });
                });
            }
            else {
                client.publish("voiceoffice", mqttstr, optionspub)
		setTodaySchedule();
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
                       deleteyn = todoList.length;
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
                        schedule: { deleted: deleteyn }
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
