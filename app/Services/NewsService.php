<?php namespace App\Services;

use App\Helpers\DateHelper;
use App\Helpers\RequestHelper;

class NewsService {

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
     * fetch next silver line
     *
     * @param NULL
     * @return array
     */
	public function getArticles() {
		$dateHelper = new DateHelper();
		$data =$this->requestHelper->processQuery('GET', 'http://api.nytimes.com/svc/topstories/v1/home.json?api-key=7d99e86b4cfee06ddc62bbb173915433:14:74804538');

		$titles = [];
		foreach($data->results as $result) {
			array_push($titles, $result->title);
		}

		$key = array_rand($titles);

		if(!preg_match("/[0-9.!?,;:]$/",$titles[$key])) {
			return "Here's a popular article from the New York Times: " . $titles[$key] . ".";
		} else {
			return "Here's a popular article from the New York Times: " . $titles[$key];
		}
	}
}
