import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import HomePage from './home/Index';
import logo from './logo.svg';
import './App.scss';

function App() {
	return (
		<Router>
			<div className="App">
				<Switch>
					<Route exact path="/" component={HomePage}/>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
