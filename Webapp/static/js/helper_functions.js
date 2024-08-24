export function initialize_snapshot_html(exchange_selected, ccy_pair_selected, css_snapshot){
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
                                </div>
                                <div class='trade_row' id='${identifier}_trade_size'>
                                </div>
                                <div class='trade_row' id='${identifier}_trade_side'>
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

    $(`#${identifier}_snapshot_title`).css(css_snapshot);
}

function round(num, dp){
    return Math.round(num*Math.pow(10, dp))/Math.pow(10, dp);
}

export function color_update(animate_cls_to_selectors){
    Object.keys(animate_cls_to_selectors).forEach((cls) => {
        animate_cls_to_selectors[cls].forEach((selector) => {
            $(selector)[0].classList.add(cls);

            setTimeout(function() {
                $(selector)[0].classList.remove(cls);
            }, 1000);
        });
    });
}

export function initialize_snapshot_data(identifier, orderbook_snapshot, trade_snapshot, 
                                type_selected, chart_type){
    
    //improve this part
    if (orderbook_snapshot==null) {
        orderbook_snapshot = {
            "timestamp": trade_snapshot["timestamp"],
            "bid_prices": [-1, -1, -1, -1, -1],
            "ask_prices": [-1, -1, -1, -1, -1],
            "bid_sizes": [-1, -1, -1, -1, -1],
            "ask_sizes": [-1, -1, -1, -1, -1],
        }
    }
    else if (trade_snapshot==null) {
        trade_snapshot = {
            "timestamp": orderbook_snapshot["timestamp"],
            "price": -1,
            "size": -1,
            "side": "nan",
        }
    }

    var orderbook_snapshot_timestamp = orderbook_snapshot["timestamp"].substring(0, orderbook_snapshot["timestamp"].length-3);
    var trade_snapshot_timestamp = trade_snapshot["timestamp"].substring(0, trade_snapshot["timestamp"].length-3);

    $(`#${identifier}_orderbook_snapshot_time`).text(orderbook_snapshot_timestamp);
    $(`#${identifier}_trade_snapshot_time`).text(trade_snapshot_timestamp);

    var animate_cls_to_selectors = {
        "yellow_animate": []
    };
    
    var [bid_current_size, ask_current_size] = [0, 0];
    for (let i=1; i<=5; i++){
        $(`#${identifier}_bid_price_${i}`).text(round(orderbook_snapshot["bid_prices"][i-1], 2));
        $(`#${identifier}_ask_price_${i}`).text(round(orderbook_snapshot["ask_prices"][i-1], 2));

        bid_current_size += orderbook_snapshot["bid_sizes"][i-1];
        ask_current_size += orderbook_snapshot["ask_sizes"][i-1];
        $(`#${identifier}_bid_size_${i}`).text(round(bid_current_size, 5));
        $(`#${identifier}_ask_size_${i}`).text(round(ask_current_size, 5));
    }

    $(`#${identifier}_trade_price`).text(round(trade_snapshot["price"], 2));
    $(`#${identifier}_trade_size`).text(round(trade_snapshot["size"], 5));
    $(`#${identifier}_trade_side`).text(trade_snapshot["side"]);


    if (type_selected != chart_type[2]){
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



export let animate_cls_to_selectors = {
    "green_animate": [],
    "yellow_animate": [],
    "red_animate": []
};


export function update_orderbook_snapshot(identifier, updated_snapshot){
    console.log(updated_snapshot);

    var updated_snapshot_timestamp = updated_snapshot["timestamp"].substring(0, updated_snapshot["timestamp"].length-3);

    $(`#${identifier}_orderbook_snapshot_time`).text(updated_snapshot_timestamp);

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

        var bid_current_price = round(updated_snapshot["bid_prices"][i-1], 2);
        var ask_current_price = round(updated_snapshot["ask_prices"][i-1], 2);

        var bid_current_size = round(bid_current_size + updated_snapshot["bid_sizes"][i-1], 5);
        var ask_current_size = round(ask_current_size + updated_snapshot["ask_sizes"][i-1], 5);

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




export function update_trade_snapshot(identifier, updated_snapshot){
    console.log(updated_snapshot);

    var updated_snapshot_timestamp = updated_snapshot["timestamp"].substring(0, updated_snapshot["timestamp"].length-3);

    $(`#${identifier}_trade_snapshot_time`).text(updated_snapshot_timestamp);
    
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

export function update_selected_trace(updated_x, updated_y, selected_trace){
    var chart_data = $(".time_series")[0].data;
    var idx = chart_data.findIndex(function(item) {
        return item["name"] == selected_trace["name"]
      });
    // var updated_x = snapshot["timestamp"];
    // var updated_y = snapshot[y_key];

    Plotly.update($(".time_series")[0], {x:[[updated_x]], y:[[updated_y]]}, {}, [idx]);
}