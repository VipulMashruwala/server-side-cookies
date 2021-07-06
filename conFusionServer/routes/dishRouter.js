const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');
const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res,next) => {
    Dishes.find({})
       .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    // res.end('Will add the dish: '+ req.body.name + ' with details: ' + req.body.description);
    Dishes.create(req.body)
        .then(dish => {
            console.log('Dish Created');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        })
        .catch(err => next(err))
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /dishes');
})

.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // res.send('Deleting all the dishes');
    Dishes.deleteOne({})
        .then(resp => {
            console.log('Dish Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        })
        .catch(err => next(err));
});

/////////////////// DISH ID /////////////////////////////

dishRouter.route('/:dishID')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next) => {
    // res.send('Will send details of the dish: ' + req.params.dishID + 'to you!');
    Dishes.findById(req.params.dishID)
    .populate('comments.author')
        .then(dish => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        })
        .catch(err => next(err))
})

.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.send('POST operation is not supported');
})

.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // res.write('Updating the dish: ' + req.params.dishID);
    // res.end('Will update the dish: ' + req.body.name + 'with details: ' + req.body.description);
    Dishes.findByIdAndUpdate(req.params.dishID, {
        $set: req.body
    }, { new: true })
        .then(dish => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        })
        .catch(err => next(err));
})

.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // res.send('Deleting dish:  ' + req.params.dishID);
    Dishes.findByIdAndRemove(req.params.dishID)
        .then(resp => {
            console.log('Dish Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        })
        .catch(err => next(err));
});

////////////////////////////////////////////////////////////////////

dishRouter.route('/:dishID/comments')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next) => {
    // res.send('Will send all the dishes to you!');
    Dishes.findById(req.params.dishID)
    .populate('comments.author')
        .then(dish => {
            if (dish != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments);
            }
            else {
                err = new Error('Dish' + req.params.dishID + 'not found!');
                err.statusCode = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
})

.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    // res.end('Will add the dish: '+ req.body.name + ' with details: ' + req.body.description);
    Dishes.findById(req.params.dishID)
        .then(dish => {
            if (dish != null) {
                req.body.author = req.user._id;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                dish.comments.push(req.body)
                dish.save()
                .then(dish => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then(dish => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })
                },(err) => next(err));
            }
            else {
                err = new Error('Dish' + req.params.dishID + 'not found!');
                err.statusCode = 404;
                return next(err);
            }

        })
        .catch(err => next(err))
})

.put(cors.corsWithOptions,authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /dishes' + req.params.dishID + 'comments');
})

.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // res.send('Deleting all the dishes');
    Dishes.findById(req.params.dishID)
        .then(dish => {
            if (dish != null) {
                for (var i = (dish.comments.length - 1); i >= 0; i--) {
                    dish.comments.id(dish.comments[i]._id).remove();
                }
                dish.save()
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishID + ' not found');
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
});

/////////////////// DISH ID /////////////////////////////

dishRouter.route('/:dishID/comments/:commentID')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next) => {
    // res.send('Will send details of the dish: ' + req.params.dishID + 'to you!');
    Dishes.findById(req.params.dishID)
    .populate('comments.author')
        .then(dish => {
            if (dish != null && dish.comments.id(req.params.commentID) != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentID));
            }
            else if (dish == null) {
                err = new Error('Dish' + req.params.dishID + 'not found!');
                err.statusCode = 404;
                return next(err);
            }
            else {
                err = new Error('Comments' + req.params.commentID + 'not found!');
                err.statusCode = 404;
                return next(err);
            }
        })
        .catch(err => next(err))
})

.post(cors.corsWithOptions,authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.send('POST operation is not supported on /dishes/' + req.params.dishID +
        '/comments/' + req.params.commentID);
})

.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    console.log(req.user);
    // res.write('Updating the dish: ' + req.params.dishID);
    // res.end('Will update the dish: ' + req.body.name + 'with details: ' + req.body.description);
        Dishes.findById(req.params.dishID)
            .then(dish => {
                if (dish != null && dish.comments.id(req.params.commentID) != null) {
                    if(!dish.comments.id(req.params.commentID).author.equals(req.user._id)){
                        var err = new Error('You are not authorized to comment here');
                        err.statusCode = 403;
                        return next(err);
                    }
                    if (req.body.rating) {
                        dish.comments.id(req.params.commentID).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        dish.comments.id(req.params.commentID).comment = req.body.comment;
                    }
                    dish.save()
                        .then(dish => {
                            Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then(dish => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dish);
                            })
                            
                        },(err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish' + req.params.dishID + 'not found!');
                    err.statusCode = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comments' + req.params.commentID + 'not found!');
                    err.statusCode = 404;
                    return next(err);
                }

            })
            .catch(err => next(err))
})

.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    // res.send('Deleting dish:  ' + req.params.dishID);
    Dishes.findById(req.params.dishID)
        .then(dish => {
            if (dish != null && dish.comments.id(req.params.commentID) != null) {
                if(!dish.comments.id(req.params.commentID).author.equals(req.user._id)){
                    var err = new Error('You are not authorized to comment here');
                    err.statusCode = 403;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                dish.comments.id(req.params.commentID).remove()
                dish.save()
                    .then(dish => {
                        Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then(dish => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dish);
                            })
                    },(err) => next(err));
            }
            else if (dish == null) {
                err = new Error('Dish' + req.params.dishID + 'not found!');
                err.statusCode = 404;
                return next(err);
            }
            else {
                err = new Error('Comments' + req.params.commentID + 'not found!');
                err.statusCode = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
});
module.exports = dishRouter;