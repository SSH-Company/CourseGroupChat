import * as express from 'express';
import * as path from 'path';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { ApiController } from './controllers/ApiController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import passport from 'passport';
import * as saml from 'passport-saml';
// import sessionFileStore from 'session-file-store';
// const FileStore = sessionFileStore(session);

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
                // store: null 
                // new FileStore({ reapInterval: 60 })
            })
        );
        const samlStrategy = new saml.Strategy({
            callbackUrl: '/api/login/callback',
            entryPoint: 'https://konnect1-dev.onelogin.com/trust/saml2/http-post/sso/fabacdc2-986a-4db1-a806-c9b61701ae89',
            issuer: 'dev-app-konnect'
        }, 
        (profile, done) => {
            console.log(profile);
            return done(null, profile);
        })

        passport.use('saml', samlStrategy);

        passport.serializeUser((user, done) => {
            done(null, user);
        });
        
        passport.deserializeUser((user, done) => {
            done(null, user);
        });
        
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    
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