const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');
const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res,next) =>{
    Promotions.find()
    .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotions);
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Promotions.create(req.body)
    .then(promotion =>{
        console.log('Promotion Created');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    res.statusCode = 403;
    res.send('PUT operation not supported on /promotions');
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Promotions.deleteOne({})
    .then(resp => {
        console.log('Promotion Deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err => next(err));
});

promoRouter.route('/:promoID')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res,next) =>{
    Promotions.findById(req.params.promoID)
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch(err => next(err));   
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    res.statusCode = 403;
    res.send('POST operation is not supported');
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Promotions.findByIdAndUpdate(req.params.promoID,{
        $set: req.body
    },{ new: true })
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Promotions.findByIdAndRemove(req.params.promoID)
    .then(resp=>{
        console.log('Promotion Deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err => next(err));
});

module.exports = promoRouter;

