using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ciphersmix.Models;

namespace ciphersmix.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Hill()
        {
            return View();
        }
        public IActionResult Adfgvx()
        {
            return View();
        }
        public IActionResult Playfair()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
