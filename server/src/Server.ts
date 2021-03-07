import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { ApiController } from './controllers/ApiController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import passport from 'passport';
import * as saml from 'passport-saml';

class CGCServer extends Server {
    private readonly SERVER_STARTED = process.env.NODE_ENV + ' Server started on port: ';

    constructor() {
        super(true);
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended:true }))
        this.app.use(
            session({
                secret: "test",
                resave: true,
                saveUninitialized: true
            })
        );

        passport.serializeUser((user, done) => {
            done(null, user);
        });
        
        passport.deserializeUser((user, done) => {
            done(null, user);
        });
        
        const samlStrategy = new saml.Strategy({
            callbackUrl: '/api/login/callback',
            entryPoint: 'https://ssh-company-dev.onelogin.com/trust/saml2/http-post/sso/f21b1a70-3579-4546-adbf-b99b593adaa2',
            issuer: 'dev-app-konnect'
        }, 
        (profile, done) => {
            console.log(profile);
            return done(null, profile);
        })

        passport.use('saml', samlStrategy);
        this.app.use(passport.initialize({}));
        this.app.use(passport.session({}));
    
        this.setupControllers();
    }

    private setupControllers(): void {
        super.addControllers(new ApiController());
    }

    public start(port: number): void {
        this.app.use('/api', (req, res) => {
            res.json({ message: `backend started but unable to find api ${req.url}`})
        });
        this.app.use(express.static(path.join(__dirname, 'public/client')))
        this.app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '/public/client/index.html')) })
        return this.app.listen(port, () => { Logger.Imp(this.SERVER_STARTED + port) });
    }
}

export default CGCServer