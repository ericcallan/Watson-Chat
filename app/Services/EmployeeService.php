<?php namespace App\Services;

use App\Helpers\DateHelper;
use App\Helpers\RequestHelper;
use App\Models\Employee;
use Twilio\Services\Twilio;

class EmployeeService {

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
	public function populate() {
		$data = $this->requestHelper->processQuery('GET', '/feed.json');

		foreach($data as $employee) {
			$profile = $employee->profile;

			$employee = Employee::firstOrNew(['name' => $profile->name]);
			$employee->name = $profile->name;
			$employee->first_name = $profile->firstName;
			$employee->last_name = $profile->lastName;
			$employee->about = $profile->bio->blurb;
			$employee->college = $profile->bio->college;
			$employee->major = $profile->bio->major;
			$employee->hometown = $profile->bio->hometown;
			$employee->title = $profile->jobTitle;
			$employee->photo = $profile->photos->photoUrl;
			$employee->email = $profile->email;

			$employee->save();
		}

		return true;
	}

	/**
     * save employee popcorn notification servce
     *
     * @param NULL
     * @return array
     */
	public function popcornCheck($request) {
		$email = $request->input('email');
		$phone = $request->input('phone');

		$employee = Employee::where('email', '=', $email)->first();

		if(empty($employee)) {
			$employee = new Employee;
			$employee->email = $email;
		}

		$employee->phone = $phone;
		$employee->popcorn = true;
		if($employee->save()) {
			return true;
		}


		return false;
	}

	public function textEmployees($message) {
		$employees = Employee::where('popcorn', '=', true)->get();
		foreach($employees as $employee) {
			$phone = $employee->phone;
			$twilio = new \Aloha\Twilio\Twilio('AC6f14a4b6f7e4551bd2d82c2dd648668b', '04bf276f86a5988c1e2dce247d017362', '7815235207');

			try {
				$twilio->message($phone, 'Popcorn is Ready! Come and get it! Reply STOP to unsubscribe');
			} catch(\Services_Twilio_RestException $e) {
				error_log($employee->name . " has unsubscribed");
			}
		}
	}
}
