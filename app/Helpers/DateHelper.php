<?php
namespace App\Helpers;


Class DateHelper {

    /**
     *
     * Formats seconds into minutes
     *
     * @param NULL
     * @return array
     */
    public function formatMinutes($seconds) {
    	return floor($seconds / 60);
	}

}
