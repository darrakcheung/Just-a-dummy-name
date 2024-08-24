import { chart_layout, yaxis_params_1, yaxis_params_2, 
         css_options_1, css_options_2,
         bid_trace_1, ask_trace_1, trade_trace_1,
         bid_trace_2, ask_trace_2, trade_trace_2, 
         selected_trace_template, exchange_ccy_pair_data, CHART_TYPE } from './params.js';

import { initialize_snapshot_html, initialize_snapshot_data,
         animate_cls_to_selectors, update_orderbook_snapshot, 
         update_trade_snapshot, update_selected_trace } from './helper_functions.js';

$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search); // supported on most modern browsers
    var dataStringBase64Safe = urlParams.get('data');

    var dataStringBase64 = decodeURI(dataStringBase64Safe);
    var dataString = window.atob(dataStringBase64);
    var data = JSON.parse(dataString);
    console.log(data);

    var css_options = {};
    var realtime_data = {};
    var chart_name_to_idx = {};
    var request_data = [];
    var initial_traces = [];
    var ws = new WebSocket(ws_url);

    //initialization
    if (data["exchange_2"]=="None" || data["ccy_pair_2"]=="None"){

        var key = `${data["exchange_1"]}_${data["ccy_pair_1"]}`;

        css_options[key] = css_options_1;
        realtime_data[key] = JSON.parse(JSON.stringify(exchange_ccy_pair_data));
        
        initial_traces = initialize_chart_params(chart_layout, yaxis_params_1, 
                                bid_trace_1, ask_trace_1, trade_trace_1,
                                data["exchange_1"], data["ccy_pair_1"]);

        $('.exchange_name').append(`
                            exchange:&nbsp;
                            <p class='exchange_name_1'>${data["exchange_1"]}</p>
                        `);
        $('.ccy_pair').append(`
                            ccy pair:&nbsp;
                            <p class='ccy_pair_1'>${data["ccy_pair_1"]}</p>
                        `);  
        request_data.push({
            "exchange": data["exchange_1"],
            "ccy_pair": data["ccy_pair_1"]
        });

    }
    else {

        var key_1 = `${data["exchange_1"]}_${data["ccy_pair_1"]}`;
        var key_2 = `${data["exchange_2"]}_${data["ccy_pair_2"]}`;
        
        css_options[key_1] = css_options_1;
        css_options[key_2] = css_options_2;

        realtime_data[key_1] = JSON.parse(JSON.stringify(exchange_ccy_pair_data));
        realtime_data[key_2] = JSON.parse(JSON.stringify(exchange_ccy_pair_data));

        var trace_1 = initialize_chart_params(chart_layout, yaxis_params_1, 
                                        bid_trace_1, ask_trace_1, trade_trace_1,
                                        data["exchange_1"], data["ccy_pair_1"]);

        var trace_2 = initialize_chart_params(chart_layout, yaxis_params_2, 
                                            bid_trace_2, ask_trace_2, trade_trace_2,
                                            data["exchange_2"], data["ccy_pair_2"]);

        initial_traces = [...trace_1, ...trace_2];

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
        request_data.push({
            "exchange": data["exchange_1"],
            "ccy_pair": data["ccy_pair_1"]
        });
        request_data.push({
            "exchange": data["exchange_2"],
            "ccy_pair": data["ccy_pair_2"]
        });

    }

    Plotly.newPlot($(".time_series")[0], initial_traces, chart_layout, {displayModeBar: false});

    for (let i = 0; i < $(".time_series")[0].data.length; i++) {
        chart_name_to_idx[$(".time_series")[0].data[i]["name"]] = i;
    }

    function initialize_chart_params(chart_layout, yaxis_params, bid_trace, ask_trace, trade_trace, exchange, ccy_pair){
        bid_trace = JSON.parse(JSON.stringify(bid_trace));
        ask_trace = JSON.parse(JSON.stringify(ask_trace));
        trade_trace = JSON.parse(JSON.stringify(trade_trace));

        chart_layout[yaxis_params["layout_yaxis_key"]] = yaxis_params["layout_yaxis"];
        if (yaxis_params["trace_yaxis"]!=null){
            ask_trace["yaxis"] = yaxis_params["trace_yaxis"];
            bid_trace["yaxis"] = yaxis_params["trace_yaxis"];
            trade_trace["yaxis"] = yaxis_params["trace_yaxis"];
        }

        var identifier = `${exchange} ${ccy_pair}`;
        bid_trace["name"] = identifier + " Bid";
        ask_trace["name"] = identifier + " Ask";
        trade_trace["name"] = identifier + " Trade";
        return [ask_trace, bid_trace, trade_trace];
    }
    

    function create_websocket_connection(){
        if ((ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) ){
            console.log("reopen WebSocket");
            ws = new WebSocket(ws_url);

            var initial_traces = null;
            if (data["exchange_2"]=="None" || data["ccy_pair_2"]=="None"){
                var key = `${data["exchange_1"]}_${data["ccy_pair_1"]}`;
                realtime_data[key] = JSON.parse(JSON.stringify(exchange_ccy_pair_data));

                initial_traces = initialize_chart_params(chart_layout, yaxis_params_1, 
                    bid_trace_1, ask_trace_1, trade_trace_1,
                    data["exchange_1"], data["ccy_pair_1"]);

            }
            else {
                var key_1 = `${data["exchange_1"]}_${data["ccy_pair_1"]}`;
                var key_2 = `${data["exchange_2"]}_${data["ccy_pair_2"]}`;
        
                realtime_data[key_1] = JSON.parse(JSON.stringify(exchange_ccy_pair_data));
                realtime_data[key_2] = JSON.parse(JSON.stringify(exchange_ccy_pair_data));

                var trace_1 = initialize_chart_params(chart_layout, yaxis_params_1, 
                                bid_trace_1, ask_trace_1, trade_trace_1,
                                data["exchange_1"], data["ccy_pair_1"]);

                var trace_2 = initialize_chart_params(chart_layout, yaxis_params_2, 
                                bid_trace_2, ask_trace_2, trade_trace_2,
                                data["exchange_2"], data["ccy_pair_2"]);

                initial_traces = [...trace_1, ...trace_2];
            }

            Plotly.newPlot($(".time_series")[0], initial_traces, chart_layout, {displayModeBar: false});
            for (let i = 0; i < $(".time_series")[0].data.length; i++) {
                chart_name_to_idx[$(".time_series")[0].data[i]["name"]] = i;
            }
        }

        ws.onopen = function() {
            console.log('WebSocket is open now.');
            ws.send(JSON.stringify(request_data));
        }
        
    
        ws.onmessage = function(event) {
            // var msg_obj = JSON.parse({"timestamp":"2024-08-04 16:28:15.092699","ccy_pair":"BTCUSD"});
            var msg_obj = JSON.parse(event.data);
            var exchange = msg_obj["exchange"];
            var ccy_pair = msg_obj["ccy_pair"];
            
            if (msg_obj["msg_type"]=="book"){
                var orderbook = msg_obj["data"];

                var [accul_ask_size, accul_bid_size] = [0, 0];
                var [ask_levels, bid_levels] = [[], []]; 
                for (let i=0; i<5; i++){
                    accul_ask_size += orderbook["ask_sizes"][i];
                    ask_levels = ask_levels.concat([orderbook["ask_prices"][i], accul_ask_size]);
    
                    accul_bid_size += orderbook["bid_sizes"][i];
                    bid_levels = bid_levels.concat([orderbook["bid_prices"][i], accul_bid_size]);
                }
                ask_levels = ask_levels.concat([exchange, ccy_pair]);
                bid_levels = bid_levels.concat([exchange, ccy_pair]);

                realtime_data[`${exchange}_${ccy_pair}`]["orderbook"].push(JSON.parse(JSON.stringify(orderbook)));

                var ask_trace_idx = chart_name_to_idx[`${exchange} ${ccy_pair} Ask`];
                var bid_trace_idx = chart_name_to_idx[`${exchange} ${ccy_pair} Bid`];
                
                var update_data = realtime_data[`${exchange}_${ccy_pair}`]["update_data"];
                update_data["count"] += 1;
                update_data["ask"]["x"].push(orderbook["timestamp"]);
                update_data["ask"]["y"].push(orderbook["ask_prices"][0]);
                update_data["ask"]["customdata"].push(ask_levels);

                update_data["bid"]["x"].push(orderbook["timestamp"]);
                update_data["bid"]["y"].push(orderbook["bid_prices"][0]);
                update_data["bid"]["customdata"].push(bid_levels);

                if (update_data["count"] % 10 == 0){
                    Plotly.extendTraces($(".time_series")[0], {
                            x:[update_data["ask"]["x"], update_data["bid"]["x"]], 
                            y:[update_data["ask"]["y"], update_data["bid"]["y"]], 
                            customdata: [update_data["ask"]["customdata"], update_data["bid"]["customdata"]]}, 
                            [ask_trace_idx, bid_trace_idx]);

                    update_data["ask"] = {x: [], y:[], customdata: []};
                    update_data["bid"] = {x: [], y:[], customdata: []};
                }
                
            }
            else if (msg_obj["msg_type"]=="trade"){
                var trades = msg_obj["data"];
                if (trades.length > 0) {

                    var update_data = realtime_data[`${exchange}_${ccy_pair}`]["update_data"];
                    trades.forEach((trade) => {
                        
                        realtime_data[`${exchange}_${ccy_pair}`]["trades"].push(JSON.parse(JSON.stringify(trade)));
                        update_data["trade"]["x"].push(trade["timestamp"]);
                        update_data["trade"]["y"].push(trade["price"]);
                        update_data["trade"]["customdata"].push([trade["price"],trade["size"],trade["side"], exchange, ccy_pair])
                    });
                    var trade_trace_idx = chart_name_to_idx[`${exchange} ${ccy_pair} Trade`];

                    console.log(update_data["trade"]["customdata"]);
                    Plotly.extendTraces($(".time_series")[0], {
                        x:[update_data["trade"]["x"]], 
                        y:[update_data["trade"]["y"]], 
                        customdata: [update_data["trade"]["customdata"]]}, 
                        [trade_trace_idx]);

                    update_data["trade"] = {x: [], y:[], customdata: []};

                }
                
            }
        }
        // Connection Closed
        ws.onclose = function (event, reason) {
            console.log('ws is closed');
            Object.keys(realtime_data).forEach((identifier) => {
                var arr = identifier.split("_");
                
                var update_data = realtime_data[identifier]["update_data"];

                if (update_data["ask"].length > 0) {
                    var exchange = arr[0];
                    var ccy_pair = arr[1];

                    var ask_trace_idx = chart_name_to_idx[`${exchange} ${ccy_pair} Ask`];
                    var bid_trace_idx = chart_name_to_idx[`${exchange} ${ccy_pair} Bid`];

                    Plotly.extendTraces($(".time_series")[0], {
                        x:[update_data["ask"]["x"], update_data["bid"]["x"]], 
                        y:[update_data["ask"]["y"], update_data["bid"]["y"]], 
                        customdata: [update_data["ask"]["customdata"], update_data["bid"]["customdata"]]}, 
                        [ask_trace_idx, bid_trace_idx]);
                }
            })
        

        };
    }
    create_websocket_connection();


    $(".ws_button").on("click", function(){
        if ($(".ws_button").hasClass("ws_close")){
            ws.close();
            
            //post action
            $(".ws_button").removeClass("ws_close");
            $(".ws_button").html("Reopen Connection");
            $(".ws_button").addClass("ws_reopen");
        }
        else if ($(".ws_button").hasClass("ws_reopen")){
            for (let i=0; i<chart_name_to_idx.length;i++){
                Plotly.update($(".time_series")[0], {x:[], y:[], customdata: []}, {}, [i]);
            }
            create_websocket_connection(ws);

            $(".ws_button").removeClass("ws_reopen");
            $(".ws_button").html("Close Connection");
            $(".ws_button").addClass("ws_close");
        }
    });

    $(".time_series")[0].on('plotly_click', function(data){
        //do nothing if the chart is still updating
        if ($(".ws_button").hasClass("ws_close")) return;

        var pts = '';
        for(var i=0; i < data.points.length; i++){
            pts = data.points[i];
        }
        // console.log(pts);
        var x_selected = pts["x"];
        var y_selected = pts["y"];
        var [orderbook_idx, trade_idx] = [-1, -1];
        var temp_arr = pts["data"]["name"].split(" ");
        var [exchange_selected, ccy_pair_selected, type_selected] = [temp_arr[0], temp_arr[1], temp_arr[2]];
        var identifier = `${exchange_selected}_${ccy_pair_selected}`;
        var orderbook_selected = realtime_data[identifier]["orderbook"];
        var trade_selected = realtime_data[identifier]["trades"];
        if (type_selected == CHART_TYPE[2]){  // handle for trade plot type
            var trade_idx = pts["pointIndex"];
            //find the last orderbook just before the trade snapshot time for initialization
            var orderbook_idx = orderbook_selected.findLastIndex((item)=> Date.parse(item["timestamp"])<Date.parse(x_selected));
        }
        else if (type_selected == CHART_TYPE[0] || type_selected == CHART_TYPE[1]){ // handle for bid or ask plot type
            var orderbook_idx = pts["pointIndex"];
            //find the last trade just before the trade snapshot time for initialization
            var trade_idx = trade_selected.findLastIndex((item)=> Date.parse(item["timestamp"])<Date.parse(x_selected));
            
        }

        // console.log(orderbook_idx);
        // console.log(trade_idx);
        // console.log(orderbook_selected[orderbook_idx]);
        // console.log(trade_selected[trade_idx]);

        var selected_trace = JSON.parse(JSON.stringify(selected_trace_template));

        selected_trace["name"] = `${exchange_selected} ${ccy_pair_selected} Selected`;
        selected_trace["x"] = [x_selected];
        selected_trace["y"] = [y_selected];
        selected_trace["yaxis"] = pts["data"]["yaxis"];

        if ($(`#${identifier}_snapshot`).length==0){
            Plotly.addTraces($(".time_series")[0], selected_trace);

            initialize_snapshot_html(exchange_selected, ccy_pair_selected, css_options[`${identifier}`]["snapshot"]);
        } 
        else {  
            var idx = $(".time_series")[0].data.findIndex(function(item) {
                return item["name"] == selected_trace["name"]
            });

            Plotly.update($(".time_series")[0], {x:[[x_selected]], y:[[y_selected]]}, {}, [idx]);
        }

        initialize_snapshot_data(identifier, orderbook_selected[orderbook_idx], trade_selected[trade_idx], 
                                type_selected, CHART_TYPE, animate_cls_to_selectors);

        $(`#${identifier}_snapshot`).find('.close').off("click").on("click", function() {
            $(`#${identifier}_snapshot`).remove();

            var idx = $(".time_series")[0].data.findIndex(function(item) {
                return item["name"] == selected_trace["name"]
            });

            Plotly.deleteTraces($(".time_series")[0], [idx]);
        });

        $(`#${identifier}_snapshot_previous`).off("click").on("click", function(){
            var next_orderbook_idx = orderbook_idx-1;
            var next_trade_idx = trade_idx-1;

            if (next_orderbook_idx > 0 && 
                next_trade_idx > 0){
                    if (orderbook_selected[next_orderbook_idx]["timestamp"] > trade_selected[next_trade_idx]["timestamp"]){
                        orderbook_idx = next_orderbook_idx;
                        update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                        update_selected_trace(orderbook_selected[orderbook_idx]["timestamp"], orderbook_selected[orderbook_idx]["ask_prices"][0], selected_trace);
                    }
                    else {
                        trade_idx = next_trade_idx;
                        update_trade_snapshot(identifier, trade_selected[trade_idx]);
                        update_selected_trace(trade_selected[trade_idx]["timestamp"], trade_selected[trade_idx]["price"], selected_trace);

                    }
            }
            else if (next_orderbook_idx > 0){
                orderbook_idx = next_orderbook_idx;
                update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                update_selected_trace(orderbook_selected[orderbook_idx]["timestamp"], orderbook_selected[orderbook_idx]["ask_prices"][0], selected_trace);
            }
            else if (next_trade_idx > 0){
                trade_idx = next_trade_idx;
                update_trade_snapshot(identifier, trade_selected[trade_idx]);
                update_selected_trace(trade_selected[trade_idx]["timestamp"], trade_selected[trade_idx]["price"], selected_trace);

                
            }
        });

        $(`#${identifier}_snapshot_next`).off("click").on("click", function(){
            var next_orderbook_idx = orderbook_idx+1;
            var next_trade_idx = trade_idx+1;
            if (next_orderbook_idx < orderbook_selected.length && 
                next_trade_idx < trade_selected.length){
                    if (orderbook_selected[next_orderbook_idx]["timestamp"] < trade_selected[next_trade_idx]["timestamp"]){
                        orderbook_idx = next_orderbook_idx;
                        update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                        update_selected_trace(orderbook_selected[orderbook_idx]["timestamp"], orderbook_selected[orderbook_idx]["ask_prices"][0], selected_trace);
                    }
                    else {
                        trade_idx = next_trade_idx;
                        update_trade_snapshot(identifier, trade_selected[trade_idx]);
                        update_selected_trace(trade_selected[trade_idx]["timestamp"], trade_selected[trade_idx]["price"], selected_trace);

                    }
            }
            else if (next_orderbook_idx < orderbook_selected.length){
                orderbook_idx = next_orderbook_idx;
                update_orderbook_snapshot(identifier, orderbook_selected[orderbook_idx]);
                update_selected_trace(orderbook_selected[orderbook_idx]["timestamp"], orderbook_selected[orderbook_idx]["ask_prices"][0], selected_trace);
            }
            else if (next_trade_idx < trade_selected.length){
                trade_idx = next_trade_idx;
                update_trade_snapshot(identifier, trade_selected[trade_idx]);
                update_selected_trace(trade_selected[trade_idx]["timestamp"], trade_selected[trade_idx]["price"], selected_trace);
            }
        });
    });
});






