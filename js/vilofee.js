/**
 * Created by zhangshuang on 16/7/14.
 */
$(function () {

    var l1_btns = $("li[role=presentation]");
    var home_btn = $("#home");

    home_btn.addClass("active");

    var coding_btn = $("#coding");
    var solution_btn = $("#solution");
    var service_btn = $("#service");
    var ml_btn = $("#ml");
    var frontend_btn = $("#frontend");
    var essay_btn = $("#essay");


    home_btn.click(function () {
        l1_btns.removeClass("active");
        home_btn.addClass("active");
    });

    coding_btn.click(function () {
        l1_btns.removeClass("active");
        coding_btn.addClass("active");
    });

    solution_btn.click(function () {
        l1_btns.removeClass("active");
        solution_btn.addClass("active");
    });

    service_btn.click(function () {
        l1_btns.removeClass("active");
        service_btn.addClass("active");
    });

    ml_btn.click(function () {
        l1_btns.removeClass("active");
        ml_btn.addClass("active");
    });

    frontend_btn.click(function () {
        l1_btns.removeClass("active");
        frontend_btn.addClass("active");
    });

    essay_btn.click(function () {
        l1_btns.removeClass("active");
        essay_btn.addClass("active");
    });

});
