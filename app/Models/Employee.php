<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Employee extends Authenticatable
{
	protected $fillable = array('first_name', 'last_name', 'email', 'about', 'college', 'major', 'hometown', 'title', 'photo', 'name');
}
