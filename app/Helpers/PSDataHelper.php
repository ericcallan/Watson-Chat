<?php
namespace App\Helpers;


Class PSDataHelper {

	protected $employeeArray = [
		'EricCallan' => '../ericcallan.jpg',
	 ];

    /**
     *
     * Formats seconds into minutes
     *
     * @param NULL
     * @return array
     */
    public function getEmployeePics() {
    	return $this->employeeArray;
	}

}
