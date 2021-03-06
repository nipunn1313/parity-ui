/* global localStorage */
import app from './app';
import EventEmitter from 'event-emitter';

const emitter = EventEmitter({});

tokenGetter(initToken => {
  app(initToken, tokenSetter, addTokenListener, '127.0.0.1:8180');
});

function tokenGetter (cb) {
  let token = localStorage.getItem('sysuiToken');
  cb(token);
}

function tokenSetter (token, cb) {
  token = token || ''; // don't store null / undefined to LS
  localStorage.setItem('sysuiToken', token);
  emitter.emit('sysuiToken', token);
  cb && cb();
}

function addTokenListener (cb) {
  emitter.on('sysuiToken', cb);
}

