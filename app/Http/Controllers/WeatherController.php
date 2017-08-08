<?php namespace App\Http\Controllers;

use App\Services\WeatherService;

class WeatherController extends Controller {

	/**
     * Constructor methods
     *
     * @param  int  $id
     * @return Response
     */
	public function __construct() {

	}

	/**
     * Get the current weather for the location specified
     *
     * @param  int  $id
     * @return Response
     */
	public function index(WeatherService $weatherService) {
          return  response()->json($weatherService->current('Boston'), 200);
	}


     /**
     * Get the specified locations forecast
     *
     * @param  int  $id
     * @return Response
     */
     public function forecast(WeatherService $weatherService) {
          return  response()->json($weatherService->forecast('Boston'), 200);
     }
}
