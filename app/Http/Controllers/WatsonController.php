<?php namespace App\Http\Controllers;

use App\Http\Requests\WatsonRequest;
use App\Services\WatsonService;
use Session;
use Illuminate\Http\Request;

class WatsonController extends Controller {

	protected $watsonService;

	/**
     * Constructor methods
     *
     * @param  int  $id
     * @return Response
     */
	public function __construct() {
		$this->watsonService = new WatsonService;
	}

	/**
     * Return welcome default view
     *
     * @param  int  $id
     * @return Response
     */
	public function index() {
		return view('watson/index');
	}

	/**
     * Converses w. Watson
     *
     * @param  WatsonRequest $request
     * @return Response
     */
	public function processRequest(WatsonRequest $request) {
		$response = $this->watsonService->converse($request->input('search'), $request);
		return response()->json($response, 200);
	}

	/**
     * Create a new Watson XML doc
     *
     * @param  null
     * @return Response
     */
	public function buildXML(Request $request) {
		return response()->json($this->watsonService->buildXML($request), 200);
	}

	/**
     * Fetch all watson XML docs
     *
     * @param  null
     * @return Response
     */
	public function fetch() {
		return response()->json($this->watsonService->fetch(), 200);
	}

	/**
     * Delete specific watson XML
     *
     * @param  int  $id
     * @return Response
     */
	public function delete($id) {
		return response()->json($this->watsonService->delete($id), 200);
	}

     /**
     * convert and Upload audio file to server
     *
     * @param  Request request
     * @return Response
     */
     public function upload(Request $request) {
          $data = $this->watsonService->speechToText($request->input('data'));
          return response()->json($data, 200);
     }

     /**
     * Convert speed to text
     *
     * @param  WatsonRequest $request
     * @return Response
     */
     public function textToSpeech() {
          $response = $this->watsonService->textToSpeech();
          return response()->json($response, 200);
     }


     /**
     * Convert speed to text
     *
     * @param  WatsonRequest $request
     * @return Response
     */
     public function speechToText() {
          $response = $this->watsonService->speechToText();
          return response()->json($response, 200);
     }
}
