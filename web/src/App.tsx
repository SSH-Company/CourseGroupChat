import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import HomePage from './home/Index';
import VerifyAccount from './home/VerifyAccount';
import ResetPassword from './home/ResetPassword';
import './App.scss';

function App() {
	return (
		<Router>
			<div className="App">
				<Switch>
					<Route exact path="/" component={HomePage}/>
				</Switch>
				<Switch>
					<Route exact path="/verify/:userId/:token" component={VerifyAccount}/>
				</Switch>
				<Switch>
					<Route exact path="/resetPassword/:userId/:token" component={ResetPassword}/>
				</Switch>
			</div>
		</Router>
	);
}

export default App;



