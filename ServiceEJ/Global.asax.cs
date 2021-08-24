#region Copyright Syncfusion Inc. 2001-2021.
// Copyright Syncfusion Inc. 2001-2021. All rights reserved.
// Use of this code is subject to the terms of our license.
// A copy of the current license can be obtained at any time by e-mailing
// licensing@syncfusion.com. Any infringement will be prosecuted under
// applicable laws. 
#endregion
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using System.Web.Routing;
using EJServices;
using Microsoft.AspNet.SignalR;
using System.Web.Http.Dispatcher;
using System.Net.Http;
using System.Web.Http.Routing;
using System.IO;
using System.Text;
using Syncfusion.Licensing;
namespace ejservices
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {

            GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpControllerSelector),
            new ApiControllerSelector(GlobalConfiguration.Configuration));

            System.Web.Http.GlobalConfiguration.Configuration.Routes.MapHttpRoute(name: "OlapRoute", routeTemplate: "api/{controller}/Olap/{action}");
            System.Web.Http.GlobalConfiguration.Configuration.Routes.MapHttpRoute(name: "RelationalRoute", routeTemplate: "api/{controller}/Relational/{action}");

            System.Web.Http.GlobalConfiguration.Configuration.Routes.MapHttpRoute(name: "DefaultApi", routeTemplate: "api/{controller}/{action}/{id}", defaults: new { id = RouteParameter.Optional });
           
   		    string license = File.ReadAllText(Server.MapPath("SyncfusionLicense.txt"), Encoding.UTF8);
            SyncfusionLicenseProvider.RegisterLicense(license);

            AppDomain.CurrentDomain.SetData("SQLServerCompactEditionUnderWebHosting", true);

            RouteTable.Routes.MapHubs(new HubConfiguration { EnableCrossDomain = true });
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "POST, PUT, DELETE, GET");
                HttpContext.Current.Response.End();
            }
        }
    }
    public class ApiControllerSelector : DefaultHttpControllerSelector
    {
        public ApiControllerSelector(HttpConfiguration configuration)
            : base(configuration)
        {
        }

        public override string GetControllerName(HttpRequestMessage request)
        {
            if (request == null)
                throw new ArgumentNullException("request");

            IHttpRouteData routeData = request.GetRouteData();

            if (routeData == null)
                return null;

            object controllerName;
            routeData.Values.TryGetValue("controller", out controllerName);

            if (controllerName != null && request.RequestUri.OriginalString.ToLower().Contains("/olap/"))
                controllerName = controllerName.ToString().Replace("Pivot", "Olap");
            else if (controllerName != null && request.RequestUri.OriginalString.ToLower().Contains("/relational/"))
                controllerName = controllerName.ToString().Replace("Pivot", "Relational");

            return (string)controllerName;
        }
    }
}