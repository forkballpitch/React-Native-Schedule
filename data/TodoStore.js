import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import moment from 'moment';
import { Context } from './Context';

export default class TodoStore extends Component {
  state = {
    todo: [],
    updateTodo: item => {
      this._updateTodo(item);
    },
    deleteTodo: item => {
      this._deleteTodo(item);
    },
    updateSelectedTask: item => {
      this._updateSelectedTask(item);
    },
    deleteSelectedTask: item => {
      this._deleteSelectedTask(item);
    },
  };

  _deleteSelectedTask = item => {
    const previousTodo = [...this.state.todo];
    const newTodo = previousTodo.map(data => {
      if (item.date === data.date) {
        const previousTodoList = [...data.todoList];
        const newTodoList = previousTodoList.filter(list => {
          if (list.key === item.todo.key) {
            return false;
          }
          return true;
        });

        data.todoList = newTodoList;
        return data;
      }
      return data;
    });
    const checkForEmpty = newTodo.filter(data => {
      if (data.todoList.length === 0) {
        return false;
      }
      return true;
    });
    try {
  
      let todo = { 
        scheduledata: JSON.stringify(checkForEmpty)
      };

     fetch("http://192.168.0.16:3210/createtask", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
      }).then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.log(err))
        
      this.setState({
        todo: checkForEmpty,
      });
    } catch (error) {
      // Error saving data
    }
  };

  _updateSelectedTask = item => {
    const previousTodo = [...this.state.todo];
    const newTodo = previousTodo.map(data => {
      if (item.date === data.date) {
        const previousTodoList = [...data.todoList];
        const newTodoList = previousTodoList.map(list => {
          if (list.key === item.todo.key) {
            return item.todo;
          }
          return list;
        });
        data.todoList = newTodoList;
        return data;
      }
      return data;
    });
    try {
      let todo = { 
        scheduledata: JSON.stringify(newTodo)
      };

      fetch("http://192.168.0.16:3210/createtask", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
      }).then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.log(err))
        

      this.setState({
        todo: newTodo,
      });
    } catch (error) {
      // Error saving data
    }
  };

  async componentWillMount() {
    try {

      await fetch("http://192.168.0.16:3210/data", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => res.json())
        .then((data) => {
          const todo = data[0].scheduledata;
          if (todo !== null) {
            this.setState({
              todo: JSON.parse(todo),
            });
          }
        })
        .catch((err) => console.log(err))

    } catch (error) {
      // Error saving data
    }
  }

  _updateTodo = item => {
    const datePresent = this.state.todo.find(data => {
      if (data.date === item.date) {
        return true;
      }
    });

    if (datePresent) {
      const updatedTodo = this.state.todo.map(data => {
        if (datePresent.date === data.date) {
          data.todoList = [...data.todoList, ...item.todoList];
          return data;
        }
        return data;
      });
      try {

        let todo = { 
          scheduledata: JSON.stringify(updatedTodo)
        };

        fetch("http://192.168.0.16:3210/createtask", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(todo)
        }).then((res) => res.json())
          .then((data) => console.log(data))
          .catch((err) => console.log(err))
        //end insert data

        this.setState({
          todo: updatedTodo
        });
      } catch (error) {
        // Error saving data
      }
    } else {
      const newTodo = [...this.state.todo, item];

      try {
        
        let todo = {
          scheduledata: JSON.stringify(newTodo)
        };

        fetch("http://192.168.0.16:3210/createtask", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(todo)
        }).then((res) => res.json())
          .then((data) => console.log(data))
          .catch((err) => console.log(err))

        this.setState({
          todo: newTodo
        });
      } catch (error) {
        // Error saving data
      }
    }
  };

  _deleteTodo = () => {};

  render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}
