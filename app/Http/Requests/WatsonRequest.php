<?php namespace App\Http\Requests;

class WatsonRequest extends Request {

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'search' => 'required|max:100',
		];
	}

	public function authorize()
    {
        return true;
    }

}
