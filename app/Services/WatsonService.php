<?php namespace App\Services;

use App\Services\XMLService;
use App\Services\MBTAService;
use App\Services\WeatherService;
use App\Services\TimeService;
use App\Services\NewsService;
use App\Helpers\PSDataHelper;
use App\Models\Employee;

class WatsonService {

	protected $conversationArray;

    /**
     * Perform query against MBTA
     *
     * @param NULL
     * @return array
     */
	public function __construct() {
		$this->conversationArray = [];
		$this->conversationArray['hometown'] = [];
		$this->conversationArray['hometown']['pronoun'] = false;
		$this->conversationArray['hometown']['negative'] = "I'm not sure where %sex% is from.";
		$this->conversationArray['hometown']['positive'] = '%sex% is from %data%.';

		$this->conversationArray['title'] = [];
		$this->conversationArray['title']['pronoun'] = true;
		$this->conversationArray['title']['negative'] = "I'm not sure what %sex%'s title is.";
		$this->conversationArray['title']['positive'] = '%sex% title is %data%.';

		$this->conversationArray['college'] = [];
		$this->conversationArray['college']['pronoun'] = false;
		$this->conversationArray['college']['negative'] = '%sex% went to %data%.';
		$this->conversationArray['college']['positive'] = "I'm not sure where %sex% went to school.";

	}

    /**
     * Perform query against MBTA
     *
     * @param NULL
     * @return array
     */
	public function converse($data, $request) {
		$curl = curl_init();

		if($request->session()->has('client_id') && $request->session()->has('conversation_id')){
			$post_args = array(
				'input' => $data,
				'conversation_id' => $request->session()->get('conversation_id'),
				'client_id' => $request->session()->get('client_id')
			);
		} else {
			$post_args = array(
				'input' => $data
			);
		}

		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($post_args));
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($curl, CURLOPT_USERPWD, "40c47248-1485-4d1a-809c-100a216bdee2:XsOlItXUVxIq");
		curl_setopt($curl, CURLOPT_URL,"https://gateway.watsonplatform.net/dialog/api/v1/dialogs/828fe678-914a-46b8-8271-1a250cc143f2/conversation");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Accept: application/json"));
		$json = curl_exec($curl);

		curl_close($curl);

		$result = json_decode($json);
		$request->session()->set('client_id', $result->client_id);
		$request->session()->set('conversation_id', $result->conversation_id);

		$custom = false;
		if (substr($result->response[0], 0, 1) === '_') {
			$custom = true;
			$watsonData = explode("_", $result->response[0]);
			$category = $watsonData[1];
			$question = $watsonData[2];
			$name = $watsonData[3];

			if($category == 2) {
				$response = $this->mbtaTranslation();
			} elseif($category == 3) {
				$response = $this->weatherTranslation();
			} elseif($category == 4) {
				$response = $this->newsTranslation();
			} elseif($category == 5) {
				$response = $this->timeTranslation();
			}
		}

		$text = '';
		$data = new \StdClass;
		$data->conversation_id = $result->conversation_id;
		$data->client_id = $result->client_id;
		$data->input = $result->input;
		$data->response = [];

		if($custom == true) {
			if(count($result->response) > 1) {
				$data->response[0] = $response;

				foreach($result->response as $key => $value) {
					if($key != 0) {
						array_push($data->response, $value);
					}
				}
			}
		} else {
			foreach($result->response as $value) {
				array_push($data->response, $value);
			}
		}

		$text = implode(' ' , $data->response);
		$data->audio = $this->textToSpeech($text);

