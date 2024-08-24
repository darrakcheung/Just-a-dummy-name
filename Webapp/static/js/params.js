export let chart_layout ={
    margin: { 
        l: 70,
        r: 50,
        b: 50,
        t: 25,
        pad: 5,
    }, 
    showlegend: true,
    legend: {
        x: 1.35,
        xanchor: 'right',
        y: 1,
        font: {
            size: 10,
        },
        bgcolor: '#e6faea',
    },
    autosize: false,
    height: 500,
    width: 1100,
    hoverlabel: {
        bgcolor: 'black'
    }
};

export let yaxis_params_1 = {
    trace_yaxis: null,
    layout_yaxis_key: "yaxis",
    layout_yaxis: {
        tickfont: {
            color: 'rgb(0, 80, 157)'
        },
        tickformat: ",.2f",
        type: "linear",
        hoverformat: '.2f',
        autorange: true,
    }
};

export let yaxis_params_2 = {
    trace_yaxis: "y2",
    layout_yaxis_key: "yaxis2",
    layout_yaxis: {
        tickfont: {
            color: 'rgb(219, 75, 81)'
        },
        overlaying: 'y',
        tickformat: ",.2f",
        type: "linear",
        hoverformat: '.2f',
        side: 'right',
    }
};

export let css_options_1 = {
    "filter": {
        "font-size": "18px",
        "color": "#00509d",
        "font-weight": "bold",
        "margin-bottom": "10px",
    },
    "snapshot": {
        "color": "#00509d",
        "font-weight": "bold"
    }
};

export let css_options_2 = {
    "filter": {
        "font-size": "18px",
        "color": "#db4b51",
        "font-weight": "bold",
        "margin-bottom": "10px",
    },
    "snapshot": {
        "color": "#db4b51",
        "font-weight": "bold"
    }
};

export let bid_trace_1 = {
    customdata: [],
    x: [],
    y: [],
    name: '',
    type: 'scatter',
    mode: 'lines',
    line: {
        color: "rgb(118, 178, 228)",
        dash: "solid",
    },
    opacity: .8,
    hovertemplate: '%{customdata[10]} %{customdata[11]} Book<br>'+
                '%{x}<br>'+
                'bid 1: %{customdata[0]:.2f}, %{customdata[1]:.5f}<br>'+
                'bid 2: %{customdata[2]:.2f}, %{customdata[3]:.5f}<br>'+
                'bid 3: %{customdata[4]:.2f}, %{customdata[5]:.5f}<br>'+
                'bid 4: %{customdata[6]:.2f}, %{customdata[7]:.5f}<br>'+
                'bid 5: %{customdata[8]:.2f}, %{customdata[9]:.5f}<br><extra></extra>'
}

export let ask_trace_1 = {
    customdata: [],
    x: [],
    y: [],
    name: '',
    type: 'scatter',
    mode: 'lines',
    line: {
      color: "rgb(118, 178, 228)",
      dash: "dot",
    },
    opacity: .8,
    hovertemplate: '%{customdata[10]} %{customdata[11]} Book<br>'+
                '%{x}<br>'+
                'ask 5: %{customdata[8]:.2f}, %{customdata[9]:.5f}<br>'+
                'ask 4: %{customdata[6]:.2f}, %{customdata[7]:.5f}<br>'+
                'ask 3: %{customdata[4]:.2f}, %{customdata[5]:.5f}<br>'+
                'ask 2: %{customdata[2]:.2f}, %{customdata[3]:.5f}<br>'+
                'ask 1: %{customdata[0]:.2f}, %{customdata[1]:.5f}<br><extra></extra>'
}

export let trade_trace_1 = {
    customdata: [],
    type: 'scatter',
    mode: 'markers',
    name: "",
    x: [],
    y: [],
    marker: {
            color: "rgba(0, 80, 157,0.7)",
            size: 7,
            symbol: "diamond"
    },
    hovertemplate: '%{customdata[3]} %{customdata[4]} Trade<br>'+
                '%{x}<br>'+
                'Price: %{customdata[0]:$.2f}<br>'+
                'Size: %{customdata[1]:$.5f}<br>'+
                'Side: %{customdata[2]}<br><extra></extra>',
}

export let bid_trace_2 = {
    customdata: [],
    x: [],
    y: [],
    name: '',
    type: 'scatter',
    mode: 'lines',
    line: {
      color: "rgb(232, 181, 139)",
      dash: "solid",
    },
    opacity: .8,
    yaxis: "y2",
    hovertemplate: '%{customdata[10]} %{customdata[11]} Book<br>'+
                '%{x}<br>'+
                'bid 1: %{customdata[0]:.2f}, %{customdata[1]:.5f}<br>'+
                'bid 2: %{customdata[2]:.2f}, %{customdata[3]:.5f}<br>'+
                'bid 3: %{customdata[4]:.2f}, %{customdata[5]:.5f}<br>'+
                'bid 4: %{customdata[6]:.2f}, %{customdata[7]:.5f}<br>'+
                'bid 5: %{customdata[8]:.2f}, %{customdata[9]:.5f}<br><extra></extra>'
}

export let ask_trace_2 = {
    customdata: [],
    x: [],
    y: [],
    name: '',
    type: 'scatter',
    mode: 'lines',
    line: {
    color: "rgb(232, 181, 139)",
    dash: "dot",
    },
    opacity: .8,
    yaxis: "y2",
    hovertemplate: '%{customdata[10]} %{customdata[11]} Book<br>'+
                '%{x}<br>'+
                'ask 5: %{customdata[8]:.2f}, %{customdata[9]:.5f}<br>'+
                'ask 4: %{customdata[6]:.2f}, %{customdata[7]:.5f}<br>'+
                'ask 3: %{customdata[4]:.2f}, %{customdata[5]:.5f}<br>'+
                'ask 2: %{customdata[2]:.2f}, %{customdata[3]:.5f}<br>'+
                'ask 1: %{customdata[0]:.2f}, %{customdata[1]:.5f}<br><extra></extra>'
}

export let trade_trace_2 = {
    customdata: [],
    type: 'scatter',
    mode: 'markers',
    name: "",
    x: [],
    y: [],
    marker: {
            color: "rgba(219, 75, 81, 0.7)",
            size: 7,
    },
    yaxis: "y2",
    hovertemplate: '%{customdata[3]} %{customdata[4]} Trade<br>'+
                '%{x}<br>'+
                'Price: %{customdata[0]:$.2f}<br>'+
                'Size: %{customdata[1]:$.5f}<br>'+
                'Side: %{customdata[2]}<br><extra></extra>',
}

export let selected_trace_template = {
    type: 'scatter',
    mode: 'markers',
    name: '',
    x: [],
    y: [],
    marker: {
        size: 10,
        symbol: 34,
        line: {width:3}
    },
}

export let exchange_ccy_pair_data = {
    orderbook: [],
    trades: [],
    update_data: {
        count: 0,
        ask: {x: [], y:[], customdata: []},
        bid: {x: [], y:[], customdata: []},
        trade: {x: [], y:[], customdata: []},
    },

    "ask_trace": {
        "x": [],
        "y": []
    },
    "bid_trace": {
        "x": [],
        "y": []
    },
    "trade_trace": {
        "x": [],
        "y": []
    },
    "ask_custom_data": [],
    "bid_custom_data": [],
    "trade_custom_data": [],
};

export const CHART_TYPE = {
    0: "Bid",
    1: "Ask",
    2: "Trade",
    3: "Clicked"
}