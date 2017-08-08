<?php namespace App\Services;

use App\Formatters\DateFormatter;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ConnectException;

class TimeService {

	/**
     * get current time (formatted)
     *
     * @param NULL
     * @return array
     */
	public function current() {
		$dt = new \DateTime();
		$current = $dt->format('h:i a');
		return ltrim($current, '0');
	}

}
