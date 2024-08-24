// import { sayHello } from './test.js';

$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search); // supported on most modern browsers
    var dataStringBase64Safe = urlParams.get('data');

    var dataStringBase64 = decodeURI(dataStringBase64Safe);
    var dataString = window.atob(dataStringBase64);
    var data = JSON.parse(dataString);
    console.log(data);

    function round(num, dp){
        return Math.round(num*Math.pow(10, dp))/Math.pow(10, dp);
    }

    var plot_type = ["Ask", "Bid", "Trade", "Clicked"];

    var css = {};
    var css_options_1 = {
        "filter": {
            "font-size": "18px",
            "color": "#2672b4",
            "font-weight": "bold",
            "margin-bottom": "10px",
        },
        "snapshot": {
            "color": "#2672b4",
            "font-weight": "bold"
        }
    }

    var css_options_2 = {
        "filter": {
            "font-size": "18px",
            "color": "#7f69bb",
            "font-weight": "bold",
            "margin-bottom": "10px",
        },
        "snapshot": {
            "color": "#7f69bb",
            "font-weight": "bold"
        }
    }

    var chart_options_1 = {
        line_style: "solid",
        line_color:{
            green: "rgb(20,217,24)",
            red: "rgb(255,75,87)"
        },
        trades_color: "rgba(38,114,180,0.7)",
        yaxis: null,
        yaxis_options: {
            tickfont: {color: 'rgb(15,99,172)'},
            tickformat: ",.2f",
            type: "linear",
            hoverformat: '.2f',
            autorange: true,
        }
    }

    var chart_options_2 = {
        line_style: "solid",
        line_color:{
            green: "rgb(18,88,76)",
            red: "rgb(88,18,30)"
        },
        trades_color: "rgba(127,105,187, 0.7)",
        yaxis: "y2",
        yaxis_options: {
            tickfont: {color: 'rgb(96,68,171)'},
            overlaying: 'y',
            tickformat: ",.2f",
            type: "linear",
            hoverformat: '.2f',
            side: 'right',
        }

    }
    let layout = {
        margin: { 
            l: 60,
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
        // hovermode: "x unified",
        // hoverlabel: {
        //     bgcolor: 'rgba(255,235,222,0.85)'
        // },
        autosize: false,
        height: 500,
        width: 1100
    }

    function createChartJson(exchange, ccy_pair, orderbook, trade, chart_options){
        var best_bid = [];
        var bid_levels = [];
        var best_ask = [];
        var ask_levels = [];
        var orderbook_timestamp = [];
        var trade_order = [];
        var trade_levels = [];
        var trade_timestamp = [];

        orderbook.forEach((item) => {
            best_bid.push(item["b1_price"]);
            var b1_total_size = item["b1_size"];
            var b2_total_size = item["b1_size"]+item["b2_size"];
            var b3_total_size = item["b1_size"]+item["b2_size"]+item["b3_size"];
            var b4_total_size = item["b1_size"]+item["b2_size"]+item["b3_size"]+item["b4_size"];
            var b5_total_size = item["b1_size"]+item["b2_size"]+item["b3_size"]+item["b4_size"]+item["b5_size"];

            bid_levels.push([item["b1_price"], b1_total_size,
                             item["b2_price"], b2_total_size,
                             item["b3_price"], b3_total_size,
                             item["b4_price"], b4_total_size,
                             item["b5_price"], b5_total_size,
                             exchange])

            best_ask.push(item["a1_price"]);
            var a1_total_size = item["a1_size"];
            var a2_total_size = item["a1_size"]+item["a2_size"];
            var a3_total_size = item["a1_size"]+item["a2_size"]+item["a3_size"];
            var a4_total_size = item["a1_size"]+item["a2_size"]+item["a3_size"]+item["a4_size"];
            var a5_total_size = item["a1_size"]+item["a2_size"]+item["a3_size"]+item["a4_size"]+item["a5_size"];

            ask_levels.push([item["a1_price"], a1_total_size,
                            item["a2_price"], a2_total_size,
                            item["a3_price"], a3_total_size,
                            item["a4_price"], a4_total_size,
                            item["a5_price"], a5_total_size,
                            exchange]);

            orderbook_timestamp.push(item["time"]);
        });

        trade.forEach((item) => {
            trade_order.push(item["price"]);
            trade_levels.push([item["price"],item["size"],item["side"]])
            trade_timestamp.push(item["time"])
        });

        var ask_trace = {
            customdata: ask_levels,
            x: orderbook_timestamp,
            y: best_ask,
            name: `${exchange} ${ccy_pair} ${plot_type[0]}`,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: chart_options["line_color"]["red"],
                dash: chart_options["line_style"],
            },
            opacity: .8,
            hovertemplate: '%{customdata[10]}<br>'+
                        'ask 5: %{customdata[8]:.2f}, %{customdata[9]:.5f}<br>'+
                        'ask 4: %{customdata[6]:.2f}, %{customdata[7]:.5f}<br>'+
                        'ask 3: %{customdata[4]:.2f}, %{customdata[5]:.5f}<br>'+
                        'ask 2: %{customdata[2]:.2f}, %{customdata[3]:.5f}<br>'+
                        'ask 1: %{customdata[0]:.2f}, %{customdata[1]:.5f}<br><extra></extra>'
        };

        var bid_trace = {
            customdata: bid_levels,
            x: orderbook_timestamp,
            y: best_bid,
            name: `${exchange} ${ccy_pair} ${plot_type[1]}`,
            type: 'scatter',
            mode: 'lines',
            line: {
              color: chart_options["line_color"]["green"],
              dash: chart_options["line_style"],
            },
            opacity: .8,
            hovertemplate: '%{customdata[10]}<br>'+
                           'bid 1: %{customdata[0]:.2f}, %{customdata[1]:.5f}<br>'+
                           'bid 2: %{customdata[2]:.2f}, %{customdata[3]:.5f}<br>'+
                           'bid 3: %{customdata[4]:.2f}, %{customdata[5]:.5f}<br>'+
                           'bid 4: %{customdata[6]:.2f}, %{customdata[7]:.5f}<br>'+
                           'bid 5: %{customdata[8]:.2f}, %{customdata[9]:.5f}<br><extra></extra>'
        };

        var trade_trace = {
            customdata: trade_levels,
            type: 'scatter',
            mode: 'markers',
            yaxis: 'y1',
            name: `${exchange} ${ccy_pair} ${plot_type[2]}`,
            x: trade_timestamp,
            y: trade_order,
            hovertemplate: 'Timestamp: %{x}<br>'+
                           'Price: %{customdata[0]:$.2f} '+
                           'Size: %{customdata[1]:$.5f} '+
                           'Side: %{customdata[2]}<extra></extra>',
            marker: {
                    color: chart_options["trades_color"],
                    size: 5,
            },
        };

        // add a second y axis if there is a second exchange ccy pair
        if (chart_options["yaxis"]!=null){
            ask_trace["yaxis"] = chart_options["yaxis"];
            bid_trace["yaxis"] = chart_options["yaxis"];
            trade_trace["yaxis"] = chart_options["yaxis"];
            layout["yaxis2"] = chart_options["yaxis_options"];
        }
        else{
            layout["yaxis"] = chart_options["yaxis_options"];
        }
        
        return [ask_trace, bid_trace, trade_trace];
    }

    if (data["exchange_2"]=="None" || data["ccy_pair_2"]=="None"){
        $('.exchange_name').append(`
                            exchange:&nbsp;
                            <p class='exchange_name_1'>${data["exchange_1"]}</p>
                        `);
        $('.ccy_pair').append(`
                            ccy pair:&nbsp;
                            <p class='ccy_pair_1'>${data["ccy_pair_1"]}</p>
                        `);  

        css[`${data["exchange_1"]}_${data["ccy_pair_1"]}`] = css_options_1;

        retrieveOrderbook(data["exchange_1"], data["ccy_pair_1"],data["start"], data["end"]);

        add_filter_html(data["exchange_1"], data["ccy_pair_1"], css_options_1["filter"]);
    }
    else {  
        $('.exchange_name').append(`
                            exchange 1:&nbsp;
                            <p class='exchange_name_1'>${data["exchange_1"]}</p>
                            &nbsp;&nbsp;&nbsp;exchange 2:&nbsp;
                            <p class='exchange_name_2'>${data["exchange_2"]}</p>
                        `);

        $('.ccy_pair').append(`
                            ccy pair 1:&nbsp;
                            <p class='ccy_pair_1'>${data["ccy_pair_1"]}</p>
                            &nbsp;&nbsp;&nbsp;ccy pair 2:&nbsp;
                            <p class='ccy_pair_2'>${data["ccy_pair_2"]}</p>
                        `);   

        css[`${data["exchange_1"]}_${data["ccy_pair_1"]}`] = css_options_1;
        css[`${data["exchange_2"]}_${data["ccy_pair_2"]}`] = css_options_2;

        retrieveTwoOrderbooks(data["exchange_1"], data["ccy_pair_1"], 
                        data["exchange_2"], data["ccy_pair_2"], data["start"], data["end"]);
                           
        add_filter_html(data["exchange_1"], data["ccy_pair_1"], css_options_1["filter"]);
        add_filter_html(data["exchange_2"], data["ccy_pair_2"], css_options_2["filter"]);

    }

    function add_filter_html(exchange, ccy_pair, css_options){
        $('.filter_dashboard').append(`
            <div class="filter_block">
                <div id="${exchange}_${ccy_pair}_filter">
                ${exchange}&nbsp;${ccy_pair}
                </div>
                <div class="filter_item">
                    <label class="filter_label" for="${exchange}_${ccy_pair}_trade_qty_lt">
                        remove trade with quantity less than
                    </label>
                    <input type="text" class="trade_qty_lt_textbox" id="${exchange}_${ccy_pair}_trade_qty_lt" name="trade_1"/>    
                </div>
            </div>
        `);
        $(`#${exchange}_${ccy_pair}_filter`).css(css_options);
    }

    function retrieveOrderbook(exchange, ccy_pair, start, end){
        $.ajax({
            url: `${api_url}/snapshot_range`,
            type: "POST",
            data: {
                exchange: exchange,
                ccy_pair: ccy_pair,
                start: start,
                end: end
                },
            }).then(function(snapshot){
                $('.timestamp_start').text(start);
                $('.timestamp_end').text(end);
                orderbook = snapshot["orderbook"];
                trade = snapshot["trade"];

                filtered_trade = snapshot["trade"];

                chart_json = createChartJson(exchange, ccy_pair, orderbook, trade, chart_options_1);
                  
                max_best_ask = Math.max(...chart_json[0]["y"]);
                min_best_bid = Math.min(...chart_json[1]["y"]);

                y_axis_start = min_best_bid-0.125*(max_best_ask-min_best_bid);
                y_axis_end = max_best_ask+0.125*(max_best_ask-min_best_bid);
                layout["yaxis"]["range"] = [y_axis_start, y_axis_end];

                Plotly.newPlot($(".time_series")[0], chart_json, layout, {displayModeBar: false});

                var trade_trace = JSON.parse(JSON.stringify(chart_json[2]));

                $(".trade_qty_lt_textbox" ).on("input", function() {
                    var temp = this.id.split("_");
                    var [exchange_filter, ccy_pair_filter] = [temp[0], temp[1]];

                    var chart_idx = $(".time_series")[0].data.findIndex(function(item) {
                        return item["name"] == `${exchange_filter} ${ccy_pair_filter} Trade`;
                    });
                    num = parseFloat(this.value);

                    if (!isNaN(num) && !isNaN(num - 0)){
                        var trade_data = JSON.parse(JSON.stringify(trade_trace["customdata"]));
                        var trade_time = JSON.parse(JSON.stringify(trade_trace["x"]));
                        updated_x = [];
                        updated_y = [];
                        updated_customdata = [];
                        updated_trade = [];

                        for (let i = 0; i < trade_time.length; i++) {
                            if (trade_data[i][1]>=num){
                                updated_x.push(trade_time[i]);
                                updated_y.push(trade_data[i][0]);
                                updated_customdata.push([trade_data[i][0],trade_data[i][1],trade_data[i][2]]);
                                updated_trade.push({
                                    "time": trade_time[i],
                                    "price": trade_data[i][0],
                                    "size": trade_data[i][1],
                                    "side": trade_data[i][2]
                                });
                            }
                        }
                        console.log(updated_y);
                        filtered_trade = updated_trade;

                        Plotly.update($(".time_series")[0], {customdata: [updated_customdata], x:[updated_x], y:[updated_y]}, {}, [chart_idx]);
                        console.log($(".time_series")[0].data);
                    }
                    else {
                        var updated_y = trade_trace["y"];
                        var updated_x = trade_trace["x"];
                        var updated_custom_data = trade_trace["customdata"]

                        filtered_trade = snapshot["trade"];

                        Plotly.update($(".time_series")[0], {customdata: [updated_custom_data], x:[updated_x], y:[updated_y]}, {}, [chart_idx]);

                    }
                });

            });

    }

    function retrieveTwoOrderbooks(exchange_1, ccy_pair_1, exchange_2, ccy_pair_2, start, end){
            var [result_1, result_2] = [NaN, NaN];
            $.when(
                $.ajax({ // First Request
                    url: `${api_url}/snapshot_range`, 
                    type: "POST",
                    data: {
                        exchange: exchange_1,
                        ccy_pair: ccy_pair_1,
                        start: start,
                        end: end
                    },    
                    cache: false,
                    success: function(snapshot){     
                        result_1 = snapshot;                  
                    }           
                }),

                $.ajax({ //Seconds Request
                    url: `${api_url}/snapshot_range`, 
                    type: "POST",
                    data: {
                        exchange: exchange_2,
                        ccy_pair: ccy_pair_2,
                        start: start,
                        end: end
                    },        
                    cache: false,
                    success: function(snapshot){                          
                        result_2 = snapshot;     
                    }           
                })

            ).then(function() {
                $('.timestamp_start').text(start);
                $('.timestamp_end').text(end);

                var exchange_ccy_pair_1 = `${exchange_1}_${ccy_pair_1}`;
                var exchange_ccy_pair_2 = `${exchange_2}_${ccy_pair_2}`;
                
                var orderbook_trade = {
                    [exchange_ccy_pair_1]: {
                                                orderbook: result_1["orderbook"],
                                                trade: result_1["trade"],

                                            },
                    [exchange_ccy_pair_2]: {
                                                orderbook: result_2["orderbook"],
                                                trade: result_2["trade"],
                                            },
                }

                var filtered_trade = {
                    [exchange_ccy_pair_1]: result_1["trade"],
                    [exchange_ccy_pair_2]: result_2["trade"]
                }

                var chart_json_1 = createChartJson(exchange_1, ccy_pair_1, orderbook_trade[exchange_ccy_pair_1]["orderbook"], 
                                            orderbook_trade[exchange_ccy_pair_1]["trade"], chart_options_1);
                var chart_json_2 = createChartJson(exchange_2, ccy_pair_2, orderbook_trade[exchange_ccy_pair_2]["orderbook"], 
                                            orderbook_trade[exchange_ccy_pair_2]["trade"], chart_options_2);

                // min_best_bid = Math.min([...chart_json_1[0]["y"], ...chart_json_2[0]["y"]]);
                // max_best_ask = Math.max([...chart_json_1[1]["y"], ...chart_json_2[1]["y"]]);     
                // y_axis_start = min_best_bid-0.125*(max_best_ask-min_best_bid);
                // y_axis_end = max_best_ask+0.125*(max_best_ask-min_best_bid);     

                // layout["yaxis"]["range"] = [y_axis_start, y_axis_end];
                var chart_json = [chart_json_1[0], chart_json_1[1], chart_json_2[0], chart_json_2[1], 
                              chart_json_1[2], chart_json_2[2]];

                Plotly.newPlot($(".time_series")[0], chart_json, layout, {displayModeBar: false});

                // var chart_arr = ["ask_1", "bid_1", "ask_2", "bid_2", "trade_1", "trade_2"];
                
                // deep copy the trade trace in a dictionary
                var trade_dict = {
                    [`${exchange_1}_${ccy_pair_1}`]: JSON.parse(JSON.stringify(chart_json_1[2])), 
                    [`${exchange_2}_${ccy_pair_2}`]: JSON.parse(JSON.stringify(chart_json_2[2]))
                };

                console.log($(".time_series")[0].data);

                // $('.trade_removal_checkbox').on('click', function () {
                //     if (this.checked){
                //         idx = chart_arr.indexOf(this.value);
                //         chart_arr.splice(idx, 1);
                //         Plotly.deleteTraces($(".time_series")[0], [idx]);
                //         console.log($(".time_series")[0].data); 
                //     }
                //     else {
                //         chart_arr.push(this.value);
                //         Plotly.addTraces($(".time_series")[0], trade_dict[this.value]);
                //         console.log($(".time_series")[0].data);
                //     }
                // });

                $(".trade_qty_lt_textbox" ).on("input", function() {
                    var temp = this.id.split("_");
                    var [exchange_filter, ccy_pair_filter] = [temp[0], temp[1]];
                    var identifier = `${exchange_filter}_${ccy_pair_filter}`;

                    var chart_idx = $(".time_series")[0].data.findIndex(function(item) {
                        return item["name"] == `${exchange_filter} ${ccy_pair_filter} Trade`;
                    });

                    var num = parseFloat(this.value);

                    if (!isNaN(num) && !isNaN(num - 0)){
                        var trade_data = JSON.parse(JSON.stringify(trade_dict[identifier]["customdata"]));
                        var trade_time = JSON.parse(JSON.stringify(trade_dict[identifier]["x"]));
                        var updated_x = [];
                        var updated_y = [];
                        var updated_customdata = [];
                        var updated_trade = [];

                        for (let i = 0; i < trade_time.length; i++) {
                            if (trade_data[i][1]>=num){
                                updated_x.push(trade_time[i]);
                                updated_y.push(trade_data[i][0]);
                                updated_customdata.push([trade_data[i][0],trade_data[i][1],trade_data[i][2]]);
                                updated_trade.push({
                                    "time": trade_time[i],
                                    "price": trade_data[i][0],
                                    "size": trade_data[i][1],
                                    "side": trade_data[i][2]
                                });
                            }
                        }
                        // console.log(updated_y);
                        filtered_trade[identifier] = updated_trade;

                        Plotly.update($(".time_series")[0], {customdata: [updated_customdata], x:[updated_x], y:[updated_y]}, {}, [chart_idx]);
                        console.log($(".time_series")[0].data[chart_idx]);
                    }
                    else {
                        var updated_y = trade_dict[identifier]["y"];
                        var updated_x = trade_dict[identifier]["x"];
                        var updated_customdata = trade_dict[identifier]["customdata"];

                        filtered_trade[identifier] = orderbook_trade[identifier]["trade"];

                        Plotly.update($(".time_series")[0], {customdata: [updated_customdata], x:[updated_x], y:[updated_y]}, {}, [chart_idx]);
                    }

                    if ($(`#${identifier}_snapshot`).length!=0){
                        $(`#${identifier}_snapshot`).remove();

                        var idx = $(".time_series")[0].data.findIndex(function(item) {
                            return item["name"] == `${exchange_filter} ${ccy_pair_filter} Selected`;
                        });

                        Plotly.deleteTraces($(".time_series")[0], [idx]);
                    }
                });

                $(".time_series")[0].on('plotly_click', function(data){
                    var pts = '';
                    for(var i=0; i < data.points.length; i++){
                        pts = data.points[i];
                    }
                    console.log(pts);
                    var x_selected = pts["x"];
                    var y_selected = pts["y"];
                    var [orderbook_idx, trade_idx] = [-1, -1];
                    var temp_arr = pts["data"]["name"].split(" ");
                    var [exchange_selected, ccy_pair_selected, type_selected] = [temp_arr[0], temp_arr[1], temp_arr[2]];
                    var identifier = `${exchange_selected}_${ccy_pair_selected}`;
                    var orderbook_selected = orderbook_trade[identifier]["orderbook"];
                    var trade_selected = filtered_trade[identifier];
                    if (type_selected == plot_type[2]){  // handle for trade plot type
                        var trade_idx = pts["pointIndex"];
                        //find the last orderbook just before the trade snapshot time for initialization
                        var orderbook_idx = orderbook_selected.findLastIndex((item)=> Date.parse(item["time"])<Date.parse(x_selected));
                    }
                    else{ // handle for bid or ask plot type
                        var orderbook_idx = pts["pointIndex"];
                        //find the last trade just before the trade snapshot time for initialization
                        var trade_idx = trade_selected.findLastIndex((item)=> Date.parse(item["time"])<Date.parse(x_selected));
                        
                    }

                    var selected_trace = {
                        type: 'scatter',
                        mode: 'markers',
                        name: `${exchange_selected} ${ccy_pair_selected} Selected`,
                        x: [x_selected],
                        y: [y_selected],
                        marker: {
                            size: 10,
                            symbol: 34,
                            line: {width:3}
                        },
                    }

                    if ("yaxis" in pts["data"]){
                        selected_trace["yaxis"] = pts["data"]["yaxis"];
                    }

                    if ($(`#${identifier}_snapshot`).length==0){
                        Plotly.addTraces($(".time_series")[0], selected_trace);

                        initialize_snapshot_html(exchange_selected, ccy_pair_selected, css[`${identifier}`]["snapshot"]);
                    } 
                    else {  
                        var idx = $(".time_series")[0].data.findIndex(function(item) {
                            return item["name"] == selected_trace["name"]
                        });

                        Plotly.update($(".time_series")[0], {x:[[x_selected]], y:[[y_selected]]}, {}, [idx]);
                    }

                    initialize_snapshot_data(identifier, orderbook_selected[orderbook_idx], trade_selected[trade_idx], type_selected);

                    $(`#${identifier}_snapshot`).find('.close').off("click").on("click", function() {
                        $(`#${identifier}_snapshot`).remove();

                        var idx = $(".time_series")[0].data.findIndex(function(item) {
                            return item["name"] == selected_trace["name"]
                        });

                        Plotly.deleteTraces($(".time_series")[0], [idx]);
                        // for (let i=0; i<$(".time_series")[0].data.length; i++){
                        //     if ($(".time_series")[0].data["name"]==`${exchange_selected} ${ccy_pair_selected} Selected`){
                        //         Plotly.deleteTraces($(".time_series")[0], [i]);
                        //         break;
                        //     }
                        // }
                    });

                    $(`#${identifier}_snapshot_previous`).off("click").on("click", function(){
                        var next_orderbook_idx = orderbook_idx-1;
                        var next_trade_idx = trade_idx-1;

                        if (next_orderbook_idx > 0 && 
                            next_trade_idx > 0){
                                if (orderbook_selected[next_orderbook_idx]["time"] > trade_selected[next_trade_idx]["time"]){
                                    orderbook_idx = next_orderbook_idx;
                                    console.log("orderbook");
                                    console.log(orderbook_idx);

                                    update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                                    update_selected_trace(orderbook_selected[orderbook_idx], "time", "a1_price", selected_trace);
                                }
                                else {
                                    console.log("trade");
                                    console.log(trade_idx);
                                    trade_idx = next_trade_idx;

                                    update_trade_snapshot(identifier, trade_selected[trade_idx]);
                                    update_selected_trace(trade_selected[trade_idx], "time", "price", selected_trace);

                                }
                        }
                        else if (next_orderbook_idx > 0){
                            orderbook_idx = next_orderbook_idx;
                            update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                            update_selected_trace(orderbook_selected[orderbook_idx], "time", "a1_price", selected_trace);
                        }
                        else if (next_trade_idx > 0){
                            trade_idx = next_trade_idx;
                            update_trade_snapshot(identifier, trade_selected[trade_idx]);
                            update_selected_trace(trade_selected[trade_idx], "time", "price", selected_trace);
                            
                        }
                    });

                    $(`#${identifier}_snapshot_next`).off("click").on("click", function(){
                        var next_orderbook_idx = orderbook_idx+1;
                        var next_trade_idx = trade_idx+1;
                        if (next_orderbook_idx < orderbook_selected.length && 
                            next_trade_idx < trade_selected.length){
                                if (orderbook_selected[next_orderbook_idx]["time"] < trade_selected[next_trade_idx]["time"]){
                                    orderbook_idx = next_orderbook_idx;
                                    console.log("orderbook");
                                    console.log(orderbook_idx);

                                    update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                                    update_selected_trace(orderbook_selected[orderbook_idx], "time", "a1_price", selected_trace);
                                }
                                else {
                                    console.log("trade");
                                    console.log(trade_idx);
                                    trade_idx = next_trade_idx;
                                    update_trade_snapshot(identifier, trade_selected[trade_idx]);
                                    update_selected_trace(trade_selected[trade_idx], "time", "price", selected_trace);

                                }
                        }
                        else if (next_orderbook_idx < orderbook_selected.length){
                            orderbook_idx = next_orderbook_idx;
                            update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                            update_selected_trace(orderbook_selected[orderbook_idx], "time", "a1_price", selected_trace);
                        }
                        else if (next_trade_idx < trade_selected.length){
                            trade_idx = next_trade_idx;
                            update_trade_snapshot(identifier, trade_selected[trade_idx]);
                            update_selected_trace(trade_selected[trade_idx], "time", "price", selected_trace);
                        }

                    });
                });
            });
    };

    function initialize_snapshot_html(exchange_selected, ccy_pair_selected, css_options){
        var identifier = `${exchange_selected}_${ccy_pair_selected}`;
        $(".snapshot_pane").append(`
                        <div class='snapshot' id='${identifier}_snapshot'> 
                            <div class='close_pane'>
                                <button class='close'>X</button>
                            </div>
                            
                            <div class='exchange_ccy_pair_snapshot_title' id='${identifier}_snapshot_title'>
                                ${exchange_selected}&nbsp;${ccy_pair_selected}
                            </div>
            
                            <div class='orderbook_pane' id='${identifier}_snapshot_orderbook'>
                                <div class='orderbook_title'>
                                    <div>Orderbook:&nbsp;</div>
                                    <div class='orderbook_snapshot_time' id='${identifier}_orderbook_snapshot_time'>
                                    </div>
                                </div>
                                
                                <div class='bid_ask'>
                                    <div class='bid_pane'>
                                        <div class='bid_title'>
                                            Bid
                                        </div>
                                        <div class='bid_price_size'>
                                            <div class='bid_prices'>
                                                <div class='bid_row' id='${identifier}_bid_price_1'></div>
                                                <div class='bid_row' id='${identifier}_bid_price_2'></div>
                                                <div class='bid_row' id='${identifier}_bid_price_3'></div>
                                                <div class='bid_row' id='${identifier}_bid_price_4'></div> 
                                                <div class='bid_row' id='${identifier}_bid_price_5'></div> 
                                            </div>
                                            <div class='bid_sizes'>
                                                <div class='bid_row' id='${identifier}_bid_size_1'></div>
                                                <div class='bid_row' id='${identifier}_bid_size_2'></div>
                                                <div class='bid_row' id='${identifier}_bid_size_3'></div>
                                                <div class='bid_row' id='${identifier}_bid_size_4'></div> 
                                                <div class='bid_row' id='${identifier}_bid_size_5'></div> 
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div class='ask_pane'>
                                        <div class='ask_title'>
                                            Ask
                                        </div>
                                        <div class='ask_price_size'>
                                            <div class='ask_prices'>
                                                <div class='ask_row' id='${identifier}_ask_price_1'></div>
                                                <div class='ask_row' id='${identifier}_ask_price_2'></div>
                                                <div class='ask_row' id='${identifier}_ask_price_3'></div>
                                                <div class='ask_row' id='${identifier}_ask_price_4'></div> 
                                                <div class='ask_row' id='${identifier}_ask_price_5'></div> 
                                            </div>
                                            <div class='ask_sizes'>
                                                <div class='ask_row' id='${identifier}_ask_size_1'></div>
                                                <div class='ask_row' id='${identifier}_ask_size_2'></div>
                                                <div class='ask_row' id='${identifier}_ask_size_3'></div>
                                                <div class='ask_row' id='${identifier}_ask_size_4'></div> 
                                                <div class='ask_row' id='${identifier}_ask_size_5'></div> 
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                            <div class='trade_pane' id='${identifier}_snapshot_trade'>
                                <div class='trade_title'>
                                    <div>Trade:&nbsp;</div>
                                    <div class='trade_snapshot_time' id='${identifier}_trade_snapshot_time'>
                                    </div>
                                </div>
                                <div class='trade'>
                                    <div class='trade_row' id='${identifier}_trade_price'>
                                        50990.00 
                                    </div>
                                    <div class='trade_row' id='${identifier}_trade_size'>
                                        0.05234
                                    </div>
                                    <div class='trade_row' id='${identifier}_trade_side'>
                                        buy
                                    </div>
                                </div>
                            </div>
                            <div class='snapshot_navigate'>
                                <!-- <button class='previous' id='${identifier}_snapshot_previous'>  -->
                                <button class='previous' id='${identifier}_snapshot_previous'>Previous</button>
                                <!-- <button class='next' id='${identifier}_snapshot_next'>  -->
                                <button class='next' id='${identifier}_snapshot_next'>Next</button>
                            </div>
                        </div>
                        `);

        $(`#${identifier}_snapshot_title`).css(css_options);
    }
    

    function initialize_snapshot_data(identifier, orderbook_snapshot, trade_snapshot, type_selected){
        $(`#${identifier}_orderbook_snapshot_time`).text(orderbook_snapshot["time"]);
        $(`#${identifier}_trade_snapshot_time`).text(trade_snapshot["time"]);
        
        var animate_cls_to_selectors = {
            "yellow_animate": []
        };
        var [bid_current_size, ask_current_size] = [0, 0];
        for (let i=1; i<=5; i++){
            $(`#${identifier}_bid_price_${i}`).text(round(orderbook_snapshot[`b${i}_price`], 2));
            $(`#${identifier}_ask_price_${i}`).text(round(orderbook_snapshot[`a${i}_price`], 2));

            bid_current_size += orderbook_snapshot[`b${i}_size`];
            ask_current_size += orderbook_snapshot[`a${i}_size`];
            $(`#${identifier}_bid_size_${i}`).text(round(bid_current_size, 5));
            $(`#${identifier}_ask_size_${i}`).text(round(ask_current_size, 5));
        }

        $(`#${identifier}_trade_price`).text(round(trade_snapshot["price"], 2));
        $(`#${identifier}_trade_size`).text(round(trade_snapshot["size"], 5));
        $(`#${identifier}_trade_side`).text(trade_snapshot["side"]);


        if (type_selected != plot_type[2]){
            animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_orderbook_snapshot_time`);

            for (let i=1; i<=5; i++){
                animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_bid_price_${i}`);
                animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_ask_price_${i}`);
                animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_bid_size_${i}`);
                animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_ask_size_${i}`);
            }
        }
        else {
            animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_trade_snapshot_time`);

            animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_trade_price`);
            animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_trade_size`);
            animate_cls_to_selectors["yellow_animate"].push(`#${identifier}_trade_side`);
        }

        console.log(animate_cls_to_selectors);  
        color_update(animate_cls_to_selectors);
    };

    function color_update(animate_cls_to_selectors){
        Object.keys(animate_cls_to_selectors).forEach((cls) => {
            animate_cls_to_selectors[cls].forEach((selector) => {
                $(selector)[0].classList.add(cls);
    
                setTimeout(function() {
                    $(selector)[0].classList.remove(cls);
                }, 1000);
            });
        });
        
    }

    function update_orderbook_snapshot(identifier, updated_snapshot){
        console.log(updated_snapshot);
        // content = $(`#${identifier}_orderbook_snapshot_time`)[0];
        // content.classList.add("animate");
  
        // setTimeout(function() {
        //     content.classList.remove("animate");
        // }, 1000); 

        $(`#${identifier}_orderbook_snapshot_time`).text(updated_snapshot["time"]);

        var animate_cls_to_selectors = {
            "green_animate": [],
            "yellow_animate": [`#${identifier}_orderbook_snapshot_time`],
            "red_animate": []
        };

        var bid_current_size = 0;
        var ask_current_size = 0;
        for (let i=1; i<=5; i++){

            var bid_previous_price = round($(`#${identifier}_bid_price_${i}`).text(), 2);
            var ask_previous_price = round($(`#${identifier}_ask_price_${i}`).text(), 2);

            var bid_previous_size = round($(`#${identifier}_bid_size_${i}`).text(), 5);
            var ask_previous_size = round($(`#${identifier}_ask_size_${i}`).text(), 5);

            var bid_current_price = round(updated_snapshot[`b${i}_price`], 2);
            var ask_current_price = round(updated_snapshot[`a${i}_price`], 2);

            var bid_current_size = round(bid_current_size + updated_snapshot[`b${i}_size`], 5);
            var ask_current_size = round(ask_current_size + updated_snapshot[`a${i}_size`], 5);

            $(`#${identifier}_bid_price_${i}`).text(bid_current_price);
            $(`#${identifier}_ask_price_${i}`).text(ask_current_price);
            $(`#${identifier}_bid_size_${i}`).text(bid_current_size);
            $(`#${identifier}_ask_size_${i}`).text(ask_current_size);

            if (bid_current_price > bid_previous_price){
                animate_cls_to_selectors["green_animate"].push(`#${identifier}_bid_price_${i}`);
            }
            else if (bid_current_price < bid_previous_price){
                animate_cls_to_selectors["red_animate"].push(`#${identifier}_bid_price_${i}`);
            }

            if (ask_current_price > ask_previous_price){
                animate_cls_to_selectors["green_animate"].push(`#${identifier}_ask_price_${i}`);
            }
            else if (ask_current_price < ask_previous_price){
                animate_cls_to_selectors["red_animate"].push(`#${identifier}_ask_price_${i}`);
            }

            if (bid_current_size > bid_previous_size){
                animate_cls_to_selectors["green_animate"].push(`#${identifier}_bid_size_${i}`);
            }
            else if (bid_current_size < bid_previous_size){
                animate_cls_to_selectors["red_animate"].push(`#${identifier}_bid_size_${i}`);
            }

            if (ask_current_size > ask_previous_size){
                animate_cls_to_selectors["green_animate"].push(`#${identifier}_ask_size_${i}`);
            }
            else if (ask_current_size < ask_previous_size){
                animate_cls_to_selectors["red_animate"].push(`#${identifier}_ask_size_${i}`);
            }

        }
        color_update(animate_cls_to_selectors);

    }


    function update_trade_snapshot(identifier, updated_snapshot){
        console.log(updated_snapshot);

        $(`#${identifier}_trade_snapshot_time`).text(updated_snapshot["time"]);
        var animate_cls_to_selectors = {
            "green_animate": [],
            "yellow_animate": [`#${identifier}_trade_snapshot_time`],
            "red_animate": []
        };

        var trade_previous_price = round($(`#${identifier}_trade_price`).text(), 2);
        var trade_previous_size = round($(`#${identifier}_trade_size`).text(), 5);

        var trade_current_price = round(updated_snapshot["price"], 2);
        var trade_current_size = round(updated_snapshot["size"], 5);

        $(`#${identifier}_trade_price`).text(trade_current_price);
        $(`#${identifier}_trade_size`).text(trade_current_size);
        $(`#${identifier}_trade_side`).text(updated_snapshot["side"]);

        if (trade_current_price > trade_previous_price){
            animate_cls_to_selectors["green_animate"].push(`#${identifier}_trade_price`);
        }
        else if (trade_current_price < trade_previous_price){
            animate_cls_to_selectors["red_animate"].push(`#${identifier}_trade_price`);
        }

        if (trade_current_size > trade_previous_size){
            animate_cls_to_selectors["green_animate"].push(`#${identifier}_trade_size`);
        }
        else if (trade_current_size < trade_previous_size){
            animate_cls_to_selectors["red_animate"].push(`#${identifier}_trade_size`);
        }

        color_update(animate_cls_to_selectors);

    }

    function update_selected_trace(snapshot, x_key, y_key, selected_trace){
        var chart_data = $(".time_series")[0].data;
        var idx = chart_data.findIndex(function(item) {
            return item["name"] == selected_trace["name"]
          });
        var updated_x = snapshot[x_key];
        var updated_y = snapshot[y_key];

        Plotly.update($(".time_series")[0], {x:[[updated_x]], y:[[updated_y]]}, {}, [idx]);
    }

});




