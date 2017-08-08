<?php namespace App\Http\Controllers;

use App\Services\EmployeeService;
use Illuminate\Http\Request;

class EmployeeController extends Controller {

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
     public function populate(EmployeeService $employeeService) {
          return response()->json($employeeService->populate(), 200);
     }

     /**
     * Populate / Update employees in DB
     *
     * @param  EmployeeService
     * @return Response
     */
     public function popcornCheck(EmployeeService $employeeService, Request $request) {
          $employeeService->popcornCheck($request);
     }

     /**
     * Populate / Update employees in DB
     *
     * @param  EmployeeService
     * @return Response
     */
     public function runJob(EmployeeService $employeeService) {
          $employeeService->textEmployees("hi!");
     }

}
