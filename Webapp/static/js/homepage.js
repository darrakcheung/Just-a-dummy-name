$(document).ready(function () {

    $(`.realtime`).addClass('active').siblings().removeClass('active');

    $("form").on("submit", function (event) {
        event.preventDefault();
        data = {
            exchange_1: $("#exchange_1").val(),
            ccy_pair_1: $("#ccy_pair_1").val(),
            exchange_2: $("#exchange_2").val(),
            ccy_pair_2: $("#ccy_pair_2").val(),
        };
        var dataString = JSON.stringify(data);
        var dataStringBase64 = window.btoa(dataString); // (optional)
        var dataStringBase64Safe = encodeURI(dataStringBase64);
        //open a new window
        window.open(`/realtime_dashboard?data=${dataStringBase64Safe}`, "_blank");
    });

});