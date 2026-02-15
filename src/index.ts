import mongoose from 'mongoose';
import 'reflect-metadata';
import app from './app'
import { createServer } from "node:http";

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/preset')
    .then(_ => { 
        createServer(app).listen(3000, () => {
            console.log('Server aperto sulla porta 3000');
        });
    }).catch(err => {
        console.log(err);
    });
