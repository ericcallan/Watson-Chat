<?php namespace App\Http\Controllers;

use App\Services\MBTAService;
use Session;

class MBTAController extends Controller {

    /**
     * Constructor methods
     *
     * @param  int  $id
     * @return Response
     */
    public function __construct() {
    }

    /**
     * Fetch the next silverline stops
     *
     * @param  int  $id
     * @return Response
     */
    public function mbta(MBTAService $mbtaservice) {
        return response()->json($mbtaservice->getSilverLine(), 200);
    }
}
