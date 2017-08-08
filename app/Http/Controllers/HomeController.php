<?php namespace App\Http\Controllers;

class HomeController extends Controller {

     /**
     * Constructor methods
     *
     * @param
     * @return
     */
     public function __construct() {
     }

     /**
     * Return welcome default view
     *
     * @param
     * @return Response View
     */
     public function index() {
          return view('welcome');
     }

}
