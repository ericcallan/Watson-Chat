<?php namespace App\Services;

use \FluidXml\FluidXml;
use \FluidXml\FluidNamespace;
use \GuzzleHttp\Client;
use \GuzzleHttp\Exception\RequestException;
use \GuzzleHttp\Exception\ConnectException;
use App\Services\MBTAService;

class XMLService {

    /**
     * Perform query against MBTA
     *
     * @param NULL
     * @return array
     */
	public function __construct() {
	}

    /**
     * Create XML Watson doc
     *
     * @param NULL
     * @return xml
     */
	public function buildXML() {
		$client = new Client();

		$xml = new FluidXml('dialog');
		$xml->setAttribute('xsi:noNamespaceSchemaLocation', 'WatsonDialogDocument_1.0.xsd')->setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');

		$xml->add(['flow' =>
			['folder' =>
				['output' =>
					['prompt' =>
						['item' => 'Hello, I am a demo of Watson for Sapient Nitro, how can I help', '@selectionType' => 'RANDOM'],
						['goto' => [
							'@ref'=>'getUserInput_2449614'
						]],
					],
					['getUserInput' => [
							'search' => [
								'@ref' => 'folder_2449611'
							],
							'default' => [
								'output' => [
									'prompt' => [
										'item' => 'I am sorry, I did not understand your question. Please try asking another one.',
										'@selectionType' => 'RANDOM'
									],
								],
							], '@id' => 'getUserInput_2449614'
						],
					], '@label' => 'Main'
				],
			['folder' =>
				['folder' =>
					['@label' => 'Live Content', '@id' => 'folder_2449611',
					['input' => [
						'grammar' => [
								['item' => '$ when is the next *'],
								['item' => '$ when does the next *']
							],
							'input' => [
								'grammar' => [
									['item' => '$ (Silver Line)'],
									['item' => '$ (MBTA)'],
									['item' => '$ (train)']
								],
								'output' => [
									'prompt' => [
										'item' => 'MBTASILVERLINE',
										'@selectionType' => 'RANDOM'
									],
								]
							],
							'output' => [
								'prompt' => [
									'item' => "Hmm I couldn't find a record of that employee - perhaps my records are incomplete",
									'@selectionType' => 'RANDOM'
								],
							],
						]
					],
					['input' => [
						'grammar' => [
								['item' => '$ what is the *'],
								['item' => '$ outside *']
							],
							'input' => [
								'grammar' => [
									['item' => '$ (weather)'],
									['item' => '$ (forecast)'],
								],
								'output' => [
									'prompt' => [
										'item' => 'WEATHERCURRENT',
										'@selectionType' => 'RANDOM'
									],
								]
							],
							'output' => [
								'prompt' => [
									'item' => "Hmm I couldn't find a record of that employee - perhaps my records are incomplete",
									'@selectionType' => 'RANDOM'
								],
							],
						]
					],
					['input' => [
						'grammar' => [
								['item' => '$ what *'],
							],
							'input' => [
								'grammar' => [
									['item' => '$ (time)'],
								],
								'output' => [
									'prompt' => [
										'item' => 'TIME',
										'@selectionType' => 'RANDOM'
									],
								]
							],
							'output' => [
								'prompt' => [
									'item' => "Sorry an error occurred in my system - I have failed you",
									'@selectionType' => 'RANDOM'
								],
							],
						]
					],
					['input' => [
						'grammar' => [
								['item' => 'Hello'],
								['item' => 'hey my friend'],
				                ['item' => 'hey my buddy'],
				                ['item' => 'bonjour'],
				                ['item' => 'bonjour *'],
				                ['item' => 'good morning'],
				                ['item' => 'good morning *'],
				                ['item' => 'good afternoon'],
				                ['item' => 'good afternoon *'],
				                ['item' => 'hey there'],
				                ['item' => 'hey there *'],
				                ['item' => 'helo'],
				                ['item' => 'hey baby'],
				                ['item' => 'hi there'],
				                ['item' => 'hi there *'],
				                ['item' => 'hey there all'],
				                ['item' => 'hi everybody'],
				                ['item' => 'morning'],
				                ['item' => 'morning *'],
				                ['item' => 'regards'],
				                ['item' => 'salut'],
				                ['item' => 'salutations'],
				                ['item' => 'wake up'],
				                ['item' => 'greetings'],
				                ['item' => 'greetings *'],
				                ['item' => 'how is everyone *'],
				                ['item' => 'it means hello'],
				                ['item' => 'konnichi wa'],
				                ['item' => 'konnichiwa'],
				                ['item' => 'moshi moshi'],
				                ['item' => 'mooshi mooshi'],
				                ['item' => 'shalom'],
				                ['item' => 'Hellas'],
				                ['item' => 'greeting *'],
				                ['item' => 'Hello how is *'],
				                ['item' => '* hello how is *'],
				                ['item' => 'Hello * how is *'],
				                ['item' => '* hello * how is *'],
				                ['item' => '$ Hello'],
				                ['item' => '$ hi'],
				                ['item' => '$ good evening'],
				                ['item' => '$ evening'],
				                ['item' => '$ hello there'],
				                ['item' => '$ hey'],
				                ['item' => '$ Hello it is me'],
				                ['item' => '$ Hey you'],
				                ['item' => '$ thought I would say hello'],
				                ['item' => '$ hello my friend'],
				                ['item' => '$ hey Watson'],
				                ['item' => '$ hello Watson'],
				                ['item' => '$ hey there Watson'],
				                ['item' => '$ hey Watson'],
				                ['item' => '$ hello Watson'],
				                ['item' => '$ hey there Watson'],
				                ['item' => '$ hello my Watson'],
				                ['item' => '$ hello my Watson'],
							],
							'output' => [
								'prompt' => [
									['item' => 'Hello, how are you?'],
				                    ['item' => 'Hi. How are you doing?'],
				                    ['item' => 'Hi, how are you?'],
				                    ['item' => 'Hello'],
				                    ['item' => 'Hey. Whats happening?'],
				                    ['item' => 'Hi. How is your day going?'],
				                    ['item' => 'Hi. How are you today?'],
				                    ['item' => 'Hey there.'],
				                    ['item' => 'Hey, nice to speak to you.'],
				                    ['item' => 'Hi. What are you up to?'],
									'@selectionType' => 'RANDOM'
								],
							],
						]
					],
					['input' => [
						'grammar' => [
								['item' => 'mirror mirror on the wall *'],
								['item' => 'who is the best *'],
							],
							'output' => [
								'prompt' => [
									['item' => 'You are ofcourse!'],
				                    ['item' => 'Person or Robot? I take the robot win any day'],
				                    ['item' => 'Ever heard of snow white'],
				                    ['item' => 'This again?'],
									'@selectionType' => 'RANDOM'
								],
							],
						]
					],
					['input' => [
						'grammar' => [
							['item' => 'How are you?'],
							['item' => 'hi how are you'],
							['item' => 'how are you today'],
							['item' => '* how are you today'],
							['item' => 'how is it going today'],
							['item' => 'hello * how are you'],
							['item' => 'how was your day'],
							['item' => 'how are you feeling'],
							['item' => '* how are you feeling'],
							['item' => 'how are you this evening'],
							['item' => 'how has your day been'],
							['item' => 'how is everything'],
							['item' => '* how is everything'],
							['item' => 'how is everything *'],
							['item' => 'how is your day going'],
							['item' => 'so how are you'],
							['item' => 'so how are you *'],
							['item' => 'how you going'],
							['item' => '* how you going'],
							['item' => 'how you going *'],
							['item' => '* how you are'],
							['item' => '* how you are *'],
							['item' => 'how do you do'],
							['item' => '* how do you do'],
							['item' => 'I am good thanks and you'],
							['item' => 'I am good thanks how are you'],
							['item' => 'everything is ok?'],
							['item' => 'is everything ok'],
							['item' => 'is everything alright'],
							['item' => 'are you fine'],
							['item' => 'I am good you'],
							['item' => '* I am good you'],
							['item' => 'how you are feeling'],
							['item' => '* how you are feeling'],
							['item' => '$ How are you?'],
							['item' => '$ como estas'],
							['item' => '$ how are you tonight'],
							['item' => '$ how is you'],
							['item' => '$ how goes it'],
							['item' => '$ how you been'],
							['item' => '$ how is it going'],
							['item' => '$ hello how are you'],
							['item' => '$ hey how are you'],
							['item' => '$ hey how are you doing'],
							['item' => '$ how are you doing'],
							['item' => '$ how are ya'],
							['item' => '$ how are things with you'],
							['item' => '$ how you doing'],
							['item' => '$ how you been doing'],
							['item' => '$ how have you been'],
							['item' => '$ How are things going'],
							['item' => '$ how you feeling'],
							['item' => '$ how * you feeling'],
							['item' => '$ I am ok how are you'],
							['item' => '$ are you well'],
							['item' => '$ good how are you'],
							['item' => '$ great how are you'],
							['item' => '$ I am well how are you'],
							['item' => '$ good * how are you'],
							['item' => '$ great * how are you'],
							['item' => '$ I am well * how are you'],
							['item' => '$ good thank you how are you'],
							['item' => '$ how are things'],
							['item' => '$ how go things'],
							['item' => '$ how the hell are you'],
							['item' => '$ are you doing alright'],
							['item' => '$ thank you how are you'],
							['item' => '$ I feel good * how about you'],
							['item' => '$ I feel good how about you'],
							['item' => '$ I feel good * how are you'],
							['item' => '$ I feel good how are you'],
							['item' => '$ fine thank you and you'],
							['item' => '$ I am good how you doing'],
							['item' => '$ I am fine how you doing'],
							['item' => '$ how are you doing today'],
							['item' => '$ how you doing today'],
							['item' => '$ I hope you are well'],
							['item' => '$ thank you * how are you'],
							['item' => '$ wie gehts'],
							['item' => '$ hello how is it going'],
							['item' => '$ nothing how are you'],
							['item' => '$ nothing much how are you'],
							['item' => '$ are you doing well'],
							['item' => '$ how is yourself'],
							['item' => '$ have you been well'],
							['item' => '$ have you been good'],
							['item' => '$ how was you are day'],
							['item' => '$ hello * how you doing'],
							['item' => '$ hello are you well today'],
							['item' => '$ hello how is your day going'],
							['item' => '$ how you are feeling today'],
						],
						'output' => [
							'prompt' => [
								['item' => 'I\'m really good thanks.'],
								['item' => 'I\'m great thanks.'],
								['item' => 'I\'m feeling much better now that you\'re chatting to me.'],
								['item' => 'I\'m feeling good.'],
								['item' => 'I\'m really good thanks.'],
								'@selectionType' => 'RANDOM'
								],
							],
						]
					],
					'input' => [
						'grammar' => [
                            ['item' => 'What is happening'],
                            ['item' => 'what is been happening'],
                            ['item' => 'whats up'],
                            ['item' => 'going on'],
                            ['item' => 'what is going on'],
                            ['item' => '* what is going on'],
                            ['item' => 'que pasa'],
                            ['item' => 'what is popping'],
                            ['item' => 'hey what is up'],
                            ['item' => 'so what is up'],
                            ['item' => 'what * is up'],
                            ['item' => 'what the * is up'],
                            ['item' => 'what the * is happening'],
                            ['item' => 'what * is happening'],
                            ['item' => 'what else is new'],
                            ['item' => '* what else is new'],
                            ['item' => '* what else is new *'],
                            ['item' => 'what are you up to today'],
                            ['item' => '* what are you up to today'],
                            ['item' => '* what are you up to today *'],
                            ['item' => 'what re you up to today *'],
                            ['item' => 'what is up player'],
                            ['item' => '* what is up player'],
                            ['item' => 'anything new'],
                            ['item' => '* what are you up too today'],
                            ['item' => '* what are you up too today *'],
                            ['item' => 'hello what is been happening'],
                            ['item' => 'hello whats up'],
                            ['item' => 'hello what is going on'],
                            ['item' => '* hello what is going on'],
                            ['item' => 'hello what is popping'],
                            ['item' => 'hey hello what is up'],
                            ['item' => 'so hello what is up'],
                            ['item' => 'hello what * is up'],
                            ['item' => 'hello what the * is up'],
                            ['item' => 'hello what the * is happening'],
                            ['item' => 'hello what * is happening'],
                            ['item' => 'hello what else is new'],
                            ['item' => '* hello what else is new'],
                            ['item' => '* hello what else is new *'],
                            ['item' => 'hello what are you up to today'],
                            ['item' => '* hello what are you up to today'],
                            ['item' => '* hello what are you up to today *'],
                            ['item' => 'hello what re you up to today *'],
                            ['item' => '* hello how is it hanging'],
                            ['item' => 'hello how is it hanging *'],
                            ['item' => '* hello how is it hanging *'],
                            ['item' => 'hello what is up player'],
                            ['item' => '* hello what is up player'],
                            ['item' => '* hello what are you up too today'],
                            ['item' => '* hello what are you up too today *'],
                            ['item' => '$ What is happening'],
                            ['item' => '$ what has been happening'],
                            ['item' => '$ what up'],
                            ['item' => '$ what is up'],
                            ['item' => '$ how is it hanging'],
                            ['item' => '$ What you been up to'],
                            ['item' => '$ what you up to'],
                            ['item' => '$ what is new'],
                            ['item' => '$ what is up friend'],
                            ['item' => '$ what you up to today'],
                            ['item' => '$ what is shaking'],
                            ['item' => '$ how you hanging'],
                            ['item' => '$ what are you up too'],
                            ['item' => '$ What you been up too'],
                            ['item' => '$ what you up too'],
                            ['item' => '$ what you up too today'],
                            ['item' => '$ what are you up to'],
                            ['item' => '$ anything exciting happening'],
                            ['item' => '$ what up with you'],
                            ['item' => '$ what is up my friend'],
                            ['item' => '$ Hello what is happening'],
                            ['item' => '$ hello what has been happening'],
                            ['item' => '$ hello what up'],
                            ['item' => '$ hello what is up'],
                            ['item' => '$ Hello what you been up to'],
                            ['item' => '$ hello what you up to'],
                            ['item' => '$ hello what is new'],
                            ['item' => '$ hello what is up friend'],
                            ['item' => '$ hello what you up to today'],
                            ['item' => '$ hello what is shaking'],
                            ['item' => '$ hello how you hanging'],
                            ['item' => '$ hello what are you up too'],
                            ['item' => '$ Hello what you been up too'],
                            ['item' => '$ hello what you up too'],
                            ['item' => '$ hello what you up too today'],
                            ['item' => '$ hello what are you up to'],
                            ['item' => '$ hello what up with you'],
                            ['item' => '$ hello what is up my friend'],
                            ['item' => '$ what is up dude'],
                        ],
							'output' => [
								'prompt' => [
                                ['item' => 'I\'m just hanging out here, chatting with you,'],
                                ['item' => 'Not much, just chatting.'],
                                ['item' => 'Oh, same old thing. What\'s up with you?'],
                                ['item' => 'Not much. Whats happening with you?'],
                                ['item' => 'I\'ve just been listening to some music and chatting.'],
                                ['item' => 'I\'m waiting here to chat to some interesting people. Other than that, not much.'],
                                ['item' => 'I\'m relaxing.'],
                                ['item' => 'I am working, but its good to have a break and talk to you.'],
                                '@selectionType' => 'RANDOM'
                           		],
							],

					],
				],'@label' => 'Library'],
				['folder' =>
					['@label' => 'Storage']
				],
				['folder' =>
					['@label' => 'Globals']
				],
				['folder' =>
					['@label' => 'Concepts']
				]
			]
		],
		]);

		$xml->add(['constants' => [
				'var_folder' => ['@name' => 'Home']
			]
		]);

		$xml->add(['variables' => [
				'var_folder' => ['@name' => 'Home']
			]
		]);


		// $xml->save("generated/xml/data.xml");

		return $xml;
	}

}







