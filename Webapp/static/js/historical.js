$(document).ready(function () {
    console.log(`${api_url}/first_and_last_timestamp`);;

    //to be done. To convert the timestamps to the client's timezone
    console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
    $(`.historical`).addClass('active').siblings().removeClass('active');

    // get default start and end
    $.ajax({
        url: `${api_url}/first_and_last_timestamp`,
        type: "POST",
        data: {
            exchange: $("#exchange_1").val(),
            ccy_pair: $("#ccy_pair_1").val()
        },
    })
    .done(function(response){
        first = response["first"].split(".")[0];
        last = response["last"].split(".")[0];

        $("#start").attr("value", first);
        $("#start").attr("min", first);
        $("#start").attr("max", last);
        $("#end").attr("value", last);
        $("#end").attr("min", first);
        $("#end").attr("max", last);
    });

    // update start and end when exchange is changed
    $("#exchange_1").on("change", function(){
        $.ajax({
            url: `${api_url}/first_and_last_timestamp`,
            type: "POST",
            data: {
                exchange: $("#exchange_1").val(),
                ccy_pair: $("#ccy_pair_1").val()
            },
        })
        .done(function(response){
            if (response["first"]==null && response["last"]==null){
                $("#start").attr("value", null);
                $("#start").attr("min", null);
                $("#start").attr("max", null);
                $("#end").attr("value", null);
                $("#end").attr("min", null);
                $("#end").attr("max", null);
            }
            else{
                var first = response["first"].split(".")[0];
                var last = response["last"].split(".")[0];
                $("#start").attr("value", first);
                $("#start").attr("min", first);
                $("#start").attr("max", last);
                $("#end").attr("value", last);
                $("#end").attr("min", first);
                $("#end").attr("max", last);
            }
            
        });
    });

    // update start and end when ccy_pair is changed
    $("#ccy_pair_1").on("change", function(){
        $.ajax({
            url: `${api_url}/first_and_last_timestamp`,
            type: "POST",
            data: {
                exchange: $("#exchange_1").val(),
                ccy_pair: $("#ccy_pair_1").val()
            },
        })
        .done(function(response){
            if (response["first"]==null && response["last"]==null){
                $("#start").attr("value", null);
                $("#start").attr("min", null);
                $("#start").attr("max", null);
                $("#end").attr("value", null);
                $("#end").attr("min", null);
                $("#end").attr("max", null);
            }
            else{
                var first = response["first"].split(".")[0];
                var last = response["last"].split(".")[0];
                $("#start").attr("value", first);
                $("#start").attr("min", first);
                $("#start").attr("max", last);
                $("#end").attr("value", last);
                $("#end").attr("min", first);
                $("#end").attr("max", last);
            }
        });
    });

    $("form").on("submit", function (event) {
        event.preventDefault();
        data = {
            exchange_1: $("#exchange_1").val(),
            ccy_pair_1: $("#ccy_pair_1").val(),
            exchange_2: $("#exchange_2").val(),
            ccy_pair_2: $("#ccy_pair_2").val(),
            start: $("#start").val(),
            end: $("#end").val()
        };
        var dataString = JSON.stringify(data);
        var dataStringBase64 = window.btoa(dataString); // (optional)
        var dataStringBase64Safe = encodeURI(dataStringBase64);
        window.open(`/historical_dashboard?data=${dataStringBase64Safe}`, "_blank");
    });
});


