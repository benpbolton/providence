import React, { Component } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import fileSize from "filesize";
const axios = require("axios");
import "bootstrap/dist/css/bootstrap.css";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	status: this.props.data.status,
    	status_display: this.props.data.status_display,
    	completed_on: this.props.data.completed_on,
    	cancelled_on: this.props.data.cancelled_on
    };
    
    this.cancel = this.cancel.bind(this);
  }
  
  cancel(e) {
  	let session_key = this.props.data.session_key;
  	
  	 axios
      .post(this.props.endpoint + '/cancel', {}, {
      	params: {key: session_key}
      })
      .then((response) => {
      	if((response.data['ok'] === 1) && response.data['cancelled'] === 1) {
			this.setState({
				status: 'CANCELLED',
				status_display: 'Cancelled',
				status_display: response.data.status_display,
				completed_on: response.data.completed_on,
			});
		} else if(response.data.errors) {
			alert(response.data.errors.join('; '));
		}
      })
      .catch((error) => {
        if (error.response) {
          console.log("Response error: " + error.response);
        } else if (error.request) {
          console.log("Request was made but no response was received");
          console.log(error.request);
        } else {
          // Something happened in setting up the request and triggered an Error
          console.log("Error", error.message);
        }
      });
  }

  render() {
    const progress = [];
    for (const [key, value] of Object.entries(this.props.data.files)) {
      progress.push(value.progressInBytes);
    }

	let fileSizeForDisplay = fileSize(this.props.data.total_bytes);

    let progressBar = null;
    const arrSum = (arr) => arr.reduce((a, b) => a + b, 0);
    let progressSum = arrSum(progress) / 1000;
    let progressPecentage =
      (progressSum / (this.props.data.total_bytes / 1000)) * 100;
    if (this.state.status !== "COMPLETED") {
      progressBar = (
        <div style={{ marginTop: "10px" }}>
          <ProgressBar
            now={progressPecentage}
            label={`${Math.ceil(progressPecentage)}%`}
          />
        </div>
      );
    }
    
    let badge_class = 'badge badge-success pull-right';
    if (this.state.status === 'IN_PROGRESS') {
    	badge_class = 'badge badge-warning pull-right';
    } else if (this.state.status === 'CANCELLED') {
    	badge_class = 'badge badge-danger pull-right';
    } else if (this.state.status === 'UNKNOWN') {
    	badge_class = 'badge badge-secondary pull-right';
    }

    return (
      <div
        className="card"
        key={this.props.data.session_key}
        style={{ marginBottom: "15px" }}
      >
        <div className="card-body">
          <div className="container">
            <div
              className="row"
              style={{ justifyContent: "space-between", marginBottom: "8px" }}
            >
              <div className="col">
                {this.props.data.num_files !== "1" ? (
                    <h5 className="card-title">
                      {this.props.data.num_files} files ({fileSizeForDisplay})
                    </h5>
                  ) : (
                    <h5 className="card-title">
                      {this.props.data.num_files} file ({fileSizeForDisplay})
                    </h5>
                  )}
              </div>

              <div className="col">
                <h5 className="card-title">{this.props.data.user.user_name}</h5>
              </div>

              <div className="col" style={{ borderRadius: "25px" }}>
                <div className={badge_class}>
                    {this.state.status_display}
                  </div>
              </div>

              <div className="col">
                {this.state.status === "IN_PROGRESS" ? (
                  <button type="button" className="btn btn-danger pull-right mr-3" onClick={this.cancel}>
                    Cancel
                  </button>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <div className="card-subtitle mb-2 text-muted">
            <h6>
              {(() => {
              	let n = parseInt(this.props.data.num_files);
              	let m = 0;
              	if (n > 3) {
              		m = n-3;
              		n = 3; 
              	}
              	let files = Object.keys(this.props.data.files);
              	if (files.length === 0) { return ''; }
              	return ((n === 1) ? 'File:' : 'Files:') + files.slice(0,n).join(', ') + ((m > 0) ? ' and ' + m + ' more' : '');
              	
              })()}
            </h6>
          </div>

          <div>
            {this.state.status === "COMPLETED" ? (
              <p className="card-text">
                Started on: {this.props.data.created_on}
                <br></br>
                Completed on: {this.state.completed_on}
              </p>
            ) : (
              <p className="card-text">
                Started on: {this.props.data.created_on}
              </p>
            )}
          </div>

          {this.state.status !== "COMPLETED" ? progressBar : ""}
        </div>
      </div>
    );
  }
}

export default Upload;
