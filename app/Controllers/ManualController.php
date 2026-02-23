<?php

namespace App\Controllers;

use App\Core\BaseWebController;

class ManualController extends BaseWebController
{

    public function __construct() {}

    public function index()
    {
        $this->view('manual');
    }
}
