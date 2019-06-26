
// Just shows the time, taking app state time as input prop
const Timer = function(props) {
	return (
		<h1>
			{props.time}
		</h1>
	);
};

// Resets the timer on click and clear the setInterval
const Reset = function(props) {
	return (
		<button onClick={props.onClickReset} className="reset">
			Reset
		</button>
	);
};


// Pause/ play button
class Control extends React.Component {
	constructor(props) {
		super(props);
	};
  
  onClickHandler = () => {
    if(this.props.paused){
      this.props.start();
    }
    else{
      this.props.stop();
    }
  }
  
	render() {
		return (
				<button className={this.props.paused?"paused":""} onClick={this.onClickHandler}>
		    	{this.props.paused?"play":"pause"}
		    </button>
		);
	};
};


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { timer: 0, paused: true };
	};
  
  tick = () => {
  	this.setState({ timer : this.state.timer + 1 });
  }
  
	startTimer = () =>{
		this.interval = setInterval(this.tick,1000);
    this.setState({ paused : false });
	}
  
  stopTimer = () => {
  	clearInterval( this.interval );
    this.setState({ paused : true });
	}
  
  reset = () => {
  	this.setState({ timer : 0, paused: true });
    clearInterval( this.interval );
  }
  
	render() {
		return (
		<div>
            <Timer time={this.state.timer}  />
            <Control 
            paused={this.state.paused} 
            start={this.startTimer} 
            stop={this.stopTimer} 
            />
            <Reset  onClickReset={this.reset}/>
		</div>
		);
	};
};

ReactDOM.render(<App/>, mountNode);

