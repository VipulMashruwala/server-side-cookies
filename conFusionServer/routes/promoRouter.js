const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req,res,next) =>{
    Promotions.find()
    .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotions);
    })
    .catch(err => next(err));
})

.post((req,res,next) =>{
    Promotions.create(req.body)
    .then(promotion =>{
        console.log('Promotion Created');
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})

.put((req,res,next) =>{
    res.statusCode = 403;
    res.send('PUT operation not supported on /promotions');
})

.delete((req,res,next) =>{
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
.get((req,res,next) =>{
    Promotions.findById(req.params.promoID)
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch(err => next(err));   
})

.post((req,res,next) =>{
    res.statusCode = 403;
    res.send('POST operation is not supported');
})

.put((req,res,next) =>{
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

.delete((req,res,next) =>{
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

