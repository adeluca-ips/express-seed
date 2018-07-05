/*Created by anthonyg 01-05-2018*/
let express = require('express'),
    router = express.Router(),
    passport = require('../../middleware/Auth').passport,
    authenticationMiddleware = require('../../middleware/Auth').authenticationMiddleware,
    validate = require('express-validation'),
    constants = require('../../utils/Constants'),
    logger = require('../../utils/Logger'),
    UserValidation = require('./UserValidation'),
    UserController = require('./UserController'),
    AUTH_PARAMS = require('../../config').auth,
    SERVER_PARAMS = require('../../config').app,
    requestIp = require('request-ip');

//===============================================================================================//
//  ROUTES                                                                                       //
//===============================================================================================//

/**
 * This route will add a user.  IMPORTANT to create your first user remove the
 * authenticationMiddleware temporarily
 */
router.post('/', authenticationMiddleware, validate(UserValidation.PostUser),
    (req, res, next)=> {
        logger.info('POST User');
        UserController.Add(req.body)
            .then(response => {
                res.status(201).json(response);
            })
            .catch(err => {
                return next(err);
            })
    });

/**
 * This route will fetch a user by id
 */
router.get('/:_id', authenticationMiddleware, validate(UserValidation.GetUser), (req, res, next) => {
    logger.info('GET User');

    UserController.GetById(req.params._id)
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(err => {
            return next(err);
        })
});

/**
 * This route will attempt to login the user with the given credentials
 */
router.post('/login',
    validate(UserValidation.Login),
    passport.authenticate('local'),
    (req, res) => {
        logger.info('Login');
        let response = constants.AUTH.PASSWORD_SUCCESS;

        //Note that 3600000 converts our cookieLife param from hours to milliseconds
        let cookieOptions = {maxAge: AUTH_PARAMS.cookieLife * 3600000};
        res.cookie('sessionId', req.session.passport.user.uuid, cookieOptions);
        return res.status(200).json(response);
    });

module.exports = router;