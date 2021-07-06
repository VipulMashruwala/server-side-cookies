const express = require('express');
const bodyParser = require('body-parser');
const Leaders = require('../models/leaders');
const authenticate = require('../authenticate');
const cors = require('./cors');
const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res,next) =>{
    Leaders.find()
    .then(leaders => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leaders);
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Leaders.create(req.body)
    .then(leader =>{
        console.log('Promotion Created');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    })
    .catch(err => next(err));
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    res.statusCode = 403;
    res.send('PUT operation not supported on /leaders');
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Leaders.deleteOne({})
    .then(resp => {
        console.log('Leader Deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err => next(err));

});

leaderRouter.route('/:leaderID')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res,next) =>{
    Leaders.findById(req.params.leaderID)
    .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    })
    .catch(err => next(err));   
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    res.statusCode = 403;
    res.send('POST operation is not supported');
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Leaders.findByIdAndUpdate(req.params.leaderID,{
        $set: req.body
    },{ new: true })
    .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    })
    .catch(err => next(err));
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Leaders.findByIdAndRemove(req.params.leaderID)
    .then(resp=>{
        console.log('Leader Deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err => next(err));
});

module.exports = leaderRouter;