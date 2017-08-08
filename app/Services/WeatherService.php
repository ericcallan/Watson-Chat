<?php namespace App\Services;

use App\Helpers\RequestHelper;

class WeatherService {

	protected $requestHelper;

    /**
     * construct
     *
     * @param NULL
     * @return array
     */
	public function __construct() {
		$this->requestHelper = new RequestHelper;
	}

    /**
     * Get current temperature in location specified
     *
     * @param NULL
     * @return array
     */
	public function current($location) {
		$url = 'http://api.openweathermap.org/data/2.5/weather?q=' . $location . ',us&appid=44f0098368cd5cdfb8de2b606e5936b5';
		$data = $this->requestHelper->processQuery('GET', $url);
		return "the temperature is " . $this->k_to_f($data->main->temp) . " degrees fahrenheit and it is " .  $data->weather[0]->description . ".";
	}

	/**
     * Get forecast for location specified
     *
     * @param NULL
     * @return array
     */
	public function forecast($location) {
		$url = 'http://api.openweathermap.org/data/2.5/forecast?q=' . $location . ',us&appid=44f0098368cd5cdfb8de2b606e5936b5';
		$data = $this->requestHelper->processQuery('GET', $url);
		print_R($data);
	}

	/**
     * Convert Kelvin to Fahrenheit
     *
     * @param NULL
     * @return array
     */
	function k_to_f($temp) {
	    if ( !is_numeric($temp) ) {
	    	return false;
	    }

	    return round((($temp - 273.15) * 1.8) + 32);
	}

}
