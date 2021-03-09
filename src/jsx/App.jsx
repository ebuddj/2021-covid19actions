import React, {Component} from 'react';
import style from './../styles/styles.less';


// https://d3js.org/
import * as d3 from 'd3';

// https://www.chartjs.org/
import Chart from 'chart.js';

let chart, interval;

function getHashValue(key) {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}
const area = getHashValue('area') ? getHashValue('area') : '';
const data_file_name = (area === 'erno') ? 'data_erno.json' : 'data.json';

class App extends Component {
  constructor(props) {
    super(props);

    this.appRef = React.createRef();
    this.chartRef = React.createRef();

    this.state = {
    }
  }
  componentDidMount() {
    this.getData();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  getData() {
    d3.json('./data/' + data_file_name).then((data) => {
      this.setState((state, props) => ({
        data:data.data,
        current_country:'',
        countries:Object.keys(data.data),
      }), this.createChart);
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  createChart() {
    setTimeout(() => {
      let ctx = this.chartRef.current.getContext('2d');
      chart = new Chart(ctx, {
        data:{
          labels:[],
          datasets:[{
            backgroundColor:'#ff9900',
            borderColor:'#ff9900',
            borderWidth:4,
            data:[],
            fill:false,
            label:'Stringency index',
            pointRadius:0,
            type:'line',
            yAxisID:'left'
          },{
            backgroundColor:'#1b4098',
            borderColor:'#1b4098',
            borderWidth:4,
            data:[],
            fill:false,
            label:'Number of cases',
            pointRadius:0,
            type:'line',
            yAxisID:'right'
          }]
        },
        options:{
          aspectRatio:16/9,
          hover:{
            enabled:false
          },
          legend:{
            display:false
          },
          onHover:(event, chartElement) => {
            // event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
          },
          scales:{
            xAxes:[{
              display:true,
              gridLines:{
                display:false
              },
              offset:true,
              ticks:{
                autoSkip:true,
                fontColor:'#444',
                fontSize:16,
                fontStyle:'bold'
              },
              stacked:false
            }],
            yAxes:[{
              id:'right',
              display:true,
              gridLines:{
                display:true
              },
              position:'right',
              scaleLabel:{
                display:true,
                fontColor:'#1b4098',
                fontSize:14,
                fontStyle:'bold',
                labelString:'Number of cases'
              },
              // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#axis-range-settings
              ticks: {
                fontColor:'#1b4098',
                fontSize:16,
                fontStyle:'bold',
                suggestedMax:160,
                suggestedMin:0
              }
            },{
              id:'left',
              display:true,
              gridLines:{
                display:true
              },
              position:'left',
              scaleLabel:{
                fontColor:'#ff9900',
                display:true,
                fontSize:14,
                fontStyle:'bold',
                labelString:'Stringency index'
              },
              // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#axis-range-settings
              ticks: {
                callback: function(value, index, values) {
                  return value;
                },
                fontColor:'#ff9900',
                fontSize:16,
                fontStyle:'bold',
                suggestedMax:100,
                suggestedMin:0,
              }
            }]
          },
          title:{
            display:false,
          },
          tooltips:{
            enabled:true
          }
        }
      });
      this.changeCountry()
    }, 2000);
  }
  changeCountry() {
    let current_country = this.state.countries.shift();
    chart.data.datasets[0].data = this.state.data[current_country].stringency_index;
    chart.data.datasets[1].data = this.state.data[current_country].new_cases_smoothed;
    chart.data.labels = this.state.data[current_country].date;
    chart.update(0);

    this.setState((state, props) => ({
      current_country:current_country,
    }));

    interval = setInterval(() => {
      let current_country = this.state.countries.shift();
      chart.data.datasets[0].data = this.state.data[current_country].stringency_index;
      chart.data.datasets[1].data = this.state.data[current_country].new_cases_smoothed;
      chart.data.labels = this.state.data[current_country].date;
      chart.update(0);

      this.setState((state, props) => ({
        current_country:current_country,
      }));
      if (this.state.countries.length < 1) {
        clearInterval(interval);
      }
    }, 3000);
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <h3>{this.state.current_country}</h3>
        <div className={style.chart_container}>
          <canvas id={style.chart} ref={this.chartRef}></canvas>
        </div>
      </div>
    );
  }
}
export default App;