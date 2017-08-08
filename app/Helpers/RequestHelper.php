<?php
namespace App\Helpers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ConnectException;

Class RequestHelper {

	/**
     * Perform query against MBTA
     *
     * @param NULL
     * @return array
     */
	public function processQuery($method, $endpoint) {
    	$data = [];
    	$client = new Client();

		try {
			$res = $client->request($method, $endpoint);
			$data = json_decode($res->getBody());
		} catch(ConnectException $e) {
			echo $e->getMessage();
		}

		return $data;
	}
}
