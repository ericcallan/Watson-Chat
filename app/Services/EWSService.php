<?php namespace App\Services;

use App\Helpers\DateHelper;
use App\Helpers\RequestHelper;
use App\Models\Employee;
use PhpEws\EwsConnection;
use PhpEws\DataType\FindItemType;
use PhpEws\DataType\ItemResponseShapeType;
use PhpEws\DataType\DefaultShapeNamesType;
use PhpEws\DataType\BodyTypeResponseType;
use PhpEws\DataType\NonEmptyArrayOfBaseFolderIdsType;
use PhpEws\DataType\DistinguishedFolderIdType;
use PhpEws\DataType\DistinguishedFolderIdNameType;
use PhpEws\DataType\ItemQueryTraversalType;
use PhpEws\DataType\FindItemResponseMessageType;
use PhpEws\DataType\GetItemType;
use PhpEws\DataType\ItemResponseShapeType;
use PhpEws\DataType\DefaultShapeNamesType;
use PhpEws\DataType\ItemIdType;

class EWSService {

	protected $requestHelper;

	protected $server = '';
	protected $username = '';
	protected $password = '';


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
     * construct
     *
     * @param NULL
     * @return array
     */
	public function fetch() {
		return $this->getAllEmail();
	}

	/**
     * get all emails for specified user
     *
     * @param NULL
     * @return array
     */
	public function getAllEmail()
	{
	    $ews = new EwsConnection($this->server, $this->username, $this->password);

		$request = new FindItemType();
		$itemProperties = new ItemResponseShapeType();
		$itemProperties->BaseShape = DefaultShapeNamesType::ID_ONLY;
		$itemProperties->BodyType = BodyTypeResponseType::TEXT;
		$request->ItemShape = $itemProperties;

		$request->ParentFolderIds = new NonEmptyArrayOfBaseFolderIdsType();
		$request->ParentFolderIds->DistinguishedFolderId = new DistinguishedFolderIdType();
		$request->ParentFolderIds->DistinguishedFolderId->Id = DistinguishedFolderIdNameType::INBOX;

		$request->Traversal = ItemQueryTraversalType::SHALLOW;

		$result = new FindItemResponseMessageType();
		$result = $ews->FindItem($request);
		print_r($result);
		die;
		if ($result->ResponseMessages->FindItemResponseMessage->ResponseCode == 'NoError' && $result->ResponseMessages->FindItemResponseMessage->ResponseClass == 'Success') {
		    $count = $result->ResponseMessages->FindItemResponseMessage->RootFolder->TotalItemsInView;
		    $request = new GetItemType();
		    $request->ItemShape = new ItemResponseShapeType();
		    $request->ItemShape->BaseShape = DefaultShapeNamesType::ALL_PROPERTIES;
		    for ($i = 0; $i < 200; $i++){
		        $message_id = $result->ResponseMessages->FindItemResponseMessage->RootFolder->Items->Message[$i]->ItemId->Id;

		        $messageItem = new ItemIdType();
		        $messageItem->Id = $message_id;
		        $request->ItemIds->ItemId[] = $messageItem;

		    }

		    // Here is your response
		    $response = $ews->GetItem($request);
		    foreach($response->ResponseMessages->GetItemResponseMessage as $email) {
		    	echo $email->Items->Message->Subject . "<br/>";
		    }
		}
	}
}
