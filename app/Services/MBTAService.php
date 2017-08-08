<?php namespace App\Services;

use App\Helpers\DateHelper;
use App\Helpers\RequestHelper;

class MBTAService {

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
	public function getSilverLine() {
		$dateHelper = new DateHelper();
		$data = $this->requestHelper->processQuery('GET', 'http://realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=wX9NwuHnZU2ToO7GmGR9uw&stop=place-bbsta&format=json');
		$stopData = [];

		print_R($data);
		die;
		if(!empty($data)) {
			foreach($data->mode as $mode) {
				foreach($mode->route as $route){
					foreach($route->direction as $direction) {
						if($direction->direction_id == 1) {
							foreach($direction->trip as $trip) {
								array_push($stopData, $dateHelper->formatMinutes($trip->pre_away));
							}
						}
					}
				}
			}
		}

		return $stopData;
	}
}
