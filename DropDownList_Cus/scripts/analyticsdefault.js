$(function () {
    if (document.body.className == "darktheme") {
        $(".rptimg1").addClass("rptdimg1").removeClass("rptimg1");
    }
   /* $(".imgstyle, .samplebutton").click(function (eve) {
        var sbURL = window.location.href.split("/");
        var sbTheme = sbURL[sbURL.length - 1];
        var host = window.location.hostname;
        var themes = ["azure", "azuredark", "gradientazure", "gradientazuredark", "lime", "limedark", "gradientlime", "gradientlimedark", "saffron", "saffrondark", "gradientsaffron", "gradientsaffrondark"];
        var className = eve.target.className || $($(eve.target.parentElement).parent().siblings()[0]).children()[0].className;
        if (jQuery.inArray(sbTheme, themes) != -1)
            window.location.href = buildUrl(sbTheme, host, className);
        else {
            if (document.body.className == "darktheme")
                window.location.href = buildUrl("azuredark", host, className);
            else
                window.location.href = buildUrl("azure", host, className);
        }
    });*/
});
$(window).on('hashchange', function (e) {
    if (document.body.className == "darktheme") {
        $(".rptimg1").addClass("rptdimg1").removeClass("rptimg1");
    }
    else {
        $(".rptdimg1").addClass("rptimg1").removeClass("rptdimg1");
    }
});

function buildUrl(theme, host, control) {
    if (control.indexOf("rptimg1") > -1 || control.indexOf("rptdimg1") > -1)
        control = "ReportViewer";
    return "/default.htm#!/" + theme + "/" + control + "/" + "DefaultFunctionalities";
}