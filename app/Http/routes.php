<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/




/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/
Route::group(['middleware' => ['web']], function () {

    Route::get('/', 'WatsonController@index');
    Route::post('/', 'WatsonController@processRequest');

    Route::get('/build', 'WatsonController@buildXML');
    Route::get('/fetch', 'WatsonController@fetch');
    Route::get('/delete/{id}', 'WatsonController@delete');

    Route::get('/texttospeech', 'WatsonController@textToSpeech');
    Route::get('/speechtotext', 'WatsonController@speechToText');
    Route::post('/uploads', 'WatsonController@upload');

    /* General API calls */
    Route::get('/mbta', 'MBTAController@mbta');
    Route::get('/weather', 'WeatherController@index');
    Route::get('/forecast', 'WeatherController@forecast');
    Route::get('/employees', 'EmployeeController@populate');
    Route::get('/ews', "EWSController@index");
    Route::post('/popcorn', 'EmployeeController@popcornCheck');
    Route::get('/popcorn', 'EmployeeController@runJob');
});
