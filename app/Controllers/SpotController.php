<?php

namespace App\Controllers;

use PDO;
use App\Core\Auth;
use App\Core\BaseWebController;

class SpotController extends BaseWebController
{
    private PDO $pdo;

    public function __construct()
    {
        require __DIR__ . '/../../config/db.php';
        $this->pdo = $pdo;
    }

    public function index()
    {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        $isAdmin = Auth::isAdmin();
        $user = $_SESSION['user'];

        $this->view('index', [
            'isAdmin' => $isAdmin,
            'user'    => $user,
        ]);
    }

    public function create()
    {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        $isAdmin = Auth::isAdmin();
        $user = $_SESSION['user'];

        $this->view('new', [
            'isAdmin' => $isAdmin,
            'user'    => $user,
        ]);
    }

    public function show($id)
    {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        $isAdmin = Auth::isAdmin();
        $user = $_SESSION['user'];

        $this->view('detail', [
            'isAdmin' => $isAdmin,
            'user'    => $user,
            'id' => $id,
        ]);
    }
}
