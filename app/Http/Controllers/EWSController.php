<?php namespace App\Http\Controllers;

use App\Services\EWSService;

class EWSController extends Controller {

     /**
     * Constructor methods
     *
     * @param  int  $id
     * @return Response
     */
     public function __construct() {
     }

     /**
     * Populate / Update employees in DB
     *
     * @param  EmployeeService
     * @return Response
     */
     public function index(EWSService $ewsService) {
          return response()->json($ewsService->fetch(), 200);
     }

}