		return json_encode($data);
	}

    /**
     * get employee data
     *
     * @param request
     * @return json
     */
	private function employeeDataTranslation($employee, $question) {

		if($question == 1) {
			$topic = 'title';
		} elseif( $question == 2) {
			$topic = 'college';
		} elseif( $question == 3) {
			$topic = 'hometown';
		}

		if($employee->$topic == '') {
			$string = $this->conversationArray[$topic]['negative'];
		} else {
			$string = $this->conversationArray[$topic]['positive'];
		}

		if($employee->sex == 'm') {
			if($this->conversationArray[$topic]['pronoun'] == true) {
				$string = str_replace('%sex%', 'his', $string);
			} else {
				$string = str_replace('%sex%', 'he', $string);
			}
		} else {
			if($this->conversationArray[$topic]['pronoun'] == true) {
				$string = str_replace('%sex%', 'her', $string);
			} else {
				$string = str_replace('%sex%', 'she', $string);
			}
		}

		$string = str_replace('%data%', $employee->$topic, $string);
		return ucfirst($string);
	}

    /**
     * get mbta data
     *
     * @param request
     * @return json
     */
	private function mbtaTranslation() {
		$MBTAService = new MBTAService();
		$data = $MBTAService->getSilverLine();


		if($data[0] == 0) {
			$next = $data[1];
		} else {
			$next = $data[0];
		}

		if($next == 1) {
			$min = "minute, better run!";
		} else {
			$min = "minutes.";
		}

		$string = "the next silverline train arrives in " . $data[0] . ' ' . $min;
		return ucfirst($string);
	}

    /**
     * get weather data
     *
     * @param request
     * @return json
     */
	private function weatherTranslation() {
		$weatherService = new WeatherService();
		$string = $weatherService->current('Boston');

		return ucfirst($string);
	}

    /**
     * get latest news
     *
     * @param request
     * @return json
     */
	private function newsTranslation() {
		$newsService = new NewsService();
		$string = $newsService->getArticles();

		return ucfirst($string);
	}

    /**
     * get current local time
     *
     * @param request
     * @return json
     */
	private function timeTranslation() {
		$time = new TimeService();
		$current = $time->current();

		return "the current time is " . $current . " in Boston, Massachusetts.";
	}

    /**
     * Serve XML data to Watson
     *
     * @param request
     * @return json
     */
	public function buildXML($request) {
		$xml = new XMLService();
		$xml->buildXML();

		// $data = json_decode($this->fetch());

		// foreach($data->dialogs as $dialog) {
		// 	$this->delete($dialog->dialog_id);
		// }

		$cfile = curl_file_create('generated/xml/data.xml');

		$post_args = array(
			'file' => $cfile,
			'name' => 'data'
		);

		$curl = curl_init();

		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $post_args);
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($curl, CURLOPT_USERPWD, "40c47248-1485-4d1a-809c-100a216bdee2:XsOlItXUVxIq");
		curl_setopt($curl, CURLOPT_URL,"https://gateway.watsonplatform.net/dialog/api/v1/dialogs");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: multipart/form-data","boundary=----WebKitFormBoundaryzeZR8KqAYJyI2jPL"));

		$json = curl_exec($curl);

		curl_close($curl);

		$request->session()->forget('client_id');
		$request->session()->forget('conversation_id');

		echo $json;
		die;
		return json_decode($json)->dialog_id;
	}

    /**
     * convert text to speech via Watson
     *
     * @param text
     * @return String
     */
	public function textToSpeech($text) {
		$data = [];
		$data['text'] = $text;

		$curl = curl_init();

		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($curl, CURLOPT_USERPWD, "97b7494e-f38a-4b10-ad94-606bf1923356:uQsvbR7wijkp");
		curl_setopt($curl, CURLOPT_URL,"https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: application/json","Accept: audio/wav"));

		$response = curl_exec($curl);

		$filename = "tmp". time() . ".wav";
		$file = fopen('generated/t2s/' .$filename, "w+");

		fwrite($file, $response);
		curl_close($curl);
		fclose($file);

		return $filename;
	}

    /**
     * Convert speech to text
     *
     * @param NULL
     * @return array
     */
	public function speechToText($input) {
		$data = str_replace('data:audio/wav;base64,', '', $input);
		$decodedData = base64_decode($data);

		$file = fopen('generated/s2t/data.wav', 'wb');
		fwrite($file, $decodedData);
		$size = filesize('generated/s2t/data.wav');
		$filedata = fread($file,$size);
		fclose($file);

		$post_str = file_get_contents('generated/s2t/data.wav');
		$headers = array("Content-Type: audio/wav", "Transfer-Encoding: chunked");

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_URL, 'https://stream.watsonplatform.net/speech-to-text/api/v1/recognize?continuous=true');
		curl_setopt($ch, CURLOPT_USERPWD, "b511623d-55f6-41ec-81bc-2f2afe26210b:o477sQYbla3W");
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post_str);
		curl_setopt($ch, CURLOPT_BINARYTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch,CURLOPT_VERBOSE,true);
		$executed = curl_exec($ch);

		$executed = json_decode($executed);

		if(isset($executed->results[0]->alternatives[0]->transcript)) {
			return trim($executed->results[0]->alternatives[0]->transcript,'"');
		} else {
			return '';
		}

	}

    /**
     * fetch all dialog ids
     *
     * @param NULL
     * @return array
     */
	public function fetch() {
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($curl, CURLOPT_USERPWD, "40c47248-1485-4d1a-809c-100a216bdee2:XsOlItXUVxIq");
		curl_setopt($curl, CURLOPT_URL,"https://gateway.watsonplatform.net/dialog/api/v1/dialogs");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$json = curl_exec($curl);

		return $json;
	}

    /**
     * delete specified dialog id
     *
     * @param NULL
     * @return array
     */
	public function delete($id) {
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($curl, CURLOPT_USERPWD, "40c47248-1485-4d1a-809c-100a216bdee2:XsOlItXUVxIq");
		curl_setopt($curl, CURLOPT_URL,"https://gateway.watsonplatform.net/dialog/api/v1/dialogs/" . $id);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: multipart/form-data","boundary=----WebKitFormBoundaryzeZR8KqAYJyI2jPL"));

		$json = curl_exec($curl);
		curl_close($curl);
	}

}
