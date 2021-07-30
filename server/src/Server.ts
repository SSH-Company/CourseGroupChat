import * as express from 'express';
import * as path from 'path';
import fs from "fs";
import cors from 'cors';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { ApiController } from './controllers/ApiController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as http from "http";
import * as https from "https";
// import sessionFileStore from 'session-file-store';
// const FileStore = sessionFileStore(session);

class CGCServer extends Server {
    private readonly SERVER_STARTED = process.env.NODE_ENV + ' Server started on port: ';

    constructor() {
        super(true);
        this.app.use(cors({ credentials: true }));
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended:true }))
        this.app.use(
            session({
                secret: "test",
                cookie: { secure: false },
                resave: true,
                saveUninitialized: true,
                httpOnly: true,
                secure: true
                // store: null 
                // new FileStore({ reapInterval: 60 })
            })
        );

        // passport.serializeUser((user, done) => {
        //     done(null, user);
        // });
        
        // passport.deserializeUser((user, done) => {
        //     done(null, user);
        // });
        
        // const samlStrategy = new saml.Strategy({
        //     callbackUrl: '/api/login/callback',
        //     entryPoint: 'https://konnect1-dev.onelogin.com/trust/saml2/http-post/sso/fabacdc2-986a-4db1-a806-c9b61701ae89',
        //     issuer: 'dev-app-konnect'
        // }, 
        // (profile, done) => {
        //     console.log(profile);
        //     return done(null, profile);
        // })

        // passport.use('saml', samlStrategy);
        // this.app.use(passport.initialize({}));
        // this.app.use(passport.session({}));
    
        this.setupControllers();

        this.app.use('/api', (req, res) => {
            res.json({ message: `backend started but unable to find api ${req.url}`})
        });
        this.app.use(express.static(path.join(__dirname, 'public/client')))
        this.app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '/public/client/index.html')) })
    }

    private setupControllers(): void {
        super.addControllers(new ApiController());
    }

    public start(port: number) {  
        // const server = https.createServer(
        //     {
        //         key: fs.readFileSync(
        //             path.join(__dirname, "../config/pem/key.pem")
        //         ),
        //         cert: fs.readFileSync(
        //             path.join(__dirname, "../config/pem/cert.pem")
        //         )
        //     },
        //     this.app
        // )
        // const server = http.createServer(this.app);

        return this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port)
        });
    }
}

export default CGCServer


