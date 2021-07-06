const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({user: req.user._id})
        .populate('user')
        .populate('dishes')
    .exec((err,favorites)=>{
        if(err) return next(err);

        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favorites);
    });
})
    
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id},(err,favorite)=>{
        if (err) return next(err);

                if (!favorite){
                    Favorites.create({user: req.user._id})
                        .then(favorite =>{
                            for(i=0; i< req.body.length; i++){
                                if(favorite.dishes.indexOf(req.body[i]._id)<0){
                                    favorite.dishes.push(req.body[i]);
                                }
                            }    
                            favorite.save()
                            .then(favorite=>{
                                console.log('Favorite Created');
                                res.statusCode=200;
                                res.setHeader('Content-Type','application/json');
                                res.json(favorite);
                            })
                            .catch(err =>   next(err))
                        })
                        .catch(err =>   next(err))    
                }
                else{
                            for(i=0; i< req.body.length; i++){
                                if(favorite.dishes.indexOf(req.body[i]._id)<0){
                                    favorite.dishes.push(req.body[i]);
                                }
                            }
                            favorite.save()
                            .then(favorite=>{
                                console.log('Favorite Dish Added');
                                res.statusCode=200;
                                res.setHeader('Content-Type','application/json');
                                res.json(favorite);
                            })
                            .catch(err =>   next(err))
                }
    })
})

.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /favorite');
})

.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteMany({user: req.user._id},(err,resp)=>{
        if (err) return next(err);
        console.log('Favorite Dish Deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});




favoriteRouter.route('/:dishID')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','text/plain');
    res.end('GET operation not supported on /favorites/'+req.params.dishID);
    
})

.post(cors.corsWithOptions,authenticate.verifyUser, (req, res) => {
    Favorites.findOne({user: req.user._id},(err,favorite)=>{
        if(err) return next(err);

        if(!favorite){
            Favorites.create({user: req.user._id})
            .then(favorite => {
                favorite.dishes.push({"_id" : req.params.dishID})
                favorite.save()
                .then(favorite => {
                    console.log('Favorite created!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favorite)
                })
                .catch(err => next(err));
            })
            .catch(err => next(err))
        }
        else{
            if(favorite.dishes.indexOf(req.params.dishID) < 0){
                favorite.dishes.push({"_id" : req.params.dishID})
                favorite.save()
                .then(favorite => {
                    console.log("Favorite Dish Added");
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
            else{
                res.statusCode = 403;
                res.setHeader('Content-Type','text/plain');
                res.end('Dish' + req.params.dishID + 'already exists');
            }

        }
    })
})

.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','text/plain');
    res.end('PUT operation not supported on /favorites/'+req.params.dishID);
})

.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id},(err,favorite) => {
        if(err) return next(err);

        console.log(favorite);
        var index = favorite.dishes.indexOf(req.params.dishID);
        if(index >= 0){
            favorite.dishes.splice(index,1)
            .then(resp => {
                res.statusCode = 200;
                res.setHeader("Content-Type","application/json");
                res.end(resp);
            })
            .catch(err => next(err));
            // favorite.dishes.splice(index,1);
            // favorite.save()
            // .then(favorite =>{
            //     Favorites.findById(favorite._id)
            //     .populate('user')
            //     .populate('dishes')
            //     .then(favorite => {
            //         console.log('Favorite Dish Deleted!',favorite);
            //         res.statusCode=200;
            //         res.setHeader('Content-Type','application/json');
            //         res.json(favorite);
            //     })
            //     .catch(err => next(err))
            // })
            // .catch(err => next(err))
        }
        else{
            res.statusCode=404;
            res.setHeader('Content-Type','text/plain');
            res.end('Dish'+ req.params._id +'not in your Favorites');
        }
    });
});

module.exports = favoriteRouter;